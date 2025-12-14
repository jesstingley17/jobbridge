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
    // Get user email from req.supabaseUser first (fast, no DB query)
    const userEmail = req.supabaseUser?.email || null;
    console.log(`[isAdmin] User email from req.supabaseUser: ${userEmail || 'none'}`);
    
    // Quick check: ADMIN_EMAILS env var (fastest, no DB/API calls)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    console.log(`[isAdmin] ADMIN_EMAILS env var: ${adminEmails.length > 0 ? adminEmails.join(', ') : 'NOT SET'}`);
    if (userEmail && adminEmails.includes(userEmail)) {
      if (!req.user) {
        req.user = { claims: { sub: userId } };
      }
      console.log(`[isAdmin] ✅ Admin access granted via ADMIN_EMAILS env var for ${userEmail}`);
      return next();
    }
    
    // Quick check: ADMIN_EMAIL_PATTERN (fast, no DB/API calls)
    const adminPattern = process.env.ADMIN_EMAIL_PATTERN;
    if (adminPattern && userEmail) {
      try {
        const regex = new RegExp(adminPattern);
        if (regex.test(userEmail)) {
          if (!req.user) {
            req.user = { claims: { sub: userId } };
          }
          console.log(`[isAdmin] Admin access granted via ADMIN_EMAIL_PATTERN for ${userEmail}`);
          return next();
        }
      } catch (regexError) {
        console.error("Invalid ADMIN_EMAIL_PATTERN regex:", regexError);
      }
    }
    
    // Run database checks in parallel with timeout
    // Use Promise.allSettled so we get partial results even if some fail
    const allChecks = Promise.allSettled([
      // Check 1: Get user from database
      storage.getUser(userId).catch(() => null),
      // Check 2: Check user_roles table
      pool.query(
        `SELECT EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON r.id = ur.role_id
          WHERE ur.user_id = $1 AND r.name = 'admin'
        ) AS is_admin`,
        [userId]
      ).then(r => r.rows[0]?.is_admin === true).catch(() => false),
      // Check 3: Check Supabase metadata
      (async () => {
        try {
          const { getSupabaseAdmin } = await import('./supabase.js');
          const supabaseAdmin = getSupabaseAdmin();
          const { data: { user: fullUser }, error } = await supabaseAdmin.auth.admin.getUserById(userId);
          if (!error && fullUser) {
            return fullUser.app_metadata?.role === 'admin' || 
                   fullUser.app_metadata?.is_admin === true ||
                   fullUser.user_metadata?.role === 'admin' ||
                   fullUser.user_metadata?.is_admin === true;
          }
        } catch {}
        return false;
      })()
    ]);
    
    // Race against timeout - but still get partial results
    let results: PromiseSettledResult<any>[] | null = null;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 2000);
      });
      results = await Promise.race([allChecks, timeoutPromise]);
    } catch (error: any) {
      if (error.message === 'timeout') {
        // Timeout occurred, but try to get partial results
        try {
          results = await Promise.race([
            allChecks,
            new Promise<PromiseSettledResult<any>[]>((resolve) => {
              setTimeout(() => resolve([]), 100); // Give it 100ms more
            })
          ]);
        } catch {
          // If still no results, continue with null
        }
      }
    }
    
    if (results && results.length >= 3) {
      const [userResult, rolesResult, metadataResult] = results;
      
      // Check user.role from database
      if (userResult?.status === 'fulfilled' && userResult.value?.role === 'admin') {
        if (!req.user) {
          req.user = { claims: { sub: userId } };
        }
        console.log(`[isAdmin] Admin access granted via user.role field`);
        return next();
      }
      
      // Check user_roles table
      if (rolesResult?.status === 'fulfilled' && rolesResult.value === true) {
        if (!req.user) {
          req.user = { claims: { sub: userId } };
        }
        console.log(`[isAdmin] Admin access granted via user_roles table`);
        return next();
      }
      
      // Check Supabase metadata
      if (metadataResult?.status === 'fulfilled' && metadataResult.value === true) {
        if (!req.user) {
          req.user = { claims: { sub: userId } };
        }
        console.log(`[isAdmin] Admin access granted via Supabase metadata`);
        return next();
      }
    }

    console.warn(`[isAdmin] Admin access DENIED for userId: ${userId}, email: ${userEmail || 'unknown'}`);
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
