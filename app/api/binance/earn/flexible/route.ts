import { NextResponse } from "next/server";
import { binanceSigned } from "@/lib/binance/client";

export async function GET() {
  try {
    // Flexible list: size max 100, current page 1 (docs)
    const data = await binanceSigned("/sapi/v1/simple-earn/flexible/list", "GET", { size: 100, current: 1 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching flexible earn:", error);
    return NextResponse.json({ error: "Error fetching flexible earn" }, { status: 500 });
  }
}
