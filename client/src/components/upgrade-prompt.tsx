import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "wouter";
import type { SubscriptionError } from "@/hooks/use-subscription";

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: SubscriptionError | null;
}

export function UpgradePromptDialog({
  open,
  onOpenChange,
  error,
}: UpgradePromptDialogProps) {
  if (!error) return null;

  const isApplicationLimit = error.code === "APPLICATION_LIMIT_REACHED";
  const tierDisplay = error.requiredTier === "enterprise" ? "Enterprise" : "Pro";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-upgrade-prompt">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {error.requiredTier === "enterprise" ? (
              <Crown className="h-6 w-6 text-amber-500" />
            ) : (
              <Sparkles className="h-6 w-6 text-primary" />
            )}
            <Badge variant="secondary">{tierDisplay} Feature</Badge>
          </div>
          <DialogTitle data-testid="text-upgrade-title">
            {isApplicationLimit
              ? "Application Limit Reached"
              : `Unlock ${error.feature || "This Feature"}`}
          </DialogTitle>
          <DialogDescription data-testid="text-upgrade-description">
            {error.message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isApplicationLimit ? (
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-2xl font-bold text-foreground">
                {error.limit} / {error.limit}
              </p>
              <p className="text-sm text-muted-foreground">
                Applications used this month
              </p>
              {error.resetDate && (
                <p className="text-xs text-muted-foreground mt-2">
                  Resets on {new Date(error.resetDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {error.description}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current plan:</span>
                <Badge variant="outline" className="capitalize">
                  {error.currentTier}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-upgrade-cancel"
          >
            Maybe Later
          </Button>
          <Link href="/pricing">
            <Button
              onClick={() => onOpenChange(false)}
              data-testid="button-upgrade-now"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to {tierDisplay}
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FeatureLockOverlayProps {
  feature: string;
  description: string;
  requiredTier?: "pro" | "enterprise";
  className?: string;
}

export function FeatureLockOverlay({
  feature,
  description,
  requiredTier = "pro",
  className = "",
}: FeatureLockOverlayProps) {
  const tierDisplay = requiredTier === "enterprise" ? "Enterprise" : "Pro";

  return (
    <div
      className={`relative ${className}`}
      data-testid={`feature-lock-${feature.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-md">
        <Card className="max-w-sm mx-4">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 p-3 rounded-full bg-muted w-fit">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">{feature}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/pricing">
              <Button data-testid="button-unlock-feature">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to {tierDisplay}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface FeatureGateProps {
  children: React.ReactNode;
  hasAccess: boolean;
  feature: string;
  description: string;
  requiredTier?: "pro" | "enterprise";
}

export function FeatureGate({
  children,
  hasAccess,
  feature,
  description,
  requiredTier = "pro",
}: FeatureGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[200px]">
      <div className="opacity-30 pointer-events-none">{children}</div>
      <FeatureLockOverlay
        feature={feature}
        description={description}
        requiredTier={requiredTier}
        className="absolute inset-0"
      />
    </div>
  );
}

interface ApplicationQuotaDisplayProps {
  used: number;
  limit: number;
  remaining: number;
  className?: string;
}

export function ApplicationQuotaDisplay({
  used,
  limit,
  remaining,
  className = "",
}: ApplicationQuotaDisplayProps) {
  const isUnlimited = limit === -1;
  const percentUsed = isUnlimited ? 0 : (used / limit) * 100;
  const isNearLimit = !isUnlimited && remaining <= 2 && remaining > 0;
  const isAtLimit = !isUnlimited && remaining === 0;

  return (
    <div className={`space-y-2 ${className}`} data-testid="application-quota-display">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Applications this month</span>
        <span className="font-medium">
          {isUnlimited ? (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Unlimited
            </span>
          ) : (
            <span className={isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : ""}>
              {used} / {limit}
            </span>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAtLimit
                ? "bg-destructive"
                : isNearLimit
                ? "bg-amber-500"
                : "bg-primary"
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      )}
      {isNearLimit && (
        <p className="text-xs text-amber-500">
          Only {remaining} application{remaining === 1 ? "" : "s"} remaining
        </p>
      )}
      {isAtLimit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-destructive">
            You've reached your monthly limit
          </p>
          <Link href="/pricing">
            <Button size="sm" variant="outline" data-testid="button-upgrade-quota">
              Upgrade
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
