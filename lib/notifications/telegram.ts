/**
 * Telegram Notification Module — Enhanced with HTML formatting and AI data.
 */

const TELEGRAM_API = "https://api.telegram.org/bot";

function getConfig() {
    return {
        botToken: process.env.TELEGRAM_BOT_TOKEN || "",
        chatId: process.env.TELEGRAM_CHAT_ID || "",
    };
}

function isConfigured(): boolean {
    const { botToken, chatId } = getConfig();
    return !!(botToken && chatId);
}

async function sendMessage(text: string, parseMode: "HTML" | "Markdown" = "HTML"): Promise<void> {
    if (!isConfigured()) {
        console.log("Telegram not configured, skipping");
        return;
    }

    const { botToken, chatId } = getConfig();

    const response = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: parseMode,
            disable_web_page_preview: true,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Telegram API error ${response.status}: ${err}`);
    }
}

// Direction emoji helper
function dirEmoji(dir: string): string {
    if (dir === "UP") return "🟢 ↗ ALCISTA";
    if (dir === "DOWN") return "🔴 ↘ BAJISTA";
    return "⚪ → NEUTRAL";
}

function riskEmoji(score: number): string {
    if (score <= 3) return "🟢";
    if (score <= 6) return "🟡";
    return "🔴";
}

/**
 * Send the daily recommendation report with rich formatting.
 */
export async function sendDailyReport(output: any): Promise<void> {
    const rec = output.recommendation;
    const ai = output.ai_analysis;
    const ps = output.portfolio_summary;

    let message = `
<b>📊 Binance Advisor — Reporte Diario</b>
<i>${new Date(output.generated_at).toLocaleString("es-CL", { dateStyle: "long", timeStyle: "short" })}</i>

━━━━━━━━━━━━━━━━━━━━

<b>💼 Portafolio</b>
• Activo principal: <b>${ps.focus_asset}</b>
• Balance: <b>${ps.focus_total?.toFixed(2) ?? "N/A"}</b>
• APR Flexible actual: <b>${ps.focus_flexible_apr?.toFixed(2) ?? "0"}%</b>

━━━━━━━━━━━━━━━━━━━━

<b>🎯 Recomendación: ${rec.type}</b>
• Activo: <b>${rec.asset}</b>
• Monto sugerido: <b>${rec.amount_suggested?.toFixed(2)}</b>
• Duración: <b>${rec.duration_days} días</b>
• Razón: <i>${rec.reason}</i>`;

    if (ai) {
        message += `

━━━━━━━━━━━━━━━━━━━━

<b>🧠 Análisis IA</b>
• Tendencia: ${dirEmoji(ai.prediction?.direction)}
• Confianza: <b>${((ai.prediction?.confidence ?? 0) * 100).toFixed(0)}%</b>
• Cambio proyectado: <b>${ai.prediction?.predictedChangePercent?.toFixed(2) ?? "N/A"}%</b>

<b>💰 Smart Yield</b>
• Rendimiento real: <b>${ai.smartYield?.realYield?.toFixed(2) ?? "N/A"}%</b>
• Riesgo: ${riskEmoji(ai.smartYield?.riskScore ?? 0)} <b>${ai.smartYield?.riskScore?.toFixed(1) ?? "N/A"}/10</b>
• Trampa: ${ai.smartYield?.isTrap ? "⛔ SÍ" : "✅ NO"}`;
    }

    // Top products
    if (output.topFlexible?.length) {
        message += `

<b>📈 Top Flexible</b>
${output.topFlexible.map((f: any) => `  • ${f.asset}: ${f.apr?.toFixed(2)}%`).join("\n")}`;
    }

    if (output.topLocked?.length) {
        message += `

<b>🔒 Top Locked</b>
${output.topLocked.map((l: any) => `  • ${l.asset}: ${l.apr?.toFixed(2)}% (${l.duration ?? "?"} días)`).join("\n")}`;
    }

    await sendMessage(message);
}

/**
 * Send an urgent alert for critical events (yield traps, crashes).
 */
export async function sendUrgentAlert(alertMessage: string): Promise<void> {
    const message = `
<b>🚨 ALERTA URGENTE — Binance Advisor</b>

${alertMessage}

<i>${new Date().toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}</i>
`;

    await sendMessage(message);
}

/**
 * Send a weekly performance summary.
 */
export async function sendPerformanceReport(stats: {
    total_predictions: number;
    correct_predictions: number;
    win_rate: number;
    current_streak: number;
    streak_type: string;
}): Promise<void> {
    const message = `
<b>📊 Reporte Semanal de Rendimiento</b>

<b>🎯 Win Rate:</b> ${stats.win_rate.toFixed(1)}%
<b>📊 Predicciones:</b> ${stats.correct_predictions}/${stats.total_predictions} correctas
<b>${stats.streak_type === "win" ? "🔥" : "❄️"} Racha:</b> ${stats.current_streak} ${stats.streak_type === "win" ? "aciertos" : "fallos"} seguidos

<i>${new Date().toLocaleString("es-CL", { dateStyle: "long" })}</i>
`;

    await sendMessage(message);
}
