// Funciones auxiliares para normalizar respuestas de Binance

export function n(x: any, d = 0) {
  const v = Number(x);
  return Number.isFinite(v) ? v : d;
}

export function arr(x: any) {
  return Array.isArray(x) 
    ? x 
    : (Array.isArray(x?.rows) ? x.rows : (Array.isArray(x?.data) ? x.data : []));
}

export function readApr(it: any): number {
  return n(
    it.latestAnnualPercentageRate ?? 
    it.annualPercentageRate ?? 
    it.apr ?? 
    it.apy ?? 
    it.tierAnnualPercentageRate, 
    0
  );
}

export function formatCurrency(value: number, currency: string = "USDT"): string {
  return `${value.toFixed(2)} ${currency}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
