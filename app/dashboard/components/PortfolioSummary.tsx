export default function PortfolioSummary({ summary }: { summary: any }) {
  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Resumen del Portafolio
        </h2>
        <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Resumen del Portafolio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">Activo Principal</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.focus_asset || "N/A"}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Total</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary.focus_total?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">APR Flexible Actual</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {summary.focus_flexible_apr?.toFixed(2) || "0.00"}%
          </p>
        </div>
      </div>
    </div>
  );
}
