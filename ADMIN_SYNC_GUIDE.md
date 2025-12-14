# Admin User Sync Guide

This guide explains how to sync admin users between your database and Supabase Auth.

## Quick Sync Command

After adding a new admin user, sync them with Supabase:

```bash
curl -X POST https://thejobbridge-inc.com/api/admin/sync-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_RESET_TOKEN" \
  -d '{"email":"admin@example.com"}'
```

## What This Does

The sync endpoint:
1. ✅ Finds the user in your database
2. ✅ Finds the user in Supabase Auth
3. ✅ Merges user IDs if they don't match
4. ✅ Assigns admin role in database (`users.role = 'admin'`)
5. ✅ Assigns admin role in `user_roles` table (if exists)
6. ✅ Returns detailed sync report

## Prerequisites

1. **User must exist in Supabase Auth first**
   - They need to sign up via `/auth` (email/password or magic link)
   - Or you can create them via Supabase Dashboard → Authentication → Users

2. **Environment Variable**
   - `ADMIN_RESET_TOKEN` must be set in Vercel (same token used for reset links)

## Step-by-Step: Adding a New Admin

### Option 1: User Already Signed Up via Supabase

If the user already has a Supabase Auth account:

```bash
# 1. Sync the user
curl -X POST https://thejobbridge-inc.com/api/admin/sync-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_RESET_TOKEN" \
  -d '{"email":"newadmin@example.com"}'

# 2. Verify sync worked
# Response should show:
# - "adminRoleAssigned": true
# - "actions" includes "Assigned admin role in database"
```

### Option 2: User Needs to Sign Up First

If the user doesn't have a Supabase Auth account yet:

1. **Have user sign up** at `https://thejobbridge-inc.com/auth`
   - They can use email/password or magic link
   - This creates their Supabase Auth account

2. **Then sync them**:
```bash
curl -X POST https://thejobbridge-inc.com/api/admin/sync-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_RESET_TOKEN" \
  -d '{"email":"newadmin@example.com"}'
```

### Option 3: Create User in Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email and set password
4. Then sync via API (same command as above)

## Response Example

```json
{
  "success": true,
  "email": "admin@example.com",
  "databaseUser": {
    "id": "uuid-from-database",
    "email": "admin@example.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  },
  "supabaseUser": {
    "id": "uuid-from-supabase",
    "email": "admin@example.com",
    "email_confirmed_at": "2025-01-15T12:00:00Z"
  },
  "adminRoleAssigned": true,
  "actions": [
    "Found user in Supabase Auth",
    "User IDs already match",
    "Assigned admin role in database",
    "Assigned admin role in user_roles table"
  ],
  "message": "Admin user synced successfully"
}
```

## Admin Role Assignment Methods

The system checks admin status in this order:

1. **Database `role` field**: `users.role = 'admin'`
2. **Environment variable**: Email in `ADMIN_EMAILS` (comma-separated)
3. **Pattern matching**: Email matches `ADMIN_EMAIL_PATTERN` regex
4. **Role-based table**: Entry in `user_roles` table with role 'admin'

The sync endpoint ensures all of these are set correctly.

## Troubleshooting

### "User not found in database"

**Cause**: User doesn't exist in your `users` table.

**Solution**: 
- Create user in database first, OR
- Have them sign up via Supabase Auth (which will create them via `sync-supabase-user`)

### "User not found in Supabase Auth"

**Cause**: User exists in database but hasn't signed up via Supabase Auth.

**Solution**:
1. Have user sign up at `/auth`
2. Or create them in Supabase Dashboard → Authentication → Users
3. Then run sync again

### "Unauthorized" error

**Cause**: Missing or incorrect `x-admin-token` header.

**Solution**: Ensure you're sending the correct `ADMIN_RESET_TOKEN` value.

### Admin role not assigned

**Cause**: User email not in `ADMIN_EMAILS` and doesn't match pattern.

**Solution**:
- Add email to `ADMIN_EMAILS` in Vercel, OR
- Update `ADMIN_EMAIL_PATTERN` to match, OR
- Manually set `users.role = 'admin'` in database

## Verification

After syncing, verify admin access:

1. **Check database**:
```sql
SELECT id, email, role FROM users WHERE email = 'admin@example.com';
SELECT ur.*, r.name as role_name 
FROM user_roles ur 
JOIN roles r ON r.id = ur.role_id 
WHERE ur.user_id = (SELECT id FROM users WHERE email = 'admin@example.com');
```

2. **Test login**:
- Go to `/admin/login`
- Login with admin credentials
- Should redirect to `/admin/blog`

3. **Check Supabase**:
- Supabase Dashboard → Authentication → Users
- Find user by email
- Verify they exist and email is confirmed

## Next Steps After Sync

1. ✅ User can now log in at `/admin/login`
2. ✅ User has access to `/admin/blog`
3. ✅ User can use password reset at `/admin/login` → "Forgot password"
4. ✅ User's JWT will include admin claims (after they refresh session)

**Note**: After assigning admin role, user should refresh their session or sign out/in to get updated JWT claims.

---

**Last Updated**: After implementing admin user sync endpoint
**Status**: Ready for production use
