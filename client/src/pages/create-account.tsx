import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { supabase } from "@/utils/supabase/client";
import { Logo } from "@/components/logo";

// Account creation page after beta signup
// Accessible at /create-account?email=user@example.com
export default function CreateAccount() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Update email if URL param changes
  useEffect(() => {
    if (emailFromUrl && !email) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl, email]);

  const createAccountMutation = useMutation({
    mutationFn: async (data: { 
      email: string; 
      password: string; 
      firstName: string; 
      lastName?: string; 
      termsAccepted: boolean; 
      marketingConsent?: boolean;
    }) => {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        throw new Error("Supabase is not configured. Please contact support.");
      }

      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            terms_accepted: data.termsAccepted,
            marketing_consent: data.marketingConsent,
            beta_tester: true, // Mark as beta tester
          },
          emailRedirectTo: `${window.location.origin}/early-access`,
        },
      });
      
      if (authError) {
        console.error("Supabase signup error:", authError);
        throw new Error(authError.message || "Account creation failed. Please try again.");
      }

      if (!authData.user) {
        throw new Error("Account creation failed. No user data returned.");
      }
      
      // Sync user to your database via API
      try {
        const syncResponse = await apiRequest("POST", "/api/auth/sync-supabase-user", {
          supabaseUserId: authData.user.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          termsAccepted: data.termsAccepted,
          marketingConsent: data.marketingConsent,
          emailVerified: false, // Will be verified after email confirmation
        });
        
        if (!syncResponse.ok) {
          const errorData = await syncResponse.json().catch(() => ({}));
          console.error("Failed to sync user to database:", errorData);
          // Don't throw - allow registration to continue
        }
      } catch (syncError: any) {
        console.error("Failed to sync user to database:", syncError);
        // If sync fails, still allow registration
      }
      
      return authData;
    },
    onSuccess: async (data) => {
      setError("");
      setSuccess(true);
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        // Show success message and redirect after a moment
        setTimeout(() => {
          setLocation("/early-access?confirm=email&beta=true");
        }, 2000);
      } else {
        // User is signed in with session
        // Wait a moment for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 300));
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        setTimeout(() => {
          setLocation("/early-access?beta=true");
        }, 2000);
      }
    },
    onError: (error: any) => {
      console.error("Account creation error:", error);
      const errorMessage = error.message || error.toString() || "Account creation failed. Please try again.";
      setError(errorMessage);
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions.");
      return;
    }

    createAccountMutation.mutate({
      email,
      password,
      firstName,
      lastName,
      termsAccepted,
      marketingConsent,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Create Your Account</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Welcome to The JobBridge, Inc!
            </p>
            <p className="text-muted-foreground">
              Complete your account setup to access the platform
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Account created successfully!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {createAccountMutation.data?.session 
                        ? "Redirecting you to the platform..." 
                        : "Please check your email to verify your account."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Account Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                You're almost there! Create a password to secure your account and start using The JobBridge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={createAccountMutation.isPending || success}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={createAccountMutation.isPending || success}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={createAccountMutation.isPending || success || !!emailFromUrl}
                    />
                  </div>
                  {emailFromUrl && (
                    <p className="text-xs text-muted-foreground">
                      This email was pre-filled from your beta signup
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                      disabled={createAccountMutation.isPending || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      disabled={createAccountMutation.isPending || success}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={createAccountMutation.isPending || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      disabled={createAccountMutation.isPending || success}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms & Marketing */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                      required
                      disabled={createAccountMutation.isPending || success}
                    />
                    <Label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I accept the{" "}
                      <a href="/terms" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </a>
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={marketingConsent}
                      onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                      disabled={createAccountMutation.isPending || success}
                    />
                    <Label htmlFor="marketing" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I'd like to receive updates about new features and platform news
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={createAccountMutation.isPending || success}
                >
                  {createAccountMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Account Created!
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Account & Access Platform
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline p-0 h-auto bg-transparent border-0 cursor-pointer"
                onClick={() => setLocation("/auth/sign-in")}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
