"use client";

import { useState, useEffect } from "react";

interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdtValue?: number | null;
}

interface PortfolioTableProps {
  balances?: Balance[];
}

export default function PortfolioTable({ balances: initialBalances }: PortfolioTableProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialBalances && initialBalances.length > 0) {
      setBalances(initialBalances);
    } else {
      fetchBalances();
    }
  }, [initialBalances]);

  const fetchBalances = async () => {
    setLoading(true);
    setError("");
    try {
      const [accountRes, tickerRes] = await Promise.all([
        fetch("/api/binance/account"),
        fetch("/api/binance/ticker24h")
      ]);

      if (!accountRes.ok) {
        let detail = "";
        try {
          const errJson = await accountRes.json();
          detail = errJson?.message || errJson?.error || "";
        } catch {}
        const statusMsg = detail ? ` (${detail})` : "";
        throw new Error(`Error fetching balances${statusMsg}`);
      }

      const data = await accountRes.json();
      const tickerData = tickerRes.ok ? await tickerRes.json() : [];

      const tickerMap = new Map<string, number>();
      for (const t of tickerData || []) {
        if (t?.symbol && t?.lastPrice) {
          tickerMap.set(t.symbol, Number(t.lastPrice));
        }
      }

      const stable = new Set(["USDT", "USDC", "FDUSD", "BUSD", "DAI", "TUSD"]);

      const processedBalances = data.balances
        .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map((b: any) => {
          const free = parseFloat(b.free);
          const locked = parseFloat(b.locked);
          const total = free + locked;
          let usdtValue: number | null = null;

          if (stable.has(b.asset)) {
            usdtValue = total;
          } else {
            const price = tickerMap.get(`${b.asset}USDT`);
            usdtValue = price ? total * price : null;
          }

          return {
            asset: b.asset,
            free,
            locked,
            total,
            usdtValue
          };
        })
        .filter((b: Balance) => b.total > 0);

      setBalances(processedBalances);
    } catch (err) {
      setError("Error cargando balances: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const totalUSDT = balances.reduce((sum, b) => sum + (b.usdtValue ?? 0), 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Portafolio Binance
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Saldo actual en tu cuenta de Binance
            </p>
            {totalUSDT > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Total estimado: ${totalUSDT.toFixed(2)} USDT
              </p>
            )}
          </div>
          <button
            onClick={fetchBalances}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Activo
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Disponible
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Bloqueado
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Valor USDT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {balances.map((balance) => (
              <tr key={balance.asset} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                        {balance.asset.substring(0, 2)}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {balance.asset}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                  {balance.free.toFixed(6)}
                </td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                  {balance.locked.toFixed(6)}
                </td>
                <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                  {balance.total.toFixed(6)}
                </td>
                <td className="py-4 px-4 text-green-600 dark:text-green-400 font-semibold">
                  {balance.usdtValue != null ? `$${balance.usdtValue.toFixed(2)}` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {balances.length === 0 && !loading && !error && (
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No hay balances disponibles. Haz clic en "Actualizar" para cargar tus saldos.
          </p>
        </div>
      )}
    </div>
  );
}
