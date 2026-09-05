export type PlanId = "free" | "lite" | "pro" | "lifetime";

export type PlanFeature = { label: string; included: boolean };

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number | null;
  oneOff?: number;
  highlight?: boolean;
  features: PlanFeature[];
};

/** Max active pantry items allowed per plan (Infinity = unlimited) */
export const ITEM_LIMITS: Record<PlanId, number> = {
  free: 20,
  lite: Infinity,
  pro: Infinity,
  lifetime: Infinity,
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Track the basics and build the habit.",
    monthly: 0,
    yearly: 0,
    features: [
      { label: "Up to 20 active pantry items", included: true },
      { label: "Expiry tracking & in-app alerts", included: true },
      { label: "Weekly challenges & badges", included: true },
      { label: "Community Impact overview", included: true },
      { label: "Analytics charts", included: false },
      { label: "Email expiry reminders", included: false },
      { label: "Community trends, top contributors & common items", included: false },
      { label: "AI assistant, recipes & insights", included: false },
      { label: "Friends & leaderboards", included: false },
    ],
  },
  {
    id: "lite",
    name: "Lite",
    tagline: "Unlimited pantry with the full picture.",
    monthly: 2.99,
    yearly: 29,
    features: [
      { label: "Unlimited pantry items", included: true },
      { label: "Analytics charts & history", included: true },
      { label: "Email expiry reminders", included: true },
      { label: "Weekly challenges & badges", included: true },
      { label: "Community trends, top contributors & common items", included: true },
      { label: "AI assistant, recipes & insights", included: false },
      { label: "Friends & leaderboards", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Every AI superpower in the kitchen.",
    monthly: 6.99,
    yearly: 59,
    highlight: true,
    features: [
      { label: "Everything in Lite", included: true },
      { label: "AI Pantry Assistant chat", included: true },
      { label: "AI recipe generator", included: true },
      { label: "Predictive waste insights", included: true },
      { label: "Unlimited OCR & barcode scans", included: true },
      { label: "Friends & leaderboards", included: true },
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    tagline: "Pay once. Pro forever, no renewals.",
    monthly: 0,
    yearly: null,
    oneOff: 149,
    features: [
      { label: "Everything in Pro, permanently", included: true },
      { label: "One single payment", included: true },
      { label: "All future features included", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

const RANK: Record<PlanId, number> = { free: 0, lite: 1, pro: 2, lifetime: 3 };

export function planAtLeast(plan: PlanId, min: PlanId) {
  return RANK[plan] >= RANK[min];
}

export function planName(plan: PlanId) {
  return PLANS.find((p) => p.id === plan)?.name ?? "Free";
}
