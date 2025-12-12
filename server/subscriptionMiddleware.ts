import { Response, NextFunction } from 'express';
import { storage } from './storage.js';
import { getTierLimits, hasFeatureAccess, FEATURE_DESCRIPTIONS, TierLimits } from './subscriptionLimits.js';
import { db } from "./db.js";
import { users } from '../shared/schema.js';
import { eq } from "drizzle-orm";

export function requireFeature(feature: keyof TierLimits) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tier = user.subscriptionTier || 'free';
      
      if (!hasFeatureAccess(tier, feature)) {
        const featureInfo = FEATURE_DESCRIPTIONS[feature];
        return res.status(403).json({
          error: 'Feature not available',
          code: 'SUBSCRIPTION_REQUIRED',
          feature: featureInfo.name,
          description: featureInfo.description,
          requiredTier: featureInfo.requiredTier,
          currentTier: tier,
          message: `Upgrade to ${featureInfo.requiredTier.charAt(0).toUpperCase() + featureInfo.requiredTier.slice(1)} to access ${featureInfo.name}`,
        });
      }

      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({ error: 'Failed to check subscription access' });
    }
  };
}

export async function checkApplicationLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  resetDate: Date | null;
}> {
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const tier = user.subscriptionTier || 'free';
  const limits = getTierLimits(tier);
  
  if (limits.monthlyApplications === -1) {
    return { allowed: true, remaining: -1, limit: -1, resetDate: null };
  }

  const now = new Date();
  let resetDate = user.applicationCountResetDate ? new Date(user.applicationCountResetDate) : now;
  let currentCount = user.monthlyApplicationCount || 0;

  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    await db.update(users)
      .set({
        monthlyApplicationCount: 0,
        applicationCountResetDate: now,
      })
      .where(eq(users.id, userId));
    currentCount = 0;
    resetDate = now;
  }

  const remaining = Math.max(0, limits.monthlyApplications - currentCount);
  
  return {
    allowed: currentCount < limits.monthlyApplications,
    remaining,
    limit: limits.monthlyApplications,
    resetDate,
  };
}

export async function incrementApplicationCount(userId: string): Promise<void> {
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const resetDate = user.applicationCountResetDate ? new Date(user.applicationCountResetDate) : now;
  
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    await db.update(users)
      .set({
        monthlyApplicationCount: 1,
        applicationCountResetDate: now,
      })
      .where(eq(users.id, userId));
  } else {
    await db.update(users)
      .set({
        monthlyApplicationCount: (user.monthlyApplicationCount || 0) + 1,
      })
      .where(eq(users.id, userId));
  }
}

export function requireApplicationQuota() {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const quotaStatus = await checkApplicationLimit(userId);
      
      if (!quotaStatus.allowed) {
        return res.status(403).json({
          error: 'Monthly application limit reached',
          code: 'APPLICATION_LIMIT_REACHED',
          limit: quotaStatus.limit,
          remaining: 0,
          resetDate: quotaStatus.resetDate,
          message: `You've used all ${quotaStatus.limit} applications this month. Upgrade to Pro for unlimited applications.`,
          requiredTier: 'pro',
        });
      }

      (req as any).applicationQuota = quotaStatus;
      next();
    } catch (error) {
      console.error('Error checking application quota:', error);
      res.status(500).json({ error: 'Failed to check application quota' });
    }
  };
}

export async function getUserSubscriptionStatus(userId: string) {
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const tier = user.subscriptionTier || 'free';
  const limits = getTierLimits(tier);
  const quotaStatus = await checkApplicationLimit(userId);

  return {
    tier,
    limits,
    applicationQuota: {
      used: (user.monthlyApplicationCount || 0),
      remaining: quotaStatus.remaining,
      limit: quotaStatus.limit,
      resetDate: quotaStatus.resetDate,
    },
  };
}
