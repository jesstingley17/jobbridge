import { SignIn, SignUp } from "@clerk/clerk-react";
import { useLocation } from "wouter";

interface ClerkSignInProps {
  signUpUrl?: string;
  afterSignInUrl?: string;
}

export function ClerkSignIn({
  signUpUrl = "/auth/sign-up",
  afterSignInUrl = "/early-access",
}: ClerkSignInProps) {
  return (
    <div className="flex justify-center">
      <SignIn
        routing="path"
        path="/auth/sign-in"
        signUpUrl={signUpUrl}
        afterSignInUrl={afterSignInUrl}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}

interface ClerkSignUpProps {
  signInUrl?: string;
  afterSignUpUrl?: string;
}

export function ClerkSignUp({
  signInUrl = "/auth/sign-in",
  afterSignUpUrl = "/early-access",
}: ClerkSignUpProps) {
  return (
    <div className="flex justify-center">
      <SignUp
        routing="path"
        path="/auth/sign-up"
        signInUrl={signInUrl}
        afterSignUpUrl={afterSignUpUrl}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
