# Clerk Redirect URIs - Quick Setup Guide

## Your Domain
**Production Domain**: `thejobbridge-inc.com`

## Step 1: Go to Clerk Dashboard

1. Visit: https://dashboard.clerk.com
2. Select your application
3. Go to **Configure** → **Paths** (or Settings → Paths)**

## Step 2: Add These Redirect URIs

In the **Redirect URIs** section, add these URIs (one per line):

### Minimum Required (Add these first):

```
https://thejobbridge-inc.com
https://thejobbridge-inc.com/*
```

### For OAuth/Social Logins (if you enable Google, GitHub, etc.):

```
https://thejobbridge-inc.com/auth/sso-callback
```

### For Development (optional - for local testing):

```
http://localhost:5000
http://localhost:5000/*
```

## Step 3: Save

Click **Save** or **Apply** - changes take effect immediately.

## What Each URI Does

- `https://thejobbridge-inc.com` - Base domain redirect
- `https://thejobbridge-inc.com/*` - Allows any path on your domain (recommended)
- `https://thejobbridge-inc.com/auth/sso-callback` - For OAuth callbacks (Google, GitHub, etc.)

## Important Notes

⚠️ **Exact Match Required**: URIs must match exactly (case-sensitive, no trailing slashes unless specified)

⚠️ **HTTPS Required**: Production URIs must use `https://` (HTTP only for localhost)

⚠️ **Wildcard**: The `/*` pattern allows any sub-path, which is useful for dynamic redirects

## After Adding URIs

1. **Test immediately**: Visit `/auth/sign-up` and try creating an account
2. **Check for errors**: Look in browser console for any redirect errors
3. **Verify in Clerk**: Check your Clerk dashboard → Users to see if signups are working

## Troubleshooting

**"Redirect URI mismatch" error?**
- Verify the URI in Clerk exactly matches your domain
- Check for `www.` vs non-`www.` (your app uses non-www)
- Ensure using `https://` not `http://` for production

**Still not working?**
- Make sure you saved the changes in Clerk dashboard
- Clear browser cache and try again
- Check that environment variables are set correctly in Vercel
