# Setting Up Admin Users

Your app uses the `users` table with a `role` column to manage admin access. Here's how to set a user as admin.

## Method 1: Using the Script (Recommended)

```bash
npm run set-admin <user-email-or-id>
```

Example:
```bash
npm run set-admin user@example.com
# or
npm run set-admin 00000000-0000-0000-0000-000000000000
```

## Method 2: Direct SQL Query

Run this in your Supabase SQL Editor or database:

```sql
-- Set a user as admin by email
UPDATE users
SET role = 'admin'
WHERE email = 'user@example.com';

-- Or by user ID (Supabase auth.uid())
UPDATE users
SET role = 'admin'
WHERE id = '00000000-0000-0000-0000-000000000000';
```

## Method 3: Using Environment Variables (Temporary)

You can also use environment variables for admin access:

1. Set `ADMIN_EMAILS` in Vercel (comma-separated):
   ```
   ADMIN_EMAILS=admin1@example.com,admin2@example.com
   ```

2. Or set `ADMIN_EMAIL_PATTERN` for regex matching:
   ```
   ADMIN_EMAIL_PATTERN=.*@thejobbridge-inc\.com
   ```

## Finding User IDs

To find a user's ID:
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user and copy their UUID
3. Use that UUID in the script or SQL query

## How Admin Access Works

The app checks admin status in this order:
1. `user.role === "admin"` (from database)
2. Email in `ADMIN_EMAILS` env var
3. Email matches `ADMIN_EMAIL_PATTERN` env var

**Note:** The database `role` column is the primary method. Environment variables are fallbacks.

## After Setting Admin

- The user needs to **sign out and sign back in** for the role to take effect
- Or wait for their token to refresh (Supabase tokens refresh automatically)
- Admin users can access `/admin/blog` and other admin routes
