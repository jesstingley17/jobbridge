import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

// Cache JWKs for 10 minutes
let jwksCache: { keys: any[]; fetchedAt: number } | null = null;

async function getSupabaseJwks(projectUrl: string) {
  const now = Date.now();
  if (jwksCache && now - jwksCache.fetchedAt < 10 * 60 * 1000) {
    return jwksCache.keys;
  }

  // Ensure URL doesn't have trailing slash and construct JWKS endpoint
  const baseUrl = projectUrl.replace(/\/$/, '');
  const jwksUrl = `${baseUrl}/auth/v1/.well-known/jwks.json`;
  
  try {
    const res = await fetch(jwksUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      // Try alternative endpoint format
      const altUrl = `${baseUrl}/auth/v1/keys`;
      const altRes = await fetch(altUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!altRes.ok) {
        throw new Error(`Failed to fetch JWKs: ${res.status} (tried ${jwksUrl} and ${altUrl})`);
      }
      
      const { keys } = await altRes.json();
      jwksCache = { keys, fetchedAt: now };
      return keys;
    }
    
    const { keys } = await res.json();
    jwksCache = { keys, fetchedAt: now };
    return keys;
  } catch (error: any) {
    console.error('Error fetching JWKs:', error);
    throw new Error(`Failed to fetch JWKs: ${error.message}`);
  }
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
  const jwk = keys.find((k: any) => k.kid === header.kid && k.alg === header.alg);
  
  if (!jwk) {
    throw new Error("No matching JWK");
  }

  // Build public key from JWK
  // Create public key directly from JWK format
  const publicKey = crypto.createPublicKey({
    key: {
      kty: jwk.kty || "RSA",
      n: jwk.n,
      e: jwk.e,
    },
    format: "jwk",
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

      // Use Supabase Admin API to verify token instead of JWKS (more reliable)
      // Add timeout to prevent hanging
      try {
        const { getSupabaseAdmin } = await import('../supabase.js');
        const supabaseAdmin = getSupabaseAdmin();
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Token verification timeout')), 3000); // 3 second timeout (reduced from 5s)
        });
        
        // Use getUser with JWT token - this verifies the token and returns user info
        const verifyPromise = supabaseAdmin.auth.getUser(token);
        const result = await Promise.race([
          verifyPromise,
          timeoutPromise
        ]) as any;
        
        // Handle both timeout and actual result
        // The result structure is: { data: { user }, error }
        if (result) {
          // Check if it's an error (timeout or other)
          if (result.error || result.message === 'Token verification timeout') {
            throw result; // Will be caught below
          }
          
          // Check if result has data property
          if (result.data) {
            const { data: { user }, error: verifyError } = result;
            
            if (verifyError || !user) {
              console.error("JWT verification error:", verifyError?.message || "User not found");
              return res.status(401).json({ 
                error: verifyError?.message || "Unauthorized",
                details: process.env.NODE_ENV === "development" ? verifyError : undefined
              });
            }

            // Attach user info to request
            (req as any).supabaseUser = {
              id: user.id,
              role: user.role || "authenticated",
              email: user.email,
              email_confirmed_at: user.email_confirmed_at,
            };

            next();
            return;
          }
        }
      } catch (adminError: any) {
        // If timeout or other error, skip JWKS fallback for now (it's also failing with 401)
        // Just return 401 - the client can retry
        if (adminError.message === 'Token verification timeout') {
          console.warn("Supabase Admin API verification timed out");
          return res.status(401).json({ 
            error: "Authentication timeout",
            message: "Token verification took too long. Please try again."
          });
        } else {
          console.warn("Supabase Admin API verification failed:", adminError.message);
          // Don't fall back to JWKS if it's also failing - just return error
          return res.status(401).json({ 
            error: adminError?.message || "Unauthorized",
            details: process.env.NODE_ENV === "development" ? adminError : undefined
          });
        }
      }

      // Fallback: Use JWKS verification
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
