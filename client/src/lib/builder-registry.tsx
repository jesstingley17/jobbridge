import { Builder } from "@builder.io/react";
import { LoginForm, SignUpForm } from "@/components/builder/auth-forms";
import { ClerkSignIn, ClerkSignUp } from "@/components/builder/clerk-auth";

// Register custom components with Builder.io
export function registerBuilderComponents() {
  // Register Clerk Sign In component (preferred if Clerk is configured)
  Builder.registerComponent(ClerkSignIn, {
    name: "ClerkSignIn",
    inputs: [
      {
        name: "signUpUrl",
        type: "string",
        defaultValue: "/auth/sign-up",
      },
      {
        name: "afterSignInUrl",
        type: "string",
        defaultValue: "/early-access",
      },
    ],
  });

  // Register Clerk Sign Up component (preferred if Clerk is configured)
  Builder.registerComponent(ClerkSignUp, {
    name: "ClerkSignUp",
    inputs: [
      {
        name: "signInUrl",
        type: "string",
        defaultValue: "/auth/sign-in",
      },
      {
        name: "afterSignUpUrl",
        type: "string",
        defaultValue: "/early-access",
      },
    ],
  });

  // Register legacy Login Form component (fallback if not using Clerk)
  Builder.registerComponent(LoginForm, {
    name: "LoginForm",
    inputs: [
      {
        name: "emailLabel",
        type: "string",
        defaultValue: "Email",
      },
      {
        name: "passwordLabel",
        type: "string",
        defaultValue: "Password",
      },
      {
        name: "submitButtonText",
        type: "string",
        defaultValue: "Login",
      },
      {
        name: "showForgotPassword",
        type: "boolean",
        defaultValue: true,
      },
      {
        name: "onSuccessRedirect",
        type: "string",
        defaultValue: "/early-access",
      },
    ],
  });

  // Register legacy Sign Up Form component (fallback if not using Clerk)
  Builder.registerComponent(SignUpForm, {
    name: "SignUpForm",
    inputs: [
      {
        name: "emailLabel",
        type: "string",
        defaultValue: "Email",
      },
      {
        name: "passwordLabel",
        type: "string",
        defaultValue: "Password",
      },
      {
        name: "confirmPasswordLabel",
        type: "string",
        defaultValue: "Confirm Password",
      },
      {
        name: "firstNameLabel",
        type: "string",
        defaultValue: "First Name",
      },
      {
        name: "lastNameLabel",
        type: "string",
        defaultValue: "Last Name",
      },
      {
        name: "submitButtonText",
        type: "string",
        defaultValue: "Sign Up",
      },
      {
        name: "showTermsCheckbox",
        type: "boolean",
        defaultValue: true,
      },
      {
        name: "showMarketingCheckbox",
        type: "boolean",
        defaultValue: true,
      },
      {
        name: "onSuccessRedirect",
        type: "string",
        defaultValue: "/early-access",
      },
    ],
  });
}
