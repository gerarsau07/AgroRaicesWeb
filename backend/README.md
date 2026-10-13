# AgroRaices API (backend Python - Pipeline Oficial)

API FastAPI de inferencia para estimación de rendimiento de cebada maltera (*Reto AgroCebada 2026*).

## Setup
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Ejecutar
```powershell
uvicorn main:app --reload --port 8000
```

## Artefactos del Modelo
- `routers/modelo_agroraices_final.joblib`: Modelo serializado final con especialistas desacoplados por entidad:
  - **Hidalgo**: ExtraTrees (75%) + SVR RBF (25%) con prior bayesiano municipal y downscaling adiabático CHIRTS-ERA5.
  - **Puebla**: Ensamble dual (Base 50% + PLS k=2 50%) con SVR (45%) + Huber (35%) + GPR (15%) + ExtraTrees (5%).
  - **Tlaxcala**: Clasificador ordinal probabilístico SVC (45%) + anclaje a mediana regional de 3.0 t/ha (55%).
- `routers/modelo_metadata.json`: Metadatos de desempeño OOF ($r = 0.8535$, $R^2 = 0.7276$, $\text{MAE} = 307.0\text{ kg/ha}$) y municipios soportados.

## Fuentes de Datos Base (`backend/data/agrocebada/`)
El backend procesa directamente el dataset original en su forma base (`.zip` con Shapefiles y capas GeoTIFF `.tif` + `.csv`):
1. `Parcelas_Reto_AGC_CONJUNTO_70_30.zip` — Shapefile vectorial (`Parcelas_Reto_AGC_CONJUNTO.shp/.dbf/.shx/.prj`) de las 197 parcelas, del cual el backend extrae los polígonos WKT, área (`AREA_HA`), conjunto (`ENTRENAMIENTO` / `PREDICCION`), centroides, elongación UTM (`EPSG:32614`), rugosidad (`proxy_relieve_m`) y genera automáticamente `backend/data/parcelas.csv`.
2. `Conjunto_datos_BASICO_AgroCebada2026.csv` — Series multitemporales Sentinel-2 y Landsat (2022–2025).
3. `Conjunto_datos_PRO_AgroCebada.csv` — Series PlanetScope de 3 m (2025).
4. `Reto_AgroCebada_Topografia_INEGI_CEM4.zip` — Rásters GeoTIFF `Elevacion_INEGI_CEM4_120m.tif` y `Pendiente_INEGI_CEM4_120m_grados.tif` (`EPSG:6372`), recortados por polígono mediante `rasterio.mask.mask`.
5. `Reto_AgroCebada_Temperatura_2022_2025_RECORTADA_CHIRPS.zip` — 96 rásters GeoTIFF mensuales (`Tmax_YYYY_MM.tif` y `Tmin_YYYY_MM.tif`, 2022–2025), muestreados con interpolación bilineal sub-píxel (`bi_*`), vecino más cercano (`nn_*`), *downscaling* adiabático (`lp_*`), temperaturas cardinales y acoplamiento fenológico.

## Endpoints
- `POST /predict` — body JSON: `{ plot, area, temp, ndwi, evi, lai, estado, municipio, elevacion, pendiente }` → predicción oficial.
- `POST /predict/upload-bundle` — recibe y procesa en tiempo real los `.zip` (con `.shp` y `.tif`) y `.csv` del dataset base.
- `GET /predict/demo-dataset` — inferencia sobre las 59 parcelas del conjunto `PREDICCION` procesadas desde `backend/data/agrocebada/`.
- `GET /api/parcelas` o `GET /parcelas` — GeoJSON de las 197 parcelas con polígonos, telemetría espectral/topográfica y estimaciones del modelo.
- `GET /health` — chequeo de salud y metadatos del modelo cargado.
- Documentación OpenAPI interactiva en `http://localhost:8000/docs`.
