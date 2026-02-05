export default function RecommendationBox({ recommendation }: { recommendation: any }) {
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
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Recomendación
      </h2>
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
        <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Razón</p>
          <p className="text-gray-900 dark:text-white font-medium">
            {recommendation.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
