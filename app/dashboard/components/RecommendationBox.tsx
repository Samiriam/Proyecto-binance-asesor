export default function RecommendationBox({ recommendation, aiAnalysis }: { recommendation: any, aiAnalysis?: any }) {
  if (!recommendation) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Recomendación
        </h2>
        <p className="text-gray-600 dark:text-gray-400">No hay recomendación disponible</p>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FLEXIBLE_STAY":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "FLEXIBLE_SWITCH":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "LOCKED_SUGGEST":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "DUAL_SUGGEST":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "NO_ACTION":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "FLEXIBLE_STAY":
        return "Mantener Flexible";
      case "FLEXIBLE_SWITCH":
        return "Cambiar Flexible";
      case "LOCKED_SUGGEST":
        return "Sugerir Locked";
      case "DUAL_SUGGEST":
        return "Sugerir Dual";
      case "NO_ACTION":
        return "Sin Acción";
      default:
        return type;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Recomendación
        </h2>
        {aiAnalysis && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">AI POWERED</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Main Recommendation */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(recommendation.type)}`}>
              {getTypeLabel(recommendation.type)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activo</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {recommendation.asset}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monto Sugerido</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {recommendation.amount_suggested?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duración (días)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {recommendation.duration_days}
              </p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-gray-700/50 p-4 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Razón</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {recommendation.reason}
            </p>
          </div>
        </div>

        {/* AI Analysis Section */}
        {aiAnalysis && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              🧠 Análisis de Mercado & Smart Yield
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prediction */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tendencia (7 días)</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${aiAnalysis.prediction.direction === 'UP' ? 'text-green-500' :
                      aiAnalysis.prediction.direction === 'DOWN' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                    {aiAnalysis.prediction.direction === 'UP' ? '↗ ALCISTA' :
                      aiAnalysis.prediction.direction === 'DOWN' ? '↘ BAJISTA' : '→ NEUTRAL'}
                  </span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                    Confianza: {(aiAnalysis.prediction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Cambio proyectado: <span className={aiAnalysis.prediction.predictedChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {aiAnalysis.prediction.predictedChangePercent > 0 ? '+' : ''}{aiAnalysis.prediction.predictedChangePercent.toFixed(2)}%
                  </span>
                </p>
              </div>

              {/* Smart Yield */}
              <div className={`p-4 rounded-lg border ${aiAnalysis.smartYield.isTrap ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                }`}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rendimiento Real (Smart Yield)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aiAnalysis.smartYield.realYield.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500">anualizado</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  APR Nominal: {aiAnalysis.smartYield.nominalApr}%
                </p>
                {aiAnalysis.smartYield.isTrap && (
                  <div className="mt-2 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                    ⚠️ TRAMPA DE YIELD DETECTADA
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1 italic">
                  "{aiAnalysis.smartYield.reason}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
