"use client";

import { useState, useEffect } from "react";

export default function AuditTable() {
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuditHistory();
  }, []);

  const fetchAuditHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/audit/history?limit=50");
      if (!response.ok) {
        throw new Error("Error fetching audit history");
      }
      const data = await response.json();
      setAuditHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching audit history:", err);
      setError((err as Error).message);
      setAuditHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Historial de Auditoria
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Historial de Auditoria
        </h2>
        <button
          onClick={fetchAuditHistory}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}

      {auditHistory.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No hay registros de auditoria disponibles
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Fecha</th>
                <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Tipo</th>
                <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Activo</th>
                <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Monto</th>
                <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Razon</th>
              </tr>
            </thead>
            <tbody>
              {auditHistory.map((record, index) => (
                <tr
                  key={record.id ?? index}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                    {record.generated_at ? new Date(record.generated_at).toLocaleString() : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {record.recommendation_type || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {record.asset}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {Number(record.amount_suggested || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                    {record.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
