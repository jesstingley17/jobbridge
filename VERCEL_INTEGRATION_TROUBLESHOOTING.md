# Vercel Integration Provisioning Failed - Troubleshooting Guide

## Common Causes

The "provisioning integrations failed" error in Vercel typically happens when:

1. **Database Integration Issues**
   - Supabase/Postgres integration not properly configured
   - Missing or incorrect connection strings
   - Integration not authorized/connected

2. **Environment Variables**
   - Required env vars not set in Vercel
   - Integration auto-provisioning failed

3. **Build Configuration**
   - Build command failing
   - Missing dependencies

## Quick Fixes

### Option 1: Check Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Check Integrations Tab**
   - Go to **Settings** → **Integrations**
   - Look for any failed integrations (red indicators)
   - Check if Supabase/Postgres integration is connected

3. **Check Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Verify these are set:
     - `DATABASE_URL` (or `POSTGRES_PRISMA_URL`)
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `VITE_SUPABASE_ANON_KEY`

### Option 2: Reconnect Database Integration

If you're using Vercel's Postgres integration:

1. **Remove and Re-add Integration**
   - Go to **Settings** → **Integrations**
   - Find Postgres/Supabase integration
   - Click **Disconnect**
   - Re-add the integration
   - Ensure connection string is correct

2. **For Supabase (External Database)**
   - You don't need Vercel's Postgres integration
   - Just ensure `DATABASE_URL` env var is set correctly
   - Get connection string from Supabase Dashboard → Settings → Database

### Option 3: Manual Environment Variable Setup

If auto-provisioning failed, set variables manually:

1. **Get Database Connection String**
   - Supabase: Dashboard → Settings → Database → Connection string (URI mode)
   - Format: `postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`

2. **Set in Vercel**
   - Go to **Settings** → **Environment Variables**
   - Add `DATABASE_URL` with your connection string
   - Select all environments (Production, Preview, Development)
   - Click **Save**

3. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment
   - Or push a new commit

### Option 4: Check Build Logs

1. **View Deployment Logs**
   - Go to **Deployments** tab
   - Click on the failed deployment
   - Check **Build Logs** for specific errors

2. **Common Build Errors:**
   - Missing environment variables
   - Database connection timeout
   - SSL certificate errors (we fixed this ✅)

### Option 5: Disable Auto-Provisioning

If you're using an external database (Supabase), you might not need Vercel's integration:

1. **Remove Vercel Postgres Integration** (if added)
   - Go to **Settings** → **Integrations**
   - Remove any Postgres integrations
   - Use only `DATABASE_URL` env var

2. **Use External Database Only**
   - Your Supabase database is external
   - No Vercel integration needed
   - Just set `DATABASE_URL` manually

## Step-by-Step: Fix Integration Error

### Step 1: Verify Environment Variables

Check that these are set in Vercel:

```bash
# Required for database
DATABASE_URL=postgres://...

# Required for Supabase auth
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_PROJECT_ID=...

# Required for sessions
SESSION_SECRET=...
```

### Step 2: Check Integration Status

1. Go to Vercel Dashboard → Your Project → Settings → Integrations
2. Look for:
   - ✅ Green checkmark = Working
   - ❌ Red X = Failed
   - ⚠️ Yellow warning = Needs attention

### Step 3: Reconnect or Remove Integration

**If using Vercel Postgres:**
- Reconnect the integration
- Verify connection string is generated

**If using Supabase (external):**
- Remove Vercel Postgres integration (if present)
- Use only `DATABASE_URL` env var
- No integration needed

### Step 4: Redeploy

After fixing:
1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Or push a new commit to trigger deployment

## Verification

After fixing, check:

1. **Deployment succeeds** - No "provisioning integrations failed" error
2. **Environment variables present** - All required vars are set
3. **Database connects** - Check logs for connection success
4. **App works** - Test admin login and other database operations

## Still Having Issues?

1. **Check Vercel Status**: https://vercel-status.com
2. **Review Build Logs**: Look for specific error messages
3. **Test Database Connection**: Use a simple script to verify `DATABASE_URL` works
4. **Contact Vercel Support**: If issue persists, contact support with deployment logs

## Prevention

To avoid this in the future:

1. ✅ Set all environment variables before first deployment
2. ✅ Use external database (Supabase) instead of Vercel Postgres (if applicable)
3. ✅ Document required environment variables
4. ✅ Test database connection locally before deploying

---

**Last Updated:** After SSL certificate fixes
**Related Issues:** Database connection, environment variables, Vercel integrations
