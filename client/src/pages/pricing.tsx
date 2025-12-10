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

// Default plans fallback
const defaultPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    priceId: null,
    features: [
      "Basic job search",
      "1 resume template",
      "Basic interview prep",
      "Community access",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    priceId: null,
    popular: true,
    features: [
      "Unlimited job applications",
      "All resume templates",
      "AI interview coaching",
      "Career DNA analysis",
      "Priority support",
      "Application tracking",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    priceId: null,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "Team collaboration",
      "Advanced analytics",
      "SLA guarantee",
    ],
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
  const plans = productsData?.products 
    ? productsData.products.map((product) => {
        const price = product.prices[0];
        const amount = price?.unit_amount ? price.unit_amount / 100 : 0;
        const interval = price?.recurring_interval || "month";
        
        return {
          name: product.name,
          price: amount > 0 ? `$${amount}` : "Custom",
          period: interval === "month" ? "per month" : interval === "year" ? "per year" : "contact us",
          priceId: price?.id || null,
          popular: product.name.toLowerCase().includes("pro"),
          features: product.description 
            ? product.description.split("\n").filter(Boolean)
            : defaultPlans.find(p => p.name === product.name)?.features || [],
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
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={plan.popular ? "border-primary shadow-lg relative" : ""}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period !== "forever" && plan.period !== "contact us" && (
                      <span className="text-sm text-muted-foreground"> / {plan.period}</span>
                    )}
                    {plan.period === "forever" && (
                      <span className="text-sm text-muted-foreground"> / {plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full mb-6" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => {
                      if (plan.name === "Enterprise" || !plan.priceId) {
                        toast({
                          title: "Contact Us",
                          description: "Please contact us for Enterprise pricing.",
                        });
                        setLocation("/contact");
                      } else {
                        checkoutMutation.mutate(plan.priceId);
                      }
                    }}
                    disabled={checkoutMutation.isPending || !plan.priceId}
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Processing...
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                  <ul className="space-y-3" role="list">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" aria-hidden="true" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
