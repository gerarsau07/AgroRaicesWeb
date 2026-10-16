---
name: agroraices-ui-design
description: Sistema de diseño y arquitectura UI/UX para AgroRaicesWeb (React 19, Tailwind CSS, Leaflet, FastAPI). Úsalo siempre que se creen o modifiquen componentes del frontend, mapas o gráficas.
---

# Sistema de Diseño: AgroRaicesWeb (AgTech GIS Dashboard)

## 1. Paleta de Colores y Estética
- **Tema Principal:** Modo Oscuro Técnico (Dark GIS Mode) para hacer resaltar las capas satelitales y los polígonos en Leaflet, o Modo Tierra/Agronómico Oscuro coherente con la identidad de AgroRaíces (`#16110d`, `#1b1410`, `#221913`), o Modo Claro Limpio (Clean Agronomic) con alto contraste.
- **Superficies:** `bg-slate-950` o `bg-[#1a130f]` (fondo base), `bg-slate-900/85 backdrop-blur-md` o `bg-[#271d17]/85 backdrop-blur-md` (paneles flotantes sobre el mapa con glassmorphism), bordes sutiles `border-slate-800` o `border-[#4a382c]`.
- **Acentos semánticos:**
  - Primario / Vegetación saludable (LAI/NDWI alto, alto potencial `> 4.35 t/ha`): `emerald-500` / `teal-400`.
  - Marca / Acento editorial cálido (Cebada y Tierra): `#d87a52` (terracota), `#b85c38` (cobre), `#e2b957` (dorado malta).
  - Alerta hídrica / Temperatura Landsat elevada / Bajo potencial (`< 3.30 t/ha`): `amber-500` a `rose-500`.
  - Interacción / Controles de datos y laboratorio SHAP: `sky-500`.

## 2. Reglas de Componentes (React 19 + Tailwind CSS v4)
- Usa componentes modulares, tipados con TypeScript estricto y limpios.
- Directiva `'use client'` obligatoria en componentes interactivos, formularios, gráficas y visores Leaflet.
- **Iconografía:** Usa `lucide-react` con trazos consistentes (`strokeWidth={1.75}`).
- **Tipografía:** `Inter`, `Plus Jakarta Sans` o `Geist` para UI; usa fuente monoespaciada (`JetBrains Mono` o `font-mono` con `tabular-nums`) para coordenadas WGS84, hectáreas, elevación (msnm), pesos SHAP ($\phi_i$) y métricas de rendimiento (`t/ha`, `kg/ha`).
- **Carga y Formularios:** Aprovecha patrones modernos de React 19 (`useActionState`, `useOptimistic` o estados de transición claros) con esqueletos de carga (`animate-pulse`) mientras FastAPI procesa los `.tif`, `.shp` y `.csv` o mientras Google Gemini genera la explicación para el agricultor.

## 3. Visor Geoespacial (Leaflet) y Gráficas
- Importar mapas siempre de forma dinámica sin SSR (`dynamic(() => import(...), { ssr: false })`).
- Ocultar controles de zoom y atribución predeterminados de Leaflet cuando se usen controles personalizados flotantes.
- Todo el texto visible para el usuario, etiquetas, tooltips y diagnósticos debe estar en **español**.
