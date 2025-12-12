import { SignIn, SignUp } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";

export default function AuthClerk() {
  const [location, setLocation] = useLocation();
  const isSignUp = location.includes("sign-up") || location.includes("signup");

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

        {/* Right Side - Clerk Auth */}
        <div className="w-full max-w-md mx-auto flex justify-center">
          {isSignUp ? (
            <SignUp
              routing="path"
              path="/auth/sign-up"
              signInUrl="/auth/sign-in"
              afterSignUpUrl="/early-access"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg",
                },
              }}
            />
          ) : (
            <SignIn
              routing="path"
              path="/auth/sign-in"
              signUpUrl="/auth/sign-up"
              afterSignInUrl="/early-access"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg",
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
