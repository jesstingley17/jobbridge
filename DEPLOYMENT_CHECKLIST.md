# Deployment Checklist - Admin Sync & Login

## Pre-Deployment Verification

### ✅ Environment Variables (Vercel)
Ensure these are set:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key (legacy or new)
- `SUPABASE_URL` - Same as VITE_SUPABASE_URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key
- `ADMIN_EMAILS` - Comma-separated admin emails (optional)
- `ADMIN_EMAIL_PATTERN` - Regex pattern for admin emails (optional)
- `ADMIN_RESET_TOKEN` - Token for admin reset/sync endpoints (optional but recommended)

### ✅ Supabase Configuration
1. **Redirect URLs** (Settings → Authentication → URL Configuration):
   - `https://thejobbridge-inc.com/auth/callback`
   - `https://thejobbridge-inc.com/auth/reset-password`
   - `https://thejobbridge-inc.com/admin/login`
   - `http://localhost:5000/auth/callback` (for local dev)
   - `http://localhost:5000/auth/reset-password` (for local dev)
   - `http://localhost:5000/admin/login` (for local dev)

2. **Site URL**: `https://thejobbridge-inc.com`

### ✅ Database Migrations
Run these in Supabase SQL Editor if not already done:
- `migrations/create_roles_system.sql` - For role-based admin access
- `migrations/merge_duplicate_users.sql` - If you have duplicate users

## Post-Deployment Testing

### 1. Test Admin Login
```
1. Go to https://thejobbridge-inc.com/admin/login
2. Enter admin email and password (from Supabase Auth)
3. Should redirect to /admin/blog
```

### 2. Test Admin Sync (if needed)
```bash
curl -X POST https://thejobbridge-inc.com/api/admin/sync-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_RESET_TOKEN" \
  -d '{"email":"admin@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "email": "admin@example.com",
  "adminRoleAssigned": true,
  "actions": [
    "Found user in Supabase Auth",
    "User IDs already match",
    "Assigned admin role in database"
  ]
}
```

### 3. Test Regular User Login
```
1. Go to https://thejobbridge-inc.com/auth
2. Sign in with email/password or magic link
3. Should work normally
```

### 4. Test Password Reset
```
1. Go to /admin/login
2. Click "Forgot your password?"
3. Enter admin email
4. Check email for reset link
5. Click link → should go to /admin/reset-password
6. Set new password
7. Should redirect to /admin/login
```

## Verification Checklist

- [ ] Admin can log in at `/admin/login`
- [ ] Admin can access `/admin/blog`
- [ ] Admin password reset works
- [ ] Regular users can sign in at `/auth`
- [ ] Magic link authentication works
- [ ] Password reset for regular users works
- [ ] No "Legacy API keys" errors
- [ ] No console errors in browser
- [ ] Vercel deployment successful

## Troubleshooting

### Admin Login Not Working
1. Check if user exists in Supabase Auth
2. Verify user has admin role in database
3. Check Vercel logs for errors
4. Try syncing user: `/api/admin/sync-user`

### "Legacy API keys" Error
1. Re-enable legacy keys in Supabase (temporary)
2. Or update to new keys in Vercel (permanent)

### User ID Conflicts
1. Run `migrations/merge_duplicate_users.sql` to identify duplicates
2. Use `/api/admin/sync-user` to merge users
3. Or use `/api/auth/sync-supabase-user` after user signs up

## Current Status

✅ Admin login uses Supabase Auth
✅ Admin password reset implemented
✅ Admin sync endpoint available
✅ User merging by email implemented
✅ All routes configured

---

**Last Updated**: After fixing admin login and sync
**Status**: Ready for deployment
