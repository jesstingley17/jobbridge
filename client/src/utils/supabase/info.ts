// Supabase project information
// ⚠️ SECURITY: Never hardcode API keys in the codebase
// These should be set via environment variables
export const projectId = process.env.VITE_SUPABASE_PROJECT_ID || import.meta.env.VITE_SUPABASE_PROJECT_ID;
export const publicAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!projectId || !publicAnonKey) {
  console.error('⚠️ Missing Supabase credentials. Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY environment variables.');
}

