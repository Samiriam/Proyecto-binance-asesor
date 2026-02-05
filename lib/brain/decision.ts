import { AdvisorOutput, Recommendation } from "./types";
import { n, arr, readApr } from "../binance/normalize";

type Cfg = {
  STABLECOINS_WHITELIST: string[];
  APR_SWITCH_THRESHOLD: number;   // puntos porcentuales (pp)
  MAX_DUAL_PERCENT: number;       // 0..1
  DEFAULT_DURATION_DAYS: number;
  VOLATILITY_GUARD_24H: number;   // %
};

export function decide(cfg: Cfg, inputs: {
  account: any;
  ticker24h: any[];
  flexible: any;
  locked: any;
  dual: any;
}): AdvisorOutput {
  const stable = new Set(cfg.STABLECOINS_WHITELIST);

  // balances
  const balances = arr(inputs.account?.balances);
  const spot = new Map<string, { free: number; locked: number; total: number }>();
  for (const b of balances) {
    const asset = b.asset;
    if (!asset) continue;
    const free = n(b.free);
    const lockedAmt = n(b.locked);
    spot.set(asset, { free, locked: lockedAmt, total: free + lockedAmt });
  }

  // ticker map for volatility
  const tmap = new Map<string, { change: number; last: number }>();
  for (const t of arr(inputs.ticker24h)) {
    if (!t.symbol) continue;
    tmap.set(t.symbol, { change: n(t.priceChangePercent), last: n(t.lastPrice) });
  }

  const vol24 = (asset: string) => {
    if (stable.has(asset)) return 0;
    return n(tmap.get(`${asset}USDT`)?.change, 0);
  };

  // flexible normalize
  const flexItems = arr(inputs.flexible?.rows ?? inputs.flexible?.data ?? inputs.flexible);
  const flex = flexItems.map((it: any) => ({
    asset: it.asset || it.productAsset || it.currency,
    apr: readApr(it),
    purchasable: it.canPurchase ?? it.purchasable ?? true,
    min: n(it.minPurchaseAmount ?? it.minAmount ?? it.minPurchase, 0),
    quota: it.leftQuota ?? it.leftCapacity ?? it.leftAvailable ?? null
  })).filter((x: any) => x.asset && x.purchasable);

  const topStableFlex = flex.filter((x: any) => stable.has(x.asset))
    .sort((a: any, b: any) => b.apr - a.apr).slice(0, 3)
    .map((x: any) => ({ asset: x.asset, apr: x.apr, min: x.min, quota: x.quota, reason: "Stablecoin con APR competitivo" }));

  const bestStable = topStableFlex[0];

  // focus asset: mayor saldo dentro de whitelist; si no, mayor saldo total
  let focusAsset = "";
  let focusTotal = 0;
  for (const a of cfg.STABLECOINS_WHITELIST) {
    const v = spot.get(a);
    if (v?.total && v.total > focusTotal) { focusAsset = a; focusTotal = v.total; }
  }
  if (!focusAsset) {
    for (const [a, v] of spot.entries()) {
      if (v.total > focusTotal) { focusAsset = a; focusTotal = v.total; }
    }
  }

  const currentApr = focusAsset ? (flex.find((x: any) => x.asset === focusAsset)?.apr ?? 0) : 0;

  let recommendation: Recommendation = {
    type: "NO_ACTION",
    asset: focusAsset,
    amount_suggested: 0,
    duration_days: cfg.DEFAULT_DURATION_DAYS,
    reason: "Datos insuficientes o no hay ventaja clara"
  };
  let blockedByVolatility = false;

  if (focusAsset && focusTotal > 0 && bestStable) {
    const delta = bestStable.apr - currentApr;

    // guardia volatilidad para activos no stable
    const v = vol24(focusAsset);
    if (!stable.has(focusAsset) && Math.abs(v) >= cfg.VOLATILITY_GUARD_24H) {
      blockedByVolatility = true;
      recommendation = {
        type: "NO_ACTION",
        asset: focusAsset,
        amount_suggested: 0,
        duration_days: 1,
        reason: `Volatilidad 24h alta (${v.toFixed(2)}%). Reevaluar.`
      };
    } else if (focusAsset === bestStable.asset || delta < cfg.APR_SWITCH_THRESHOLD) {
      recommendation = {
        type: "FLEXIBLE_STAY",
        asset: focusAsset,
        amount_suggested: focusTotal,
        duration_days: cfg.DEFAULT_DURATION_DAYS,
        reason: focusAsset === bestStable.asset
          ? `Ya estás en la mejor stablecoin (APR ${currentApr}%).`
          : `Mejora APR insuficiente (+${delta.toFixed(2)}pp).`
      };
    } else {
      recommendation = {
        type: "FLEXIBLE_SWITCH",
        asset: bestStable.asset,
        amount_suggested: focusTotal,
        duration_days: cfg.DEFAULT_DURATION_DAYS,
        reason: `Switch ${focusAsset} → ${bestStable.asset}. APR +${delta.toFixed(2)}pp (de ${currentApr}% a ${bestStable.apr}%).`
      };
    }
  }

  // dual normalize (catálogo)
  const dualItems = arr(inputs.dual?.rows ?? inputs.dual?.data ?? inputs.dual);
  const dual = dualItems.map((it: any) => ({
    base: it.baseAsset || it.base || it.depositAsset || it.asset,
    quote: it.quoteAsset || it.quote,
    apy: n(it.apy ?? it.apr ?? it.annualPercentageRate ?? it.latestAnnualPercentageRate, 0),
    strike: n(it.strikePrice ?? it.strike, 0),
    settle: it.settleAsset || it.deliveryAsset || it.quoteAsset || it.baseAsset,
    duration: n(it.duration ?? it.durationDays ?? it.period, 0),
  })).filter((x: any) => x.base && x.apy > 0);

  const bestFlexibleApr = bestStable?.apr ?? 0;
  const bestDual = dual.filter((d: any) => stable.has(d.base)).sort((a: any, b: any) => b.apy - a.apy)[0];

  const topDual = dual.sort((a: any, b: any) => b.apy - a.apy).slice(0, 3).map((d: any) => ({
    base: d.base,
    quote: d.quote,
    apy: d.apy,
    strike: d.strike,
    worst_case: `Podrías liquidar en ${d.settle} al strike ${d.strike || "N/A"} (riesgo conversión).`,
    reason: "Retorno potencial mayor con riesgo de conversión"
  }));

  // regla dual: solo si diferencial >= 3pp y sugerir % pequeño
  if (!blockedByVolatility && bestDual && (bestDual.apy - bestFlexibleApr) >= 3) {
    const baseBal = spot.get(bestDual.base)?.total ?? 0;
    const amt = Math.max(0, baseBal * cfg.MAX_DUAL_PERCENT);
    if (amt > 0) {
      recommendation = {
        type: "DUAL_SUGGEST",
        asset: bestDual.base,
        amount_suggested: amt,
        duration_days: bestDual.duration || cfg.DEFAULT_DURATION_DAYS,
        reason: `Dual sugerido: APY ${bestDual.apy}% vs Flexible ~${bestFlexibleApr}%. Worst-case: conversión por strike.`
      };
    }
  }

  return {
    generated_at: new Date().toISOString(),
    portfolio_summary: {
      focus_asset: focusAsset,
      focus_total: focusTotal,
      focus_flexible_apr: currentApr
    },
    topFlexible: topStableFlex,
    topDual,
    recommendation
  };
}
