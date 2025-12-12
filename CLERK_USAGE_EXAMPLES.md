# Clerk Usage Examples for React + Vite

## ✅ Your Current Setup

Clerk is already integrated! Here's how to use it in your React components.

## 1. Basic Authentication Check

```tsx
import { useAuth } from "@clerk/clerk-react";

function MyComponent() {
  const { isSignedIn, userId, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome! Your user ID is: {userId}</div>;
}
```

## 2. Get User Information

```tsx
import { useUser } from "@clerk/clerk-react";

function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Name: {user?.firstName} {user?.lastName}</p>
      <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
      <img src={user?.imageUrl} alt="Profile" />
    </div>
  );
}
```

## 3. Conditional Rendering

```tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
```

## 4. Protect a Route

Wrap your page component:

```tsx
// pages/dashboard.tsx
import { ProtectedRoute } from "@/components/protected-route";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>This is protected content</div>
    </ProtectedRoute>
  );
}
```

Or in your router:

```tsx
// App.tsx
import { ProtectedRoute } from "@/components/protected-route";

<Route path="/dashboard">
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
</Route>
```

## 5. Sign Out

```tsx
import { useClerk } from "@clerk/clerk-react";

function LogoutButton() {
  const clerk = useClerk();

  const handleSignOut = async () => {
    await clerk.signOut();
    // Optionally redirect
    window.location.href = "/";
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

## 6. Get Session Token (for API calls)

```tsx
import { useAuth } from "@clerk/clerk-react";

async function callAPI() {
  const { getToken } = useAuth();
  const token = await getToken();

  const response = await fetch("/api/protected", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
```

## 7. Update Navbar to Use Clerk

Here's how to update your navbar:

```tsx
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";
import { UserButton, SignInButton } from "@clerk/clerk-react";

export function Navbar() {
  const { user } = useUser();
  const clerk = useClerk();

  return (
    <header>
      {/* ... other nav items ... */}
      
      <SignedOut>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      
      <SignedIn>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-10 h-10"
            }
          }}
        />
      </SignedIn>
    </header>
  );
}
```

## 8. Server-Side Verification (Express)

For your Express API routes, verify Clerk tokens:

```typescript
// server/clerkMiddleware.ts
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function verifyClerkAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the session token
    const session = await clerkClient.sessions.verifySession(token);
    
    // Get user info
    const user = await clerkClient.users.getUser(session.userId);
    
    req.clerkUser = user;
    req.clerkSession = session;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

Then use it in your routes:

```typescript
// server/routes.ts
import { verifyClerkAuth } from './clerkMiddleware';

app.get('/api/protected-route', verifyClerkAuth, (req, res) => {
  const user = req.clerkUser;
  res.json({ message: `Hello ${user.firstName}!` });
});
```

## Key Differences from Next.js

| Feature | Next.js | React + Vite (Your App) |
|---------|---------|------------------------|
| Get user | `auth()` | `useUser()` hook |
| Check auth | `auth()` | `useAuth()` hook |
| Protect route | `middleware.ts` | `<ProtectedRoute>` component |
| Sign out | `auth().signOut()` | `clerk.signOut()` |
| Get token | `auth().getToken()` | `getToken()` from `useAuth()` |

## Environment Variables

Make sure these are set in Vercel:

- `VITE_CLERK_PUBLISHABLE_KEY` - Client-side (public)
- `CLERK_SECRET_KEY` - Server-side (secret)

## Testing

1. Visit `/auth/sign-in` to sign in
2. Use `useAuth()` to check authentication state
3. Use `<SignedIn>` and `<SignedOut>` for conditional rendering
4. Use `ProtectedRoute` to protect pages

Your Clerk integration is ready to use! 🎉
