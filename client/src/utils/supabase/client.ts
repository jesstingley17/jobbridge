import { createClient } from '@supabase/supabase-js';

// Supabase configuration - get from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables (only warn in development)
if (import.meta.env.DEV) {
  if (!supabaseUrl || supabaseUrl === 'placeholder' || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ VITE_SUPABASE_URL environment variable not set or invalid.');
    console.warn('Please set VITE_SUPABASE_URL in your Vercel environment variables.');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'placeholder' || supabaseAnonKey === 'placeholder-key') {
    console.warn('⚠️ VITE_SUPABASE_ANON_KEY environment variable not set or invalid.');
    console.warn('Please set VITE_SUPABASE_ANON_KEY in your Vercel environment variables.');
  }
}

// Create Supabase client (will use placeholder if env vars not set)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Detect session from URL (for OAuth callbacks)
      flowType: 'pkce', // Use PKCE flow for better security
      storage: typeof window !== 'undefined' ? window.localStorage : undefined, // Explicitly use localStorage
      storageKey: 'sb-auth-token', // Default storage key
    },
  }
);
