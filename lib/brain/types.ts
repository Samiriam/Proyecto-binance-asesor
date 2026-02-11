export type RecommendationType =
  | "FLEXIBLE_STAY"
  | "FLEXIBLE_SWITCH"
  | "LOCKED_SUGGEST"
  | "DUAL_SUGGEST"
  | "NO_ACTION";

export type Recommendation = {
  type: RecommendationType;
  asset: string;
  amount_suggested: number;
  duration_days: number;
  reason: string;
};

export type AdvisorOutput = {
  generated_at: string;
  portfolio_summary: {
    focus_asset: string;
    focus_total: number;
    focus_flexible_apr: number;
  };
  topFlexible: Array<{ asset: string; apr: number; reason: string; min?: number; quota?: any }>;
  topLocked: Array<{ asset: string; apr: number; duration?: number; reason: string; min?: number; quota?: any }>;
  topDual: Array<{ base: string; quote?: string; apy: number; strike?: number; worst_case: string; reason: string }>;
  recommendation: Recommendation;
  ai_analysis?: {
    prediction: {
      direction: 'UP' | 'DOWN' | 'NEUTRAL';
      confidence: number;
      predictedChangePercent: number;
    };
    smartYield: {
      realYield: number;
      riskScore: number;
      isTrap: boolean;
      reason: string;
    };
  };
};

export type FlexibleItem = {
  asset: string;
  apr: number;
  purchasable: boolean;
  min: number;
  quota: any;
};

export type DualItem = {
  base: string;
  quote?: string;
  apy: number;
  strike: number;
  settle: string;
  duration: number;
};

export type Balance = {
  asset: string;
  free: number;
  locked: number;
  total: number;
};

export type Ticker24h = {
  symbol: string;
  change: number;
  last: number;
};
