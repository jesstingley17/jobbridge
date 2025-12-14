# Verify Admin Access After Migration

## Step 1: Verify Tables Were Created

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'user_roles');
```

Should return 2 rows: `roles` and `user_roles`

## Step 2: Verify Admin Role Exists

```sql
SELECT * FROM public.roles WHERE name = 'admin';
```

Should return 1 row with the admin role.

## Step 3: Verify Your Admin Assignment

```sql
SELECT 
  u.email,
  u.id as user_id,
  r.name as role_name,
  ur.created_at as assigned_at
FROM public.users u
JOIN public.user_roles ur ON ur.user_id = u.id
JOIN public.roles r ON r.id = ur.role_id
WHERE u.email = 'jessicaleetingley@outlook.com';
```

Should return 1 row showing you have the 'admin' role.

## Step 4: Test Admin Access

1. **Sign out** from your website completely
2. **Sign back in** with `jessicaleetingley@outlook.com`
3. **Visit**: `https://thejobbridge-inc.com/admin/blog`
4. You should see the admin blog management interface

## Troubleshooting

### If admin role is not assigned:

Run this to manually assign it:

```sql
-- First, get your user ID
SELECT id, email FROM public.users WHERE email = 'jessicaleetingley@outlook.com';

-- Then assign admin role (replace USER_ID with the ID from above)
INSERT INTO public.user_roles (user_id, role_id)
SELECT 'USER_ID', r.id
FROM public.roles r
WHERE r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

### If tables don't exist:

Re-run the migration from `migrations/create_roles_system.sql` in Supabase SQL Editor.

### If you still can't access:

1. Clear browser cache and cookies
2. Try incognito/private browsing
3. Check browser console (F12) for errors
4. Verify you're signed in (try `/dashboard` first)
