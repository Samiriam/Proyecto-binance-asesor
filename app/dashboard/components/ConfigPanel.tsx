"use client";

import { useEffect, useState } from "react";

export default function ConfigPanel() {
  const [config, setConfig] = useState({
    stablecoins: "",
    aprThreshold: "",
    maxDualPercent: "",
    volatilityGuard: "",
    defaultDuration: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error("Error loading config");
      }
      const data = await response.json();
      setConfig({
        stablecoins: Array.isArray(data.STABLECOINS_WHITELIST)
          ? data.STABLECOINS_WHITELIST.join(",")
          : "",
        aprThreshold: String(data.APR_SWITCH_THRESHOLD ?? ""),
        maxDualPercent: String(
          data.MAX_DUAL_PERCENT != null ? Math.round(data.MAX_DUAL_PERCENT * 100) : ""
        ),
        volatilityGuard: String(data.VOLATILITY_GUARD_24H ?? ""),
        defaultDuration: String(data.DEFAULT_DURATION_DAYS ?? "")
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        STABLECOINS_WHITELIST: config.stablecoins
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => s.toUpperCase()),
        APR_SWITCH_THRESHOLD: Number(config.aprThreshold),
        MAX_DUAL_PERCENT: Number(config.maxDualPercent),
        VOLATILITY_GUARD_24H: Number(config.volatilityGuard),
        DEFAULT_DURATION_DAYS: Number(config.defaultDuration)
      };

      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Error saving config");
      }

      setSuccess("Configuracion guardada");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Configuracion del Asesor
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Configuracion del Asesor
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-md text-sm">
          {success}
        </div>
      )}

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
            % Maximo Dual
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
            Duracion Default (dias)
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
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? "Guardando..." : "Guardar Configuracion"}
        </button>
      </div>
    </div>
  );
}
