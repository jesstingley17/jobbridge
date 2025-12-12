import { createClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

// Server-side Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  const errorMsg = 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
    'Set them in your .env file or deployment environment (Vercel).';
  console.error(errorMsg);
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'SET' : 'MISSING');
  throw new Error(errorMsg);
}

// Server-side Supabase client (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Middleware to verify Supabase authentication token
 * Attaches user info to req.supabaseUser
 */
export async function verifySupabaseAuth(
  req: Request & { supabaseUser?: any },
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    // Attach user to request object
    req.supabaseUser = user;
    next();
  } catch (error) {
    console.error('Supabase authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
