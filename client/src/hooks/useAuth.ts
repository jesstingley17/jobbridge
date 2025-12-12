import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  // Client-side session fallback for immediate UI feedback
  const [clientSession, setClientSession] = useState<{ email?: string; id?: string } | null>(null);

  // Initialize client session on mount
  useEffect(() => {
    const initClientSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setClientSession({ email: session.user.email, id: session.user.id });
      }
    };
    initClientSession();
  }, []);

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

  // Use backend user if available, otherwise fall back to client session for UI
  const isAuthenticated = !!user || !!clientSession;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    // Expose client session for debugging/fallback UI
    clientSession: clientSession ? { email: clientSession.email, id: clientSession.id } : null,
  };
}
