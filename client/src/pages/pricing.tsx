import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
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
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const checkoutMutation = useMutation({
    mutationFn: async (planName: string) => {
      if (planName === "Enterprise") {
        toast({
          title: "Contact Us",
          description: "Please contact us for Enterprise pricing.",
        });
        return;
      }
      if (!isAuthenticated) {
        toast({
          title: "Login Required",
          description: "Please log in to subscribe to a plan.",
          variant: "destructive",
        });
        return;
      }
      const response = await apiRequest("POST", "/api/stripe/checkout", { 
        plan: planName.toLowerCase() 
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
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
                  onClick={() => checkoutMutation.mutate(plan.name)}
                  disabled={checkoutMutation.isPending}
                >
                  Get Started
                </Button>
                <ul className="space-y-3" role="list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
