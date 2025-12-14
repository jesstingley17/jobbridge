# Fix Admin Panel Access

If you can't access the admin panel at `/admin/blog`, follow these steps:

## Quick Fix: Set Your Email as Admin

### Option 1: Add Your Email to Vercel Environment Variables (Easiest)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `ADMIN_EMAILS`
   - **Value:** `your-email@example.com` (use your actual email)
   - **Environment:** Production (and Preview if you want)
4. **Redeploy** your project (or wait for auto-deploy)
5. **Sign out and sign back in** to your account
6. Try accessing `/admin/blog` again

### Option 2: Set Role in Database (Permanent)

Run this SQL in your Supabase SQL Editor:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Then:
1. **Sign out and sign back in** to your account
2. Try accessing `/admin/blog` again

### Option 3: Use the Script (If Running Locally)

If you have the project running locally with database access:

```bash
npm run set-admin your-email@example.com
```

## Verify Your Email

To find your user email:
1. Sign in to your app
2. Check your profile or account settings
3. Or check Supabase Dashboard → Authentication → Users

## Still Not Working?

1. **Clear your browser cache and cookies**
2. **Sign out completely** and sign back in
3. **Check browser console** for any errors (F12 → Console)
4. **Verify you're signed in** - try accessing `/dashboard` first

## Admin Login Page

If you need to use the separate admin login (for users with password auth):
- Go to: `https://thejobbridge-inc.com/admin/login`
- This uses email/password authentication (different from Supabase auth)
