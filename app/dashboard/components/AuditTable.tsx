"use client";

import { useState, useEffect } from "react";

export default function AuditTable() {
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditHistory();
  }, []);

  const fetchAuditHistory = async () => {
    try {
      // Por ahora es un placeholder, cuando se implemente la DB real
      // const response = await fetch("/api/audit/history");
      // const data = await response.json();
      // setAuditHistory(data);
      setAuditHistory([]);
    } catch (error) {
      console.error("Error fetching audit history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Historial de Auditoría
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Historial de Auditoría
      </h2>
      {auditHistory.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No hay registros de auditoría disponibles
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
                <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Razón</th>
              </tr>
            </thead>
            <tbody>
              {auditHistory.map((record, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(record.generated_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {record.recommendation_type}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {record.asset}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {record.amount_suggested?.toFixed(2)}
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
