import { binancePublic } from "./client";

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export async function getKlines(symbol: string, interval: string = "1d", limit: number = 30): Promise<Kline[]> {
  // GET /api/v3/klines
  const path = `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const data = await binancePublic<any[][]>(path);
  
  return data.map(k => ({
    openTime: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
    closeTime: k[6]
  }));
}
