import { NextResponse } from "next/server";
import { binancePublic, binanceSigned } from "@/lib/binance/client";
import { decide } from "@/lib/brain/decision";
import { getConfig } from "@/lib/config";
import { saveAudit } from "@/lib/db";
import { savePerformanceSnapshot, evaluatePendingSnapshots } from "@/lib/db/performance";
import { sendDailyReport, sendUrgentAlert } from "@/lib/notifications/telegram";

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

    const cfg = await getConfig();

    // Ejecutar llamadas con manejo de errores individuales (resiliente)
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

    const output = await decide(cfg, { account, ticker24h, flexible, locked, dual });

    // Guardar en auditoría (si está configurada)
    let auditId: number | null = null;
    try {
      auditId = await saveAudit({
        generated_at: output.generated_at,
        recommendation_type: output.recommendation.type,
        asset: output.recommendation.asset,
        amount_suggested: output.recommendation.amount_suggested,
        duration_days: output.recommendation.duration_days,
        reason: output.recommendation.reason,
        payload: output
      });
    } catch (auditError) {
      console.error("Error saving audit:", auditError);
    }

    // Performance Tracker: save snapshot & evaluate pending
    try {
      if (auditId && output.ai_analysis) {
        // Get current price of the focus asset
        const focusAsset = output.recommendation.asset;
        const tickerArr = Array.isArray(ticker24h) ? ticker24h : [];
        const assetTicker = tickerArr.find((t: any) =>
          t.symbol === `${focusAsset}USDT` || t.symbol === `${focusAsset}BUSD`
        );
        const currentPrice = assetTicker ? parseFloat(assetTicker.lastPrice || "0") : 0;

        if (currentPrice > 0) {
          await savePerformanceSnapshot(
            auditId,
            focusAsset,
            output.recommendation.type,
            currentPrice,
            output.ai_analysis.prediction.direction,
            output.ai_analysis.prediction.predictedChangePercent
          );
        }
      }

      // Evaluate past predictions
      const getPriceFromTicker = async (asset: string): Promise<number> => {
        const tickerArr = Array.isArray(ticker24h) ? ticker24h : [];
        const t = tickerArr.find((t: any) => t.symbol === `${asset}USDT`);
        return t ? parseFloat(t.lastPrice || "0") : 0;
      };
      const evaluated = await evaluatePendingSnapshots(getPriceFromTicker);
      if (evaluated > 0) {
        console.log(`Performance: evaluated ${evaluated} pending snapshots`);
      }
    } catch (perfError) {
      console.error("Error in performance tracking:", perfError);
    }

    // Enviar notificación por Telegram (mejorada)
    try {
      await sendDailyReport(output);

      // Alerta urgente si hay trampa o crash
      if (output.ai_analysis?.smartYield?.isTrap) {
        await sendUrgentAlert(
          `⛔ TRAMPA DE YIELD DETECTADA en ${output.recommendation.asset}\n${output.ai_analysis.smartYield.reason}`
        );
      }
      if (output.ai_analysis?.prediction?.direction === 'DOWN' &&
        output.ai_analysis?.prediction?.confidence > 0.7) {
        await sendUrgentAlert(
          `📉 ALERTA BAJISTA FUERTE: ${output.portfolio_summary.focus_asset}\nConfianza: ${(output.ai_analysis.prediction.confidence * 100).toFixed(0)}%\nCambio proyectado: ${output.ai_analysis.prediction.predictedChangePercent.toFixed(2)}%`
        );
      }
    } catch (telegramError) {
      console.error("Error sending Telegram notification:", telegramError);
    }

    return NextResponse.json({ success: true, recommendation: output });
  } catch (error) {
    console.error("Error en cron daily:", error);
    return NextResponse.json({ error: "Error en cron daily" }, { status: 500 });
  }
}
