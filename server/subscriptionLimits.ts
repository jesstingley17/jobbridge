// Subscription tier limits and feature access configuration

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface TierLimits {
  monthlyApplications: number; // -1 for unlimited
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
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    monthlyApplications: 5,
    aiResumeBuilder: false,
    aiResumeParsing: false,
    aiInterviewPrep: false,
    aiJobRecommendations: false,
    aiCoverLetter: false,
    aiSkillsGap: false,
    aiChatAssistant: false,
    aiApplicationTips: false,
    bulkApply: false,
    prioritySupport: false,
    analyticsAccess: false,
    apiAccess: false,
    teamFeatures: false,
  },
  pro: {
    monthlyApplications: -1, // unlimited
    aiResumeBuilder: true,
    aiResumeParsing: true,
    aiInterviewPrep: true,
    aiJobRecommendations: true,
    aiCoverLetter: true,
    aiSkillsGap: true,
    aiChatAssistant: true,
    aiApplicationTips: true,
    bulkApply: true,
    prioritySupport: true,
    analyticsAccess: false,
    apiAccess: false,
    teamFeatures: false,
  },
  enterprise: {
    monthlyApplications: -1, // unlimited
    aiResumeBuilder: true,
    aiResumeParsing: true,
    aiInterviewPrep: true,
    aiJobRecommendations: true,
    aiCoverLetter: true,
    aiSkillsGap: true,
    aiChatAssistant: true,
    aiApplicationTips: true,
    bulkApply: true,
    prioritySupport: true,
    analyticsAccess: true,
    apiAccess: true,
    teamFeatures: true,
  },
};

export function getTierLimits(tier: string | null | undefined): TierLimits {
  const validTier = (tier as SubscriptionTier) || 'free';
  return TIER_LIMITS[validTier] || TIER_LIMITS.free;
}

export function hasFeatureAccess(tier: string | null | undefined, feature: keyof TierLimits): boolean {
  const limits = getTierLimits(tier);
  const value = limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return false;
}

export function getMonthlyApplicationLimit(tier: string | null | undefined): number {
  return getTierLimits(tier).monthlyApplications;
}

export function isUnlimited(tier: string | null | undefined): boolean {
  return getMonthlyApplicationLimit(tier) === -1;
}

// Feature descriptions for upgrade prompts
export const FEATURE_DESCRIPTIONS: Record<keyof TierLimits, { name: string; description: string; requiredTier: SubscriptionTier }> = {
  monthlyApplications: {
    name: 'Unlimited Applications',
    description: 'Apply to as many jobs as you want without monthly limits',
    requiredTier: 'pro',
  },
  aiResumeBuilder: {
    name: 'AI Resume Builder',
    description: 'Create professional, ATS-optimized resumes with AI assistance',
    requiredTier: 'pro',
  },
  aiResumeParsing: {
    name: 'AI Resume Parsing',
    description: 'Automatically extract and organize information from your existing resume',
    requiredTier: 'pro',
  },
  aiInterviewPrep: {
    name: 'AI Interview Prep',
    description: 'Practice interviews with AI-generated questions and feedback',
    requiredTier: 'pro',
  },
  aiJobRecommendations: {
    name: 'AI Job Recommendations',
    description: 'Get personalized job suggestions based on your skills and experience',
    requiredTier: 'pro',
  },
  aiCoverLetter: {
    name: 'AI Cover Letter Generator',
    description: 'Generate tailored cover letters for each job application',
    requiredTier: 'pro',
  },
  aiSkillsGap: {
    name: 'Skills Gap Analysis',
    description: 'Identify missing skills and get learning recommendations',
    requiredTier: 'pro',
  },
  aiChatAssistant: {
    name: 'AI Career Assistant',
    description: 'Get personalized career guidance from our AI assistant',
    requiredTier: 'pro',
  },
  aiApplicationTips: {
    name: 'AI Application Tips',
    description: 'Receive customized tips for each job application',
    requiredTier: 'pro',
  },
  bulkApply: {
    name: 'Bulk Apply',
    description: 'Apply to multiple jobs at once with a single click',
    requiredTier: 'pro',
  },
  prioritySupport: {
    name: 'Priority Support',
    description: 'Get faster response times from our support team',
    requiredTier: 'pro',
  },
  analyticsAccess: {
    name: 'Advanced Analytics',
    description: 'Access detailed analytics about your job search progress',
    requiredTier: 'enterprise',
  },
  apiAccess: {
    name: 'API Access',
    description: 'Integrate with external tools using our API',
    requiredTier: 'enterprise',
  },
  teamFeatures: {
    name: 'Team Collaboration',
    description: 'Collaborate with your team on job search activities',
    requiredTier: 'enterprise',
  },
};
