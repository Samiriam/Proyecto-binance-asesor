import { NextResponse } from "next/server";
import { binancePublic } from "@/lib/binance/client";

export async function GET() {
  try {
    const data = await binancePublic<any[]>("/api/v3/ticker/24hr");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching ticker 24h:", error);
    return NextResponse.json({ error: "Error fetching ticker 24h" }, { status: 500 });
  }
}
