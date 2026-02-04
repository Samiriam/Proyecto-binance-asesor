# Binance Advisor - Asesor de Inversiones Binance

Proyecto de asesor financiero para Binance con Next.js, Vercel y GUI.

## Características

- **Spot balances**: Consulta de saldos en spot
- **Precios + variación 24h**: Datos de mercado en tiempo real
- **Simple Earn Flexible + Locked**: Productos de ahorro flexible y bloqueado
- **Dual Investment**: Catálogo de productos de inversión dual
- **1 recomendación accionable por corrida**: Sin auto-trade, solo sugerencias
- **Scheduler diario con Vercel Cron**: Ejecución automática diaria
- **Auditoría + notificaciones**: Registro histórico y alertas

## Stack Tecnológico

- **Next.js (App Router)** + TypeScript
- **Tailwind CSS** para la interfaz de usuario
- **Postgres** (Neon o Supabase) para persistencia
- **Email** (Resend) o Telegram opcional para notificaciones

## Estructura del Proyecto

```
binance-advisor/
  app/
    layout.tsx
    page.tsx
    dashboard/
      page.tsx
      components/
  app/api/
    recommend/route.ts
    cron/daily/route.ts
    binance/
  lib/
    binance/
    brain/
    db/
    config.ts
  public/
  vercel.json
  package.json
  tsconfig.json
  .env.example
  README.md
```

## Instalación Local

1. **Clonar el repositorio**:
```bash
git clone https://github.com/Samiriam/Proyecto-binance-asesor.git
cd Proyecto-binance-asesor
```

2. **Instalar dependencias**:
```bash
npm install
# o
pnpm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Binance:
```bash
BINANCE_API_KEY=tu_api_key
BINANCE_API_SECRET=tu_api_secret
APP_ADMIN_USER=admin
APP_ADMIN_PASS=tu_contraseña_segura
DATABASE_URL=tu_url_postgres
CRON_SECRET=tu_secreto_cron
```

4. **Ejecutar en desarrollo**:
```bash
npm run dev
# o
pnpm dev
```

## Validación y Smoke Test

### 1. Validación Básica (sin Binance)

1. Abre: `http://localhost:3000/login`
2. Entra con `APP_ADMIN_USER / APP_ADMIN_PASS`
3. Debe redirigir a `/dashboard`
4. Si abres `/dashboard` sin login, **debe bloquearte** (middleware OK).

### 2. Validación Binance (firmado y permisos)

#### 2.1 Prueba "public" primero
```bash
curl http://localhost:3000/api/binance/ticker24h
```
Debe responder JSON grande (ok).

#### 2.2 Prueba "signed" mínima (Spot)
```bash
curl http://localhost:3000/api/binance/account
```
Si falla:
- `-2015` suele ser permisos/clave inválida o restricciones IP.
- `-1021` suele ser timestamp (reloj desfasado).

#### 2.3 Validar timestamp (opcional)
```bash
curl http://localhost:3000/api/binance/time
```
Compara `serverTime` vs `localTime`. Si hay diferencia grande, ajusta `BINANCE_RECV_WINDOW`.

#### 2.4 Earn y Dual
```bash
curl http://localhost:3000/api/binance/earn/flexible
curl http://localhost:3000/api/binance/earn/locked
curl http://localhost:3000/api/binance/dual/list
```
Si estos devuelven vacío o error, puede ser que tu cuenta/región no tenga esos productos habilitados.

### 3. Recomendación End-to-End

```bash
curl -X POST http://localhost:3000/api/recommend
```

Criterios de OK:
- Responde **1** `recommendation.type`
- Trae `topFlexible[]` (si Earn disponible)
- Trae `topDual[]` (si Dual disponible)
- Incluye `generated_at`

### 4. Probar Endpoints

- `GET /api/binance/ticker24h` - Precios 24h
- `GET /api/binance/account` - Cuenta Binance
- `GET /api/binance/time` - Validar timestamp
- `POST /api/recommend` - Generar recomendación

## Despliegue en Vercel

1. **Subir el repositorio a GitHub**

2. **Importar en Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa el repositorio
   - Configura las **Environment Variables**
   - Deploy

3. **Configurar Cron Jobs**:
   - El archivo `vercel.json` ya incluye la configuración
   - El cron se ejecuta diariamente a las 12:00 UTC

4. **Probar cron manualmente**:
```bash
curl -X POST https://tu-app.vercel.app/api/cron/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

## Configuración de Base de Datos

### Opción 1: Postgres (Neon o Supabase)

```bash
# Neon
DATABASE_URL=postgresql://usuario:password@ep-nombre.region.aws.neon.tech/neondb?sslmode=require

# Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### Opción 2: Vercel KV (Redis)

```bash
# Instalar cliente
npm install @vercel/kv

# Usar en lugar de Postgres
```

## Seguridad

- **Firma HMAC SHA256**: Todos los endpoints firmados usan autenticación HMAC
- **Secrets**: Las credenciales nunca llegan al navegador
- **Rate limit**: Simple Earn Flexible tiene peso alto (150), se ejecuta 1 vez al día

## Riesgos y Controles

- **Dual Investment**: Riesgo de conversión. Modo moderado (max 30% y solo si diferencial >= 3pp)
- **Volatilidad**: Guardia de volatilidad 24h para activos no stable
- **No auto-trade**: Solo recomendaciones, el usuario decide ejecutar

## Troubleshooting

### Errores Comunes de Binance

| Código | Descripción | Solución |
|--------|-------------|-----------|
| `-2015` | API Key inválida o sin permisos | Verifica que la API Key tenga permisos de lectura y que no esté restringida por IP |
| `-1021` | Timestamp fuera de ventana | Ejecuta `GET /api/binance/time` para verificar el desfase. Aumenta `BINANCE_RECV_WINDOW` (máximo 10000) |
| `-1000` | Error desconocido | Verifica que los endpoints sean correctos para tu región |
| `403` | IP no autorizada | Agrega tu IP a la whitelist en Binance |

### Errores de Earn/Dual

Si `GET /api/binance/earn/flexible` o `GET /api/binance/dual/list` devuelven vacío:
- Verifica que tu cuenta tenga acceso a Simple Earn y Dual Investment
- Algunos productos no están disponibles en todas las regiones
- El sistema degradará a `NO_ACTION` automáticamente

### Caché en Vercel

Los endpoints de Binance usan `cache: "no-store"` para evitar respuestas en caché. Si ves datos desactualizados:
- Verifica que las variables de entorno estén configuradas en Vercel
- Limpia el caché de Vercel si es necesario

## Endpoints API

### Binance
- `GET /api/binance/ticker24h` - Precios 24h
- `GET /api/binance/account` - Cuenta y saldos
- `GET /api/binance/time` - Validar timestamp (debugging)
- `GET /api/binance/earn/flexible` - Simple Earn Flexible
- `GET /api/binance/earn/locked` - Simple Earn Locked
- `GET /api/binance/dual/list` - Dual Investment

### Recomendación
- `POST /api/recommend` - Generar recomendación completa

### Cron
- `POST /api/cron/daily` - Ejecución diaria (requiere auth)

## Referencias

- [Binance API Documentation](https://developers.binance.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Next.js App Router](https://nextjs.org/docs/app)

## Licencia

MIT
