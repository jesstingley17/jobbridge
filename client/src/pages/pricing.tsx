import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface StripePrice {
  id: string;
  unit_amount: number;
  recurring_interval: string;
  currency: string;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  prices: StripePrice[];
}

interface StripeProductsResponse {
  products: StripeProduct[];
}

interface Plan {
  name: string;
  subtitle?: string;
  price: string;
  period?: string;
  yearlyPrice?: string;
  yearlyPeriod?: string;
  priceId: string | null;
  popular?: boolean;
  description?: string;
  features: string[];
  notIncluded?: string[];
  purpose?: string;
  contact?: boolean;
}

// Default plans fallback
const defaultPlans = [
  {
    name: "Free",
    subtitle: "Explore",
    price: "$0",
    period: "forever",
    priceId: null,
    description: "You can look. You can't move furniture.",
    features: [
      "Accessible job search (basic filters only)",
      "Limited job recommendations (algorithm-lite)",
      "Save up to 10 jobs",
      "Application tracking (view-only)",
      "Blog + resource access",
    ],
    notIncluded: [
      "No deep AI",
      "No resume builder",
      "No interview prep",
      "No analytics",
      "No magic",
    ],
    purpose: "Lead gen, trust-building, SEO fuel.",
  },
  {
    name: "JobBridge Core",
    subtitle: "Where real progress starts",
    price: "$29",
    period: "per month",
    yearlyPrice: "$249",
    yearlyPeriod: "per year",
    priceId: null,
    popular: true,
    description: "This is your breadwinner tier.",
    features: [
      "Everything in Free, plus:",
      "🧠 Career DNA Matching (Full Power)",
      "  • Deep skill + experience analysis",
      "  • Cultural fit modeling",
      "  • Accessibility-first matching",
      "  • Priority job recommendations",
      "📄 Smart Resume Builder",
      "  • ATS-optimized templates",
      "  • AI content generation",
      "  • Unlimited edits",
      "  • PDF & Word export",
      "📊 Application Tracking (Full)",
      "  • Unlimited applications",
      "  • Status tracking",
      "  • Interview reminders",
    ],
  },
  {
    name: "JobBridge Pro",
    subtitle: "Aggressive growth. Serious intent.",
    price: "$49",
    period: "per month",
    yearlyPrice: "$399",
    yearlyPeriod: "per year",
    priceId: null,
    description: "This is for users who are done playing around.",
    features: [
      "Everything in Core, plus:",
      "🎯 Interview Preparation Suite",
      "  • Role- and industry-specific AI questions",
      "  • AI feedback + improvement scoring",
      "  • Question bank access",
      "  • Video practice mode",
      "📈 Success Analytics",
      "  • Resume-to-interview conversion insights",
      "  • Application performance trends",
      "  • Personalized improvement suggestions",
      "💛 Career Resilience Tools",
      "  • Burnout & stress management resources",
      "  • Focused career coaching prompts",
    ],
  },
  {
    name: "Sponsored / Institutional Access",
    subtitle: "Same pricing. Different payer.",
    price: "$0",
    period: "to user",
    priceId: null,
    description: "No discounts. No guilt pricing. Just redistributed cost.",
    features: [
      "Full JobBridge Pro access",
      "Progress reporting",
      "Priority support",
      "Billed to orgs: Bulk / per-seat contracts",
    ],
    contact: true,
  },
  {
    name: "Job Developers & Coaches",
    subtitle: "You're not a 'nice add-on.' You're infrastructure.",
    price: "$99",
    period: "per month per seat",
    priceId: null,
    description: "Org pricing scales from there",
    features: [
      "Multi-client management",
      "Resume + application oversight",
      "Interview readiness tracking",
      "Reporting & documentation",
      "Accessibility-informed insights",
    ],
    contact: true,
  },
  {
    name: "Employers",
    subtitle: "Inclusive Hiring, Done Right",
    price: "$199–499",
    period: "per month",
    priceId: null,
    description: "Pay to access prepared, matched candidates.",
    features: [
      "Job postings with accessibility signals",
      "Candidate matching",
      "Employer profile & insights",
      "Or per-hire options",
    ],
    contact: true,
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Check for success/cancel from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast({
        title: "Success!",
        description: "Your subscription has been activated.",
      });
      setLocation("/pricing");
    } else if (params.get("canceled") === "true") {
      toast({
        title: "Cancelled",
        description: "Checkout was cancelled.",
        variant: "destructive",
      });
      setLocation("/pricing");
    }
  }, [toast, setLocation]);

  // Fetch Stripe products
  const { data: productsData, isLoading } = useQuery<StripeProductsResponse>({
    queryKey: ["/api/stripe/products"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      if (!isAuthenticated) {
        toast({
          title: "Login Required",
          description: "Please log in to subscribe to a plan.",
          variant: "destructive",
        });
        setLocation("/auth");
        return;
      }
      const response = await apiRequest("POST", "/api/stripe/checkout", { 
        priceId 
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout.",
        variant: "destructive",
      });
    },
  });

  // Map Stripe products to plans
  const plans: Plan[] = productsData?.products 
    ? productsData.products.map((product) => {
        const price = product.prices[0];
        const amount = price?.unit_amount ? price.unit_amount / 100 : 0;
        const interval = price?.recurring_interval || "month";
        const defaultPlan = defaultPlans.find(p => 
          product.name.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(product.name.toLowerCase())
        );
        
        return {
          name: product.name,
          subtitle: defaultPlan?.subtitle || "",
          price: amount > 0 ? `$${amount}` : "Custom",
          period: interval === "month" ? "per month" : interval === "year" ? "per year" : "contact us",
          yearlyPrice: defaultPlan?.yearlyPrice,
          yearlyPeriod: defaultPlan?.yearlyPeriod,
          priceId: price?.id || null,
          popular: product.name.toLowerCase().includes("core"),
          description: defaultPlan?.description,
          features: product.description 
            ? product.description.split("\n").filter(Boolean)
            : defaultPlan?.features || [],
          notIncluded: defaultPlan?.notIncluded,
          purpose: defaultPlan?.purpose,
          contact: defaultPlan?.contact || false,
        };
      })
    : defaultPlans;

  return (
    <div className="flex flex-col min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl">
            Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that&apos;s right for your job search journey
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24 mb-4" />
                  <Skeleton className="h-8 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full mb-6" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={plan.popular ? "border-primary shadow-lg relative md:col-span-2 lg:col-span-1" : ""}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{plan.subtitle}</p>
                  )}
                  {plan.description && (
                    <p className="text-xs text-muted-foreground italic mt-2">{plan.description}</p>
                  )}
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground"> / {plan.period}</span>
                    )}
                    {plan.yearlyPrice && (
                      <div className="mt-2">
                        <span className="text-2xl font-bold">{plan.yearlyPrice}</span>
                        <span className="text-sm text-muted-foreground"> / {plan.yearlyPeriod}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full mb-6" 
                    variant={plan.popular ? "default" : plan.contact ? "outline" : "outline"}
                    onClick={() => {
                      if (plan.contact || plan.name.includes("Sponsored") || plan.name.includes("Employers") || plan.name.includes("Coaches") || !plan.priceId) {
                        toast({
                          title: "Contact Us",
                          description: `Please contact us for ${plan.name} pricing.`,
                        });
                        setLocation("/contact");
                      } else {
                        checkoutMutation.mutate(plan.priceId);
                      }
                    }}
                    disabled={checkoutMutation.isPending || (plan.contact && !plan.priceId)}
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Processing...
                      </>
                    ) : plan.contact ? (
                      "Contact Us"
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                  {plan.purpose && (
                    <p className="text-xs text-muted-foreground mb-4 italic">{plan.purpose}</p>
                  )}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">Includes:</p>
                      <ul className="space-y-2" role="list">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            {feature.startsWith("  •") ? (
                              <>
                                <span className="text-xs text-muted-foreground w-2 flex-shrink-0">•</span>
                                <span className="text-xs text-muted-foreground">{feature.trim()}</span>
                              </>
                            ) : feature.includes("Everything in") || feature.includes("🧠") || feature.includes("📄") || feature.includes("📊") || feature.includes("🎯") || feature.includes("📈") || feature.includes("💛") ? (
                              <span className="text-sm font-medium text-foreground">{feature}</span>
                            ) : (
                              <>
                                <Check className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" aria-hidden="true" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {plan.notIncluded && plan.notIncluded.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2 text-destructive">What's NOT included:</p>
                        <ul className="space-y-2" role="list">
                          {plan.notIncluded.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground">✗</span>
                              <span className="text-xs text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
