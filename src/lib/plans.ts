export type Plan = 'free' | 'pro' | 'premium';

export const PLAN_LIMITS = {
  free: {
    resumes: 1,
    aiCredits: 5,
    atsAnalysis: false,
    premiumTemplates: false,
    versioning: false,
  },
  pro: {
    resumes: 10,
    aiCredits: 100,
    atsAnalysis: true,
    premiumTemplates: true,
    versioning: true,
  },
  premium: {
    resumes: -1, // Unlimited
    aiCredits: -1, // Unlimited
    atsAnalysis: true,
    premiumTemplates: true,
    versioning: true,
    prioritySupport: true,
  }
};

export function hasFeature(plan: Plan, feature: keyof typeof PLAN_LIMITS['free']) {
  return PLAN_LIMITS[plan][feature] === true || (typeof PLAN_LIMITS[plan][feature] === 'number' && PLAN_LIMITS[plan][feature] !== 0);
}

export function getLimit(plan: Plan, feature: 'resumes' | 'aiCredits') {
  return PLAN_LIMITS[plan][feature];
}
