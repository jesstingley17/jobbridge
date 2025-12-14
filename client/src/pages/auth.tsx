import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, CheckCircle, Chrome } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Logo } from "@/components/logo";
import { Link } from "wouter";
import { supabase } from "@/utils/supabase/client";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [registerError, setRegisterError] = useState("");

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

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
      const errorMessage = error.message || error.toString() || "Login failed. Please check your credentials.";
      setLoginError(errorMessage);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName?: string; termsAccepted: boolean; marketingConsent?: boolean }) => {
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
          },
          emailRedirectTo: `${window.location.origin}/early-access`,
        },
      });
      
      if (authError) {
        console.error("Supabase signup error:", authError);
        throw new Error(authError.message || "Registration failed. Please try again.");
      }

      if (!authData.user) {
        throw new Error("Registration failed. No user data returned.");
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
        });
        
        if (!syncResponse.ok) {
          const errorData = await syncResponse.json().catch(() => ({}));
          console.error("Failed to sync user to database:", errorData);
          // Don't throw - allow registration to continue
          // The /api/auth/user endpoint will auto-create the user if needed
        }
      } catch (syncError: any) {
        console.error("Failed to sync user to database:", syncError);
        // If sync fails, still allow registration but log the error
        // The /api/auth/user endpoint will auto-create the user from Supabase data if needed
      }
      
      return authData;
    },
    onSuccess: async (data) => {
      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setRegisterError("");
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        // Show success message instead of redirecting
        setLocation("/early-access?confirm=email");
      } else {
        // User is signed in with session
        // Wait a moment for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 300));
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        setLocation("/early-access");
      }
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      const errorMessage = error.message || error.toString() || "Registration failed. Please try again.";
      setRegisterError(errorMessage);
    },
  });

  // Magic link (passwordless) authentication
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const magicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      // Conditionally set redirect based on environment (prod vs local)
      const redirectTo = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000/auth/callback'
        : 'https://thejobbridge-inc.com/auth/callback';
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setMagicLinkSent(true);
    },
    onError: (error: any) => {
      setLoginError(error.message || "Failed to send magic link. Please try again.");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      // Use Supabase's built-in password reset
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setForgotPasswordSent(true);
    },
    onError: (error: any) => {
      setLoginError(error.message || "Failed to send password reset link. Please try again.");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    if (registerPassword.length < 8) {
      setRegisterError("Password must be at least 8 characters");
      return;
    }

    if (!termsAccepted) {
      setRegisterError("You must accept the Terms and Conditions to join early access");
      return;
    }

    if (!marketingConsent) {
      setRegisterError("You must consent to marketing communications to receive early access updates");
      return;
    }

    registerMutation.mutate({
      email: registerEmail,
      password: registerPassword,
      firstName,
      lastName: lastName || undefined,
      termsAccepted: true,
      marketingConsent: true, // Required for early access
    });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate(forgotEmail);
  };

  // Magic link (passwordless) view
  if (showMagicLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in with Magic Link</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a passwordless sign-in link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {magicLinkSent ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Check your email! We've sent you a magic link to sign in. Click the link in the email to complete sign-in.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowMagicLink(false);
                    setMagicLinkSent(false);
                    setMagicLinkEmail("");
                  }}
                  data-testid="button-back-to-login"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); magicLinkMutation.mutate(magicLinkEmail); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-link-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="magic-link-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={magicLinkEmail}
                      onChange={(e) => setMagicLinkEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                      data-testid="input-magic-link-email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={magicLinkMutation.isPending}
                  data-testid="button-send-magic-link"
                >
                  {magicLinkMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Magic Link"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowMagicLink(false)}
                  data-testid="button-cancel-magic-link"
                >
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forgotPasswordSent ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    If an account exists with that email, you will receive a password reset link shortly. Check your email and click the link to reset your password.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordSent(false);
                    setForgotEmail("");
                  }}
                  data-testid="button-back-to-login"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                      data-testid="input-forgot-email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordMutation.isPending}
                  data-testid="button-send-reset-link"
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                  data-testid="button-cancel-forgot"
                >
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side - Logo and Mission */}
        <div className="hidden md:block space-y-6">
          <Logo size="lg" />
          <p className="text-lg text-muted-foreground leading-relaxed">
            Breaking employment barriers for people with disabilities through AI-powered tools and inclusive hiring solutions.
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="w-full">
            <CardContent className="p-8">
              <Tabs value="login">
                <TabsList className="grid w-full grid-cols-1 mb-8">
                  <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6 mt-0">
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                      Early Access Login
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      You're logging in to receive updates about our platform launch, community events, and blog posts. 
                      Full platform features are coming soon - you'll be among the first beta testers!
                    </p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="rounded-md"
                        required
                        autoComplete="email"
                        data-testid="input-login-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pr-10 rounded-md"
                          required
                          autoComplete="current-password"
                          data-testid="input-login-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-black text-white hover:bg-black/90 rounded-md h-12 text-base font-medium"
                      disabled={loginMutation.isPending}
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>

                    {/* OAuth (Google) - conditionally enabled via environment variable */}
                    {import.meta.env.VITE_ENABLE_OAUTH === 'true' && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">Or continue with</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-md h-12 text-base font-medium"
                          onClick={() => googleLoginMutation.mutate()}
                          disabled={googleLoginMutation.isPending}
                        >
                          {googleLoginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in with Google...
                            </>
                          ) : (
                            <>
                              <Chrome className="mr-2 h-4 w-4" />
                              Google
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </form>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-0 text-sm h-auto w-full text-center"
                      onClick={() => setShowMagicLink(true)}
                      data-testid="button-magic-link"
                    >
                      Sign in with magic link (passwordless)
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-0 text-sm h-auto w-full text-center"
                      onClick={() => setShowForgotPassword(true)}
                      data-testid="button-forgot-password"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link href="/beta-tester" className="text-primary hover:underline font-medium">
                        Join our beta program
                      </Link>
                    </p>
                  </div>
                </TabsContent>

                {/* Register tab removed - users should sign up via beta tester page */}
                <TabsContent value="register" className="hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      🎉 Join Early Access - Become a Beta Tester!
                    </p>
                    <p className="text-xs text-purple-800 dark:text-purple-200 mb-2">
                      Sign up to be among the <strong>first beta testers</strong> when we launch! Right now, you'll get:
                    </p>
                    <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1 list-disc list-inside">
                      <li>Email updates about platform launches and new features</li>
                      <li>Community updates and networking opportunities</li>
                      <li>Blog post notifications and career insights</li>
                    </ul>
                    <p className="text-xs text-purple-800 dark:text-purple-200 mt-2 font-medium">
                      ⚠️ Full platform features (job matching, resume builder, etc.) are not yet available. 
                      You'll be notified when they launch!
                    </p>
                  </div>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {registerError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{registerError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          name="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="rounded-md"
                          required
                          autoComplete="given-name"
                          data-testid="input-first-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          name="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="rounded-md"
                          autoComplete="family-name"
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="rounded-md"
                        required
                        autoComplete="email"
                        data-testid="input-register-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pr-10 rounded-md"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          data-testid="input-register-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password-register"
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
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="rounded-md"
                        required
                        autoComplete="new-password"
                        data-testid="input-confirm-password"
                      />
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms-accepted"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                          required
                          className="mt-1"
                          data-testid="checkbox-terms-accepted"
                        />
                        <Label
                          htmlFor="terms-accepted"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          I agree to the{" "}
                          <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank">
                            Terms and Conditions
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank">
                            Privacy Policy
                          </Link>
                          <span className="text-destructive"> *</span>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="marketing-consent"
                          checked={marketingConsent}
                          onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                          required
                          className="mt-1"
                          data-testid="checkbox-marketing-consent"
                        />
                        <Label
                          htmlFor="marketing-consent"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          I agree to receive marketing communications, newsletters, and updates about platform launches, 
                          community events, and blog posts from The JobBridge, Inc. 
                          <span className="text-destructive"> *</span>
                          <span className="block text-xs text-muted-foreground mt-1">
                            Required to receive early access updates and become a beta tester
                          </span>
                        </Label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-black text-white hover:bg-black/90 rounded-md h-12 text-base font-medium"
                      disabled={registerMutation.isPending || !termsAccepted || !marketingConsent}
                      data-testid="button-register-submit"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining Early Access...
                        </>
                      ) : (
                        "Join Early Access"
                      )}
                    </Button>

                    {/* OAuth (Google) - conditionally enabled via environment variable */}
                    {import.meta.env.VITE_ENABLE_OAUTH === 'true' && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">Or sign up with</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-md h-12 text-base font-medium"
                          onClick={() => googleLoginMutation.mutate()}
                          disabled={googleLoginMutation.isPending}
                        >
                          {googleLoginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing up with Google...
                            </>
                          ) : (
                            <>
                              <Chrome className="mr-2 h-4 w-4" />
                              Google
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </form>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link href="/beta-tester" className="text-primary hover:underline font-medium">
                        Join our beta program
                      </Link>
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
