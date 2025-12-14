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
import { AuthInitializer } from "@/components/auth-initializer";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { builder } from "@builder.io/react";
import { registerBuilderComponents } from "@/lib/builder-registry";
// BotID disabled - import commented out
// import { initBotId } from "botid/client/core";
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
import AuthCallback from "@/pages/auth-callback";
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
import BetaTester from "@/pages/beta-tester";
import AdminBlog from "@/pages/admin-blog";
import AdminLogin from "@/pages/admin-login";
import AdminResetPassword from "@/pages/admin-reset-password";
import NotFound from "@/pages/not-found";
import BuilderPage from "@/pages/builder";

// Initialize Builder.io if API key is available
const BUILDER_API_KEY = import.meta.env.VITE_BUILDER_API_KEY || "";
if (BUILDER_API_KEY) {
  builder.init(BUILDER_API_KEY);
  // Register custom components for Builder.io
  registerBuilderComponents();
}

// BotID disabled - removed client-side initialization
// If you want to re-enable BotID, uncomment the initBotId call below
// and ensure BotID is enabled in your Vercel dashboard
// initBotId({
//   protect: [
//     { path: '/api/admin/login', method: 'POST' },
//     { path: '/api/admin/blog/posts', method: 'GET' },
//     { path: '/api/admin/blog/posts', method: 'POST' },
//     { path: '/api/admin/blog/posts/*', method: 'PUT' },
//     { path: '/api/admin/blog/posts/*', method: 'DELETE' },
//     { path: '/api/contentful/sync', method: 'POST' },
//     { path: '/api/applications', method: 'POST' },
//     { path: '/api/resume/generate', method: 'POST' },
//     { path: '/api/cover-letter/generate', method: 'POST' },
//     { path: '/api/interview/questions', method: 'POST' },
//     { path: '/api/interview/analyze', method: 'POST' },
//     { path: '/api/ai/*', method: 'POST' },
//   ],
// });

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
          <Route path="/admin/reset-password" component={AdminResetPassword} />
          <Route path="/admin/blog" component={AdminBlog} />
          <Route path="/contact" component={Contact} />
          <Route path="/notes" component={Notes} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/cookies" component={Cookies} />
          <Route path="/terms" component={Terms} />
          <Route path="/early-access" component={EarlyAccess} />
          <Route path="/beta-tester" component={BetaTester} />
          <Route path="/beta" component={BetaTester} />
          <Route path="/auth" component={AuthWrapper} />
      <Route path="/auth/sign-in" component={AuthWrapper} />
      <Route path="/auth/sign-up" component={AuthWrapper} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/auth/verify" component={ResetPassword} />
      <Route path="/cms" component={BuilderPage} />
      <Route component={CatchAllRoute} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SubscriptionProvider>
          <AuthInitializer />
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
