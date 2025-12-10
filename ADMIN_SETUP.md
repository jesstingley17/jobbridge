# Admin Setup Guide

## Quick Start

### 1. Create Admin User Account

Run the admin user creation script:

```bash
tsx scripts/create-admin-user.ts
```

This will create/update the admin user with:
- **Email**: `jessicaleetingley@outlook.com`
- **Password**: `Axel@1417!`
- **Role**: `admin`

### 2. Access Admin Panel

1. Navigate to `/admin/login`
2. Enter your credentials:
   - Email: `jessicaleetingley@outlook.com`
   - Password: `Axel@1417!`
3. You'll be redirected to `/admin/blog` to manage your blog posts

## Admin Features

### Blog Management (`/admin/blog`)
- ✅ Create new blog posts
- ✅ Edit existing posts
- ✅ Delete posts
- ✅ View all posts (published and drafts)
- ✅ Sync posts from Contentful
- ✅ View post statistics (views, dates, tags)

### Forgot Password

If you forget your password:
1. Go to `/admin/login`
2. Click "Forgot your password?"
3. Enter your admin email
4. Check your email for a reset link
5. Click the link to reset your password

## Environment Variables

Add to your `.env.local` (and Vercel):

```bash
# Admin Configuration
ADMIN_EMAILS=jessicaleetingley@outlook.com
# Or use a pattern:
# ADMIN_EMAIL_PATTERN=.*@outlook\.com
```

## Security Notes

- Admin login uses session-based authentication
- Admin routes are protected with `isAdmin` middleware
- Password reset tokens expire after 15 minutes
- Admin sessions are separate from regular user sessions

## Manual Admin User Creation

If you need to create an admin user manually:

```sql
-- Hash the password first (use bcrypt with 10 rounds)
-- Then insert:
INSERT INTO users (email, password, first_name, last_name, role, email_verified)
VALUES (
  'jessicaleetingley@outlook.com',
  '$2b$10$...', -- hashed password
  'Jessica-Lee',
  'Tingley',
  'admin',
  true
);
```

## Troubleshooting

### Can't log in?
1. Make sure the admin user exists (run the script)
2. Check that `ADMIN_EMAILS` env var includes your email
3. Verify the password is correct

### Forgot password not working?
1. Check that email service (Resend) is configured
2. Verify `RESEND_API_KEY` is set
3. Check spam folder for reset emails

### Access denied?
1. Ensure your user has `role = 'admin'` in the database
2. Or add your email to `ADMIN_EMAILS` env var
3. Clear browser cookies and try again

