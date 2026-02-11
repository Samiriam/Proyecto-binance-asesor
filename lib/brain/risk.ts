import { n, arr } from "../binance/normalize";

export interface RiskMetrics {
    total_value_usd: number;
    stablecoin_pct: number;
    volatile_pct: number;
    risk_score: number;          // 0-100 (0 = safest)
    diversification_score: number; // 0-100 (100 = best)
    top_holdings: Array<{
        asset: string;
        amount: number;
        value_usd: number;
        percent: number;
        is_stable: boolean;
    }>;
    warnings: string[];
    grade: "A" | "B" | "C" | "D" | "F";
}

const STABLECOINS = new Set(["USDT", "USDC", "FDUSD", "BUSD", "DAI", "TUSD"]);

/**
 * Calculate portfolio risk metrics from balances and ticker data.
 */
export function calculatePortfolioRisk(
    balances: any[],
    tickers: any[],
    stablecoinsWhitelist?: string[]
): RiskMetrics {
    const stables = stablecoinsWhitelist
        ? new Set(stablecoinsWhitelist)
        : STABLECOINS;

    // Build price map
    const priceMap = new Map<string, number>();
    for (const t of arr(tickers)) {
        if (!t.symbol) continue;
        priceMap.set(t.symbol, n(t.lastPrice, 0));
    }

    // Calculate holdings with USD values
    const holdings: Array<{
        asset: string;
        amount: number;
        value_usd: number;
        percent: number;
        is_stable: boolean;
        volatility: number;
    }> = [];

    let totalUsd = 0;

    for (const b of arr(balances)) {
        const asset = b.asset;
        if (!asset) continue;

        const amount = n(b.free, 0) + n(b.locked, 0);
        if (amount <= 0) continue;

        let valueUsd = 0;

        if (stables.has(asset)) {
            valueUsd = amount; // 1:1 for stablecoins
        } else {
            const price = priceMap.get(`${asset}USDT`) || priceMap.get(`${asset}BUSD`) || 0;
            valueUsd = amount * price;
        }

        if (valueUsd < 0.01) continue; // Skip dust

        // Get 24h volatility
        const ticker = tickers.find((t: any) => t.symbol === `${asset}USDT`);
        const volatility = ticker ? Math.abs(n(ticker.priceChangePercent, 0)) : 0;

        holdings.push({
            asset,
            amount,
            value_usd: valueUsd,
            percent: 0, // calculate after total
            is_stable: stables.has(asset),
            volatility,
        });

        totalUsd += valueUsd;
    }

    // Calculate percentages
    for (const h of holdings) {
        h.percent = totalUsd > 0 ? (h.value_usd / totalUsd) * 100 : 0;
    }

    // Sort by value
    holdings.sort((a, b) => b.value_usd - a.value_usd);

    // Metrics
    const stablePct = holdings
        .filter((h) => h.is_stable)
        .reduce((sum, h) => sum + h.percent, 0);
    const volatilePct = 100 - stablePct;

    // Diversification Score (HHI-based: Herfindahl-Hirschman Index)
    // Low HHI = more diversified
    const hhi = holdings.reduce((sum, h) => sum + Math.pow(h.percent / 100, 2), 0);
    const numAssets = holdings.length;
    // Normalize: 1 asset = 0 diversification, many = higher
    // Perfect diversification with N assets: HHI = 1/N
    const maxHhi = 1; // single asset
    const minHhi = numAssets > 0 ? 1 / numAssets : 1;
    const diversificationScore = numAssets <= 1
        ? 0
        : Math.max(0, Math.min(100, ((maxHhi - hhi) / (maxHhi - minHhi)) * 100));

    // Risk Score (0-100, higher = riskier)
    // Factors: volatile %, concentration (HHI), avg volatility of volatile assets
    const avgVolatility = holdings
        .filter((h) => !h.is_stable)
        .reduce((sum, h) => sum + h.volatility, 0) / Math.max(1, holdings.filter(h => !h.is_stable).length);

    const riskScore = Math.min(100, Math.max(0,
        (volatilePct * 0.4) +          // 40% weight: volatile allocation
        (hhi * 100 * 0.3) +            // 30% weight: concentration
        (avgVolatility * 3)             // 30% weight: actual volatility
    ));

    // Warnings
    const warnings: string[] = [];
    if (volatilePct > 80) warnings.push("⚠️ Más del 80% en activos volátiles — Alto riesgo");
    if (holdings.length === 1) warnings.push("⚠️ Portafolio concentrado en un solo activo");
    if (holdings[0]?.percent > 70) warnings.push(`⚠️ ${holdings[0].asset} representa más del 70% del portafolio`);
    if (avgVolatility > 10) warnings.push("⚠️ Volatilidad promedio alta (>10%) en activos crypto");
    if (totalUsd < 10) warnings.push("ℹ️ Balance muy bajo para análisis significativo");

    // Grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (riskScore <= 20) grade = "A";
    else if (riskScore <= 40) grade = "B";
    else if (riskScore <= 60) grade = "C";
    else if (riskScore <= 80) grade = "D";
    else grade = "F";

    return {
        total_value_usd: totalUsd,
        stablecoin_pct: stablePct,
        volatile_pct: volatilePct,
        risk_score: parseFloat(riskScore.toFixed(1)),
        diversification_score: parseFloat(diversificationScore.toFixed(1)),
        top_holdings: holdings.slice(0, 10).map(h => ({
            asset: h.asset,
            amount: h.amount,
            value_usd: parseFloat(h.value_usd.toFixed(2)),
            percent: parseFloat(h.percent.toFixed(2)),
            is_stable: h.is_stable,
        })),
        warnings,
        grade,
    };
}
