import { SignIn, SignUp } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";

export default function AuthClerk() {
  const [location] = useLocation();
  const isSignUp = location === "/auth/sign-up" || location.includes("sign-up") || location.includes("signup");

  // Check if Clerk is properly configured
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
    import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  // Debug logging
  console.log("AuthClerk - Location:", location);
  console.log("AuthClerk - IsSignUp:", isSignUp);
  console.log("AuthClerk - Clerk Key:", CLERK_PUBLISHABLE_KEY ? "Set" : "Not set");

  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Clerk Not Configured</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please set VITE_CLERK_PUBLISHABLE_KEY in your environment variables.
          </p>
        </div>
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

        {/* Right Side - Clerk Auth */}
        <div className="w-full max-w-md mx-auto flex justify-center items-start min-h-[500px] py-8">
          {isSignUp ? (
            <div className="w-full" style={{ minWidth: '100%' }}>
              {CLERK_PUBLISHABLE_KEY ? (
                <SignUp
                  routing="path"
                  path="/auth/sign-up"
                  signInUrl="/auth/sign-in"
                  afterSignUpUrl="/early-access"
                  appearance={{
                    elements: {
                      rootBox: "mx-auto w-full",
                      card: "shadow-lg w-full",
                      formButtonPrimary: "bg-black hover:bg-gray-800",
                    },
                  }}
                />
              ) : (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">Clerk publishable key not found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full" style={{ minWidth: '100%' }}>
              {CLERK_PUBLISHABLE_KEY ? (
                <SignIn
                  routing="path"
                  path="/auth/sign-in"
                  signUpUrl="/auth/sign-up"
                  afterSignInUrl="/early-access"
                  appearance={{
                    elements: {
                      rootBox: "mx-auto w-full",
                      card: "shadow-lg w-full",
                      formButtonPrimary: "bg-black hover:bg-gray-800",
                    },
                  }}
                />
              ) : (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">Clerk publishable key not found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
