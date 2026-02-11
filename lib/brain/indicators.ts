import { RSI, SMA, BollingerBands } from 'technicalindicators';

export function calculateRSI(values: number[], period: number = 14): number[] {
    // RSI requires at least period + 1 values
    if (values.length <= period) return [];
    return RSI.calculate({ values, period });
}

export function calculateSMA(values: number[], period: number = 14): number[] {
    if (values.length < period) return [];
    return SMA.calculate({ values, period });
}

export function calculateBollinger(values: number[], period: number = 20, stdDev: number = 2) {
    if (values.length < period) return [];
    return BollingerBands.calculate({ values, period, stdDev });
}

export function calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    // Calculate standard deviation of percentage changes (log returns is better but simple % is fine for this)
    const changes: number[] = [];
    for (let i = 1; i < values.length; i++) {
        changes.push((values[i] - values[i - 1]) / values[i - 1]);
    }

    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;
    return Math.sqrt(variance); // This is volatility over the period interval
}
