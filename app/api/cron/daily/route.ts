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

    const output = decide(cfg, { account, ticker24h, flexible, locked, dual });

    // Guardar en auditoría (si está configurada)
    try {
      await saveAudit({
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
      // No fallar el cron si la auditoría falla
    }

    // Enviar notificación por Telegram (si está configurado)
    try {
      await sendTelegramNotification(output);
    } catch (telegramError) {
      console.error("Error sending Telegram notification:", telegramError);
      // No fallar el cron si Telegram falla
    }

    return NextResponse.json({ success: true, recommendation: output });
  } catch (error) {
    console.error("Error en cron daily:", error);
    return NextResponse.json({ error: "Error en cron daily" }, { status: 500 });
  }
}

// Función para enviar notificación por Telegram
async function sendTelegramNotification(output: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("Telegram not configured, skipping notification");
    return;
  }

  const message = `
🤖 *Binance Advisor - Recomendación Diaria*

📅 *Fecha:* ${new Date(output.generated_at).toLocaleString('es-CL')}

🎯 *Tipo:* ${output.recommendation.type}
💰 *Activo:* ${output.recommendation.asset}
💵 *Monto:* ${output.recommendation.amount_suggested?.toFixed(2)}
⏱️ *Duración:* ${output.recommendation.duration_days} días

📝 *Razón:* ${output.recommendation.reason}

---
📊 *Top Flexible:* ${output.topFlexible.map((f: any) => f.asset + ' (' + f.apr?.toFixed(2) + '%)').join(', ')}
📈 *Top Dual:* ${output.topDual.map((d: any) => d.base + '/' + d.quote + ' (' + d.apy?.toFixed(2) + '%)').join(', ')}
  `;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }

  return await response.json();
}
