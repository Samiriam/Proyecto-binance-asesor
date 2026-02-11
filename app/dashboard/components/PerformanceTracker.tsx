"use client";

import { useState, useEffect } from "react";

interface PerformanceStats {
    total_predictions: number;
    correct_predictions: number;
    win_rate: number;
    avg_predicted_change: number;
    avg_actual_change: number;
    current_streak: number;
    streak_type: "win" | "loss" | "none";
    recent: any[];
}

export default function PerformanceTracker() {
    const [stats, setStats] = useState<PerformanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/performance");
            if (!res.ok) throw new Error("Error");
            const data = await res.json();
            setStats(data);
        } catch {
            setError("No se pudieron cargar las estadísticas");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">📊 Performance Tracker</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {error || "Sin datos de rendimiento aún. Las predicciones se evaluarán automáticamente."}
                </p>
            </div>
        );
    }

    const getWinRateColor = (rate: number) => {
        if (rate >= 70) return "text-green-500";
        if (rate >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const getStreakEmoji = () => {
        if (stats.streak_type === "win") return "🔥";
        if (stats.streak_type === "loss") return "❄️";
        return "➖";
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    📊 Performance Tracker
                </h3>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                    {stats.total_predictions} predicciones evaluadas
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Win Rate */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Win Rate</p>
                    <p className={`text-3xl font-bold ${getWinRateColor(stats.win_rate)}`}>
                        {stats.win_rate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {stats.correct_predictions}/{stats.total_predictions} correctas
                    </p>
                </div>

                {/* Streak */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Racha</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {getStreakEmoji()} {stats.current_streak}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {stats.streak_type === "win" ? "aciertos seguidos" :
                            stats.streak_type === "loss" ? "fallos seguidos" : "sin datos"}
                    </p>
                </div>

                {/* Avg Change */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Precisión Promedio</p>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-sm text-gray-500">Pred:</span>
                        <span className={`text-lg font-bold ${stats.avg_predicted_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stats.avg_predicted_change > 0 ? '+' : ''}{stats.avg_predicted_change.toFixed(2)}%
                        </span>
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-sm text-gray-500">Real:</span>
                        <span className={`text-lg font-bold ${stats.avg_actual_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stats.avg_actual_change > 0 ? '+' : ''}{stats.avg_actual_change.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Predictions Table */}
            {stats.recent.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Últimas Predicciones</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-2 px-2 text-xs text-gray-500 uppercase">Fecha</th>
                                    <th className="text-left py-2 px-2 text-xs text-gray-500 uppercase">Activo</th>
                                    <th className="text-left py-2 px-2 text-xs text-gray-500 uppercase">Pred</th>
                                    <th className="text-left py-2 px-2 text-xs text-gray-500 uppercase">Real</th>
                                    <th className="text-center py-2 px-2 text-xs text-gray-500 uppercase">Resultado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent.map((snap: any, i: number) => (
                                    <tr key={snap.id || i} className="border-b border-gray-100 dark:border-gray-700/50">
                                        <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                                            {new Date(snap.created_at).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">
                                            {snap.asset}
                                        </td>
                                        <td className="py-2 px-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${snap.predicted_direction === 'UP' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    snap.predicted_direction === 'DOWN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                {snap.predicted_direction === 'UP' ? '↗' : snap.predicted_direction === 'DOWN' ? '↘' : '→'}
                                                {' '}{snap.predicted_change_pct?.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-2 px-2">
                                            {snap.evaluated_at ? (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${snap.actual_direction === 'UP' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        snap.actual_direction === 'DOWN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}>
                                                    {snap.actual_direction === 'UP' ? '↗' : snap.actual_direction === 'DOWN' ? '↘' : '→'}
                                                    {' '}{snap.actual_change_pct?.toFixed(1)}%
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Pendiente</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                            {snap.evaluated_at ? (
                                                snap.was_correct ? (
                                                    <span className="text-green-500 font-bold">✓</span>
                                                ) : (
                                                    <span className="text-red-500 font-bold">✗</span>
                                                )
                                            ) : (
                                                <span className="text-gray-400">⏳</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
