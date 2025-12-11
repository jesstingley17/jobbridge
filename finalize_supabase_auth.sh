#!/bin/bash
set -e

echo "📝 Adding Supabase authentication support and documentation..."

# Create SUPABASE_AUTH_SETUP.md documentation
cat > SUPABASE_AUTH_SETUP.md << 'DOCEOF'
# Supabase Authentication Setup

This project uses **Supabase** as the primary authentication provider. The server validates JWT tokens from Supabase and automatically creates/updates users in the local Postgres database.

## Required Environment Variables

### Production (Vercel)
Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
SUPABASE_URL=https://mkkmfocbujeeayenvxtl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
VITE_SUPABASE_URL=https://mkkmfocbujeeayenvxtl.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
DATABASE_URL=<postgres-pooler-connection-string>
SESSION_SECRET=<generate-with-openssl-rand-hex-32>
```

## How Authentication Works

1. User signs up/in via Supabase (client-side)
2. Client receives JWT access token
3. Client sends token: `Authorization: Bearer <token>`
4. Server validates token using Supabase Admin client
5. Server creates/updates user in local database
6. Protected routes use `isAuthenticated` middleware

## Testing

### Sign up a test user:
```javascript
import { supabase } from './utils/supabase/client';

const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'securepassword123'
});
```

### Make authenticated request:
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  https://thejobbridge-inc.com/api/auth/user
```

## Troubleshooting

### Error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
Set these environment variables in Vercel dashboard.

### Error: "FUNCTION_INVOCATION_FAILED"
This is now replaced with clear error messages. Check Vercel logs for the actual error.

## Security

- Never commit `SUPABASE_SERVICE_ROLE_KEY` to git
- Use different `SESSION_SECRET` for dev vs production
- Service role key should only be used server-side
DOCEOF

echo "✓ Created SUPABASE_AUTH_SETUP.md"

git add SUPABASE_AUTH_SETUP.md
git commit -m "Add Supabase authentication setup documentation

- Complete guide for setting up Supabase auth
- Environment variable reference
- Testing instructions
- Troubleshooting guide"

git push origin main

echo ""
echo "✅ All changes committed and pushed successfully!"
echo ""
echo "📦 Summary of changes:"
echo "  - server/env.ts: Environment variable validation helper"
echo "  - server/supabase.ts: Removed hard-coded keys, fail-fast validation"
echo "  - client/src/utils/supabase/client.ts: Removed hard-coded keys"
echo "  - SUPABASE_AUTH_SETUP.md: Complete setup documentation"
echo ""
echo "🔄 Vercel will automatically deploy in 2-3 minutes"
echo ""
echo "⚠️  IMPORTANT: Set environment variables in Vercel dashboard:"
echo "   https://vercel.com/jess-9182/jobbridge/settings/environment-variables"
echo ""
echo "   Required variables:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - DATABASE_URL"
echo "   - SESSION_SECRET (generate with: openssl rand -hex 32)"
