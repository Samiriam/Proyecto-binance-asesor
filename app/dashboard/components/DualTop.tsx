export default function DualTop({ items }: { items: any[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Top Dual Investment
        </h2>
        <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Top Dual Investment
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Base</th>
              <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Quote</th>
              <th className="py-3 px-4 text-gray-700 dark:text-gray-300">APY</th>
              <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Strike</th>
              <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Worst Case</th>
              <th className="py-3 px-4 text-gray-700 dark:text-gray-300">Razón</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                  {item.base}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                  {item.quote || "N/A"}
                </td>
                <td className="py-3 px-4 text-green-600 dark:text-green-400 font-bold">
                  {item.apy?.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                  {item.strike || "N/A"}
                </td>
                <td className="py-3 px-4 text-orange-600 dark:text-orange-400 text-sm">
                  {item.worst_case}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                  {item.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
