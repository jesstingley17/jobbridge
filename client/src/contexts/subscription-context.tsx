import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useSubscription, SubscriptionStatus, SubscriptionError, parseSubscriptionError } from "@/hooks/use-subscription";
import { UpgradePromptDialog } from "@/components/upgrade-prompt";

interface SubscriptionContextValue {
  subscription: SubscriptionStatus | null | undefined;
  isLoading: boolean;
  showUpgradePrompt: (error: SubscriptionError) => void;
  handleApiError: (error: unknown) => boolean;
  hasFeature: (feature: keyof SubscriptionStatus["limits"]) => boolean;
  isPro: boolean;
  isEnterprise: boolean;
  isFree: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data: subscription, isLoading } = useSubscription();
  const [upgradeError, setUpgradeError] = useState<SubscriptionError | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const showUpgradePrompt = useCallback((error: SubscriptionError) => {
    setUpgradeError(error);
    setShowDialog(true);
  }, []);

  const handleApiError = useCallback((error: unknown): boolean => {
    if (error instanceof Error) {
      const match = error.message.match(/^\d+:\s*(.+)$/);
      if (match) {
        const subError = parseSubscriptionError(match[1]);
        if (subError) {
          showUpgradePrompt(subError);
          return true;
        }
      }
    }
    return false;
  }, [showUpgradePrompt]);

  const hasFeature = useCallback(
    (feature: keyof SubscriptionStatus["limits"]): boolean => {
      if (!subscription) return false;
      const value = subscription.limits[feature];
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0;
      return false;
    },
    [subscription]
  );

  const isPro = subscription?.tier === "pro" || subscription?.tier === "enterprise";
  const isEnterprise = subscription?.tier === "enterprise";
  const isFree = !subscription || subscription.tier === "free";

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        showUpgradePrompt,
        handleApiError,
        hasFeature,
        isPro,
        isEnterprise,
        isFree,
      }}
    >
      {children}
      <UpgradePromptDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        error={upgradeError}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
  }
  return context;
}
