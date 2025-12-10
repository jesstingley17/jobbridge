import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mkkmfocbujeeayenvxtl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ra21mb2NidWplZWF5ZW52eHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTIyMzYsImV4cCI6MjA4MDk2ODIzNn0._zCxN0ISokh-NuSqRN0Np17jk8gZCv8fUf01-FC2P6E';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key must be set in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

