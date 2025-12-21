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
  metadata?: {
    nickname?: string;
    [key: string]: string | undefined;
  };
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
  role: 'participant' | 'job_developer' | 'employer' | 'free' | 'beta';
  subtitle?: string;
  price: string;
  period?: string;
  monthlyPriceId?: string | null;
  yearlyPrice?: string;
  yearlyPeriod?: string;
  yearlyPriceId?: string | null;
  sponsoredPriceId?: string | null;
  priceId: string | null; // Legacy - for backward compatibility
  popular?: boolean;
  description?: string;
  features: string[];
  notIncluded?: string[];
  purpose?: string;
  contact?: boolean;
}

// Default plans fallback - Role-based structure
const defaultPlans = [
  {
    name: "Free",
    role: 'free' as const,
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
    name: "Participant (Job Seeker)",
    role: 'participant' as const,
    subtitle: "AI-powered job matching & career tools",
    price: "$29",
    period: "per month",
    yearlyPrice: "$249",
    yearlyPeriod: "per year",
    monthlyPriceId: null,
    yearlyPriceId: null,
    sponsoredPriceId: null,
    priceId: null,
    popular: true,
    description: "AI-powered job matching, resume tools, interview prep, and application tracking.",
    features: [
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
      "🎯 Interview Preparation Suite",
      "  • Role- and industry-specific AI questions",
      "  • AI feedback + improvement scoring",
    ],
  },
  {
    name: "Job Developer / Career Coach",
    role: 'job_developer' as const,
    subtitle: "Multi-participant coaching workspace",
    price: "$99",
    period: "per month per seat",
    yearlyPrice: "$999",
    yearlyPeriod: "per year per seat",
    monthlyPriceId: null,
    yearlyPriceId: null,
    priceId: null,
    description: "Multi-participant coaching workspace with AI tools, reporting, and compliance features.",
    features: [
      "Multi-client management",
      "Resume + application oversight",
      "Interview readiness tracking",
      "Reporting & documentation",
      "Accessibility-informed insights",
      "AI-powered coaching tools",
      "Compliance features",
    ],
    contact: false, // Can checkout directly
  },
  {
    name: "Employer (HR Manager)",
    role: 'employer' as const,
    subtitle: "Inclusive Hiring Portal",
    price: "$199",
    period: "per month",
    priceId: null,
    monthlyPriceId: null,
    yearlyPriceId: null,
    description: "Employer hiring portal with inclusive job posts, candidate matching, and compliance tools.",
    features: [
      "Job postings with accessibility signals",
      "Candidate matching",
      "Employer profile & insights",
      "Compliance tools",
      "Inclusive hiring analytics",
    ],
    contact: false, // Can checkout directly
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

  // Map Stripe products to plans by role
  const plans: Plan[] = defaultPlans.map((defaultPlan) => {
    // Skip mapping for free and beta plans (no Stripe products)
    if (defaultPlan.role === 'free' || defaultPlan.role === 'beta') {
      return defaultPlan;
    }

    let monthlyPriceId: string | null = null;
    let yearlyPriceId: string | null = null;
    let sponsoredPriceId: string | null = null;
    let priceId: string | null = null; // Legacy fallback

    if (productsData?.products) {
      // Map by role-based product names
      const productNameMap: Record<string, string> = {
        'participant': 'JobBridge – Participant Access',
        'job_developer': 'JobBridge – Job Developer Workspace',
        'employer': 'JobBridge – Inclusive Hiring Portal',
      };

      const expectedProductName = productNameMap[defaultPlan.role];
      const matchingProduct = productsData.products.find((product) => {
        return product.name === expectedProductName || 
               product.name.toLowerCase().includes(defaultPlan.role.toLowerCase());
      });

      if (matchingProduct?.prices) {
        // Map prices by nickname or interval
        for (const price of matchingProduct.prices) {
          const nickname = (price.metadata?.nickname || '').toLowerCase();
          const interval = (price.recurring_interval || '').toLowerCase();
          
          // Match by nickname first (most reliable)
          if (nickname.includes('monthly') || nickname.includes('_core_monthly') || nickname.includes('_pro_monthly') || nickname.includes('_standard_monthly')) {
            monthlyPriceId = price.id;
            if (!priceId) priceId = price.id; // Legacy fallback
          } else if (nickname.includes('annual') || nickname.includes('yearly') || nickname.includes('_core_annual') || nickname.includes('_pro_annual')) {
            yearlyPriceId = price.id;
          } else if (nickname.includes('sponsored') || nickname.includes('_sponsored')) {
            sponsoredPriceId = price.id;
          } else if (interval === 'month' && !monthlyPriceId) {
            // Fallback: use interval if no nickname match
            monthlyPriceId = price.id;
            if (!priceId) priceId = price.id;
          } else if (interval === 'year' && !yearlyPriceId) {
            yearlyPriceId = price.id;
          }
        }
      }
    }

    return {
      ...defaultPlan,
      monthlyPriceId: monthlyPriceId || defaultPlan.monthlyPriceId,
      yearlyPriceId: yearlyPriceId || defaultPlan.yearlyPriceId,
      sponsoredPriceId: sponsoredPriceId || defaultPlan.sponsoredPriceId,
      priceId: priceId || defaultPlan.priceId, // Legacy fallback
    };
  });

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
                    {/* Price selection for plans with multiple prices */}
                    {(plan.monthlyPriceId || plan.yearlyPriceId || plan.sponsoredPriceId) && (
                      <div className="mb-4 flex gap-2">
                        {plan.monthlyPriceId && (
                          <button
                            type="button"
                            onClick={() => setSelectedPrices({ ...selectedPrices, [plan.name]: 'monthly' })}
                            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                              selectedPrices[plan.name] === 'monthly' || !selectedPrices[plan.name]
                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            Monthly
                          </button>
                        )}
                        {plan.yearlyPriceId && (
                          <button
                            type="button"
                            onClick={() => setSelectedPrices({ ...selectedPrices, [plan.name]: 'yearly' })}
                            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                              selectedPrices[plan.name] === 'yearly'
                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            Annual
                          </button>
                        )}
                        {plan.sponsoredPriceId && (
                          <button
                            type="button"
                            onClick={() => setSelectedPrices({ ...selectedPrices, [plan.name]: 'sponsored' })}
                            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                              selectedPrices[plan.name] === 'sponsored'
                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            Sponsored
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Display selected price */}
                    <div>
                      {(!selectedPrices[plan.name] || selectedPrices[plan.name] === 'monthly') && (
                        <>
                          <span className="text-3xl font-bold">{plan.price}</span>
                          {plan.period && (
                            <span className="text-sm text-muted-foreground"> / {plan.period}</span>
                          )}
                        </>
                      )}
                      {selectedPrices[plan.name] === 'yearly' && plan.yearlyPrice && (
                        <>
                          <span className="text-3xl font-bold">{plan.yearlyPrice}</span>
                          {plan.yearlyPeriod && (
                            <span className="text-sm text-muted-foreground"> / {plan.yearlyPeriod}</span>
                          )}
                        </>
                      )}
                      {selectedPrices[plan.name] === 'sponsored' && (
                        <>
                          <span className="text-3xl font-bold">$0</span>
                          <span className="text-sm text-muted-foreground"> / to user</span>
                          <p className="text-xs text-muted-foreground mt-1 italic">Billed to organization</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full mb-6" 
                    variant={plan.popular ? "default" : plan.contact ? "outline" : "outline"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Free plan - no checkout needed
                      if (plan.role === 'free') {
                        toast({
                          title: "Free Plan",
                          description: "You're already on the free plan! Sign up to get started.",
                        });
                        setLocation("/auth");
                        return;
                      }

                      // Beta/Waitlist - no Stripe product
                      if (plan.role === 'beta') {
                        toast({
                          title: "Beta Access",
                          description: "Beta access is granted through manual approval. Apply on the beta tester page.",
                        });
                        setLocation("/beta-tester");
                        return;
                      }

                      // Determine which priceId to use based on selection
                      const priceSelection = selectedPrices[plan.name] || 'monthly';
                      let selectedPriceId: string | null = null;

                      if (priceSelection === 'monthly' && plan.monthlyPriceId) {
                        selectedPriceId = plan.monthlyPriceId;
                      } else if (priceSelection === 'yearly' && plan.yearlyPriceId) {
                        selectedPriceId = plan.yearlyPriceId;
                      } else if (priceSelection === 'sponsored' && plan.sponsoredPriceId) {
                        selectedPriceId = plan.sponsoredPriceId;
                      } else {
                        // Fallback to legacy priceId or first available
                        selectedPriceId = plan.priceId || plan.monthlyPriceId || plan.yearlyPriceId || null;
                      }

                      // Sponsored pricing - redirect to contact
                      if (priceSelection === 'sponsored' || plan.contact) {
                        const planParam = encodeURIComponent(plan.name);
                        window.location.href = `/contact?plan=${planParam}&type=pricing&pricing=sponsored`;
                        return;
                      }

                      // Checkout with selected price
                      if (selectedPriceId) {
                        checkoutMutation.mutate(selectedPriceId);
                      } else {
                        toast({
                          title: "Contact Us",
                          description: `Please contact us for ${plan.name} pricing.`,
                        });
                        window.location.href = `/contact?plan=${encodeURIComponent(plan.name)}&type=pricing`;
                      }
                    }}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Processing...
                      </>
                    ) : plan.contact || selectedPrices[plan.name] === 'sponsored' ? (
                      "Contact Us"
                    ) : plan.role === 'free' ? (
                      "Sign Up Free"
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
