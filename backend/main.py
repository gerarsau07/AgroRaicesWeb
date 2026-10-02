"""API de inferencia de rendimiento de cebada maltera para AgroRaicesWeb."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="AgroRaices API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    plot: str = Field(min_length=1)
    area: float = Field(gt=0, description="Hectáreas")
    temp: float
    ndwi: float
    evi: float
    lai: float


class PredictionResponse(BaseModel):
    rendimiento_t_ha: float
    rendimiento_kg_ha: int
    produccion_estimada_t: float
    estado: str


def estimar_rendimiento(temp: float, ndwi: float, evi: float, lai: float) -> float:
    """Heurística que replica la fórmula actualmente simulada en el frontend."""
    pred = 3.35 + (evi - 0.2) * 4 + (lai - 0.3) * 2.3 + (ndwi - 0.1) * 1.4 + (temp + 0.6) * 1.8
    return round(min(5.6, max(2.0, pred)), 2)


@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest) -> PredictionResponse:
    rend = estimar_rendimiento(req.temp, req.ndwi, req.evi, req.lai)
    if rend < 3.2:
        estado = "bajo"
    elif rend <= 4.2:
        estado = "promedio"
    else:
        estado = "alto"
    return PredictionResponse(
        rendimiento_t_ha=rend,
        rendimiento_kg_ha=int(rend * 1000),
        produccion_estimada_t=round(rend * req.area, 1),
        estado=estado,
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
