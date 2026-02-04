import { NextResponse } from "next/server";
import { binanceSigned } from "@/lib/binance/client";

export async function GET() {
  try {
    // Dual list: size max 100, current page 1 (docs)
    const data = await binanceSigned("/sapi/v1/dci/product/list", "GET", { size: 100, current: 1 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dual investment:", error);
    return NextResponse.json({ error: "Error fetching dual investment" }, { status: 500 });
  }
}
