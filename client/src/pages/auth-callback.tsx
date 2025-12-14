import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/utils/supabase/client";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

/**
 * OAuth callback handler for Supabase
 * This page handles the redirect after OAuth authentication
 */
export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle Supabase auth callback (OAuth, magic link, etc.)
        // Supabase automatically processes the URL hash and creates a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          // If no session, wait a moment for Supabase to process the callback
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
          if (retryError || !retrySession?.user) {
            throw new Error("No user session found. The authentication link may have expired.");
          }
          // Use retrySession if found
          const user = retrySession.user;
          const userMetadata = user.user_metadata || {};

          // Sync user to database
          try {
            await apiRequest("POST", "/api/auth/sync-supabase-user", {
              supabaseUserId: user.id,
              email: user.email,
              firstName: userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || null,
              lastName: userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || null,
              emailVerified: user.email_confirmed_at ? true : false,
              termsAccepted: true,
              marketingConsent: false,
            });
          } catch (syncError) {
            console.error("Failed to sync user to database:", syncError);
          }

          await new Promise(resolve => setTimeout(resolve, 300));
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
          setLocation("/early-access");
          return;
        }

        const user = session.user;
        const userMetadata = user.user_metadata || {};

        // Sync user to database
        try {
          await apiRequest("POST", "/api/auth/sync-supabase-user", {
            supabaseUserId: user.id,
            email: user.email,
            firstName: userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || null,
            lastName: userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || null,
            emailVerified: user.email_confirmed_at ? true : false,
            termsAccepted: true, // OAuth users accept by signing in
            marketingConsent: false, // Default to false, can be updated later
          });
        } catch (syncError) {
          console.error("Failed to sync user to database:", syncError);
          // Don't fail the auth flow if sync fails
        }

        // Wait a moment for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 300));
        // Invalidate and refetch user data to ensure it's available
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        setLocation("/early-access");
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed");
        // Redirect to auth page after a delay
        setTimeout(() => {
          setLocation("/auth");
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <p className="text-sm mt-4">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Completing authentication...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
      </div>
    </div>
  );
}
