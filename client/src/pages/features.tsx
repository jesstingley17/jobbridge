import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  FileText,
  MessageSquare,
  Search,
  ClipboardList,
  Heart,
  Shield,
  Zap,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Job Matching",
    description: "Our advanced Career DNA technology analyzes over 50 career dimensions including skills, experience, interests, values, and accessibility needs. Get matched with opportunities that truly fit your unique profile.",
    benefits: ["Personalized job recommendations", "Smart skill matching", "Cultural fit analysis", "Accessibility-first filtering"],
  },
  {
    icon: FileText,
    title: "Smart Resume Builder",
    description: "Create professional, ATS-optimized resumes in minutes with AI assistance. Our builder helps you highlight your strengths and tailor your resume for each application.",
    benefits: ["Multiple professional templates", "AI-powered content suggestions", "ATS optimization", "Export to PDF/Word"],
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description: "Practice with AI-generated interview questions specific to your target role and industry. Receive personalized feedback and improve your interview skills.",
    benefits: ["Role-specific questions", "Video practice mode", "AI feedback and tips", "Common question library"],
  },
  {
    icon: Search,
    title: "Accessible Job Search",
    description: "Search thousands of jobs from disability-friendly employers. Filter by accommodation needs, remote work options, and accessibility features.",
    benefits: ["Accessibility filters", "Remote-first jobs", "Inclusive employers", "Accommodation info"],
  },
  {
    icon: ClipboardList,
    title: "Application Tracking",
    description: "Keep track of all your applications in one central dashboard. Monitor progress, set reminders, and get insights to improve your success rate.",
    benefits: ["Centralized dashboard", "Application status tracking", "Interview reminders", "Success analytics"],
  },
  {
    icon: Heart,
    title: "Wellness Support",
    description: "Access mental health resources and career wellness guidance throughout your job search journey. We understand the emotional challenges of job hunting.",
    benefits: ["Wellness resources", "Career coaching tips", "Stress management", "Community support"],
  },
];

export default function Features() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-medium text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Comprehensive Platform Features
            </div>
            <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed">
              The JobBridge provides a complete suite of AI-powered tools and resources designed specifically for job seekers with disabilities. Every feature is built with accessibility at its core.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:gap-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
                  index % 2 === 1 ? "lg:direction-rtl" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="text-3xl tracking-tight md:text-4xl">{feature.title}</h2>
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-3" role="list">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Card className={`overflow-hidden ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <CardContent className="p-8">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-20 w-20 text-primary/40" aria-hidden="true" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Commitment */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl tracking-tight md:text-4xl">
              Built with Accessibility in Mind
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every feature on The JobBridge is designed, built, and tested to meet the highest accessibility standards.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">WCAG 2.1 AA</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fully compliant with international accessibility standards
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">Screen Reader Optimized</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tested with NVDA, JAWS, and VoiceOver
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">Keyboard Navigation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete keyboard support with clear focus indicators
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
