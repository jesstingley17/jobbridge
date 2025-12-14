# Fix: "Legacy API keys are disabled" Error

This error occurs when Supabase has migrated to new API keys, but your app is still using the old/legacy keys.

## Quick Fix

### Step 1: Get New API Keys from Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the new one, not the legacy one)

### Step 2: Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Update these variables:

   **Update `VITE_SUPABASE_URL`:**
   - Find `VITE_SUPABASE_URL` in the list
   - Click "Edit"
   - Replace with your new Project URL from Supabase
   - Format: `https://xxxxx.supabase.co` (no trailing slash)

   **Update `VITE_SUPABASE_ANON_KEY`:**
   - Find `VITE_SUPABASE_ANON_KEY` in the list
   - Click "Edit"
   - Replace with your new **anon/public** key from Supabase
   - This is the long string starting with `eyJ...`

   **Update `SUPABASE_URL` (if it exists):**
   - Find `SUPABASE_URL` in the list
   - Click "Edit"
   - Replace with the same Project URL

   **Update `SUPABASE_SERVICE_ROLE_KEY` (if needed):**
   - Find `SUPABASE_SERVICE_ROLE_KEY` in the list
   - Click "Edit"
   - Replace with your new **service_role** key from Supabase
   - ⚠️ This is different from the anon key - it's the secret key

### Step 3: Redeploy

After updating the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a redeploy

### Step 4: Verify

After redeploy, test:
1. Go to `/admin/login`
2. Try logging in
3. The error should be gone

## How to Identify New vs Legacy Keys

**New API Keys:**
- Start with `eyJ` (JWT format)
- Longer strings
- Found in **Settings → API → Project API keys**

**Legacy Keys:**
- Shorter strings
- May have different format
- Supabase shows a warning if you try to use them

## Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `VITE_SUPABASE_URL` - Your Supabase project URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Your new anon/public key
- ✅ `SUPABASE_URL` - Same as VITE_SUPABASE_URL (for server-side)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for admin operations)

## Still Having Issues?

If you still see the error after updating:

1. **Clear browser cache** - Old keys might be cached
2. **Check Vercel logs** - Look for any Supabase-related errors
3. **Verify keys in Supabase Dashboard** - Make sure you copied the correct keys
4. **Check for typos** - Ensure no extra spaces or characters

## Need Help?

If you're unsure which keys to use:
1. In Supabase Dashboard → Settings → API
2. Look for the **"Project API keys"** section
3. Use the keys marked as **"Active"** (not "Legacy")

---

**Last Updated**: After fixing "Legacy API keys are disabled" error
**Status**: Ready to use
