import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Sparkles, Building2, Rocket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface StripePrice {
  id: string;
  unit_amount: number;
  recurring_interval: string;
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

const tierFeatures: Record<string, string[]> = {
  free: [
    "Basic job search",
    "5 job applications per month",
    "Basic resume templates",
    "Community access",
  ],
  pro: [
    "Everything in Free",
    "Unlimited job applications",
    "AI-powered resume builder",
    "AI interview preparation",
    "Career DNA assessment",
    "Priority support",
    "Job matching recommendations",
  ],
  enterprise: [
    "Everything in Pro",
    "Dedicated account manager",
    "Custom accessibility features",
    "Team collaboration tools",
    "Advanced analytics",
    "API access",
    "White-label options",
  ],
};

const tierIcons: Record<string, typeof Sparkles> = {
  free: Sparkles,
  pro: Rocket,
  enterprise: Building2,
};

function getTierFromName(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("enterprise")) return "enterprise";
  if (lowerName.includes("pro")) return "pro";
  return "free";
}

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const { user, isAuthenticated } = useAuth();

  const { data: productsData, isLoading } = useQuery<StripeProductsResponse>({
    queryKey: ["/api/stripe/products"],
  });
  
  const products = productsData?.products;

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const response = await apiRequest("POST", "/api/stripe/checkout", { priceId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/portal");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const sortedProducts = Array.isArray(products) ? (() => {
    const tierOrder: Record<string, number> = { free: 0, pro: 1, enterprise: 2 };
    const seenTiers = new Set<string>();
    return [...products]
      .sort((a, b) => (tierOrder[getTierFromName(a.name)] || 0) - (tierOrder[getTierFromName(b.name)] || 0))
      .filter((product) => {
        const tier = getTierFromName(product.name);
        if (seenTiers.has(tier)) return false;
        seenTiers.add(tier);
        return true;
      });
  })() : [];

  const handleSubscribe = (product: StripeProduct) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    const tier = getTierFromName(product.name);
    
    if (tier === "free") {
      return;
    }

    const price = product.prices.find(
      (p) => p.recurring_interval === billingInterval
    );
    
    if (price) {
      checkoutMutation.mutate(price.id);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const getPrice = (product: StripeProduct) => {
    const price = product.prices.find(
      (p) => p.recurring_interval === billingInterval
    );
    return price ? price.unit_amount : 0;
  };

  const userCurrentTier = user?.subscriptionTier || "free";

  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="text-pricing-title">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-pricing-subtitle">
            Choose the plan that fits your career journey. Upgrade anytime as your needs grow.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-md">
            <Button
              variant={billingInterval === "month" ? "default" : "ghost"}
              onClick={() => setBillingInterval("month")}
              data-testid="button-billing-monthly"
            >
              Monthly
            </Button>
            <Button
              variant={billingInterval === "year" ? "default" : "ghost"}
              onClick={() => setBillingInterval("year")}
              data-testid="button-billing-yearly"
            >
              Yearly
              <Badge variant="secondary" className="ml-2">Save 17%</Badge>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="flex-1">
                  <Skeleton className="h-10 w-32 mb-6" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {sortedProducts?.map((product) => {
              const tier = getTierFromName(product.name);
              const features = tierFeatures[tier] || [];
              const TierIcon = tierIcons[tier] || Sparkles;
              const price = getPrice(product);
              const isCurrentPlan = userCurrentTier === tier;
              const isPro = tier === "pro";

              return (
                <Card
                  key={product.id}
                  className={`flex flex-col relative ${isPro ? "border-primary shadow-lg" : ""}`}
                  data-testid={`card-pricing-${tier}`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default" data-testid="badge-most-popular">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <TierIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                      <CardTitle className="text-xl" data-testid={`text-tier-name-${tier}`}>
                        {product.name}
                      </CardTitle>
                    </div>
                    <CardDescription data-testid={`text-tier-description-${tier}`}>
                      {product.description || `Perfect for ${tier === "free" ? "getting started" : tier === "pro" ? "serious job seekers" : "organizations"}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6">
                      <span className="text-4xl font-bold" data-testid={`text-price-${tier}`}>
                        {formatPrice(price)}
                      </span>
                      <span className="text-muted-foreground">
                        /{billingInterval}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="text-sm" data-testid={`text-feature-${tier}-${index}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrentPlan ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => portalMutation.mutate()}
                        disabled={portalMutation.isPending}
                        data-testid={`button-manage-${tier}`}
                      >
                        {portalMutation.isPending ? "Loading..." : "Manage Plan"}
                      </Button>
                    ) : tier === "free" ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled
                        data-testid={`button-subscribe-${tier}`}
                      >
                        Free Plan
                      </Button>
                    ) : (
                      <Button
                        variant={isPro ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleSubscribe(product)}
                        disabled={checkoutMutation.isPending}
                        data-testid={`button-subscribe-${tier}`}
                      >
                        {checkoutMutation.isPending ? "Loading..." : `Subscribe to ${product.name}`}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4" data-testid="text-faq-title">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto text-left space-y-6">
            <div>
              <h3 className="font-medium mb-2">Can I change my plan later?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards, debit cards, and various digital payment methods through Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Is there a refund policy?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
