import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AIChatAssistant } from "@/components/ai-chat-assistant";
import { CookieConsent } from "@/components/cookie-consent";
import { SubscriptionProvider } from "@/contexts/subscription-context";
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
          <Route path="/auth" component={Auth} />
      <Route path="/auth/verify" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
