import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

// Cache JWKs for 10 minutes
let jwksCache: { keys: any[]; fetchedAt: number } | null = null;

async function getSupabaseJwks(projectUrl: string) {
  const now = Date.now();
  if (jwksCache && now - jwksCache.fetchedAt < 10 * 60 * 1000) {
    return jwksCache.keys;
  }

  const res = await fetch(`${projectUrl}/auth/v1/keys`);
  if (!res.ok) throw new Error(`Failed to fetch JWKs: ${res.status}`);
  
  const { keys } = await res.json();
  jwksCache = { keys, fetchedAt: now };
  return keys;
}

function base64urlToBuffer(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

async function verifyJwtWithJwks(token: string, projectUrl: string) {
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error("Invalid JWT format");
  }

  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));

  // Check expiration
  if (!payload.exp || Date.now() / 1000 > payload.exp) {
    throw new Error("JWT expired");
  }

  // Check subject
  if (!payload.sub) {
    throw new Error("Missing sub");
  }

  const keys = await getSupabaseJwks(projectUrl);
  const jwk = keys.find((k) => k.kid === header.kid && k.alg === header.alg);
  
  if (!jwk) {
    throw new Error("No matching JWK");
  }

  // Build public key from JWK
  // First create a public key from JWK format
  const jwkKey = crypto.createPublicKey({
    key: {
      kty: "RSA",
      n: jwk.n,
      e: jwk.e,
    },
    format: "jwk",
  });
  
  // Export to PEM format, then recreate (this ensures proper format)
  const pemKey = jwkKey.export({ type: "spki", format: "pem" }) as string;
  const publicKey = crypto.createPublicKey({
    key: pemKey,
    format: "pem",
    type: "spki",
  });

  // Verify signature
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();

  const signature = Buffer.from(signatureB64, "base64url");
  const ok = verifier.verify(publicKey, signature);

  if (!ok) {
    throw new Error("Invalid JWT signature");
  }

  return payload; // contains sub (user id), role, email, etc.
}

/**
 * Express middleware to verify Supabase JWT tokens
 * Reads Authorization: Bearer <token> header and verifies the JWT
 */
export function requireSupabaseAuth() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error("SUPABASE_URL not set - JWT verification will fail");
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!supabaseUrl) {
        return res.status(500).json({ 
          error: "Authentication service not configured",
          message: "SUPABASE_URL environment variable is missing"
        });
      }

      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

      if (!token) {
        return res.status(401).json({ error: "Missing Bearer token" });
      }

      const payload = await verifyJwtWithJwks(token, supabaseUrl);

      // Attach user info to request
      (req as any).supabaseUser = {
        id: payload.sub,
        role: payload.role || "authenticated",
        email: payload.email,
        aud: payload.aud,
        exp: payload.exp,
      };

      next();
    } catch (e: any) {
      console.error("JWT verification error:", e.message);
      return res.status(401).json({ 
        error: e?.message || "Unauthorized",
        details: process.env.NODE_ENV === "development" ? e.stack : undefined
      });
    }
  };
}

/**
 * Optional middleware - verifies JWT but doesn't require it (for optional auth)
 */
export function optionalSupabaseAuth() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!supabaseUrl) {
        return next(); // Continue without auth if Supabase not configured
      }

      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

      if (token) {
        try {
          const payload = await verifyJwtWithJwks(token, supabaseUrl);
          (req as any).supabaseUser = {
            id: payload.sub,
            role: payload.role || "authenticated",
            email: payload.email,
            aud: payload.aud,
            exp: payload.exp,
          };
        } catch (e) {
          // If token is invalid, continue without auth (optional)
          console.warn("Optional auth verification failed:", e);
        }
      }

      next();
    } catch (e) {
      // Continue without auth on error
      next();
    }
  };
}
