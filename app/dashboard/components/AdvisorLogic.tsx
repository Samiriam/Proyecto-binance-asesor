"use client";

export default function AdvisorLogic() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Lógica del Asesor Binance
      </h2>

      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Finalidad
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Este asesor te ayuda a optimizar tus rendimientos en Binance analizando tus saldos actuales,
            los productos de Simple Earn Flexible/Locked y las oportunidades de Dual Investment.
            El sistema genera <strong>una recomendación diaria</strong> basada en análisis de APR/APY,
            volatilidad y tu perfil de inversión.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Cómo Funciona
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Análisis de Portafolio</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Identifica tu activo principal (mayor saldo) y calcula el APR actual de tus productos Flexible.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Comparación de Oportunidades</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Analiza los mejores productos Flexible, Locked y Dual disponibles en el mercado.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Guardia de Volatilidad</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Si el activo principal tiene volatilidad 24h {'>'} 5%, recomienda NO ACCIÓN para evitar riesgos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Recomendación Inteligente</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Genera una recomendación accionable basada en análisis cuantitativo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Tipos de Recomendaciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-1">
                FLEXIBLE_STAY
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                Mantener tu activo actual en Flexible. Ya estás en la mejor opción o la mejora no justifica el cambio.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1">
                FLEXIBLE_SWITCH
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                Cambiar a otra stablecoin Flexible con mejor APR. Requiere mejora de al menos 0.5 puntos porcentuales.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-1">
                LOCKED_SUGGEST
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                Considerar Simple Earn Locked si supera a Flexible en al menos 0.5pp.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-1">
                DUAL_SUGGEST
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                Considerar Dual Investment. Solo si el APY es 3pp mayor que Flexible y se sugiere máximo 30% del saldo.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <h4 className="font-semibold text-gray-800 dark:text-gray-300 text-sm mb-1">
                NO_ACTION
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                No se recomienda acción. Puede ser por volatilidad alta, datos insuficientes o sin ventaja clara.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Umbrales de Decisión
          </h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <strong>Volatilidad 24h:</strong> Bloquea recomendaciones si {'>'} 5%
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <strong>Switch Flexible:</strong> Requiere mejora de 0.5 puntos porcentuales (pp)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <strong>Locked:</strong> Solo si supera a Flexible en ≥ 0.5pp
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <strong>Dual Investment:</strong> Solo si diferencial ≥ 3pp y máximo 30% del saldo
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <strong>Stablecoins prioritarias:</strong> USDT, USDC, BUSD, DAI, TUSD
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-2">
            Qué Falta y Próximos Pasos
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span><strong>Base de Datos:</strong> Implementar Supabase para almacenar historial de recomendaciones y auditoría</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span><strong>Notificaciones:</strong> Configurar envío de alertas por Telegram y Email cuando se generen recomendaciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span><strong>Historial:</strong> Mostrar gráficos de rendimiento y evolución del portafolio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span><strong>Valores en USDT:</strong> Integrar precios en tiempo real para calcular valor total del portafolio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span><strong>Configuración personalizada:</strong> Permitir ajustar umbrales según tu perfil de riesgo</span>
            </li>
          </ul>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Importante
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            Este asesor proporciona <strong>recomendaciones informativas</strong> y <strong>NO ejecuta operaciones automáticamente</strong>.
            Siempre revisa las recomendaciones y toma tus propias decisiones de inversión.
            Las inversiones en criptomonedas conllevan riesgos significativos.
          </p>
        </div>
      </div>
    </div>
  );
}
