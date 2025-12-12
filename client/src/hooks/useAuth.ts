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
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      // Invalidate the user query when auth state changes
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
