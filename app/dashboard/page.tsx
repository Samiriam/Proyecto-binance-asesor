"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortfolioSummary from "./components/PortfolioSummary";
import FlexibleTop from "./components/FlexibleTop";
import DualTop from "./components/DualTop";
import RecommendationBox from "./components/RecommendationBox";
import AuditTable from "./components/AuditTable";
import ConfigPanel from "./components/ConfigPanel";

export default function DashboardPage() {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar sesión
    const session = document.cookie.includes("admin_session=true");
    if (!session) {
      router.push("/login");
    }
  }, [router]);

  const handleGenerateRecommendation = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Error generando recomendación");
      }
      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      setError("Error generando recomendación: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_session=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Binance Advisor
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={handleGenerateRecommendation}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Generando..." : "Generar Recomendación"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {recommendation && (
          <div className="space-y-6">
            <PortfolioSummary summary={recommendation.portfolio_summary} />
            <RecommendationBox recommendation={recommendation.recommendation} />
            <FlexibleTop items={recommendation.topFlexible} />
            <DualTop items={recommendation.topDual} />
          </div>
        )}

        <div className="mt-8 space-y-6">
          <ConfigPanel />
          <AuditTable />
        </div>
      </main>
    </div>
  );
}
