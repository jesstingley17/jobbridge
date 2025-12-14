import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { supabase } from "@/utils/supabase/client";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");
  const type = params.get("type") || "login";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { data: tokenData, isLoading: verifying } = useQuery({
    queryKey: ["/api/auth/verify-token", token],
    queryFn: async () => {
      const response = await fetch(`/api/auth/verify-token?token=${token}`);
      return response.json();
    },
    enabled: !!token,
  });

  const useMagicLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/use-magic-link", { token });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to verify email");
    },
  });

  // Check if user has a valid session from Supabase password reset link
  const [hasResetSession, setHasResetSession] = useState(false);
  
  useEffect(() => {
    const checkResetSession = async () => {
      // If user arrived from Supabase reset email, they'll have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasResetSession(true);
      }
    };
    checkResetSession();
  }, []);

  const resetPasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      // Use Supabase's native password update (user is authenticated from reset link)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session. Please use the link from your email.");
      }
      
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to reset password");
    },
  });

  useEffect(() => {
    if (type === "login" && tokenData?.valid && !useMagicLinkMutation.isPending && !useMagicLinkMutation.isSuccess) {
      useMagicLinkMutation.mutate();
    }
  }, [type, tokenData]);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Use Supabase native password reset (no token needed - session from email link)
    resetPasswordMutation.mutate(newPassword);
  };

  // For Supabase password reset, check if user has session from reset email
  // If no session and no token, show invalid link message
  if (!hasResetSession && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invalid Link</CardTitle>
            <CardDescription>
              This link is invalid or has expired. Please request a new password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => setLocation("/auth")}
              data-testid="button-back-to-auth"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying your link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-2xl">Link Expired</CardTitle>
            <CardDescription>
              {tokenData?.error || "This link is invalid or has already been used."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => setLocation("/auth")}
              data-testid="button-request-new-link"
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              {useMagicLinkMutation.isPending ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Logging you in...</p>
                </>
              ) : useMagicLinkMutation.isSuccess ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="text-muted-foreground">Success! Redirecting...</p>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <p className="text-destructive">{error}</p>
                  <Button onClick={() => setLocation("/auth")} data-testid="button-retry-login">
                    Try Again
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                  data-testid="input-new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password-reset"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-confirm-new-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
              data-testid="button-reset-password-submit"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
