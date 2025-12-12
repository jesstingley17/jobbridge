# Clerk Redirect URIs - Final Setup Instructions

## Important: Two Different Scenarios

### Scenario 1: Using Clerk for Your App (What You Need) ✅
You're using Clerk to authenticate users in YOUR React app. For this, you need to add **Redirect URIs** in Clerk's **Paths** settings.

### Scenario 2: Using Clerk as OAuth Provider (Not What You Need)
The SSO documentation you shared is for using Clerk as an OAuth provider FOR OTHER APPS. That's different and requires creating an OAuth Application in Clerk.

## What You Need to Do (Scenario 1)

### Step 1: Go to Clerk Dashboard

1. Visit: https://dashboard.clerk.com
2. Select your application: **thejobbridge-inc.com**
3. Go to **Configure** → **Paths** (or **Settings** → **Paths**)

### Step 2: Find "Redirect URIs" Section

Look for a section called:
- **Redirect URIs**
- **Allowed Redirect URIs**
- **OAuth Redirect URIs**
- **Paths** → **Redirect URIs**

### Step 3: Add These URIs

Click **Add URI** or **+** and add these one by one:

```
https://thejobbridge-inc.com
https://thejobbridge-inc.com/*
https://thejobbridge-inc.com/auth/sso-callback
```

### Step 4: Save

Click **Save** or **Apply**

## Alternative Location (If Not in Paths)

If you don't see Redirect URIs in Paths, try:

1. **Configure** → **OAuth Applications** → Select your app → **Redirect URIs**
2. **Settings** → **OAuth** → **Redirect URIs**
3. **Settings** → **Paths** → **Redirect URIs**

## Your Clerk OAuth Endpoints (Already Configured)

These are already set up and working:
- Discovery URL: `https://clerk.thejobbridge-inc.com/.well-known/openid-configuration`
- Authorize URL: `https://clerk.thejobbridge-inc.com/oauth/authorize`
- Token URL: `https://clerk.thejobbridge-inc.com/oauth/token`
- User Info URL: `https://clerk.thejobbridge-inc.com/oauth/userinfo`

✅ You don't need to configure these - they're provided by Clerk.

## What the SSO Documentation is For

The [Clerk SSO documentation](https://clerk.com/docs/guides/configure/auth-strategies/oauth/single-sign-on) you shared is for:
- **Option 1**: Letting users sign in with Google/GitHub/etc. (social logins)
- **Option 2**: Using YOUR Clerk app as an OAuth provider for OTHER apps

For your use case (Clerk authentication in your React app), you just need to add the Redirect URIs as shown above.

## Quick Checklist

- [ ] Go to Clerk Dashboard → Configure → Paths
- [ ] Find "Redirect URIs" section
- [ ] Add: `https://thejobbridge-inc.com`
- [ ] Add: `https://thejobbridge-inc.com/*`
- [ ] Add: `https://thejobbridge-inc.com/auth/sso-callback` (if using social logins)
- [ ] Click Save
- [ ] Test by visiting `/auth/sign-up`

## Still Can't Find It?

If you can't find the Redirect URIs field:

1. **Check your Clerk plan** - Some features may require a specific plan
2. **Look in different sections**:
   - Configure → Paths
   - Settings → Paths
   - Configure → OAuth Applications
   - Settings → OAuth
3. **Contact Clerk Support** - They can guide you to the exact location

## After Adding URIs

1. Visit: `https://thejobbridge-inc.com/auth/sign-up`
2. Try creating an account
3. Should redirect to `/early-access` after signup
4. Check browser console for any errors

The Redirect URIs tell Clerk where it's allowed to send users after they authenticate. Without these, Clerk will reject the authentication flow for security reasons.
