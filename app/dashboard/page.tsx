"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioSummary from "./components/PortfolioSummary";
import PortfolioTable from "./components/PortfolioTable";
import FlexibleTop from "./components/FlexibleTop";
import LockedTop from "./components/LockedTop";
import DualTop from "./components/DualTop";
import RecommendationBox from "./components/RecommendationBox";
import AdvisorLogic from "./components/AdvisorLogic";
import AuditTable from "./components/AuditTable";
import ConfigPanel from "./components/ConfigPanel";

export default function DashboardPage() {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "portfolio" | "logic">("dashboard");

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Binance Advisor
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === "dashboard"
                  ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
               Dashboard
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === "portfolio"
                  ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
               Portafolio
            </button>
            <button
              onClick={() => setActiveTab("logic")}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === "logic"
                  ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
                Lógica del Asesor
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <>
            {/* Actions */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Panel de Recomendaciones
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Genera recomendaciones personalizadas basadas en tu portafolio y las mejores oportunidades del mercado
                </p>
              </div>
              <button
                onClick={handleGenerateRecommendation}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generar Recomendación
                  </span>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {recommendation && (
              <div className="space-y-6">
                <PortfolioSummary summary={recommendation.portfolio_summary} />
                <RecommendationBox recommendation={recommendation.recommendation} />
                <FlexibleTop items={recommendation.topFlexible} />
                <LockedTop items={recommendation.topLocked} />
                <DualTop items={recommendation.topDual} />
              </div>
            )}

            {!recommendation && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay recomendaciones disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Haz clic en "Generar Recomendación" para obtener una recomendación personalizada
                </p>
              </div>
            )}

            <div className="mt-8 space-y-6">
              <ConfigPanel />
              <AuditTable />
            </div>
          </>
        )}

        {activeTab === "portfolio" && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Portafolio Binance
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Visualiza todos tus activos y saldos en tu cuenta de Binance
              </p>
            </div>
            <PortfolioTable />
          </>
        )}

        {activeTab === "logic" && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Cómo Funciona el Asesor
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Entiende la lógica detrás de las recomendaciones generadas por el sistema
              </p>
            </div>
            <AdvisorLogic />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Binance Advisor - Asistente de Inversiones â€¢ Las recomendaciones son informativas y no constituyen asesoramiento financiero
          </p>
        </div>
      </footer>
    </div>
  );
}
