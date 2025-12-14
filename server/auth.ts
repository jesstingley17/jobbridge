import session from "express-session";
import type { Express, RequestHandler, Request } from "express";
import { storage } from "./storage.js";

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
      const { getSupabaseAdmin } = await import('./supabase.js');
      const supabaseAdmin = getSupabaseAdmin();
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) {
        return user.id;
      }
    }
  } catch (error) {
    console.error('Supabase auth check error:', error);
  }
  return null;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
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
  
  // No authentication found
  return res.status(401).json({ message: "Unauthorized" });
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
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    // Use role-based system: check user_roles table
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = ${userId} AND r.name = 'admin'
      ) AS is_admin
    `);
    
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
    
    // Fallback: Check legacy user.role field (for backward compatibility)
    const user = await storage.getUser(userId);
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
      const regex = new RegExp(adminPattern);
      if (regex.test(user.email)) {
        if (!req.user) {
          req.user = {
            claims: { sub: userId }
          };
        }
        return next();
      }
    }

    return res.status(403).json({ message: "Admin access required" });
  } catch (error) {
    console.error("Error checking admin access:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
