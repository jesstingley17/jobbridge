import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  // Client-side session fallback for immediate UI feedback
  const [clientSession, setClientSession] = useState<{ email?: string; id?: string } | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Initialize client session on mount - but only after checking if it's valid
  useEffect(() => {
    const initClientSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // If there's an error or no session, clear client session
      if (error || !session) {
        setClientSession(null);
        setSessionChecked(true);
        return;
      }

      // Check if session is expired
      if (session.expires_at && session.expires_at < Date.now() / 1000) {
        // Session expired, sign out
        await supabase.auth.signOut();
        setClientSession(null);
        setSessionChecked(true);
        return;
      }

      // Only set client session if session is valid
      if (session?.user) {
        setClientSession({ email: session.user.email, id: session.user.id });
      }
      setSessionChecked(true);
    };
    initClientSession();
  }, []);

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: 1, // Retry once if it fails
    staleTime: 0, // Always refetch to get latest auth state
    refetchOnWindowFocus: true, // Refetch when window regains focus
    enabled: sessionChecked && !!clientSession, // Only run query if we have a session
    // Don't fail the query if backend is temporarily unavailable
    // We'll show authenticated based on clientSession, backend will sync when available
  });

  // Listen to Supabase auth state changes and invalidate query
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      // Update client session immediately for UI responsiveness
      if (session?.user) {
        setClientSession({ email: session.user.email, id: session.user.id });
      } else {
        setClientSession(null);
      }
      
      // Invalidate and refetch the user query when auth state changes
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Wait a moment for session to be fully established
        setTimeout(async () => {
          // Ensure clientSession is set first (it should be from the if above)
          // Then sync with backend
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        }, 300); // Increased delay to ensure session is fully ready
      } else if (event === "SIGNED_OUT") {
        // Clear everything on sign out
        setClientSession(null);
        queryClient.setQueryData(["/api/auth/user"], null);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else if (event === "USER_UPDATED") {
        // User data changed, refresh
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authenticated if we have a valid Supabase session
  // Backend user query will sync in the background, but don't block UI on it
  // This allows immediate feedback when user signs in, while backend validates
  const isAuthenticated = !!clientSession;

  // Helper function to refresh session (useful after admin role assignment)
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        setClientSession({ email: data.session.user.email, id: data.session.user.id });
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      }
      return data.session;
    } catch (err: any) {
      console.error("Error refreshing session:", err);
      throw err;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    // Expose client session for debugging/fallback UI
    clientSession: clientSession ? { email: clientSession.email, id: clientSession.id } : null,
    // Helper to refresh session (useful after role updates)
    refreshSession,
  };
}
