# Clerk Setup for React + Vite Application

This guide shows how Clerk is set up in your React + Vite application (not Next.js).

## ✅ Already Completed

1. **Clerk Package Installed**: `@clerk/clerk-react` is already installed
2. **ClerkProvider Added**: Your app is wrapped with `<ClerkProvider>` in `App.tsx`
3. **Auth Pages Created**: Clerk sign-in/sign-up pages are available at `/auth`
4. **Environment Variables**: Configured to use `VITE_CLERK_PUBLISHABLE_KEY`

## Current Setup

### 1. ClerkProvider (Already Done)

Your `App.tsx` already includes:

```tsx
import { ClerkProvider } from "@clerk/clerk-react";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

if (CLERK_PUBLISHABLE_KEY) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {/* Your app */}
    </ClerkProvider>
  );
}
```

### 2. Using Clerk in Components

Since you're using React (not Next.js), use these hooks instead of Next.js components:

#### Protected Routes

Create a protected route component:

```tsx
import { useAuth } from "@clerk/clerk-react";
import { useLocation } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation] = useLocation();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    setLocation("/auth/sign-in");
    return null;
  }

  return <>{children}</>;
}
```

#### Using Clerk Hooks

```tsx
import { useUser, useAuth, SignedIn, SignedOut } from "@clerk/clerk-react";

function MyComponent() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  return (
    <div>
      <SignedIn>
        <p>Welcome, {user?.firstName}!</p>
      </SignedIn>
      <SignedOut>
        <p>Please sign in</p>
      </SignedOut>
    </div>
  );
}
```

### 3. Server-Side Authentication (Express)

For your Express backend, you'll need to verify Clerk tokens. Install the server SDK:

```bash
npm install @clerk/clerk-sdk-node
```

Then create a middleware:

```typescript
// server/clerkAuth.ts
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function verifyClerkToken(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token with Clerk
    const session = await clerkClient.sessions.verifySession(token);
    req.user = session;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

## Differences from Next.js

| Next.js | React + Vite (Your App) |
|---------|------------------------|
| `@clerk/nextjs` | `@clerk/clerk-react` |
| `clerkMiddleware()` | Use `useAuth()` hook in components |
| `middleware.ts` | Express middleware for server routes |
| `<ClerkProvider>` in layout | `<ClerkProvider>` in App.tsx ✅ |
| `auth()` helper | `useAuth()` hook |

## Environment Variables

For Vercel, add these in your dashboard:

- `VITE_CLERK_PUBLISHABLE_KEY` = `pk_live_...` (client-side)
- `CLERK_SECRET_KEY` = `sk_live_...` (server-side, for Express)

## Testing

1. Visit `/auth/sign-in` to test sign in
2. Visit `/auth/sign-up` to test sign up
3. Use `useAuth()` hook to check authentication state
4. Use `<SignedIn>` and `<SignedOut>` components for conditional rendering

## Next Steps

1. ✅ ClerkProvider is already set up
2. ✅ Auth pages are created
3. Add protected routes using the `ProtectedRoute` component above
4. Add server-side token verification for your Express API routes
5. Use Clerk hooks in your components

Your Clerk integration is already working! You just need to use the React hooks instead of Next.js-specific functions.
