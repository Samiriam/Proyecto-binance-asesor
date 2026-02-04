import { NextResponse } from "next/server";
import { binancePublic, binanceSigned } from "@/lib/binance/client";
import { decide } from "@/lib/brain/decision";
import { getConfig } from "@/lib/config";

export async function POST() {
  try {
    const cfg = getConfig();

    // Ejecutar llamadas con manejo de errores individuales
    const results = await Promise.allSettled([
      binancePublic<any[]>("/api/v3/ticker/24hr"),
      binanceSigned("/api/v3/account", "GET"),
      binanceSigned("/sapi/v1/simple-earn/flexible/list", "GET", { size: 100, current: 1 }),
      binanceSigned("/sapi/v1/simple-earn/locked/list", "GET", { size: 100, current: 1 }),
      binanceSigned("/sapi/v1/dci/product/list", "GET", { size: 100, current: 1 })
    ]);

    // Extraer resultados o valores por defecto
    const ticker24h = results[0].status === "fulfilled" ? results[0].value : [];
    const account = results[1].status === "fulfilled" ? results[1].value : { balances: [] };
    const flexible = results[2].status === "fulfilled" ? results[2].value : [];
    const locked = results[3].status === "fulfilled" ? results[3].value : [];
    const dual = results[4].status === "fulfilled" ? results[4].value : [];

    // Logear errores individuales para debugging
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const endpoints = ["ticker24h", "account", "flexible", "locked", "dual"];
        console.error(`Error fetching ${endpoints[index]}:`, result.reason);
      }
    });

    const output = decide(cfg, { account, ticker24h, flexible, locked, dual });
    return NextResponse.json(output);
  } catch (error) {
    console.error("Error generating recommendation:", error);
    // Devolver respuesta estructurada en lugar de error 500
    return NextResponse.json({
      generated_at: new Date().toISOString(),
      portfolio_summary: {
        focus_asset: "",
        focus_total: 0,
        focus_flexible_apr: 0
      },
      topFlexible: [],
      topDual: [],
      recommendation: {
        type: "NO_ACTION",
        asset: "",
        amount_suggested: 0,
        duration_days: 1,
        reason: `Error del sistema: ${error instanceof Error ? error.message : "Error desconocido"}`
      }
    });
  }
}
