# Fix Admin Blog Page Errors - Step by Step Guide

## Current Errors

1. ✅ `/site.webmanifest` - 429 (Too Many Requests) - **FIXED** (route moved to top)
2. ❌ `/api/admin/blog/posts` - 500 error
3. ❌ `/api/subscription/status` - 500 error  
4. ❌ `/api/contentful/sync` - 500 error

## Root Cause

**You are not authenticated.** The page is trying to access admin endpoints without being logged in.

## Step-by-Step Fix

### Step 1: Check Vercel Deployment Status

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: **The-JobBridge-Inc**
3. Check the **Deployments** tab
4. Make sure the latest deployment is **Ready** (green checkmark)
5. If still deploying, wait 1-2 minutes

### Step 2: Clear Browser Cache

1. **Hard refresh** the page:
   - **Mac**: `Cmd + Shift + R`
   - **Windows/Linux**: `Ctrl + Shift + R`
2. Or open in **Incognito/Private window** to test

### Step 3: Log In to Admin Panel

**You MUST log in first before accessing the admin blog page.**

1. Go to: `https://thejobbridge-inc.com/admin/login`
2. Enter your admin credentials:
   - **Email**: `jessicaleetingley@outlook.com` (or your admin email)
   - **Password**: (your admin password)
3. Click **Login**

### Step 4: Verify Admin Access

After logging in, you should be redirected to `/admin/blog`. If you still see errors:

#### Option A: Check Database Admin Role

Run this SQL in Supabase SQL Editor:

```sql
-- Check if you have admin role
SELECT 
  u.email,
  r.name as role_name
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
WHERE u.email = 'jessicaleetingley@outlook.com';
```

If no admin role is found, assign it:

```sql
-- Assign admin role
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u
CROSS JOIN public.roles r
WHERE u.email = 'jessicaleetingley@outlook.com' 
  AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

#### Option B: Use Environment Variable Fallback

If the database role doesn't work, add to Vercel environment variables:

1. Go to Vercel → Settings → Environment Variables
2. Add:
   ```
   ADMIN_EMAILS=jessicaleetingley@outlook.com
   ```
3. Redeploy

### Step 5: Test the Endpoints

After logging in, the endpoints should work:

1. **Admin Blog Posts**: Should return `{ posts: [] }` (empty array if no posts)
2. **Subscription Status**: Should return default free tier status
3. **Contentful Sync**: Should work if Contentful is configured

## Expected Behavior After Fix

✅ **When NOT logged in:**
- Page redirects to `/admin/login`
- Endpoints return `401 Unauthorized` (not 500)

✅ **When logged in as admin:**
- Page loads successfully
- Endpoints return data or empty arrays
- No 500 errors

## Troubleshooting

### Still seeing 500 errors after login?

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on a failed function
   - Check the logs for detailed error messages

2. **Check Database Connection:**
   - Verify `DATABASE_URL` is set in Vercel
   - Test connection in Supabase dashboard

3. **Check Authentication:**
   - Sign out completely
   - Clear browser cookies
   - Sign back in

### Site.webmanifest 429 Error

This is a rate limiting issue. The browser is requesting the manifest too frequently. This should resolve itself, but if it persists:

1. The route is now at the top of routes (should be fixed)
2. Wait a few minutes and refresh
3. The 429 will clear once the rate limit resets

## Browser Extension Errors (Can Ignore)

These errors are from browser extensions and **do not affect your site**:

- ❌ `share-modal.js` errors
- ❌ `contentOverview.js` errors  
- ❌ `foreground.js` errors
- ❌ `dynamic_optimization.js` (SearchAtlas)
- ❌ Chrome extension connection errors

**You can safely ignore all of these.** They're from extensions trying to interact with your page.

## Quick Checklist

- [ ] Vercel deployment is complete
- [ ] Hard refreshed the page
- [ ] Logged in at `/admin/login`
- [ ] Verified admin role in database
- [ ] Tested endpoints after login
- [ ] Checked Vercel function logs if still failing

## Next Steps After Fix

Once the admin panel works:

1. **Add Contentful environment variables** to Vercel:
   ```
   CONTENTFUL_SPACE_ID=h4k9k4nfr6pp
   CONTENTFUL_ACCESS_TOKEN=LBvEilIyjKTWGl3XNVzoi0_lkQ8QsS3V_WE-rDwtCsI
   CONTENTFUL_ENVIRONMENT=master
   ```

2. **Test Contentful sync** using the "Sync from Contentful" button

3. **Create your first blog post** in the admin panel
