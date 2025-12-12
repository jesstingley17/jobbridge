# Supabase Auth Setup Information

## Framework & Version
- **Framework**: React 18.3.1 (with Vite)
- **Routing**: Wouter (not Next.js)
- **supabase-js version**: ^2.87.1
- **Deployment**: Vercel (serverless functions)

## Auth Initialization Code

### Client Setup (`client/src/utils/supabase/client.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Detect session from URL (for OAuth callbacks)
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-auth-token', // Default storage key
    },
  }
);
```

### Auth Initializer Component (`client/src/components/auth-initializer.tsx`)
```typescript
import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { queryClient } from "@/lib/queryClient";

export function AuthInitializer() {
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get existing session from Supabase (restores from localStorage)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          return;
        }

        if (session && mounted) {
          console.log("Session restored:", session.user.email);
          // Wait a moment to ensure session is fully ready
          await new Promise(resolve => setTimeout(resolve, 100));
          // Invalidate and refetch user data to sync with backend
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    };

    // Initialize on mount
    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Sync user data with backend when signed in or token refreshed
        setTimeout(async () => {
          if (mounted && session) {
            console.log("Invalidating and refetching user query after", event);
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
          }
        }, 200);
      } else if (event === "SIGNED_OUT") {
        // Clear user data when signed out
        queryClient.setQueryData(["/api/auth/user"], null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
```

## Login Handlers

### Email/Password Login (`client/src/pages/auth.tsx`)
```typescript
const loginMutation = useMutation({
  mutationFn: async (data: { email: string; password: string }) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw error;
    return authData;
  },
  onSuccess: async () => {
    // Wait a moment for session to be fully established
    await new Promise(resolve => setTimeout(resolve, 300));
    // Invalidate and refetch user data to ensure it's available
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
    setLocation("/early-access");
  },
  onError: (error: any) => {
    console.error("Login error:", error);
    setLoginError(error.message || "Login failed. Please check your credentials.");
  },
});
```

### Google OAuth Login (`client/src/pages/auth.tsx`)
```typescript
const googleLoginMutation = useMutation({
  mutationFn: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
    return data;
  },
  onError: (error: any) => {
    setLoginError(error.message || "Google login failed. Please try again.");
  },
});
```

### OAuth Callback Handler (`client/src/pages/auth-callback.tsx`)
```typescript
useEffect(() => {
  const handleAuthCallback = async () => {
    try {
      // Get the session from the URL hash/fragment
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        throw new Error("No user session found");
      }

      // Sync user to database
      try {
        await apiRequest("POST", "/api/auth/sync-supabase-user", {
          supabaseUserId: user.id,
          email: user.email,
          firstName: userMetadata.first_name || null,
          lastName: userMetadata.last_name || null,
          emailVerified: user.email_confirmed_at ? true : false,
          termsAccepted: true,
          marketingConsent: false,
        });
      } catch (syncError) {
        console.error("Failed to sync user to database:", syncError);
      }

      // Wait a moment for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 300));
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/early-access");
    } catch (err: any) {
      console.error("Auth callback error:", err);
      setError(err.message || "Authentication failed");
      setTimeout(() => {
        setLocation("/auth");
      }, 3000);
    }
  };

  handleAuthCallback();
}, [setLocation]);
```

## Logout Handler

### Logout (`client/src/components/navbar.tsx`)
```typescript
const handleLogout = async () => {
  await supabase.auth.signOut();
  // The AuthInitializer will handle clearing the user query data via onAuthStateChange
};
```

## useAuth Hook (`client/src/hooks/useAuth.ts`)
```typescript
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always refetch to get latest auth state
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Listen to Supabase auth state changes and invalidate query
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setTimeout(async () => {
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        }, 200);
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
```

## API Request Handler (`client/src/lib/queryClient.ts`)
```typescript
// Get Supabase session token
async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    if (session?.access_token) {
      console.log("Auth token available:", session.user?.email || session.user?.id);
      return session.access_token;
    }

    console.log("No auth token available - user not signed in");
    return null;
  } catch (error) {
    console.error("Error in getAuthToken:", error);
    return null;
  }
}

// API request with auth token
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const token = await getAuthToken();
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}
```

## Current Issue

**Problem**: Users sign in successfully, but the app doesn't recognize they're logged in. The `/api/auth/user` endpoint returns 401 or the user query returns null even after successful authentication.

**Symptoms**:
- User signs in with email/password or Google OAuth
- Session appears to be created (visible in localStorage)
- But `useAuth()` hook returns `user: null` and `isAuthenticated: false`
- Protected routes redirect back to login
- After page refresh, user is logged out

**What we've tried**:
- Added delays before refetching queries
- Explicitly calling both `invalidateQueries` and `refetchQueries`
- Listening to `onAuthStateChange` events
- Restoring session on app initialization
- Using `detectSessionInUrl: true` for OAuth callbacks
- Checking token availability before API requests

**Environment**:
- Vercel serverless functions (not Next.js)
- React with Vite
- Wouter for routing
- @tanstack/react-query for data fetching
- Custom Express backend API
