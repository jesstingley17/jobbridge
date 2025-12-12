import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get Supabase session token
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
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

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    // Handle 401 Unauthorized - return null if configured to do so
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // For auth/user endpoint, also handle 500 errors gracefully (return null)
    // This prevents the app from breaking if the auth endpoint has temporary issues
    if (queryKey[0] === "/api/auth/user" && res.status === 500) {
      console.warn("Auth endpoint returned 500, treating as unauthenticated");
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // Return null on 401 instead of throwing
      refetchInterval: false,
      refetchOnWindowFocus: true, // Refetch when window regains focus
      staleTime: 0, // Always consider data stale to get fresh auth state
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
