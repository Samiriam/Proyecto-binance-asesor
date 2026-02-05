import { getSupabase } from "./db/supabase";

export interface AdvisorConfig {
  STABLECOINS_WHITELIST: string[];
  APR_SWITCH_THRESHOLD: number;
  MAX_DUAL_PERCENT: number; // 0..1
  DEFAULT_DURATION_DAYS: number;
  VOLATILITY_GUARD_24H: number;
}

export const DEFAULT_CONFIG: AdvisorConfig = {
  STABLECOINS_WHITELIST: ["USDT", "FDUSD", "USDC"],
  APR_SWITCH_THRESHOLD: 0.5,
  MAX_DUAL_PERCENT: 0.3,
  DEFAULT_DURATION_DAYS: 7,
  VOLATILITY_GUARD_24H: 5
};

const CONFIG_TABLE = "advisor_config";
const CONFIG_ID = 1;

export function normalizeConfig(input: Partial<AdvisorConfig>): AdvisorConfig {
  const stable = Array.isArray(input.STABLECOINS_WHITELIST)
    ? input.STABLECOINS_WHITELIST
        .map((s) => String(s).trim().toUpperCase())
        .filter(Boolean)
    : DEFAULT_CONFIG.STABLECOINS_WHITELIST;

  const apr = Number(input.APR_SWITCH_THRESHOLD);
  let maxDual = Number(input.MAX_DUAL_PERCENT);
  const duration = Number(input.DEFAULT_DURATION_DAYS);
  const vol = Number(input.VOLATILITY_GUARD_24H);

  if (!Number.isFinite(maxDual)) {
    maxDual = DEFAULT_CONFIG.MAX_DUAL_PERCENT;
  } else if (maxDual > 1) {
    maxDual = maxDual / 100;
  }

  return {
    STABLECOINS_WHITELIST: stable.length > 0 ? stable : DEFAULT_CONFIG.STABLECOINS_WHITELIST,
    APR_SWITCH_THRESHOLD: Number.isFinite(apr) ? apr : DEFAULT_CONFIG.APR_SWITCH_THRESHOLD,
    MAX_DUAL_PERCENT: Math.min(1, Math.max(0, maxDual)),
    DEFAULT_DURATION_DAYS: Number.isFinite(duration) ? duration : DEFAULT_CONFIG.DEFAULT_DURATION_DAYS,
    VOLATILITY_GUARD_24H: Number.isFinite(vol) ? vol : DEFAULT_CONFIG.VOLATILITY_GUARD_24H
  };
}

export function getConfigFromEnv(): AdvisorConfig {
  return normalizeConfig({
    STABLECOINS_WHITELIST: process.env.STABLECOINS_WHITELIST
      ? process.env.STABLECOINS_WHITELIST.split(",").map((s) => s.trim())
      : undefined,
    APR_SWITCH_THRESHOLD: Number(process.env.APR_SWITCH_THRESHOLD),
    MAX_DUAL_PERCENT: Number(process.env.MAX_DUAL_PERCENT),
    DEFAULT_DURATION_DAYS: Number(process.env.DEFAULT_DURATION_DAYS),
    VOLATILITY_GUARD_24H: Number(process.env.VOLATILITY_GUARD_24H)
  });
}

async function getConfigFromDb(): Promise<Partial<AdvisorConfig> | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from(CONFIG_TABLE)
    .select("data")
    .eq("id", CONFIG_ID)
    .maybeSingle();

  if (error || !data?.data) {
    return null;
  }

  return data.data as Partial<AdvisorConfig>;
}

export async function getConfig(): Promise<AdvisorConfig> {
  const envConfig = getConfigFromEnv();
  const dbConfig = await getConfigFromDb();
  if (!dbConfig) return envConfig;

  return normalizeConfig({ ...envConfig, ...dbConfig });
}

export async function saveConfig(config: AdvisorConfig): Promise<void> {
  const client = getSupabase();
  if (!client) {
    throw new Error("Supabase not configured");
  }

  const normalized = normalizeConfig(config);
  const { error } = await client.from(CONFIG_TABLE).upsert({
    id: CONFIG_ID,
    data: normalized,
    updated_at: new Date().toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }
}
