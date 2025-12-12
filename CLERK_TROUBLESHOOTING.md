# Clerk Troubleshooting Guide

## Issue: Sign Up Box Not Showing

If the Clerk sign-up form is not appearing, check the following:

### 1. Check Browser Console

Open your browser's developer console (F12) and look for:
- Any Clerk-related errors
- Check if `VITE_CLERK_PUBLISHABLE_KEY` is logged as "Set" or "Not set"
- Look for any React rendering errors

### 2. Verify Environment Variables

Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set:
- In Vercel: Settings → Environment Variables
- Locally: Check `.env.local` file

### 3. Check Route Detection

The component checks if the URL contains "sign-up". Visit:
- `/auth/sign-up` (should show SignUp)
- `/auth/sign-in` (should show SignIn)
- `/auth` (should show SignIn by default)

### 4. Verify ClerkProvider

Make sure your app is wrapped with `<ClerkProvider>` in `App.tsx`. Check:
- Is `CLERK_PUBLISHABLE_KEY` defined?
- Is the ClerkProvider wrapping your app?

### 5. Check Builder.io Interference

If Builder.io is configured, it might be taking priority. The AuthWrapper checks:
1. Builder.io content (if exists)
2. Clerk (if configured)
3. Default auth (fallback)

### 6. Test Directly

Visit `/clerk-test` to see:
- If Clerk is configured
- Authentication status
- User information (if signed in)

### 7. Common Issues

**Issue**: Component renders but is invisible
- Check CSS: The component might be hidden by styles
- Check z-index: Other elements might be overlaying it
- Check viewport: Component might be off-screen

**Issue**: "Clerk is not configured" message
- Environment variable not set
- Variable name incorrect (must be `VITE_CLERK_PUBLISHABLE_KEY`)
- Server not restarted after adding variable

**Issue**: Component shows but form fields are missing
- Clerk publishable key might be invalid
- Check Clerk dashboard for API key
- Verify the key starts with `pk_live_` or `pk_test_`

### 8. Debug Steps

1. Visit `/clerk-test` page
2. Check browser console for errors
3. Check Network tab for Clerk API calls
4. Verify environment variable is accessible:
   ```javascript
   console.log(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
   ```

### 9. Quick Fix

If nothing works, try:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if Clerk components are imported correctly
4. Verify Clerk package is installed: `npm list @clerk/clerk-react`

### 10. Contact Support

If issues persist:
- Check Clerk dashboard for any service status
- Review Clerk documentation: https://clerk.com/docs
- Check Clerk React SDK version compatibility
