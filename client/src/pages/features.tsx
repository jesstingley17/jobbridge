import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  FileText,
  MessageSquare,
  Search,
  ClipboardList,
  Heart,
  Accessibility,
  Shield,
  Zap,
  Users,
  Target,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Globe,
} from "lucide-react";

const mainFeatures = [
  {
    icon: Brain,
    title: "Career DNA Matching",
    description: "Our AI analyzes 50+ career dimensions including skills, interests, work style preferences, and accessibility needs to create your unique Career DNA profile.",
    highlights: [
      "Personalized job recommendations",
      "Skills gap analysis",
      "Career path suggestions",
      "Accommodation matching",
    ],
  },
  {
    icon: FileText,
    title: "AI Resume Builder",
    description: "Create professional, ATS-optimized resumes that highlight your unique strengths and automatically adapt to any job posting.",
    highlights: [
      "AI-powered content suggestions",
      "ATS compatibility scoring",
      "Multiple format templates",
      "One-click optimization",
    ],
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description: "Practice with AI-generated interview questions tailored to your target role and receive personalized feedback to improve your performance.",
    highlights: [
      "Role-specific questions",
      "Real-time answer feedback",
      "Confidence building exercises",
      "Accommodation request tips",
    ],
  },
  {
    icon: Search,
    title: "Smart Job Search",
    description: "Search across Google Jobs, Indeed, ZipRecruiter, and more with advanced filters for disability accommodations and accessibility needs.",
    highlights: [
      "Multi-platform aggregation",
      "Accessibility filters",
      "Remote work focus",
      "Salary transparency",
    ],
  },
  {
    icon: Zap,
    title: "Automated Applications",
    description: "Apply to hundreds of jobs automatically with personalized cover letters generated specifically for each position.",
    highlights: [
      "One-click applications",
      "Custom cover letters",
      "Application scheduling",
      "Follow-up reminders",
    ],
  },
  {
    icon: ClipboardList,
    title: "Application Tracker",
    description: "Monitor all your job applications in one place with detailed insights on success rates, interview performance, and next steps.",
    highlights: [
      "Status tracking",
      "Interview scheduling",
      "Performance analytics",
      "Document storage",
    ],
  },
];

const accessibilityFeatures = [
  {
    icon: Accessibility,
    title: "Screen Reader Support",
    description: "Full compatibility with JAWS, NVDA, VoiceOver, and other screen readers.",
  },
  {
    icon: Target,
    title: "Keyboard Navigation",
    description: "Complete keyboard accessibility for all features and interactions.",
  },
  {
    icon: BarChart3,
    title: "High Contrast",
    description: "WCAG 2.1 AA compliant color contrast throughout the platform.",
  },
  {
    icon: Lightbulb,
    title: "Clear Focus Indicators",
    description: "Visible focus states on all interactive elements.",
  },
];

const integrations = [
  { name: "Google Jobs", icon: Globe },
  { name: "Indeed", icon: Search },
  { name: "ZipRecruiter", icon: Zap },
  { name: "LinkedIn", icon: Users },
];

export default function Features() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-accent/5 to-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Powerful Tools for Your{" "}
              <span className="text-primary">Career Success</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed">
              Discover how The Job Bridge combines AI technology with accessibility-first design to help you find and land your dream job.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 md:py-32" aria-labelledby="main-features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="main-features-heading" className="sr-only">Main Features</h2>
          <div className="grid gap-12 lg:gap-16">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
                  index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-bold md:text-3xl">{feature.title}</h3>
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2" role="list">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                        <span className="text-sm text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Card className={`overflow-visible ${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                  <CardContent className="flex h-64 items-center justify-center bg-muted/30">
                    <feature.icon className="h-24 w-24 text-primary/20" aria-hidden="true" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section className="bg-muted/30 py-20 md:py-32" aria-labelledby="accessibility-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="accessibility-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
              Accessibility First Design
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every feature is built with accessibility at its core, following WCAG 2.1 Level AA standards.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {accessibilityFeatures.map((feature) => (
              <Card key={feature.title} className="overflow-visible">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 md:py-32" aria-labelledby="integrations-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="integrations-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
              Connected to Top Job Boards
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Access opportunities from the most popular job platforms, all in one place.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 rounded-lg bg-muted/50 px-6 py-4"
              >
                <integration.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <span className="font-medium">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="bg-muted/30 py-20 md:py-32" aria-labelledby="privacy-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 id="privacy-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
                Your Privacy is Our Priority
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                We handle your data with the utmost care. Your information is never shared without your explicit permission.
              </p>
              <ul className="mt-8 space-y-4" role="list">
                {[
                  "End-to-end encryption for all data",
                  "No sharing with third parties without consent",
                  "GDPR and CCPA compliant",
                  "Regular security audits",
                  "Option to delete all data anytime",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Shield className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="overflow-visible">
              <CardContent className="flex h-64 items-center justify-center bg-muted/30">
                <Shield className="h-32 w-32 text-primary/20" aria-hidden="true" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20" aria-labelledby="features-cta-heading">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="features-cta-heading" className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Experience the Difference
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Start using our AI-powered tools today and take the first step toward your dream career.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/jobs">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8 py-6 text-lg"
                data-testid="button-features-get-started"
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
