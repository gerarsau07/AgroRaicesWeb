# AgroRaíces API (Backend Python · QBAF + DF-QuAD + SHAP + Campaña 2026)

API FastAPI y motor científico de entrenamiento, explicabilidad **SHAP** y proyección agroclimática **2026** para las **197 parcelas** de cebada maltera (*Reto AgroCebada 2026*).

## 1. Instalación y Ejecución
```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 2. Artefactos y Scripts del Modelo (`backend/routers/` y `backend/scripts/`)
- `routers/empaquetar_modelo_agroraices_final.py`: Entrena los árbitros regionales **QBAF + DF-QuAD**, ejecuta la validación cruzada OOF ($K=3$) y calcula la descomposición aditiva **SHAP** ($\phi_0 + \sum \phi_i = \hat{y}$) para las 197 parcelas.
- `scripts/generar_covariables_2026.py`: Separa las variables estáticas fijas (**INEGI CEM 4.0** + geometría WKT) de las variables dinámicas del ciclo **Abril – Octubre 2026** (pronósticos por coordenadas **OpenWeather / Open-Meteo Climate API** con *downscaling* adiabático $-0.0065\ ^\circ\text{C/m}$ + conector **Google Earth Engine** Sentinel-2/Landsat) y genera las 197 predicciones de la campaña 2026.
- `routers/modelo_agroraices_final.joblib` y `routers/modelo_metadata.json`:
  - **Métricas Oficiales OOF**: $r = 0.8584$, $R^2 = 0.7362$ ($73.62\%$), $\text{MAE} = 296.3\text{ kg/ha}$, $\text{RMSE} = 435.6\text{ kg/ha}$.
  - **Hidalgo (51 parcelas)**: `GradientBoosting` ($\sigma=0.75$) + Prior Bayesiano Municipal + `SVR RBF` ($\sigma=0.25$).
  - **Puebla (100 parcelas)**: Deliberación Dual (`SVR + Huber + GPR + ExtraTrees` + `PLS k=2`) con **Undercutting en Capa 0** ($\sigma_{\text{ET}}=0.001$ cuando $\text{NDVI} > P_{75}$).
  - **Tlaxcala (46 parcelas)**: Anclaje Modal Regional $3.00\text{ t/ha}$ ($\sigma=0.55$) + `SVC Ordinal Probabilístico` ($\sigma=0.45$).
- `routers/predicciones_2026_meta.json` y `data/agrocebada/predicciones_197_parcelas_2026.csv`: Telemetría y matriz completa de predicciones 2026 para las 197 parcelas (`138 ENTRENAMIENTO` + `59 PREDICCION`).

## 3. Endpoints Principales
- `POST /predict` — Inferencia individual y descomposición aditiva SHAP en vivo.
- `GET /predict/demo-dataset` — Auditoría SHAP grupal e individual filtrada por subconjunto (`PREDICCION`, `ENTRENAMIENTO`, `TODOS`), estado y grupo homogéneo.
- `POST /predict/upload-bundle` — Procesamiento nativo de lotes `.zip` (Shapefiles `.shp` y GeoTIFFs `.tif`) y `.csv`.
- `GET /api/parcelas` — GeoJSON de las 197 parcelas enriquecido con telemetría 2025, proyecciones 2026 y explicabilidad SHAP.
- `GET /health` — Estado del motor e inventario de fuentes activas.
