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
        console.warn("Missing Bearer token in request to:", req.path);
        return res.status(401).json({ error: "Missing Bearer token" });
      }
      
      // Log token info for debugging (first 20 chars only for security)
      console.log(`[Auth] Verifying token for ${req.path}, token prefix: ${token.substring(0, 20)}...`);

      // Use Supabase Admin API to verify token - simpler approach
      try {
        const { getSupabaseAdmin } = await import('../supabase.js');
        const supabaseAdmin = getSupabaseAdmin();
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Token verification timeout')), 5000); // 5 second timeout
        });
        
        // Use getUser with JWT token - this verifies the token and returns user info
        // The result structure is: { data: { user }, error }
        const verifyPromise = supabaseAdmin.auth.getUser(token);
        const result = await Promise.race([
          verifyPromise,
          timeoutPromise
        ]) as any;
        
        // Handle timeout
        if (result && result.message === 'Token verification timeout') {
          throw new Error('Token verification timeout');
        }
        
        // Check for error in result
        if (result?.error) {
          console.error("[Auth] JWT verification error:", result.error?.message || "Verification failed");
          console.error("[Auth] Full error:", JSON.stringify(result.error, null, 2));
          return res.status(401).json({ 
            error: result.error?.message || "Unauthorized",
            details: process.env.NODE_ENV === "development" ? result.error : undefined
          });
        }
        
        // Check for user in result
        if (result?.data?.user) {
          const user = result.data.user;
          console.log(`[Auth] Token verified successfully for user: ${user.email || user.id}`);
          
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
        
        // If we get here, something unexpected happened
        console.error("[Auth] Unexpected result structure:", {
          hasData: !!result?.data,
          hasError: !!result?.error,
          resultKeys: result ? Object.keys(result) : 'null',
          resultType: typeof result,
          fullResult: process.env.NODE_ENV === "development" ? JSON.stringify(result, null, 2) : "hidden"
        });
        return res.status(401).json({ 
          error: "Token verification failed",
          message: "Unexpected response from authentication service"
        });
        
      } catch (adminError: any) {
        // Handle timeout or other errors
        if (adminError.message === 'Token verification timeout') {
          console.warn("[Auth] Token verification timed out");
          return res.status(401).json({ 
            error: "Authentication timeout",
            message: "Token verification took too long. Please try again."
          });
        }
        
        console.error("[Auth] Token verification error:", adminError.message);
        console.error("[Auth] Error name:", adminError.name);
        console.error("[Auth] Error stack:", adminError.stack);
        if (adminError.cause) {
          console.error("[Auth] Error cause:", adminError.cause);
        }
        
        // Fallback: Try JWKS verification if Admin API fails
        console.log("[Auth] Falling back to JWKS verification...");
        try {
          const payload = await verifyJwtWithJwks(token, supabaseUrl);
          
          // Attach user info from JWT payload
          (req as any).supabaseUser = {
            id: payload.sub,
            role: payload.role || "authenticated",
            email: payload.email,
            email_confirmed_at: payload.email_confirmed_at ? new Date(payload.email_confirmed_at * 1000).toISOString() : null,
          };
          
          console.log(`[Auth] Token verified via JWKS fallback for user: ${payload.email || payload.sub}`);
          next();
          return;
        } catch (jwksError: any) {
          console.error("[Auth] JWKS fallback also failed:", jwksError.message);
          return res.status(401).json({ 
            error: adminError?.message || "Unauthorized",
            details: process.env.NODE_ENV === "development" ? {
              message: adminError?.message,
              name: adminError?.name,
              jwksError: jwksError?.message
            } : undefined
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
