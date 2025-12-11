#!/bin/bash
set -e

echo "�� Updating remaining critical files..."

# Update server/supabase.ts
cat > server/supabase.ts << 'SUPABASEOF'
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
    'Set them in your .env file or deployment environment (Vercel).'
  );
}

// Server-side Supabase client (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
SUPABASEOF

echo "✓ Updated server/supabase.ts"

# Update client/src/utils/supabase/client.ts
cat > client/src/utils/supabase/client.ts << 'CLIENTEOF'
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. ' +
    'Set them in your .env file or deployment environment.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
CLIENTEOF

echo "✓ Updated client/src/utils/supabase/client.ts"

git add server/supabase.ts client/src/utils/supabase/client.ts
git commit -m "Remove hard-coded Supabase keys and add fail-fast validation

- server/supabase.ts: Remove fallback keys, throw error if env vars missing
- client/src/utils/supabase/client.ts: Remove fallback keys, throw error if env vars missing

This ensures the app fails early with clear error messages instead of
using stale hard-coded credentials in production."

git push origin main

echo ""
echo "✅ All critical files updated and pushed!"
