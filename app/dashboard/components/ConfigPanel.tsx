"use client";

import { useState } from "react";

export default function ConfigPanel() {
  const [config, setConfig] = useState({
    stablecoins: "USDT,FDUSD,USDC",
    aprThreshold: "0.5",
    maxDualPercent: "30",
    volatilityGuard: "5",
    defaultDuration: "7"
  });

  const handleSave = () => {
    // Aquí se guardaría la configuración
    console.log("Configuración guardada:", config);
    alert("Configuración guardada (demo)");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Configuración del Asesor
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="stablecoins" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stablecoins Whitelist
          </label>
          <input
            type="text"
            id="stablecoins"
            value={config.stablecoins}
            onChange={(e) => setConfig({ ...config, stablecoins: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="USDT,FDUSD,USDC"
          />
        </div>
        <div>
          <label htmlFor="aprThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Umbral APR Switch (pp)
          </label>
          <input
            type="number"
            id="aprThreshold"
            value={config.aprThreshold}
            onChange={(e) => setConfig({ ...config, aprThreshold: e.target.value })}
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="0.5"
          />
        </div>
        <div>
          <label htmlFor="maxDualPercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            % Máximo Dual
          </label>
          <input
            type="number"
            id="maxDualPercent"
            value={config.maxDualPercent}
            onChange={(e) => setConfig({ ...config, maxDualPercent: e.target.value })}
            step="1"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="30"
          />
        </div>
        <div>
          <label htmlFor="volatilityGuard" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Guardia Volatilidad 24h (%)
          </label>
          <input
            type="number"
            id="volatilityGuard"
            value={config.volatilityGuard}
            onChange={(e) => setConfig({ ...config, volatilityGuard: e.target.value })}
            step="1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="5"
          />
        </div>
        <div>
          <label htmlFor="defaultDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duración Default (días)
          </label>
          <input
            type="number"
            id="defaultDuration"
            value={config.defaultDuration}
            onChange={(e) => setConfig({ ...config, defaultDuration: e.target.value })}
            step="1"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="7"
          />
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}
