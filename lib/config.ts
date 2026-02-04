// Configuración centralizada del asesor

export interface AdvisorConfig {
  STABLECOINS_WHITELIST: string[];
  APR_SWITCH_THRESHOLD: number;   // puntos porcentuales (pp)
  MAX_DUAL_PERCENT: number;       // 0..1
  DEFAULT_DURATION_DAYS: number;
  VOLATILITY_GUARD_24H: number;   // %
}

export const DEFAULT_CONFIG: AdvisorConfig = {
  STABLECOINS_WHITELIST: ["USDT", "FDUSD", "USDC"],
  APR_SWITCH_THRESHOLD: 0.5,
  MAX_DUAL_PERCENT: 0.30,
  DEFAULT_DURATION_DAYS: 7,
  VOLATILITY_GUARD_24H: 5
};

export function getConfig(): AdvisorConfig {
  return DEFAULT_CONFIG;
}

export function getConfigFromEnv(): AdvisorConfig {
  return {
    STABLECOINS_WHITELIST: process.env.STABLECOINS_WHITELIST 
      ? process.env.STABLECOINS_WHITELIST.split(",").map(s => s.trim())
      : DEFAULT_CONFIG.STABLECOINS_WHITELIST,
    APR_SWITCH_THRESHOLD: Number(process.env.APR_SWITCH_THRESHOLD) || DEFAULT_CONFIG.APR_SWITCH_THRESHOLD,
    MAX_DUAL_PERCENT: Number(process.env.MAX_DUAL_PERCENT) || DEFAULT_CONFIG.MAX_DUAL_PERCENT,
    DEFAULT_DURATION_DAYS: Number(process.env.DEFAULT_DURATION_DAYS) || DEFAULT_CONFIG.DEFAULT_DURATION_DAYS,
    VOLATILITY_GUARD_24H: Number(process.env.VOLATILITY_GUARD_24H) || DEFAULT_CONFIG.VOLATILITY_GUARD_24H
  };
}
