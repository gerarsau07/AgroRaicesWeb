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

## Endpoints
- `POST /predict` — body JSON: `{ plot, area, temp, ndwi, evi, lai, estado, municipio, elevacion, pendiente }` → predicción oficial.
- `POST /predict/upload-bundle` — subida y validación estricta de las 4 fuentes de datos (Parcelas, Satélite Básico, Satélite Pro, Topografía INEGI).
- `GET /predict/demo-dataset` — inferencia sobre las 59 parcelas sin rendimiento del dataset oficial.
- `GET /api/parcelas` o `GET /parcelas` — GeoJSON de las 197 parcelas con polígonos y métricas.
- `GET /health` — chequeo de salud y metadatos del modelo cargado.
- Documentación OpenAPI interactiva en `http://localhost:8000/docs`.
