import { useQuery } from "@tanstack/react-query";

export interface SubscriptionStatus {
  tier: "free" | "pro" | "enterprise";
  limits: {
    monthlyApplications: number;
    aiResumeBuilder: boolean;
    aiResumeParsing: boolean;
    aiInterviewPrep: boolean;
    aiJobRecommendations: boolean;
    aiCoverLetter: boolean;
    aiSkillsGap: boolean;
    aiChatAssistant: boolean;
    aiApplicationTips: boolean;
    bulkApply: boolean;
    prioritySupport: boolean;
    analyticsAccess: boolean;
    apiAccess: boolean;
    teamFeatures: boolean;
  };
  applicationQuota: {
    used: number;
    remaining: number;
    limit: number;
    resetDate: string | null;
  };
}

export interface SubscriptionError {
  error: string;
  code: "SUBSCRIPTION_REQUIRED" | "APPLICATION_LIMIT_REACHED";
  feature?: string;
  description?: string;
  requiredTier: "pro" | "enterprise";
  currentTier: "free" | "pro" | "enterprise";
  message: string;
  limit?: number;
  remaining?: number;
  resetDate?: string;
}

export function useSubscription() {
  return useQuery<SubscriptionStatus | null>({
    queryKey: ["/api/subscription/status"],
    retry: false,
    staleTime: 30000,
  });
}

export function isSubscriptionError(error: unknown): error is SubscriptionError {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  return (
    err.code === "SUBSCRIPTION_REQUIRED" || err.code === "APPLICATION_LIMIT_REACHED"
  );
}

export function parseSubscriptionError(errorText: string): SubscriptionError | null {
  try {
    const parsed = JSON.parse(errorText);
    if (isSubscriptionError(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON or not a subscription error
  }
  return null;
}

export function hasFeatureAccess(
  subscription: SubscriptionStatus | null | undefined,
  feature: keyof SubscriptionStatus["limits"]
): boolean {
  if (!subscription) return false;
  const value = subscription.limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return false;
}
