import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { queryClient } from "@/lib/queryClient";

/**
 * Component that initializes and restores Supabase session on app load
 * This ensures users stay signed in across page refreshes
 */
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
          // Invalidate user data - React Query will refetch automatically
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        // Just invalidate - React Query will refetch automatically
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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

  return null; // This component doesn't render anything
}
