import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  FileText,
  MessageSquare,
  Search,
  ClipboardList,
  Accessibility,
  Brain,
  Heart,
  Shield,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Job Matching",
    description: "Advanced algorithms analyze 50+ career dimensions to create your unique Career DNA and match you with perfect opportunities.",
  },
  {
    icon: FileText,
    title: "Smart Resume Builder",
    description: "Create ATS-optimized resumes with AI assistance that highlights your strengths and adapts to any job posting.",
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description: "Practice with AI-generated questions tailored to your target role and receive personalized feedback.",
  },
  {
    icon: Search,
    title: "Accessible Job Search",
    description: "Find disability-friendly employers with comprehensive accommodation filters and accessibility features.",
  },
  {
    icon: ClipboardList,
    title: "Application Tracking",
    description: "Monitor all your applications in one place with insights on success rates and interview performance.",
  },
  {
    icon: Heart,
    title: "Wellness Support",
    description: "Mental health resources and career wellness guidance throughout your job search journey.",
  },
];

const stats = [
  { value: "10,000+", label: "Job Seekers Helped" },
  { value: "95%", label: "Accessibility Rating" },
  { value: "500+", label: "Inclusive Employers" },
  { value: "4.9/5", label: "User Satisfaction" },
];

const howItWorks = [
  {
    step: "1",
    title: "Create Your Profile",
    description: "Tell us about your skills, experience, and accessibility needs to build your Career DNA.",
  },
  {
    step: "2",
    title: "Get Matched",
    description: "Our AI finds opportunities from top job boards that match your unique profile.",
  },
  {
    step: "3",
    title: "Prepare & Apply",
    description: "Use our resume builder and interview prep tools to submit winning applications.",
  },
  {
    step: "4",
    title: "Track Progress",
    description: "Monitor your applications and get insights to improve your success rate.",
  },
];

export default function Home() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Create a form element to submit to AWeber
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.aweber.com/scripts/addlead.pl";
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    // Add hidden fields
    const addHiddenField = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addHiddenField("meta_web_form_id", "539205314");
    addHiddenField("meta_split_id", "");
    addHiddenField("listname", "awlist6912956");
    addHiddenField("redirect", window.location.href);
    addHiddenField("meta_adtracking", "Waitlist");
    addHiddenField("meta_message", "1");
    addHiddenField("meta_required", "name (awf_first),name (awf_last),email");
    addHiddenField("meta_tooltip", "");

    // Add form data
    addHiddenField("name (awf_first)", formData.firstName);
    addHiddenField("name (awf_last)", formData.lastName);
    addHiddenField("email", formData.email);
    if (formData.role) {
      addHiddenField("custom Your Role", formData.role);
    }
    if (formData.company) {
      addHiddenField("custom Organization", formData.company);
    }

    document.body.appendChild(form);
    form.submit();
    
    // Show success message
    toast({
      title: "Success!",
      description: "You've been added to the waitlist. Check your email for confirmation.",
    });
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      company: "",
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950/20 dark:via-pink-950/20 dark:to-background py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Large Logo */}
            <div className="mb-8 flex justify-center">
              <Logo size="xl" variant="vertical" showText={true} />
            </div>

            {/* CTA Button */}
            <div className="mb-8 flex justify-center">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-0 gap-2 px-8 py-6 text-lg"
                  data-testid="button-join-revolution"
                >
                  <Rocket className="h-5 w-5" aria-hidden="true" />
                  Join the JobBridge Revolution
                </Button>
              </Link>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Breaking Employment{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Barriers
              </span>{" "}
              for Everyone
            </h1>

            {/* Subheading */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
              The most comprehensive, accessible, and user-friendly job search platform designed with the success and wellbeing of people with disabilities in mind.
            </p>

            {/* Waitlist Form */}
            <form onSubmit={handleWaitlistSubmit} className="mt-10 mx-auto max-w-md">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-md"
                  required
                  data-testid="input-waitlist-email"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 gap-2 px-8"
                  disabled={waitlistMutation.isPending}
                  data-testid="button-join-waitlist"
                >
                  {waitlistMutation.isPending ? (
                    "Joining..."
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Get 30-day free premium trial + priority access
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y bg-muted/30 py-8" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful AI tools and accessibility features designed to help you find and land your dream job.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group relative overflow-visible">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20 md:py-32" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="how-it-works-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Your journey to meaningful employment in four simple steps.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Promise */}
      <section className="py-20 md:py-32" aria-labelledby="accessibility-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 id="accessibility-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
                Built for Accessibility from Day One
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Every feature is designed with accessibility at its core. We follow WCAG 2.1 guidelines and continuously test with assistive technologies.
              </p>
              <ul className="mt-8 space-y-4" role="list">
                {[
                  "Full screen reader support with ARIA labels",
                  "Complete keyboard navigation",
                  "High contrast color schemes",
                  "Adjustable text sizes up to 200%",
                  "Reduced motion options",
                  "Clear focus indicators",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Accessibility className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">WCAG 2.1</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Level AA Compliant</p>
                </CardContent>
              </Card>
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Shield className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">Privacy First</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Secure Data Handling</p>
                </CardContent>
              </Card>
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Users className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">Community</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Peer Support Network</p>
                </CardContent>
              </Card>
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Zap className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">AI Powered</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Smart Matching</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Join thousands of job seekers who have found meaningful employment through The Job Bridge.
          </p>
          <div className="mt-10">
            <Link href="/beta-tester">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8 py-6 text-lg"
                data-testid="button-cta-get-started"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
