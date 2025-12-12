# Clerk Authentication Setup for Vercel

This guide will help you set up Clerk authentication for your Vercel deployment.

## 1. Environment Variables in Vercel

You need to add the following environment variables to your Vercel project:

### Steps to Add Environment Variables:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New** for each variable below

### Required Environment Variables:

#### Client-Side (Public):
- **Key**: `VITE_CLERK_PUBLISHABLE_KEY`
- **Value**: Your Clerk publishable key (starts with `pk_live_` or `pk_test_`)
- **Environment**: Select all (Production, Preview, Development)
- **Note**: The `VITE_` prefix is required for Vite to expose this to client-side code
- **How to get it**: Go to [Clerk Dashboard](https://dashboard.clerk.com) → Your Application → API Keys

#### Server-Side (Secret):
- **Key**: `CLERK_SECRET_KEY`
- **Value**: Your Clerk secret key (starts with `sk_live_` or `sk_test_`)
- **Environment**: Select all (Production, Preview, Development)
- **Note**: This is a secret key - never expose it in client-side code
- **How to get it**: Go to [Clerk Dashboard](https://dashboard.clerk.com) → Your Application → API Keys

### Alternative Variable Name (for compatibility):

If you prefer to use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Next.js convention), the code will also check for that:

- **Key**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value**: Your Clerk publishable key (starts with `pk_live_` or `pk_test_`)
- **Environment**: Select all

## 2. After Adding Variables

1. **Redeploy your application** for changes to take effect
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

2. Or trigger a new deployment by pushing to your connected Git repository

## 3. How It Works

### Authentication Flow:

1. **Clerk Provider**: The app is wrapped with `ClerkProvider` when the publishable key is detected
2. **Auth Pages**: 
   - `/auth` - Main auth page (auto-detects sign-in vs sign-up)
   - `/auth/sign-in` - Sign in page
   - `/auth/sign-up` - Sign up page
3. **After Authentication**: Users are redirected to `/early-access` by default

### Priority Order:

The auth system uses this priority:
1. **Builder.io** - If Builder.io content exists for `/auth`, it's used first
2. **Clerk** - If Clerk is configured (publishable key exists), Clerk components are used
3. **Default Auth** - Falls back to the original custom auth system

## 4. Using Clerk in Builder.io

If you're using Builder.io to design your auth pages, you can use these components:

### ClerkSignIn Component
- Drag and drop from the Builder.io component library
- Customize `signUpUrl` and `afterSignInUrl` props

### ClerkSignUp Component
- Drag and drop from the Builder.io component library
- Customize `signInUrl` and `afterSignUpUrl` props

## 5. Clerk Dashboard

Access your Clerk dashboard at: https://dashboard.clerk.com

From there you can:
- Manage users
- Configure authentication methods
- Set up social logins (Google, GitHub, etc.)
- Customize email templates
- View analytics

## 6. Testing

After deployment:

1. Visit `/auth` or `/auth/sign-in` to test sign in
2. Visit `/auth/sign-up` to test sign up
3. Check the browser console for any errors
4. Verify users are created in your Clerk dashboard

## 7. Troubleshooting

### Clerk components not showing:
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set in Vercel
- Check that the value starts with `pk_live_` or `pk_test_`
- Redeploy after adding environment variables

### Authentication not working:
- Check browser console for errors
- Verify the Clerk publishable key is correct
- Ensure you're using the live keys (not test keys) in production

### Redirect issues:
- Check the `afterSignInUrl` and `afterSignUpUrl` props
- Verify the redirect URLs exist in your app

## 8. Security Notes

⚠️ **Important Security Reminders**:

- `CLERK_SECRET_KEY` should **NEVER** be exposed in client-side code
- Only use `VITE_CLERK_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) in the frontend
- The secret key is only used server-side (if you add Clerk webhooks or server-side auth checks)
- Never commit these keys to your repository

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Vercel Integration](https://clerk.com/docs/deployments/vercel)
