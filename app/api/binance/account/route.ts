import { NextResponse } from "next/server";
import { binanceSigned } from "@/lib/binance/client";

export async function GET() {
  try {
    const data = await binanceSigned("/api/v3/account", "GET");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json({ error: "Error fetching account" }, { status: 500 });
  }
}
