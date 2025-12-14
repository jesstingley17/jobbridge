# Supabase Authentication Setup Guide

## Overview

This application uses Supabase's native authentication methods:
- ✅ **Email + Password** - Traditional login/signup
- ✅ **Magic Link (Passwordless)** - One-click email sign-in
- ✅ **Password Reset** - Native Supabase password reset flow
- ⚙️ **OAuth (Google)** - Optional, controlled by environment variable

## Supabase Dashboard Configuration

### 1. Site URL
Set in: **Settings → Authentication → URL Configuration**

```
https://thejobbridge-inc.com
```

### 2. Redirect URLs
Set in: **Settings → Authentication → URL Configuration → Redirect URLs**

Add all of these (one per line):
```
https://thejobbridge-inc.com/auth/callback
https://thejobbridge-inc.com/auth/reset-password
http://localhost:5000/auth/callback
http://localhost:5000/auth/reset-password
```

### 3. Email Templates
Location: **Settings → Authentication → Email Templates**

- **Confirm signup** - Used when email confirmation is enabled
- **Magic Link** - Used for passwordless sign-in
- **Change Email Address** - Used when users change email
- **Reset Password** - Used for password reset

**Recommendation:** Keep default templates for production safety, or customize to match your brand.

### 4. Email Confirmation
Location: **Settings → Authentication → Email**

- **Enable email confirmations:** Recommended for production
- If enabled, users must confirm email before accessing the app
- The sign-up flow already handles this gracefully

### 5. Rate Limits
Location: **Settings → Authentication → Rate Limits**

Keep defaults for production:
- **Email rate limit:** 4 emails per hour per user
- **SMS rate limit:** (if using SMS) 1 per hour per user

## Environment Variables

### Required (Vercel)
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Optional
```
VITE_ENABLE_OAUTH=false  # Set to 'true' to enable Google OAuth button
```

## Authentication Flows

### Email + Password Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: emailInput,
  password: passwordInput,
});
```

### Email + Password Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: emailInput,
  password: passwordInput,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
    },
    emailRedirectTo: 'https://thejobbridge-inc.com/early-access',
  },
});
```

### Magic Link (Passwordless)
```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  email: emailInput,
  options: {
    emailRedirectTo: 'https://thejobbridge-inc.com/auth/callback',
  },
});
```

### Password Reset
```typescript
// Send reset email
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://thejobbridge-inc.com/auth/reset-password',
});

// On reset page (user has session from email link)
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  await supabase.auth.updateUser({ password: newPassword });
}
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

## Session Management

### Get Current Session
```typescript
const { data: { session }, error } = await supabase.auth.getSession();
```

### Listen for Auth State Changes
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (event === 'SIGNED_IN') {
      // User signed in - redirect to app
    } else if (event === 'SIGNED_OUT') {
      // User signed out - redirect to login
    } else if (event === 'TOKEN_REFRESHED') {
      // Token refreshed - update UI if needed
    }
  }
);
```

### Refresh Session (for role updates)
```typescript
// After assigning/changing admin roles, refresh session to get updated JWT
await supabase.auth.refreshSession();

// Or have user sign out and back in (most reliable)
await supabase.auth.signOut();
// Then redirect to login
```

## Admin Role Propagation

When you assign or change admin roles:

1. **User must refresh session** to get updated JWT claims:
   ```typescript
   await supabase.auth.refreshSession();
   ```

2. **Or have user sign out and back in** (most reliable):
   ```typescript
   await supabase.auth.signOut();
   // Redirect to login, user signs in again
   ```

3. **Check admin access** in your middleware:
   - Server-side: Check `user_roles` table or `user.role` field
   - Client-side: Check JWT claims (after refresh)

## Security Checklist

### Row Level Security (RLS)
- ✅ Verify RLS policies cover authenticated routes
- ✅ Index columns used in RLS conditions (e.g., `user_id`)
- ✅ Test RLS policies with different user roles

### Admin Access
- ✅ Guard admin screens client-side (check JWT claims)
- ✅ Guard admin routes server-side (check database roles)
- ✅ Use `isAdmin` middleware for all admin endpoints

### Environment Variables
- ✅ Never commit secrets to git
- ✅ Use Vercel environment variables for production
- ✅ Use `.env.local` for local development (already in `.gitignore`)

## Testing Checklist

### Email + Password
- [ ] Sign up with new email
- [ ] Sign in with existing credentials
- [ ] Sign out
- [ ] Sign in after sign out

### Magic Link
- [ ] Request magic link
- [ ] Check email for link
- [ ] Click link and verify redirect to `/auth/callback`
- [ ] Verify user is signed in after callback

### Password Reset
- [ ] Request password reset
- [ ] Check email for reset link
- [ ] Click link and verify redirect to `/auth/reset-password`
- [ ] Set new password
- [ ] Sign in with new password

### OAuth (if enabled)
- [ ] Click Google sign-in button
- [ ] Complete OAuth flow
- [ ] Verify redirect to `/auth/callback`
- [ ] Verify user is signed in

## Troubleshooting

### "Redirect URL not allowed"
- Check Supabase Dashboard → Authentication → Redirect URLs
- Ensure exact URL matches (including protocol and path)

### "Session not found" on reset page
- User's reset link may have expired (default: 1 hour)
- Have user request a new reset link

### "Admin access denied" after role assignment
- User needs to refresh session or sign out/in
- JWT contains role claims - must be refreshed to update

### Magic link not working
- Check email is being sent (check Supabase logs)
- Verify redirect URL is in allowed list
- Check spam folder

## Next Steps

1. ✅ Configure Supabase Dashboard settings (see above)
2. ✅ Set environment variables in Vercel
3. ✅ Test all authentication flows
4. ✅ Verify admin role propagation works
5. ✅ Test password reset flow end-to-end

---

**Last Updated:** After implementing Supabase native auth with magic link
**Status:** Fully implemented and ready for production
