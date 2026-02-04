import { buildQuery, signHmacSha256Hex } from "./sign";

const BASE_URL = process.env.BINANCE_BASE_URL || "https://api.binance.com";
const API_KEY = process.env.BINANCE_API_KEY || "";
const API_SECRET = process.env.BINANCE_API_SECRET || "";
const RECV_WINDOW = Number(process.env.BINANCE_RECV_WINDOW || 5000);

type HttpMethod = "GET" | "POST";

export async function binancePublic<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { 
    method: "GET", 
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Binance public error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function binanceSigned<T>(
  path: string,
  method: HttpMethod = "GET",
  params: Record<string, any> = {}
): Promise<T> {
  if (!API_KEY || !API_SECRET) throw new Error("Missing BINANCE_API_KEY / BINANCE_API_SECRET");

  const timestamp = Date.now();
  const fullParams = { ...params, recvWindow: RECV_WINDOW, timestamp };
  const query = buildQuery(fullParams);
  const signature = signHmacSha256Hex(API_SECRET, query);
  const url = `${BASE_URL}${path}?${query}&signature=${signature}`;

  const res = await fetch(url, {
    method,
    headers: {
      "X-MBX-APIKEY": API_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store"
  });

  if (!res.ok) throw new Error(`Binance signed error ${res.status}: ${await res.text()}`);
  return res.json();
}
