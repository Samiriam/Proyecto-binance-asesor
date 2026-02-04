import { NextResponse } from "next/server";
import { binancePublic } from "@/lib/binance/client";

export async function GET() {
  try {
    const data = await binancePublic<{ serverTime: number }>("/api/v3/time");
    return NextResponse.json({
      serverTime: data.serverTime,
      localTime: Date.now(),
      diffMs: data.serverTime - Date.now(),
      diffSeconds: (data.serverTime - Date.now()) / 1000
    });
  } catch (error) {
    console.error("Error fetching Binance time:", error);
    return NextResponse.json({ error: "Error fetching Binance time" }, { status: 500 });
  }
}
