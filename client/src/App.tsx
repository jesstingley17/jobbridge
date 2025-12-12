import { Switch, Route, useLocation } from "wouter";
import { ClerkProvider } from "@clerk/clerk-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AIChatAssistant } from "@/components/ai-chat-assistant";
import { CookieConsent } from "@/components/cookie-consent";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { builder } from "@builder.io/react";
import { registerBuilderComponents } from "@/lib/builder-registry";
import Home from "@/pages/home";
import Features from "@/pages/features";
import Jobs from "@/pages/jobs";
import Resume from "@/pages/resume";
import Interview from "@/pages/interview";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import CareerDNA from "@/pages/career-dna";
import Applications from "@/pages/applications";
import SelectRole from "@/pages/select-role";
import Community from "@/pages/community";
import Pricing from "@/pages/pricing";
import Auth from "@/pages/auth";
import AuthWrapper from "@/pages/auth-wrapper";
import ResetPassword from "@/pages/reset-password";
import About from "@/pages/about";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Contact from "@/pages/contact";
import Notes from "@/pages/notes";
import Privacy from "@/pages/privacy";
import Cookies from "@/pages/cookies";
import Terms from "@/pages/terms";
import EarlyAccess from "@/pages/early-access";
import AdminBlog from "@/pages/admin-blog";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import BuilderPage from "@/pages/builder";

// Initialize Builder.io if API key is available
const BUILDER_API_KEY = import.meta.env.VITE_BUILDER_API_KEY || "";
if (BUILDER_API_KEY) {
  builder.init(BUILDER_API_KEY);
  // Register custom components for Builder.io
  registerBuilderComponents();
}

// Get Clerk publishable key (for Vite, use VITE_ prefix)
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

function CatchAllRoute() {
  const [location] = useLocation();
  return location.startsWith("/cms") ? <BuilderPage /> : <NotFound />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/features" component={Features} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/resume" component={Resume} />
      <Route path="/interview" component={Interview} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/career-dna" component={CareerDNA} />
      <Route path="/applications" component={Applications} />
      <Route path="/select-role" component={SelectRole} />
      <Route path="/community" component={Community} />
      <Route path="/pricing" component={Pricing} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/blog" component={AdminBlog} />
          <Route path="/contact" component={Contact} />
          <Route path="/notes" component={Notes} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/cookies" component={Cookies} />
          <Route path="/terms" component={Terms} />
          <Route path="/early-access" component={EarlyAccess} />
          <Route path="/auth" component={AuthWrapper} />
      <Route path="/auth/sign-in" component={AuthWrapper} />
      <Route path="/auth/sign-up" component={AuthWrapper} />
      <Route path="/auth/verify" component={ResetPassword} />
      <Route path="/cms" component={BuilderPage} />
      <Route component={CatchAllRoute} />
    </Switch>
  );
}

function App() {
  // If Clerk is configured, wrap with ClerkProvider
  if (CLERK_PUBLISHABLE_KEY) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <SubscriptionProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main id="main-content" className="flex-1">
                  <Router />
                </main>
                <Footer />
              </div>
              <Toaster />
              <AIChatAssistant />
              <CookieConsent />
            </SubscriptionProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    );
  }

  // Fallback if Clerk is not configured
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SubscriptionProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
          <AIChatAssistant />
          <CookieConsent />
        </SubscriptionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
