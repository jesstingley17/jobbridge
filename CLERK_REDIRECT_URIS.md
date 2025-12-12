# Clerk Redirect URIs Configuration

## Where to Add Redirect URIs

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Configure** → **Paths** (or **Settings** → **Paths**)
4. Find the **Redirect URIs** section

## Required Redirect URIs

Add the following URIs to your Clerk application:

### Production (Required)

```
https://thejobbridge-inc.com
https://thejobbridge-inc.com/*
```

### For OAuth/Social Logins (if you enable them)

If you plan to use social logins (Google, GitHub, etc.), also add:

```
https://thejobbridge-inc.com/auth/sso-callback
https://thejobbridge-inc.com/api/auth/callback
```

### Development (Optional - for local testing)

If you want to test locally, add:

```
http://localhost:5000
http://localhost:5000/*
http://localhost:5000/auth/sso-callback
```

### Vercel Preview URLs (Optional)

If you want to test preview deployments:

```
https://*.vercel.app
https://*.vercel.app/*
```

## Step-by-Step Instructions

### In Clerk Dashboard:

1. **Navigate to Paths Settings**:
   - Go to https://dashboard.clerk.com
   - Select your application
   - Click **Configure** in the sidebar
   - Click **Paths** (or go to **Settings** → **Paths**)

2. **Add Redirect URIs**:
   - Find the **Redirect URIs** section
   - Click **Add URI** or the **+** button
   - Add each URI one by one:

   **Minimum Required:**
   ```
   https://thejobbridge-inc.com
   ```

   **Recommended (for full functionality):**
   ```
   https://thejobbridge-inc.com
   https://thejobbridge-inc.com/*
   https://thejobbridge-inc.com/auth/sso-callback
   ```

3. **Save Changes**:
   - Click **Save** or **Apply**
   - Changes take effect immediately

## Important Notes

### Wildcard URIs
- `https://thejobbridge-inc.com/*` allows any path on your domain
- This is useful if Clerk needs to redirect to different pages after authentication

### Exact Match Required
- Clerk requires **exact matches** for OAuth redirects
- Make sure there are no trailing slashes unless needed
- Case-sensitive: `https://TheJobBridge-Inc.com` ≠ `https://thejobbridge-inc.com`

### HTTPS Required
- Production URIs **must** use `https://`
- HTTP is only allowed for localhost development

## Current Configuration in Your App

Based on your code, your app uses:
- **Domain**: `thejobbridge-inc.com`
- **Auth Routes**: `/auth/sign-in`, `/auth/sign-up`
- **After Auth Redirect**: `/early-access`
- **Callback Route**: `/api/callback` (for legacy auth, not needed for Clerk)

## Testing

After adding the redirect URIs:

1. **Test Sign Up**:
   - Visit `https://thejobbridge-inc.com/auth/sign-up`
   - Create an account
   - Should redirect to `/early-access` after signup

2. **Test Sign In**:
   - Visit `https://thejobbridge-inc.com/auth/sign-in`
   - Sign in with your account
   - Should redirect to `/early-access` after signin

3. **Test Social Logins** (if enabled):
   - Try signing in with Google/GitHub
   - Should redirect back to your app after OAuth

## Troubleshooting

### "Redirect URI mismatch" error:
- Check that the URI in Clerk exactly matches the one in your app
- Verify no trailing slashes
- Check for `www.` vs non-`www.` mismatch
- Ensure using `https://` in production

### OAuth not working:
- Verify redirect URIs are added in Clerk
- Check that social login providers are enabled in Clerk
- Verify the callback URL matches exactly

## Quick Reference

**Minimum Setup:**
```
https://thejobbridge-inc.com
```

**Recommended Setup:**
```
https://thejobbridge-inc.com
https://thejobbridge-inc.com/*
https://thejobbridge-inc.com/auth/sso-callback
```

**Full Setup (with development):**
```
https://thejobbridge-inc.com
https://thejobbridge-inc.com/*
https://thejobbridge-inc.com/auth/sso-callback
http://localhost:5000
http://localhost:5000/*
```
