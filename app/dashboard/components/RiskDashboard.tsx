"use client";

import { useState, useEffect } from "react";

interface RiskMetrics {
    total_value_usd: number;
    stablecoin_pct: number;
    volatile_pct: number;
    risk_score: number;
    diversification_score: number;
    top_holdings: Array<{
        asset: string;
        amount: number;
        value_usd: number;
        percent: number;
        is_stable: boolean;
    }>;
    warnings: string[];
    grade: "A" | "B" | "C" | "D" | "F";
}

const GRADE_COLORS: Record<string, string> = {
    A: "text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    B: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    C: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    D: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    F: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
};

const GRADE_LABELS: Record<string, string> = {
    A: "Excelente — Bajo riesgo, bien diversificado",
    B: "Bueno — Riesgo moderado-bajo",
    C: "Regular — Riesgo moderado",
    D: "Alto — Considere diversificar",
    F: "Crítico — Riesgo muy alto",
};

export default function RiskDashboard() {
    const [risk, setRisk] = useState<RiskMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRisk();
    }, []);

    const fetchRisk = async () => {
        try {
            const res = await fetch("/api/portfolio/risk");
            if (!res.ok) throw new Error("Error");
            const data = await res.json();
            setRisk(data);
        } catch {
            setError("No se pudo cargar el análisis de riesgo");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !risk) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🛡️ Dashboard de Riesgo</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {error || "Sin datos de riesgo disponibles."}
                </p>
            </div>
        );
    }

    // CSS-only donut chart
    const stableAngle = (risk.stablecoin_pct / 100) * 360;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    🛡️ Dashboard de Riesgo
                </h3>
                <div className={`px-3 py-1 rounded-full border text-sm font-bold ${GRADE_COLORS[risk.grade]}`}>
                    Grado: {risk.grade}
                </div>
            </div>

            {/* Grade description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 italic">
                {GRADE_LABELS[risk.grade]}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Risk Gauge + Distribution */}
                <div className="space-y-4">
                    {/* Risk Score Gauge */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Score de Riesgo</p>
                        <div className="relative h-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 h-full w-1 bg-white shadow-lg border border-gray-400 rounded"
                                style={{ left: `${Math.min(100, risk.risk_score)}%`, transform: "translateX(-50%)" }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Seguro</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{risk.risk_score}/100</span>
                            <span>Riesgoso</span>
                        </div>
                    </div>

                    {/* Distribution Bar */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Distribución del Portafolio</p>
                        <div className="h-6 rounded-full overflow-hidden flex">
                            <div
                                className="bg-green-500 flex items-center justify-center text-xs text-white font-bold transition-all"
                                style={{ width: `${risk.stablecoin_pct}%` }}
                            >
                                {risk.stablecoin_pct >= 15 ? `${risk.stablecoin_pct.toFixed(0)}%` : ""}
                            </div>
                            <div
                                className="bg-orange-500 flex items-center justify-center text-xs text-white font-bold transition-all"
                                style={{ width: `${risk.volatile_pct}%` }}
                            >
                                {risk.volatile_pct >= 15 ? `${risk.volatile_pct.toFixed(0)}%` : ""}
                            </div>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                Stablecoins ({risk.stablecoin_pct.toFixed(1)}%)
                            </span>
                            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                                Volátiles ({risk.volatile_pct.toFixed(1)}%)
                            </span>
                        </div>
                    </div>

                    {/* Diversification Score */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Score de Diversificación</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-bold ${risk.diversification_score >= 60 ? 'text-green-500' :
                                    risk.diversification_score >= 30 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                {risk.diversification_score.toFixed(0)}
                            </span>
                            <span className="text-gray-400 text-sm">/100</span>
                        </div>
                    </div>
                </div>

                {/* Right: Top Holdings + Warnings */}
                <div className="space-y-4">
                    {/* Top Holdings */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Top Holdings</p>
                        <div className="space-y-2">
                            {risk.top_holdings.slice(0, 5).map((h, i) => (
                                <div key={h.asset} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm flex-1">{h.asset}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${h.is_stable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                        }`}>
                                        {h.is_stable ? 'Stable' : 'Crypto'}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                                        ${h.value_usd.toFixed(0)}
                                    </span>
                                    <div className="w-16">
                                        <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${h.is_stable ? 'bg-green-500' : 'bg-orange-500'}`}
                                                style={{ width: `${Math.min(100, h.percent)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 w-10 text-right">{h.percent.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                        {risk.total_value_usd > 0 && (
                            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                                <span className="text-xs text-gray-500">Total estimado</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">${risk.total_value_usd.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Warnings */}
                    {risk.warnings.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-yellow-700 dark:text-yellow-400 uppercase tracking-wider mb-2 font-bold">Alertas</p>
                            <ul className="space-y-1">
                                {risk.warnings.map((w, i) => (
                                    <li key={i} className="text-sm text-yellow-800 dark:text-yellow-300">{w}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
