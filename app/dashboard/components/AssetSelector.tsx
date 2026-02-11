"use client";

import { useState } from "react";

interface AssetSelectorProps {
    onSelect: (asset: string) => void;
    isLoading: boolean;
}

const COMMON_ASSETS = ["BTC", "ETH", "BNB", "USDT", "USDC", "SOL", "XRP", "ADA", "DOGE"];

export default function AssetSelector({ onSelect, isLoading }: AssetSelectorProps) {
    const [customAsset, setCustomAsset] = useState("");
    const [activeAsset, setActiveAsset] = useState("");

    const handleSelect = (asset: string) => {
        setActiveAsset(asset);
        setCustomAsset(asset);
        onSelect(asset);
    };

    const handleSubmitCustom = (e: React.FormEvent) => {
        e.preventDefault();
        if (customAsset.trim()) {
            handleSelect(customAsset.toUpperCase().trim());
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Analizar Activo Específico
            </h3>

            <div className="space-y-4">
                {/* Quick Select */}
                <div className="flex flex-wrap gap-2">
                    {COMMON_ASSETS.map((asset) => (
                        <button
                            key={asset}
                            onClick={() => handleSelect(asset)}
                            disabled={isLoading}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeAsset === asset
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            {asset}
                        </button>
                    ))}
                </div>

                {/* Custom Input */}
                <form onSubmit={handleSubmitCustom} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Ej. DOT, LINK, MATIC..."
                        value={customAsset}
                        onChange={(e) => setCustomAsset(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !customAsset}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors shadow-sm"
                    >
                        Analizar
                    </button>
                </form>
            </div>
        </div>
    );
}
