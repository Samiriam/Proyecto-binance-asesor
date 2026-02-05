import { NextResponse } from "next/server";
import { binanceSigned } from "@/lib/binance/client";
import { verifySessionFromRequest } from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!(await verifySessionFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Flexible list: size max 100, current page 1 (docs)
    const data = await binanceSigned("/sapi/v1/simple-earn/flexible/list", "GET", { size: 100, current: 1 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching flexible earn:", error);
    return NextResponse.json({ error: "Error fetching flexible earn" }, { status: 500 });
  }
}
