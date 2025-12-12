# Clerk Quick Start Guide

## ✅ What's Already Done

1. ✅ Clerk React package installed (`@clerk/clerk-react`)
2. ✅ Clerk server SDK installed (`@clerk/clerk-sdk-node`)
3. ✅ ClerkProvider added to your app
4. ✅ Auth pages created (`/auth/sign-in`, `/auth/sign-up`)
5. ✅ Protected route component created
6. ✅ Express middleware created for server-side verification

## 🚀 Quick Start

### 1. Add Environment Variables in Vercel

Go to Vercel Dashboard → Settings → Environment Variables:

- **Key**: `VITE_CLERK_PUBLISHABLE_KEY`
- **Value**: Your Clerk publishable key (starts with `pk_live_` or `pk_test_`)
- **Environment**: All (Production, Preview, Development)
- **How to get it**: Go to [Clerk Dashboard](https://dashboard.clerk.com) → Your Application → API Keys

- **Key**: `CLERK_SECRET_KEY`  
- **Value**: Your Clerk secret key (starts with `sk_live_` or `sk_test_`)
- **Environment**: All
- **How to get it**: Go to [Clerk Dashboard](https://dashboard.clerk.com) → Your Application → API Keys

### 2. Protect a Page

```tsx
// pages/dashboard.tsx
import { ProtectedRoute } from "@/components/protected-route";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### 3. Use Clerk in Components

```tsx
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

function MyComponent() {
  const { user } = useUser();

  return (
    <div>
      <SignedOut>
        <p>Please sign in</p>
      </SignedOut>
      <SignedIn>
        <p>Welcome, {user?.firstName}!</p>
        <UserButton />
      </SignedIn>
    </div>
  );
}
```

### 4. Protect API Routes (Express)

```typescript
// server/routes.ts
import { verifyClerkAuth } from './clerkAuth';

app.get('/api/protected', verifyClerkAuth, (req: any, res) => {
  const user = req.clerkUser;
  res.json({ message: `Hello ${user.firstName}!` });
});
```

### 5. Get Token for API Calls

```tsx
import { useAuth } from "@clerk/clerk-react";

function MyComponent() {
  const { getToken } = useAuth();

  const callAPI = async () => {
    const token = await getToken();
    
    const response = await fetch('/api/protected', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
}
```

## 📚 More Examples

See `CLERK_USAGE_EXAMPLES.md` for detailed examples.

## 🔑 Key Differences from Next.js

Your app uses **React + Vite**, not Next.js. Here's the mapping:

| Next.js | Your App (React + Vite) |
|---------|------------------------|
| `@clerk/nextjs` | `@clerk/clerk-react` ✅ |
| `auth()` | `useAuth()` hook |
| `middleware.ts` | `<ProtectedRoute>` component ✅ |
| Server: `auth()` | Server: `verifyClerkAuth()` middleware ✅ |

## ✨ You're All Set!

Clerk is fully integrated. Just:
1. Add the environment variables in Vercel
2. Redeploy
3. Start using Clerk hooks in your components!
