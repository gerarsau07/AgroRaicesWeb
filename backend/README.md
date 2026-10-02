# AgroRaices API (backend Python)

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

## Endpoints
- `POST /predict` — body JSON: `{ plot, area, temp, ndwi, evi, lai }` → rendimiento estimado.
- `GET /health` — chequeo de estado.
- Docs interactivas en `http://localhost:8000/docs`.

`POST /predict` actualmente replica la heurística del frontend; sustituir `estimar_rendimiento()` por el modelo entrenado (ElasticNetCV/XGBoost/MLP) cuando esté disponible.
