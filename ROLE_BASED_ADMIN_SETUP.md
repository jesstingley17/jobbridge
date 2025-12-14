# Role-Based Admin System Setup

This document explains the new role-based admin system that replaces the simple `user.role` field approach.

## What Changed

### Before
- Admin access checked via `user.role === "admin"` or environment variables
- Limited to single role per user
- Hard to scale for multiple roles

### After
- Admin access checked via `user_roles` and `roles` tables
- Supports multiple roles per user
- Scalable for future roles (moderator, editor, etc.)

## Database Tables

### `public.roles`
Stores available roles:
- `id` (VARCHAR, primary key)
- `name` (VARCHAR, unique) - e.g., 'admin', 'moderator', 'editor'
- `description` (TEXT)
- `created_at` (TIMESTAMP)

### `public.user_roles`
Junction table linking users to roles:
- `id` (VARCHAR, primary key)
- `user_id` (VARCHAR, references users.id)
- `role_id` (VARCHAR, references roles.id)
- `created_at` (TIMESTAMP)
- Unique constraint on (user_id, role_id)

## Migration

Run the migration to create the tables:

```sql
-- See migrations/create_roles_system.sql
```

Or run it directly in Supabase SQL Editor.

## Assigning Admin Role

### Method 1: SQL (Recommended)

```sql
-- Find user ID by email
SELECT id FROM public.users WHERE email = 'jessicaleetingley@outlook.com';

-- Assign admin role (replace USER_ID with actual ID)
INSERT INTO public.user_roles (user_id, role_id)
SELECT 'USER_ID', r.id
FROM public.roles r
WHERE r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

### Method 2: One-liner (if user exists)

```sql
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u
CROSS JOIN public.roles r
WHERE u.email = 'jessicaleetingley@outlook.com' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

## How It Works

The `isAdmin` middleware now:

1. **Primary check**: Queries `user_roles` table for admin role
2. **Fallback 1**: Checks legacy `user.role === "admin"` field
3. **Fallback 2**: Checks `ADMIN_EMAILS` environment variable
4. **Fallback 3**: Checks `ADMIN_EMAIL_PATTERN` environment variable

This ensures backward compatibility while using the new system.

## Adding More Roles

To add a new role (e.g., 'moderator'):

```sql
INSERT INTO public.roles (name, description) 
VALUES ('moderator', 'Can moderate content but not manage settings')
ON CONFLICT (name) DO NOTHING;
```

Then create middleware similar to `isAdmin`:

```typescript
export const isModerator: RequestHandler = async (req: any, res, next) => {
  // Similar to isAdmin but check for 'moderator' role
};
```

## Current Admin User

- **Email**: jessicaleetingley@outlook.com
- **Role**: admin (assigned via migration)

## Testing

1. Run the migration
2. Verify admin role is assigned:
   ```sql
   SELECT u.email, r.name as role
   FROM public.users u
   JOIN public.user_roles ur ON ur.user_id = u.id
   JOIN public.roles r ON r.id = ur.role_id
   WHERE u.email = 'jessicaleetingley@outlook.com';
   ```
3. Sign out and sign back in
4. Try accessing `/admin/blog` - should work!

## Backward Compatibility

The system maintains backward compatibility:
- Old `user.role` field still works
- `ADMIN_EMAILS` env var still works
- `ADMIN_EMAIL_PATTERN` env var still works

However, the new role-based system is the primary method and should be used going forward.
