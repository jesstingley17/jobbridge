import session from "express-session";
import type { Express, RequestHandler, Request } from "express";
import { storage } from "./storage.js";
import { pool } from "./db.js";

// Extend Express Request type to include user property
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      claims: {
        sub: string;
      };
    };
  }
}

// Simple session middleware for Vercel (Supabase handles auth)
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for Vercel (Supabase handles auth, sessions are minimal)
  return session({
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Supabase-compatible authentication middleware
async function checkSupabaseAuth(req: any): Promise<string | null> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { getSupabaseAdmin } = await import('./supabase.js');
        const supabaseAdmin = getSupabaseAdmin();
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
          return user.id;
        }
      } catch (supabaseError: any) {
        // Log but don't throw - this is expected for invalid tokens
        console.warn('Supabase auth check failed (expected for unauthenticated users):', supabaseError?.message);
      }
    }
  } catch (error: any) {
    // Log but don't throw - authentication failures are expected
    console.warn('Supabase auth check error (non-fatal):', error?.message);
  }
  return null;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check Supabase auth first
    const supabaseUserId = await checkSupabaseAuth(req);
    if (supabaseUserId) {
      // Set req.user for compatibility with existing code
      req.user = {
        claims: { sub: supabaseUserId }
      };
      return next();
    }
    
    // Fallback to session-based auth (for admin login)
    if (req.session && (req.session as any).userId) {
      req.user = {
        claims: { sub: (req.session as any).userId }
      };
      return next();
    }
    
    // No authentication found - return 401, not 500
    return res.status(401).json({ message: "Unauthorized" });
  } catch (error: any) {
    // Only log, don't return 500 - treat as unauthenticated
    console.warn("Error in isAuthenticated middleware (treating as unauthenticated):", error?.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Admin middleware - checks if user is admin using role-based system
export const isAdmin: RequestHandler = async (req: any, res, next) => {
  let userId: string | null = null;
  
  // Check Supabase auth first
  const supabaseUserId = await checkSupabaseAuth(req);
  if (supabaseUserId) {
    userId = supabaseUserId;
  }
  // Fallback to session-based auth (for admin login)
  else if (req.session && (req.session as any).userId) {
    userId = (req.session as any).userId;
  }
  // Also check req.user.claims.sub (set by isAuthenticated or requireSupabaseAuth)
  else if (req.user?.claims?.sub) {
    userId = req.user.claims.sub;
  }
  
  if (!userId) {
    // User not authenticated - return 401, not 500
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    // First, try to get user info (needed for fallback checks)
    let user;
    try {
      user = await storage.getUser(userId);
    } catch (userError) {
      console.error("Error fetching user in isAdmin:", userError);
      // Continue with role-based check even if getUser fails
    }

    // Try role-based system: check user_roles table (if it exists)
    try {
      const result = await pool.query(
        `
          SELECT EXISTS (
            SELECT 1
            FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = $1 AND r.name = 'admin'
          ) AS is_admin
        `,
        [userId]
      );
      
      const isAdmin = result.rows[0]?.is_admin === true;
      
      if (isAdmin) {
        // Ensure req.user is set for downstream middleware
        if (!req.user) {
          req.user = {
            claims: { sub: userId }
          };
        }
        return next();
      }
    } catch (roleError: any) {
      // If tables don't exist (e.g., migration not run), log and continue to fallback checks
      if (roleError?.code === '42P01' || roleError?.message?.includes('does not exist')) {
        console.warn("Role-based tables not found, using fallback admin checks:", roleError.message);
      } else {
        console.error("Error checking role-based admin access:", roleError);
        // Continue to fallback checks instead of failing
      }
    }
    
    // Fallback: Check legacy user.role field (for backward compatibility)
    if (user?.role === "admin") {
      if (!req.user) {
        req.user = {
          claims: { sub: userId }
        };
      }
      return next();
    }
    
    // Fallback: Check admin emails from env (for backward compatibility)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    if (user?.email && adminEmails.includes(user.email)) {
      if (!req.user) {
        req.user = {
          claims: { sub: userId }
        };
      }
      return next();
    }
    
    // Fallback: Check admin email pattern (for backward compatibility)
    const adminPattern = process.env.ADMIN_EMAIL_PATTERN;
    if (adminPattern && user?.email) {
      try {
        const regex = new RegExp(adminPattern);
        if (regex.test(user.email)) {
          if (!req.user) {
            req.user = {
              claims: { sub: userId }
            };
          }
          return next();
        }
      } catch (regexError) {
        console.error("Invalid ADMIN_EMAIL_PATTERN regex:", regexError);
      }
    }

    return res.status(403).json({ message: "Admin access required" });
  } catch (error: any) {
    // Log error but return 403 instead of 500 to prevent information leakage
    console.error("Error checking admin access:", error);
    // If it's a database error and user might be authenticated, return 403
    // Otherwise return 401 (though this shouldn't happen if isAuthenticated worked)
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      // Tables don't exist - user might still be admin via fallback, but return 403
      return res.status(403).json({ message: "Admin access required" });
    }
    // For other errors, return 403 (not 500) to be safe
    return res.status(403).json({ message: "Admin access required" });
  }
};
