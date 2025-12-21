import { createClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

// Server-side Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

// Initialize Supabase client lazily to avoid throwing on module load
function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const errorMsg = 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'Set them in your .env file or deployment environment (Vercel).';
    console.error('[Supabase] Configuration Error:', errorMsg);
    console.error('[Supabase] SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING');
    console.error('[Supabase] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? `${supabaseServiceRoleKey.substring(0, 10)}...` : 'MISSING');
    throw new Error(errorMsg);
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (urlError) {
    console.error('[Supabase] Invalid SUPABASE_URL format:', supabaseUrl);
    throw new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}`);
  }

  if (!supabaseAdmin) {
    try {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'x-client-info': 'jobbridge-server',
          },
        },
      });
      console.log('[Supabase] Admin client initialized successfully');
      console.log('[Supabase] URL:', supabaseUrl);
      
      // Test connection with a simple query
      (async () => {
        try {
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
          if (error) {
            console.warn('[Supabase] Connection test warning:', error.message);
          } else {
            console.log('[Supabase] Connection test successful');
          }
        } catch (testError: any) {
          console.warn('[Supabase] Connection test failed (non-fatal):', testError.message);
        }
      })();
    } catch (error: any) {
      console.error('[Supabase] Failed to create Supabase client:', error);
      console.error('[Supabase] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  }

  return supabaseAdmin;
}

// Export getter function instead of direct export to allow lazy initialization
export { getSupabaseAdmin };

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
    const admin = getSupabaseAdmin();
    const { data: { user }, error } = await admin.auth.getUser(token);
    
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
