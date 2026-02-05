import { NextResponse } from "next/server";
import { binanceSigned } from "@/lib/binance/client";
import { verifySessionFromRequest } from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!(await verifySessionFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verificar que las credenciales estén configuradas
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      console.error("Binance API credentials not configured");
      return NextResponse.json(
        { 
          error: "Binance API credentials not configured",
          message: "Please set BINANCE_API_KEY and BINANCE_API_SECRET in your environment variables"
        }, 
        { status: 500 }
      );
    }

    const data = await binanceSigned("/api/v3/account", "GET");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching account:", error);
    
    // Proporcionar más detalles del error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: "Error fetching account", 
        message: errorMessage,
        details: errorStack
      }, 
      { status: 500 }
    );
  }
}
