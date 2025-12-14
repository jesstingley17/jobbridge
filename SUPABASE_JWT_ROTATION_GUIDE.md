# Supabase JWT Secret Rotation Guide

⚠️ **CRITICAL OPERATION**: Rotating the JWT secret will invalidate ALL existing tokens (anon, service_role, and user access tokens). This requires immediate updates to all services.

## What This Does

When you rotate the JWT secret:
- ✅ **All existing anon/service_role keys become invalid** - Your app will stop working until you update env vars
- ✅ **All user access tokens start rotating** - Users will need to re-authenticate
- ✅ **New keys are generated** - You'll get fresh anon and service_role keys
- ⚠️ **Downtime expected** - Plan for 5-15 minutes of service interruption

## Prerequisites

Before starting, ensure you have:
1. ✅ Access to Supabase Dashboard
2. ✅ Access to Vercel Dashboard (or wherever your env vars are stored)
3. ✅ All hardcoded keys removed from codebase (already done ✅)
4. ✅ Team notified about planned maintenance window

## Step-by-Step Rotation Process

### Step 1: Prepare for Downtime

1. **Notify your team/users** (if applicable)
   - "Scheduled maintenance: Authentication will be temporarily unavailable"

2. **Have these ready:**
   - Supabase Dashboard open
   - Vercel Dashboard open (Settings > Environment Variables)
   - A text editor to temporarily store new keys

3. **Time estimate:** 5-15 minutes of downtime

### Step 2: Rotate JWT Secret in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `mkkmfocbujeeayenvxtl`

2. **Navigate to API Settings**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **API** under Project Settings

3. **Find JWT Secret Section**
   - Scroll down to find **"JWT Settings"** or **"JWT Secret"**
   - Look for a button like **"Reset JWT Secret"** or **"Rotate JWT Secret"**

4. **Rotate the Secret**
   - Click **"Rotate JWT Secret"** or similar button
   - ⚠️ **Confirm the action** (Supabase will warn you about the impact)
   - The rotation happens immediately

5. **Get New Keys**
   - After rotation, new **anon key** and **service_role key** will be displayed
   - ⚠️ **Copy both keys immediately** - you won't see them again!
   - Store them temporarily in a secure text editor (not in the codebase!)

### Step 3: Update Environment Variables in Vercel

⚠️ **Do this immediately** - your app is broken until these are updated!

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `jobbridge` (or your project name)

2. **Navigate to Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Update Supabase Keys**

   **Update `VITE_SUPABASE_ANON_KEY`:**
   - Find `VITE_SUPABASE_ANON_KEY` in the list
   - Click the **three dots** (⋯) next to it
   - Click **Edit**
   - Paste the new **anon key** from Step 2
   - Select all environments: **Production**, **Preview**, **Development**
   - Click **Save**

   **Update `SUPABASE_SERVICE_ROLE_KEY`:**
   - Find `SUPABASE_SERVICE_ROLE_KEY` in the list
   - Click the **three dots** (⋯) next to it
   - Click **Edit**
   - Paste the new **service_role key** from Step 2
   - ⚠️ **Only select Production** (service role should never be in preview/dev)
   - Click **Save**

   **Update `VITE_SUPABASE_URL` (if it changed):**
   - Check if the URL changed (usually it doesn't)
   - If it did, update `VITE_SUPABASE_URL` as well

4. **Redeploy Your Application**
   - Go to **Deployments** tab
   - Find the latest deployment
   - Click **three dots** (⋯) > **Redeploy**
   - Or push a new commit to trigger automatic deployment

### Step 4: Update Local Development Environment

If you have a local `.env.local` file:

1. **Open `.env.local`** (in your project root)
2. **Update these values:**
   ```bash
   VITE_SUPABASE_ANON_KEY=<new-anon-key-from-step-2>
   SUPABASE_SERVICE_ROLE_KEY=<new-service-role-key-from-step-2>
   ```
3. **Save the file**
4. **Restart your dev server** if it's running

### Step 5: Verify Everything Works

1. **Wait for Vercel deployment** (2-5 minutes)
   - Check deployment status in Vercel dashboard
   - Wait for "Ready" status

2. **Test Authentication**
   - Visit your site: https://thejobbridge-inc.com
   - Try logging in with a test account
   - Verify authentication works

3. **Test Admin Functions**
   - Try admin login: https://thejobbridge-inc.com/admin/login
   - Verify admin panel loads correctly

4. **Check for Errors**
   - Open browser console (F12)
   - Look for any Supabase authentication errors
   - Check Vercel function logs for errors

### Step 6: Monitor and Clean Up

1. **Check Supabase Logs**
   - Go to Supabase Dashboard > **Logs** > **API Logs**
   - Verify no unauthorized access attempts
   - Check for any errors

2. **Delete Temporary Key Storage**
   - Delete the text file where you temporarily stored keys
   - Never commit keys to git (already handled ✅)

3. **Notify Team**
   - "Maintenance complete - authentication restored"
   - Users may need to log in again

## Troubleshooting

### Issue: "Invalid API key" errors

**Solution:**
- Double-check you updated the correct environment variables
- Ensure Vercel deployment completed successfully
- Clear browser cache and try again
- Verify keys match exactly (no extra spaces)

### Issue: Users can't log in

**Solution:**
- This is expected - users need to re-authenticate after JWT rotation
- Ask users to log out and log back in
- Clear browser localStorage if needed

### Issue: Admin panel not working

**Solution:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` was updated in Vercel
- Check Vercel function logs for authentication errors
- Ensure service role key is only in Production environment

### Issue: Deployment failed

**Solution:**
- Check Vercel build logs for errors
- Verify environment variable names are correct
- Ensure no syntax errors in the key values

## Prevention: Best Practices

✅ **Never hardcode secrets** - Always use environment variables (already done ✅)
✅ **Use different keys per environment** - Service role should only be in production
✅ **Rotate keys regularly** - Consider rotating every 90 days
✅ **Monitor for leaks** - Use GitHub secret scanning (already enabled ✅)
✅ **Document rotation process** - This guide serves as documentation

## Quick Reference: Environment Variables to Update

After JWT rotation, update these in Vercel:

- ✅ `VITE_SUPABASE_ANON_KEY` → New anon key (all environments)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` → New service_role key (production only)
- ⚠️ `VITE_SUPABASE_URL` → Usually unchanged, but verify

## Support

If you encounter issues:
1. Check Supabase status: https://status.supabase.com
2. Review Supabase logs in dashboard
3. Check Vercel deployment logs
4. Verify environment variables are set correctly

---

**Last Updated:** After security fix (removed hardcoded keys) - Test redeployment
**Next Rotation:** Consider scheduling every 90 days
