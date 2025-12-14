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
  
  // Check Supabase auth first (from requireSupabaseAuth middleware)
  if (req.supabaseUser?.id) {
    userId = req.supabaseUser.id;
    console.log(`[isAdmin] Found userId from req.supabaseUser: ${userId}`);
  }
  // Check Supabase auth via checkSupabaseAuth function
  else {
    const supabaseUserId = await checkSupabaseAuth(req);
    if (supabaseUserId) {
      userId = supabaseUserId;
      console.log(`[isAdmin] Found userId from checkSupabaseAuth: ${userId}`);
    }
  }
  // Fallback to session-based auth (for admin login)
  if (!userId && req.session && (req.session as any).userId) {
    userId = (req.session as any).userId;
    console.log(`[isAdmin] Found userId from session: ${userId}`);
  }
  // Also check req.user.claims.sub (set by isAuthenticated or requireSupabaseAuth)
  if (!userId && req.user?.claims?.sub) {
    userId = req.user.claims.sub;
    console.log(`[isAdmin] Found userId from req.user.claims.sub: ${userId}`);
  }
  
  if (!userId) {
    // User not authenticated - return 401, not 500
    console.warn(`[isAdmin] No userId found. req.supabaseUser: ${!!req.supabaseUser}, req.user: ${!!req.user}, req.session: ${!!req.session}`);
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  console.log(`[isAdmin] Checking admin access for userId: ${userId}`);
  
  try {
    // First, check Supabase Auth metadata (same as /api/auth/user does)
    let isAdminFromMetadata = false;
    try {
      const { getSupabaseAdmin } = await import('./supabase.js');
      const supabaseAdmin = getSupabaseAdmin();
      
      // Add timeout to prevent hanging during build/deploy
      const metadataCheckPromise = supabaseAdmin.auth.admin.getUserById(userId);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Metadata check timeout')), 3000); // 3 second timeout
      });
      
      const { data: { user: fullUser }, error: getUserError } = await Promise.race([
        metadataCheckPromise,
        timeoutPromise
      ]) as any;
      
      if (!getUserError && fullUser) {
        const metadataAdmin = fullUser.app_metadata?.role === 'admin' || 
                            fullUser.app_metadata?.is_admin === true ||
                            fullUser.user_metadata?.role === 'admin' ||
                            fullUser.user_metadata?.is_admin === true;
        if (metadataAdmin) {
          isAdminFromMetadata = true;
          console.log(`[isAdmin] Admin role found in Supabase metadata for ${fullUser.email || userId}`);
          console.log(`[isAdmin] app_metadata:`, fullUser.app_metadata);
          console.log(`[isAdmin] user_metadata:`, fullUser.user_metadata);
        }
      }
    } catch (metadataError: any) {
      if (metadataError.message === 'Metadata check timeout') {
        console.warn('[isAdmin] Supabase metadata check timed out, continuing with database checks');
      } else {
        console.warn('Could not check Supabase metadata for admin status:', metadataError.message);
      }
    }
    
    if (isAdminFromMetadata) {
      if (!req.user) {
        req.user = {
          claims: { sub: userId }
        };
      }
      console.log(`[isAdmin] Admin access granted via Supabase metadata for ${userId}`);
      return next();
    }
    
    // First, try to get user info (needed for fallback checks)
    // Add timeout to prevent hanging
    let user;
    let userEmail: string | null = null;
    try {
      const getUserPromise = storage.getUser(userId);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('getUser timeout')), 3000); // 3 second timeout
      });
      user = await Promise.race([getUserPromise, timeoutPromise]) as any;
      userEmail = user?.email || null;
      console.log(`[isAdmin] User from DB: ${userEmail || 'not found'}, role: ${user?.role || 'none'}`);
    } catch (userError: any) {
      if (userError.message === 'getUser timeout') {
        console.warn("[isAdmin] getUser timed out, using email from req.supabaseUser for fallback checks");
      } else {
        console.error("Error fetching user in isAdmin:", userError);
      }
      // Use email from req.supabaseUser as fallback if database lookup fails
      userEmail = req.supabaseUser?.email || null;
      console.log(`[isAdmin] Using email from req.supabaseUser: ${userEmail || 'none'}`);
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
      
      const isAdminFromRoles = result.rows[0]?.is_admin === true;
      console.log(`[isAdmin] user_roles table check: ${isAdminFromRoles}`);
      
      if (isAdminFromRoles) {
        // Ensure req.user is set for downstream middleware
        if (!req.user) {
          req.user = {
            claims: { sub: userId }
          };
        }
        console.log(`[isAdmin] Admin access granted via user_roles table for ${userId}`);
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
      console.log(`[isAdmin] Admin access granted via user.role field for ${user.email || userId}`);
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
      console.log(`[isAdmin] Admin access granted via ADMIN_EMAILS env var for ${user.email}`);
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
          console.log(`[isAdmin] Admin access granted via ADMIN_EMAIL_PATTERN for ${user.email}`);
          return next();
        }
      } catch (regexError) {
        console.error("Invalid ADMIN_EMAIL_PATTERN regex:", regexError);
      }
    }

    console.warn(`[isAdmin] Admin access DENIED for userId: ${userId}, email: ${user?.email || 'unknown'}, role: ${user?.role || 'none'}`);
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
