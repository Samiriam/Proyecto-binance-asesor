# Binance Advisor - Asesor de Inversiones Binance

Asistente de inversiones inteligente para Binance con análisis de productos Simple Earn y Dual Investment.

## 🎯 Finalidad

Este proyecto es un asistente de inversiones que te ayuda a **optimizar tus rendimientos en Binance** analizando:

- **Saldo Spot**: Balances disponibles en tu cuenta
- **Precios 24h**: Variación de precios de criptomonedas
- **Simple Earn Flexible**: Productos de bajo riesgo con retiro flexible
- **Simple Earn Locked**: Productos con mayor rendimiento pero plazo fijo
- **Dual Investment**: Oportunidades de alto rendimiento con riesgo de conversión

### ¿Qué hace el asesor?

1. **Analiza tu portafolio** actual en Binance
2. **Compara oportunidades** de Simple Earn y Dual Investment
3. **Genera una recomendación diaria** basada en análisis cuantitativo
4. **Te protege de riesgos** con guardias de volatilidad
5. **Te muestra visualmente** tus saldos y las mejores oportunidades

### ¿Qué NO hace?

- ❌ NO ejecuta operaciones automáticamente (solo recomienda)
- ❌ NO garantiza rendimientos futuros
- ❌ NO constituye asesoramiento financiero profesional

## 🏗️ Arquitectura

```
Proyecto-binance-asesor/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── binance/              # Binance API endpoints
│   │   │   ├── account/route.ts  # GET /api/binance/account
│   │   │   ├── ticker24h/route.ts # GET /api/binance/ticker24h
│   │   │   ├── time/route.ts     # GET /api/binance/time (debug)
│   │   │   ├── earn/             # Simple Earn endpoints
│   │   │   │   ├── flexible/route.ts
│   │   │   │   └── locked/route.ts
│   │   │   └── dual/             # Dual Investment endpoints
│   │   │       └── list/route.ts
│   │   ├── recommend/route.ts    # POST /api/recommend (main logic)
│   │   └── cron/daily/route.ts   # Cron job endpoint
│   ├── dashboard/                # GUI Dashboard
│   │   ├── page.tsx              # Main dashboard page
│   │   └── components/           # React components
│   │       ├── PortfolioSummary.tsx
│   │       ├── PortfolioTable.tsx
│   │       ├── FlexibleTop.tsx
│   │       ├── DualTop.tsx
│   │       ├── RecommendationBox.tsx
│   │       ├── AdvisorLogic.tsx
│   │       ├── AuditTable.tsx
│   │       └── ConfigPanel.tsx
│   ├── login/page.tsx            # Login page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── lib/
│   ├── binance/                  # Binance API client
│   │   ├── client.ts             # API client with HMAC signing
│   │   ├── sign.ts               # HMAC SHA256 hex signing
│   │   └── normalize.ts          # Data normalization helpers
│   ├── brain/                    # Decision logic
│   │   ├── types.ts              # TypeScript types
│   │   └── decision.ts           # Decision engine
│   ├── db/                       # Database layer
│   │   ├── index.ts              # DB client
│   │   └── schema.sql            # SQL schema
│   └── config.ts                 # Centralized configuration
├── public/                       # Static assets
├── vercel.json                   # Vercel Cron configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🚀 Configuración Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/Samiriam/Proyecto-binance-asesor.git
cd Proyecto-binance-asesor
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` con tus credenciales:

```bash
# Binance
BINANCE_BASE_URL=https://api.binance.com
BINANCE_API_KEY=tu_api_key
BINANCE_API_SECRET=tu_api_secret
BINANCE_RECV_WINDOW=5000

# App security
NEXT_PUBLIC_ADMIN_USER=admin
NEXT_PUBLIC_ADMIN_PASS=admin123
CRON_SECRET=tu_clave_secreta

# Database (opcional - para auditoría)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Notificaciones (opcional)
RESEND_API_KEY=tu_clave_resend
ALERT_EMAIL_TO=tu@email.com
TELEGRAM_BOT_TOKEN=tu_token_bot
TELEGRAM_CHAT_ID=tu_chat_id
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 API Endpoints

### Binance API

- `GET /api/binance/account` - Obtener información de la cuenta y saldos
- `GET /api/binance/ticker24h` - Obtener variación 24h de precios
- `GET /api/binance/time` - Validar timestamp del servidor (debug)
- `GET /api/binance/earn/flexible` - Productos Simple Earn Flexible
- `GET /api/binance/earn/locked` - Productos Simple Earn Locked
- `GET /api/binance/dual/list` - Catálogo Dual Investment

### Recommendation API

- `POST /api/recommend` - Generar recomendación

**Ejemplo de respuesta:**

```json
{
  "generated_at": "2024-01-15T10:30:00.000Z",
  "portfolio_summary": {
    "focus_asset": "USDT",
    "focus_total": 1000.0,
    "focus_flexible_apr": 5.5
  },
  "topFlexible": [
    {
      "asset": "USDC",
      "apr": 6.2,
      "min": 10,
      "quota": 1000000,
      "reason": "Stablecoin con APR competitivo"
    }
  ],
  "topDual": [
    {
      "base": "USDT",
      "quote": "BTC",
      "apy": 12.5,
      "strike": 50000,
      "worst_case": "Podrías liquidar en BTC al strike 50000 (riesgo conversión).",
      "reason": "Retorno potencial mayor con riesgo de conversión"
    }
  ],
  "recommendation": {
    "type": "FLEXIBLE_SWITCH",
    "asset": "USDC",
    "amount_suggested": 1000.0,
    "duration_days": 30,
    "reason": "Switch USDT → USDC. APR +0.7pp (de 5.5% a 6.2%)."
  }
}
```

### Cron Job

- `POST /api/cron/daily` - Ejecutar recomendación diaria (requiere `CRON_SECRET`)

## 🧠 Lógica del Asesor

### Decision Engine

El asesor utiliza la siguiente lógica para generar recomendaciones:

1. **Análisis de Portafolio**: Identifica el activo principal (mayor saldo) y calcula el APR actual
2. **Comparación de Oportunidades**: Analiza los mejores productos Flexible y Dual disponibles
3. **Guardia de Volatilidad**: Si el activo principal tiene volatilidad 24h > 5%, recomienda NO ACCIÓN
4. **Recomendación**: Genera una recomendación basada en análisis cuantitativo

### Tipos de Recomendaciones

| Tipo | Descripción | Cuándo se recomienda |
|------|-------------|---------------------|
| **FLEXIBLE_STAY** | Mantener activo actual en Flexible | Ya estás en la mejor opción o mejora insuficiente |
| **FLEXIBLE_SWITCH** | Cambiar a otra stablecoin Flexible | Requiere mejora ≥ 0.5 puntos porcentuales |
| **DUAL_SUGGEST** | Considerar Dual Investment | Diferencial ≥ 3pp y máximo 30% del saldo |
| **NO_ACTION** | No se recomienda acción | Volatilidad alta, datos insuficientes o sin ventaja clara |

### Umbrales de Decisión

- **Volatilidad 24h**: Bloquea recomendaciones si > 5%
- **Switch Flexible**: Requiere mejora de 0.5 puntos porcentuales (pp)
- **Dual Investment**: Solo si diferencial ≥ 3pp y máximo 30% del saldo
- **Stablecoins prioritarias**: USDT, USDC, BUSD, DAI, TUSD

## 🎨 GUI Dashboard

El dashboard incluye:

- **Login**: Autenticación simple con usuario/contraseña
- **Dashboard**: Panel principal con recomendaciones
- **Portafolio**: Visualización completa de tus saldos en Binance
- **Lógica del Asesor**: Explicación detallada de cómo funciona el sistema

### Componentes

- **Portfolio Summary**: Resumen del portafolio actual
- **Portfolio Table**: Tabla completa con todos tus saldos
- **Recommendation Box**: Recomendación principal con detalles
- **Flexible Top**: Top 3 productos Simple Earn Flexible
- **Dual Top**: Top 3 productos Dual Investment
- **Advisor Logic**: Explicación de la lógica del asesor
- **Audit Table**: Historial de recomendaciones
- **Config Panel**: Configuración del asesor

## 📅 Vercel Cron

El proyecto está configurado para ejecutar una recomendación diaria a las 12:00 UTC (09:00 Chile) usando Vercel Cron Jobs.

### Configuración en `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 12 * * *"
    }
  ]
}
```

### Variables de Entorno en Vercel

Asegúrate de configurar las siguientes variables en el dashboard de Vercel:

- `BINANCE_API_KEY`
- `BINANCE_API_SECRET`
- `NEXT_PUBLIC_ADMIN_USER`
- `NEXT_PUBLIC_ADMIN_PASS`
- `CRON_SECRET`

## 🔒 Seguridad

- Las credenciales de Binance se almacenan en variables de entorno
- Las llamadas a la API de Binance se firman con HMAC SHA256
- El cron job está protegido con `CRON_SECRET`
- No se ejecutan operaciones automáticamente (solo recomendaciones)

## 🚨 Importante

Este asistente proporciona **recomendaciones informativas** y **NO ejecuta operaciones automáticamente**. Siempre revisa las recomendaciones y toma tus propias decisiones de inversión.

Las inversiones en criptomonedas conllevan riesgos significativos. Este proyecto no constituye asesoramiento financiero.

## 📝 Validación

Antes de desplegar, valida que todo funcione correctamente:

### 1. Validar conexión con Binance API

```bash
curl http://localhost:3000/api/binance/account
```

Deberías ver tu información de cuenta.

### 2. Validar generación de recomendación

```bash
curl -X POST http://localhost:3000/api/recommend
```

Deberías ver una recomendación completa.

### 3. Validar endpoint de tiempo (debugging)

```bash
curl http://localhost:3000/api/binance/time
```

Deberías ver la hora actual del servidor.

## 🔧 Troubleshooting

### Error: "Binance API Error 401"

- Verifica que `BINANCE_API_KEY` y `BINANCE_API_SECRET` sean correctos
- Asegúrate de que la API key tenga los permisos necesarios

### Error: "Binance API Error 1021"

- Verifica la sincronización de tiempo del servidor
- Aumenta `BINANCE_RECV_WINDOW` si hay latencia

### Error: "No action recommendation"

- Verifica que tengas saldos en tu cuenta
- Asegúrate de que haya productos disponibles en Simple Earn
- Revisa los umbrales de decisión en `lib/config.ts`

### Error en Vercel: "Type error"

- Verifica que `tsconfig.json` tenga `"target": "ES2020"`
- Ejecuta `npm run build` localmente para verificar errores

### Error: "Credenciales inválidas"

- Verifica que `NEXT_PUBLIC_ADMIN_USER` y `NEXT_PUBLIC_ADMIN_PASS` estén configurados
- Asegúrate de que las variables tengan el prefijo `NEXT_PUBLIC_`

## 📦 Deploy en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno
3. Deploy

## 🔧 Qué Falta Implementar

### Base de Datos (Supabase)

Actualmente, el proyecto no tiene una base de datos persistente. Para implementar auditoría completa, puedes usar Supabase:

```bash
npm install @supabase/supabase-js
```

**Configuración en `.env.local`:**

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Ejemplo de implementación:**

```typescript
// lib/db/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Notificaciones (Telegram + Email)

Para implementar notificaciones completas:

**Telegram:**
```bash
npm install node-telegram-bot-api
```

**Email (Resend):**
```bash
npm install resend
```

### Funcionalidades Futuras

- [ ] Gráficos de rendimiento histórico
- [ ] Cálculo de valor total del portafolio en USDT
- [ ] Configuración personalizable de umbrales
- [ ] Alertas en tiempo real
- [ ] Comparación de rendimientos
- [ ] Exportación de reportes

## 📄 Licencia

MIT

## 👨‍💻 Autor

[Samiriam](https://github.com/Samiriam)
