# Quick Admin Access - Get Access Now

## Fastest Method: Add Your Email to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variable:**
   - Go to **Settings** → **Environment Variables**
   - Click **Add New**
   - **Name:** `ADMIN_EMAILS`
   - **Value:** Your email address (the one you use to sign in)
   - **Environment:** Check ✅ **Production** (and Preview if you want)
   - Click **Save**

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**
   - OR wait for the next auto-deploy

4. **Sign Out and Sign Back In:**
   - Go to your website
   - Sign out completely
   - Sign back in with the same email

5. **Access Admin:**
   - Go to: `https://thejobbridge-inc.com/admin/blog`
   - You should now have access!

## Alternative: Set Role in Database

If you have access to Supabase:

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click **SQL Editor** in the left sidebar

3. **Run This Query:**
   ```sql
   -- Replace with your actual email
   UPDATE users
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

4. **Sign Out and Sign Back In:**
   - Sign out from your website
   - Sign back in

5. **Access Admin:**
   - Go to: `https://thejobbridge-inc.com/admin/blog`

## Find Your Email

If you're not sure what email you're using:

1. **Check Supabase:**
   - Supabase Dashboard → **Authentication** → **Users**
   - Find your user and copy the email

2. **Check Your Profile:**
   - Sign in to your website
   - Go to `/profile` or `/dashboard`
   - Your email should be visible there

## Troubleshooting

**Still can't access?**
1. Make sure you're signed in (try `/dashboard` first)
2. Clear browser cache and cookies
3. Try incognito/private browsing mode
4. Check browser console (F12) for errors
5. Verify the email in Vercel matches exactly (case-sensitive)

## Direct Admin Login (Alternative)

If you have a separate admin account with password:
- Go to: `https://thejobbridge-inc.com/admin/login`
- This uses email/password (different from Supabase auth)
