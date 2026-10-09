# AGENTS.md - AgroRaicesWeb

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS v4** (via `@tailwindcss/postcss`).
- **TypeScript 5.7** estricto, alias `@/*` → raíz del repo (`tsconfig.json`).
- UI via **shadcn** (`components.json`, estilo `base-nova`, `components/ui`, util `lib/utils.ts` con `cn()`).
- Sitio en español (`<html lang="es">`); todo el contenido visible es en español.

## Comandos

- Gestor de paquetes: **pnpm** (`packageManager: pnpm@12.3.4`); no usar npm (puede desincronizar).
- `pnpm dev` — dev server; `pnpm build` — producción; `pnpm start`.
- **No hay scripts de lint, test ni typecheck definidos en package.json.** Verificación manual: `pnpm build` (no falla por errores de TS por `ignoreBuildErrors`, pero ejecuta `npx tsc --noEmit` aparte si cambias tipos) y `uvicorn main:app --reload --port 8000` desde `backend/` para la API.

## Gotchas importantes

- `next.config.mjs` tiene `typescript.ignoreBuildErrors: true` e `images.unoptimized: true` → **`pnpm build` NO falla por errores de TypeScript**. Ejecuta `npx tsc --noEmit` aparte si cambias tipos.
- `pnpm-workspace.yaml` define `minimumReleaseAgeExclude` para `next`/`@next/*`; el resto de paquetes respeta política de edad mínima de release.
- Rutas: `/` (`app/page.tsx`), `/inferencia` (redirige a `/modelo`), `/modelo` (`PredictionForm`), `/nosotros`.
- **`PredictionForm` simula la inferencia** con `window.setTimeout` (800ms); el `POST /predict` en `backend/main.py` está listo para recibir `fetch` desde el frontend.
- `components/agro-raices.tsx` concentra Navbar, Hero, HomeCards, About, ModelSpecs, PredictionForm y Footer (~700 líneas). `AgroRaicesApp()` es una vista compuesta sin uso en rutas actuales.
- `backend/` contiene la API **FastAPI** (`main.py`, `POST /predict`, `GET /health`). Corre con `uvicorn main:app --reload --port 8000` desde `backend/`. La heurística de `estimar_rendimiento()` replica la fórmula hasta que exista modelo entrenado.
- Datos del backend en `backend/data/` (parcelas.csv, ID_area_rendimiento_70_30_Reto_AgroCebada.csv, etc.). Rutas resolvidas relativas via `resolver_ruta_datos()`.
- **No hay motor de mapas compilado** en la home. `leaflet` y `@types/leaflet` son dependencias pero no se usan en componentes activos. Si añades mapas: **Client Component** + `next/dynamic` con `ssr: false`, y GeoJSON en `EPSG:4326`.

## Convenciones

- Componentes interactivos/cliente: **`'use client'` obligatorio**.
- Documentación, comentarios y mensajes de commit en **español**.
- Imágenes en `public/`; iconos y metadata definidos en `app/layout.tsx`.
- Variables de entrada del formulario: `plot` (texto), `area` (hectáreas), `temp` (NDVI/VI6t max), `ndwi` (índice de agua), `evi` (verdor), `lai` (área foliar). Valores típicos en los componentes.