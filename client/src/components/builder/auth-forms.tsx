import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LoginFormProps {
  emailLabel?: string;
  passwordLabel?: string;
  submitButtonText?: string;
  showForgotPassword?: boolean;
  onSuccessRedirect?: string;
}

export function LoginForm({
  emailLabel = "Email",
  passwordLabel = "Password",
  submitButtonText = "Login",
  showForgotPassword = true,
  onSuccessRedirect = "/early-access",
}: LoginFormProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation(onSuccessRedirect);
    },
    onError: (error: any) => {
      setError(error.message || "Login failed. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="login-email">{emailLabel}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{passwordLabel}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
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
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          submitButtonText
        )}
      </Button>
    </form>
  );
}

interface SignUpFormProps {
  emailLabel?: string;
  passwordLabel?: string;
  confirmPasswordLabel?: string;
  firstNameLabel?: string;
  lastNameLabel?: string;
  submitButtonText?: string;
  showTermsCheckbox?: boolean;
  showMarketingCheckbox?: boolean;
  onSuccessRedirect?: string;
}

export function SignUpForm({
  emailLabel = "Email",
  passwordLabel = "Password",
  confirmPasswordLabel = "Confirm Password",
  firstNameLabel = "First Name",
  lastNameLabel = "Last Name",
  submitButtonText = "Sign Up",
  showTermsCheckbox = true,
  showMarketingCheckbox = true,
  onSuccessRedirect = "/early-access",
}: SignUpFormProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName?: string;
      termsAccepted: boolean;
      marketingConsent?: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation(onSuccessRedirect);
    },
    onError: (error: any) => {
      setError(error.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (showTermsCheckbox && !termsAccepted) {
      setError("You must accept the Terms and Conditions");
      return;
    }

    if (showMarketingCheckbox && !marketingConsent) {
      setError("You must consent to marketing communications");
      return;
    }

    registerMutation.mutate({
      email,
      password,
      firstName,
      lastName: lastName || undefined,
      termsAccepted: showTermsCheckbox ? termsAccepted : true,
      marketingConsent: showMarketingCheckbox ? marketingConsent : true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name">{firstNameLabel}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="first-name"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="last-name">{lastNameLabel}</Label>
          <Input
            id="last-name"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{emailLabel}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">{passwordLabel}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
            minLength={8}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
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
        <Label htmlFor="confirm-password">{confirmPasswordLabel}</Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {showTermsCheckbox && (
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms-accepted"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            required
            className="mt-1"
          />
          <Label
            htmlFor="terms-accepted"
            className="text-sm font-normal leading-none cursor-pointer"
          >
            I agree to the{" "}
            <a href="/terms" className="text-primary hover:underline" target="_blank">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline" target="_blank">
              Privacy Policy
            </a>
            <span className="text-destructive"> *</span>
          </Label>
        </div>
      )}

      {showMarketingCheckbox && (
        <div className="flex items-start space-x-2">
          <Checkbox
            id="marketing-consent"
            checked={marketingConsent}
            onCheckedChange={(checked) => setMarketingConsent(checked === true)}
            required
            className="mt-1"
          />
          <Label
            htmlFor="marketing-consent"
            className="text-sm font-normal leading-none cursor-pointer"
          >
            I agree to receive marketing communications and updates
            <span className="text-destructive"> *</span>
          </Label>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={
          registerMutation.isPending ||
          (showTermsCheckbox && !termsAccepted) ||
          (showMarketingCheckbox && !marketingConsent)
        }
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing up...
          </>
        ) : (
          submitButtonText
        )}
      </Button>
    </form>
  );
}
