# AGENTS.md - AgroRaicesWeb

## Stack real de este repo
- Next.js 16 (App Router) + React 19 + Tailwind CSS v4 (vía `@tailwindcss/postcss`).
- TypeScript 5.7 estricto, alias `@/*` → raíz del repo.
- UI shadcn (`components.json`, estilo `base-nova`, `components/ui`, util `lib/utils.ts` con `cn()`).
- Sitio en español (`<html lang="es">`); todo el contenido visible es en español.

## Comandos
- Gestor de paquetes: **pnpm** (`packageManager: pnpm@12.3.4`). Hay también `package-lock.json`; no usar npm, puede desincronizar.
- `pnpm dev` — dev server; `pnpm build` — producción; `pnpm start`.
- No hay scripts de lint, test ni typecheck. Verificación manual: `pnpm build` (ojo, ver abajo) y `npx tsc --noEmit`.

## Gotchas importantes
- `next.config.mjs` tiene `typescript.ignoreBuildErrors: true` y `images.unoptimized: true` → **`pnpm build` NO falla por errores de TypeScript**. Ejecuta `npx tsc --noEmit` aparte si cambias tipos.
- `pnpm-workspace.yaml` define `minimumReleaseAgeExclude` para `next`/`@next/*`; el resto de paquetes respeta política de edad mínima de release.
- Rutas: `/` (`app/page.tsx`), `/inferencia`, `/modelo`, `/nosotros`, `/mapa`, `/mapa-rendimiento`. La mayoría de la home vive en `components/agro-raices.tsx` (componente grande, ~30KB; Navbar/Footer se importan de ahí en `app/layout.tsx`).
- `PredictionForm` está conectado al backend (`POST /api/predict` / API externa o fallback local).
- `components/agro-raices.tsx` concentra todas las vistas de la home.
- `backend/` contiene la API FastAPI (`main.py`, modelo V6 `modelo_agroraices_v6.joblib`, `POST /predict`, `GET /parcelas`, `GET /health`). Corre con `uvicorn main:app --reload --port 8000` desde `backend/`.
- Visor geoespacial interactivo implementado con **Leaflet** (`components/mapa-parcelas.tsx` y `components/mapa-view.tsx`).

## Convenciones
- Componentes interactivos/cliente: `'use client'` obligatorio.
- Documentación, comentarios y mensajes de commit en **español**.
- Imágenes en `public/`; iconos y metadata definidos en `app/layout.tsx`.
