# AgroRaíces · Plataforma de Inteligencia Geoespacial y Explicable (AgroCebada 2026)

Plataforma web e infraestructura de Inteligencia Artificial Explicable (**XAI**) para la estimación y auditoría del rendimiento de **cebada maltera** en las **197 parcelas** del Altiplano Central de México (**Puebla, Hidalgo y Tlaxcala**).

---

## 1. Arquitectura Tecnológica

| Capa | Tecnología | Función en el Sistema |
| :--- | :--- | :--- |
| **Frontend & UI** | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Leaflet | Visor geoespacial interactivo (`EPSG:4326`), asistente guiado para el **Agricultor** ("Mapa-Primero") y laboratorio técnico para el **Analista**. |
| **Modelo Predictivo (XAI)** | Arquitectura Neuro-Simbólica **QBAF + DF-QuAD** (`scikit-learn` / `joblib`) | Tres árbitros regionales especializados por estado con deliberación gradual y mecanismo de *undercutting* en Capa 0 ($\text{NDVI} > P_{75}$). |
| **Explicabilidad Matemática** | **SHAP** (`shap.Explainer`, $\phi_0 + \sum \phi_i = \hat{y}$) | Descomposición aditiva exacta en $\text{kg/ha}$ para casos particulares, grupos de parcelas ($\text{mean } |\text{SHAP}|$) y proyecciones 2026. |
| **Asesor IA Generativo** | **Google Gemini (`gemini-3.8-flash`)** (`/api/explicar-agricultor`) | Valida los pesos matemáticos de SHAP y los traduce en un diagnóstico claro, empático y **100% libre de tecnicismos** para el agricultor. |
| **Motor de Proyección 2026** | `backend/scripts/generar_covariables_2026.py` | Separa la fisiografía fija (**INEGI CEM 4.0**) de las señales dinámicas 2026 (**OpenWeather / Open-Meteo Climate API** + **Google Earth Engine**). |
| **Backend Híbrido** | Python **FastAPI** (`backend/main.py`) + Next.js Serverless Routes | Procesamiento nativo de `.zip`, `.shp` y GeoTIFFs `.tif` en local, y lectura instantánea de artefactos precalculados (`.json`/`.csv`) en **Vercel**. |

---

## 2. Funcionamiento por Perfil: Agricultor vs. Analista

### A. Perfil «Soy Agricultor» (Enfoque Visual y Cero Tecnicismos)
Diseñado para productores en campo que buscan conocer cuánto va a rendir su parcela, por qué y cómo cuidarla, sin lidiar con nombres de sensores ni fórmulas matemáticas:
1. **Selección Guiada (Pasos 1 a 3)**: El productor elige su **Estado** (Puebla, Hidalgo o Tlaxcala), su **Municipio** y su **Temporada de cultivo** (Ciclo Principal Abril – Octubre 2026 o fechas personalizadas). El mapa satelital vuela automáticamente a su municipio.
2. **Ubicación «Mapa-Primero» o Manual (Paso 4)**:
   - **Camino A (En el Mapa Satelital)**: El agricultor toca su parcela directamente sobre la fotografía satelital. Aparece un globo de confirmación simple: *«¿Es esta tu parcela? Tiene aproximadamente X hectáreas»* con botones **`Sí, esta es`** o **`No, buscar otra`**.
   - **Camino B (Ingreso Manual)**: Si su terreno no está entre los 197 polígonos, ingresa sus hectáreas, tipo de relieve y régimen de agua.
3. **Diagnóstico Explicado por IA (Paso 5)**:
   - Muestra el **Rendimiento Proyectado (`t/ha`)**, la **Cosecha Total en toneladas**, el equivalente en **costales de 50 kg** y la comparativa frente al promedio de su municipio.
   - **Explicación validada por Google Gemini (`gemini-3.8-flash`)**: Toma las 4 variables que **SHAP** identificó con mayor peso en esa parcela y redacta un resumen sin tecnicismos indicando **qué favoreció la cosecha (`+ kg/ha`)**, **qué jugó en contra (`- kg/ha`)**, qué problemas puede causar en la planta y qué recomendaciones prácticas aplicar.
   - Permite descargar su **Ficha del Productor (CSV)**.

### B. Perfil «Soy Analista» (Auditoría Matemática SHAP y Proyección 2026)
Diseñado para agrónomos, investigadores y tomadores de decisiones que requieren transparencia algorítmica completa:
1. **Pestaña 1 · Casos Particulares y Simulación en Vivo (`SHAP Individual`)**:
   - Permite elegir cualquiera de las 197 parcelas (incluyendo los 9 casos particulares destacados de prueba ciega) y ajustar en vivo parámetros espectrales (`VI6T`, `NDWI`, `DSWI2`, `LAI`, `NDVI`, `STI`, `Área`).
   - Muestra la ecuación aditiva exacta **$\phi_0 + \sum \phi_i = \hat{y}$**, el estado del árbitro **QBAF + DF-QuAD** (incluyendo si el *undercutting* en Capa 0 está activo) y las barras divergentes de contribución de cada variable en $\text{kg/ha}$.
2. **Pestaña 2 · Análisis con Grupos de Parcelas (`SHAP Grupal`)**:
   - Permite filtrar el universo de parcelas por **Subconjunto** (`Prueba Ciega · 59 Parcelas`, `Entrenamiento · 138 Parcelas`, `Catálogo Completo · 197 Parcelas`), **Estado**, **Municipio** y **Nivel de Rendimiento** (`Alto > 4.35 t/ha`, `Medio 3.30–4.35 t/ha`, `Bajo < 3.30 t/ha`).
   - Calcula en tiempo real el **Ranking de Importancia SHAP del Grupo ($\text{mean } |\text{SHAP}|$ en $\text{kg/ha}$)**, permite inspeccionar cualquier predio de la tabla y exportar la auditoría completa en CSV.
3. **Pestaña 3 · Predicción Próximo Año (`Campaña 2026 · 197 Parcelas`)**:
   - Permite ejecutar y simular la predicción completa del ciclo **Abril – Octubre 2026** sobre las **197 parcelas** (tanto las 138 de entrenamiento como las 59 ocultas del reto).
   - Incluye selector de escenarios climáticos 2026 (*Pronóstico Oficial API*, *Escenario Húmedo Favorable*, *Sequía Moderada y Calor*, *Helada Tardía en Abril*) y controles deslizantes de $\Delta\text{ Temperatura (°C)}$ y $\Delta\text{ Precipitación (%)}$.
   - Audita la separación entre **Variables Estáticas Fijas (`INEGI CEM 4.0`)** y **Variables Dinámicas Creadas (`Clima API + GEE Satélite 2026`)**, con comparativa 2026 vs. 2025 por estado y exportación a CSV.

---

## 3. Estructura de Archivos Clave

```text
AgroRaícesWeb/
├── app/
│   ├── page.tsx                          # Página de Inicio (Hero, Carrusel full-width, Regiones, Comparativa)
│   ├── nosotros/page.tsx                 # Página Nosotros (Filosofía XAI, Analogía SHAP y Arquitectura)
│   ├── mapa/page.tsx                     # Visor Geoespacial, Asistente Agricultor y Laboratorio Analista
│   └── api/
│       ├── parcelas/route.ts             # GeoJSON de las 197 parcelas enriquecido con telemetría 2025/2026
│       ├── predict/route.ts              # Inferencia QBAF + DF-QuAD + SHAP (individual, grupal y campaña 2026)
│       └── explicar-agricultor/route.ts  # Conector con Google Gemini (gemini-3.8-flash) para el Agricultor
├── components/
│   ├── mapa-parcelas.tsx                 # Componente principal del Mapa, Asistente Agricultor y Lab Analista
│   ├── scroll-world.tsx                  # Carrusel interactivo a ancho completo en Inicio
│   ├── home-page-rebuild.tsx             # Secciones informativas de la página de Inicio
│   └── agro-raices.tsx                   # Navbar, Footer y secciones XAI/SHAP de Nosotros
├── lib/
│   └── agronomy-translations.ts          # Diccionario de traducción agronómica de variables SHAP sin tecnicismos
└── backend/
    ├── main.py                           # API FastAPI de geoprocesamiento e inferencia QBAF + DF-QuAD + SHAP
    ├── scripts/
    │   └── generar_covariables_2026.py   # Motor ETL de ingesta climática/satelital 2026 para las 197 parcelas
    ├── routers/
    │   ├── empaquetar_modelo_agroraices_final.py # Entrenamiento y serialización oficial del modelo y SHAP
    │   ├── modelo_agroraices_final.joblib        # Modelo QBAF + DF-QuAD serializado
    │   ├── modelo_metadata.json                  # Telemetría OOF (r=0.8584, R²=73.62%, MAE=296.3 kg/ha) y SHAP
    │   └── predicciones_2026_meta.json           # Proyecciones y descomposición SHAP 2026 de las 197 parcelas
    └── data/
        ├── parcelas.csv                          # Geometrías WKT y metadatos de las 197 parcelas
        ├── topografia_inegi_cem4_parcelas.csv    # Matriz topográfica INEGI CEM 4.0 y cubo climático CHIRTS-ERA5
        └── agrocebada/                           # Dataset original del reto + predicciones_197_parcelas_2026.csv
```

---

## 4. Configuración e Instalación

### Variables de Entorno (`.env` local y Vercel)
Crea un archivo `.env` en la raíz del proyecto (ignorado automáticamente por `.gitignore` para no exponer llaves en GitHub) o registra la variable en **Vercel -> Settings -> Environment Variables**:

```env
GEMINI_API_KEY=tu_clave_de_google_ai_studio_aqui
GEMINI_MODEL=gemini-3.8-flash
```

### Ejecutar el Frontend (Next.js)
```bash
pnpm install
pnpm dev
```
*Verificación de tipos y compilación de producción:*
```bash
npx tsc --noEmit
pnpm build
```

### Ejecutar o Re-empaquetar el Backend en Python (Opcional en local)
```powershell
# Regenerar las covariables y predicciones de la campaña 2026 (197 parcelas):
py backend/scripts/generar_covariables_2026.py

# Levantar el servidor FastAPI en el puerto 8000:
cd backend
uvicorn main:app --reload --port 8000
```
