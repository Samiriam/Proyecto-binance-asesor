import * as tf from '@tensorflow/tfjs';
import { getKlines, Kline } from '../binance/market';
import { calculateRSI, calculateSMA, calculateVolatility } from './indicators';

export interface Prediction {
    asset: string;
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    confidence: number;
    predictedChangePercent: number;
    price: number;
    volatility: number;
}

export interface YieldAnalysis {
    asset: string;
    nominalApr: number;
    realYield: number; // APR - Devaluation
    riskScore: number; // 0 (Safe) - 100 (Risky)
    isTrap: boolean;
    reason: string;
}

export class MarketPredictor {

    // Simple linear regression to detect trend slope
    // Returns slope (positive = up, negative = down)
    async predictTrend(symbol: string): Promise<Prediction> {
        // Fetch last 50 days
        const klines = await getKlines(symbol, '1d', 50);
        if (klines.length < 30) {
            return { asset: symbol, direction: 'NEUTRAL', confidence: 0, predictedChangePercent: 0, price: 0, volatility: 0 };
        }

        const closes = klines.map(k => k.close);
        const lastPrice = closes[closes.length - 1];

        // Indicators
        const rsi = calculateRSI(closes, 14);
        const lastRsi = rsi[rsi.length - 1] || 50;
        const volatility = calculateVolatility(closes); // standard deviation of % changes

        // Simple Trend Logic (Linear Regression on last 14 days)
        const recentCloses = closes.slice(-14);
        const xs = tf.tensor1d(recentCloses.map((_, i) => i));
        const ys = tf.tensor1d(recentCloses);

        // Calculate slope m and intercept b: y = mx + b
        // formula: m = (n*sum(xy) - sum(x)*sum(y)) / (n*sum(x^2) - sum(x)^2)
        // Using TFJS logic or simple JS math for speed
        const n = recentCloses.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = recentCloses.reduce((a, b) => a + b, 0);
        const sumXY = recentCloses.reduce((a, b, i) => a + (i * b), 0);
        const sumXX = recentCloses.reduce((a, b, i) => a + (i * i), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const averagePrice = sumY / n;
        const slopePercent = slope / averagePrice; // Normalized slope

        // Prediction
        let direction: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
        let confidence = 0.5;

        // Rule-based + Regression
        if (slopePercent > 0.005) { // Rising > 0.5% per day trend
            direction = 'UP';
            confidence = 0.7;
        } else if (slopePercent < -0.005) {
            direction = 'DOWN';
            confidence = 0.7;
        }

        // RSI adjustments
        if (lastRsi > 70 && direction === 'UP') {
            confidence -= 0.2; // Overbought, might reverse
        } else if (lastRsi < 30 && direction === 'DOWN') {
            confidence -= 0.2; // Oversold, might reverse
        }

        // Volatility Penalty on confidence
        if (volatility > 0.05) { // High volatility
            confidence -= 0.1;
        }

        return {
            asset: symbol,
            direction,
            confidence: Math.max(0, Math.min(1, confidence)),
            predictedChangePercent: slopePercent * 100 * 7, // projected 7-day change
            price: lastPrice,
            volatility
        };
    }

    async analyzeSmartYield(asset: string, nominalApr: number, isStable: boolean): Promise<YieldAnalysis> {
        let symbol = asset;

        // If stablecoin, compare against USDT if it's not USDT (e.g. FDUSD)
        // But usually we want to see if the stablecoin ITSELF is de-pegging.
        // For crypto (e.g. BTC), we analyze BTCUSDT.
        if (asset === 'USDT' || asset === 'USDC' || asset === 'FDUSD' || asset === 'DAI') {
            symbol = `${asset}USDT`;
            // USDTUSDT doesn't exist. USDT is the baseline. 
            // If asset is USDT, we check comparison against USDC or others? 
            // Actually, for USDT, we assume Price = $1, Volatility ~ 0 unless severe event.
            if (asset === 'USDT') {
                return {
                    asset,
                    nominalApr,
                    realYield: nominalApr,
                    riskScore: 5, // Low risk
                    isTrap: false,
                    reason: "Base Stablecoin."
                };
            }
        } else {
            symbol = `${asset}USDT`;
        }

        // Check if symbol exists (try-catch implicit in getKlines or handle empty)
        let prediction: Prediction;
        try {
            prediction = await this.predictTrend(symbol);
        } catch (e) {
            // If pair doesn't exist (e.g. USDTUSDT), assume stable
            return {
                asset,
                nominalApr,
                realYield: nominalApr,
                riskScore: 10,
                isTrap: false,
                reason: "Sin datos de mercado suficientes."
            };
        }

        // Annualized predicted price change
        // predictedChangePercent is 7-day. Annualize it roughly: * 52
        const annualizedPriceChange = prediction.predictedChangePercent * 52;
        const realYield = nominalApr + annualizedPriceChange;

        // Risk Score Calculation
        let riskScore = prediction.volatility * 1000; // Volatility 0.01 (1%) -> Score 10
        if (prediction.direction === 'DOWN') riskScore += 50;

        // Trap Detection
        // If APR is high (>20%) but Real Yield is negative
        const isTrap = nominalApr > 15 && realYield < 0;

        let reason = `Real Yield: ${realYield.toFixed(2)}% (APR ${nominalApr}% + Price ${annualizedPriceChange.toFixed(2)}%).`;
        if (isTrap) reason = "⚠️ TRAMPA DE YIELD: La devaluación proyectada supera al interés ganado.";
        else if (isStable && Math.abs(prediction.predictedChangePercent) > 1) reason += " ⚠️ Alerta Des-peg (Volatilidad alta para Stablecoin).";

        return {
            asset,
            nominalApr,
            realYield,
            riskScore: Math.min(100, riskScore),
            isTrap,
            reason
        };
    }

    async analyzeGridBotSuitability(asset: string): Promise<{ suitable: boolean; confidence: number; reason: string }> {
        const symbol = `${asset}USDT`;
        let prediction: Prediction;
        try {
            prediction = await this.predictTrend(symbol);
        } catch (e) {
            return { suitable: false, confidence: 0, reason: "Sin datos." };
        }

        // Grid Bot logic:
        // 1. Trend is Neutral (Sideways)
        // 2. High Volatility (enough price swings to make profit)

        const isNeutral = prediction.direction === 'NEUTRAL';
        const hasVolatility = prediction.volatility > 0.02 && prediction.volatility < 0.15; // 2% to 15% range

        // If trend is slightly UP but volatile, also okay for Long Grid
        // But for neutral grid, we want sideways.

        if (isNeutral && hasVolatility) {
            return {
                suitable: true,
                confidence: 0.8,
                reason: `Mercado Lateral con Volatilidad (${(prediction.volatility * 100).toFixed(1)}%). Ideal para Spot Grid Bot.`
            };
        }

        if (prediction.volatility <= 0.02) {
            return { suitable: false, confidence: 0, reason: "Baja volatilidad para Bot." };
        }

        if (!isNeutral) {
            return { suitable: false, confidence: 0, reason: `Tendencia definida (${prediction.direction}). Riesgo de salir del rango.` };
        }

        return { suitable: false, confidence: 0, reason: "No cumple criterios." };
    }
}
