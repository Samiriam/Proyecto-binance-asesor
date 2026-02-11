import { NextResponse } from "next/server";
import { verifySessionFromRequest } from "@/lib/auth/session";
import { binancePublic, binanceSigned } from "@/lib/binance/client";
import { calculatePortfolioRisk } from "@/lib/brain/risk";
import { getConfig } from "@/lib/config";

export async function GET(request: Request) {
    if (!(await verifySessionFromRequest(request))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const cfg = await getConfig();

        const [tickerResult, accountResult] = await Promise.allSettled([
            binancePublic<any[]>("/api/v3/ticker/24hr"),
            binanceSigned("/api/v3/account", "GET"),
        ]);

        const tickers = tickerResult.status === "fulfilled" ? tickerResult.value : [];
        const account = accountResult.status === "fulfilled" ? accountResult.value : { balances: [] };

        const risk = calculatePortfolioRisk(
            (account as any).balances || [],
            Array.isArray(tickers) ? tickers : [],
            cfg.STABLECOINS_WHITELIST
        );

        return NextResponse.json(risk);
    } catch (error) {
        console.error("Error calculating portfolio risk:", error);
        return NextResponse.json(
            { error: "Error calculating portfolio risk" },
            { status: 500 }
        );
    }
}
