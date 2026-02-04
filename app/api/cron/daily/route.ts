import { NextResponse } from "next/server";
import { binancePublic, binanceSigned } from "@/lib/binance/client";
import { decide } from "@/lib/brain/decision";
import { getConfig } from "@/lib/config";
import { saveAudit } from "@/lib/db";

// Verifica autenticación del cron
function verifyCronAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn("CRON_SECRET no configurado");
    return false;
  }
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === cronSecret;
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    if (!verifyCronAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cfg = getConfig();

    const [ticker24h, account, flexible, locked, dual] = await Promise.all([
      binancePublic<any[]>("/api/v3/ticker/24hr"),
      binanceSigned("/api/v3/account", "GET"),
      binanceSigned("/sapi/v1/simple-earn/flexible/list", "GET", { size: 100, current: 1 }),
      binanceSigned("/sapi/v1/simple-earn/locked/list", "GET", { size: 100, current: 1 }),
      binanceSigned("/sapi/v1/dci/product/list", "GET", { size: 100, current: 1 })
    ]);

    const output = decide(cfg, { account, ticker24h, flexible, locked, dual });

    // Guardar en auditoría
    await saveAudit({
      generated_at: output.generated_at,
      recommendation_type: output.recommendation.type,
      asset: output.recommendation.asset,
      amount_suggested: output.recommendation.amount_suggested,
      duration_days: output.recommendation.duration_days,
      reason: output.recommendation.reason,
      payload: output
    });

    // Aquí se podrían agregar notificaciones (email, telegram)
    // sendNotification(output);

    return NextResponse.json({ success: true, recommendation: output });
  } catch (error) {
    console.error("Error en cron daily:", error);
    return NextResponse.json({ error: "Error en cron daily" }, { status: 500 });
  }
}
