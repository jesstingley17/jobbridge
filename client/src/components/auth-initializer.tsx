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
          // Clear any stale session data
          queryClient.setQueryData(["/api/auth/user"], null);
          return;
        }

        // Check if session is expired
        if (session && session.expires_at && session.expires_at < Date.now() / 1000) {
          console.log("Session expired, signing out");
          await supabase.auth.signOut();
          queryClient.setQueryData(["/api/auth/user"], null);
          return;
        }

        if (session && mounted) {
          console.log("Session restored:", session.user.email);
          // Wait a moment to ensure session is fully ready
          await new Promise(resolve => setTimeout(resolve, 200));
          // Invalidate and refetch user data to sync with backend
          // This will verify the session is still valid on the backend
          // Use setTimeout to ensure this happens after useAuth hook has set clientSession
          setTimeout(async () => {
            if (mounted) {
              await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
            }
          }, 100);
        } else if (mounted) {
          // No session found, clear any stale user data
          queryClient.setQueryData(["/api/auth/user"], null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // On error, clear stale data
        queryClient.setQueryData(["/api/auth/user"], null);
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
        // Wait a moment for session to be fully established, then invalidate and refetch
        setTimeout(async () => {
          if (mounted && session) {
            console.log("Invalidating and refetching user query after", event);
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            // Explicitly refetch to ensure we get the user data immediately
            await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
          }
        }, 200); // Increased delay to ensure session is fully established
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
