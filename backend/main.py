"""API de inferencia y datos geoespaciales de rendimiento de cebada maltera para AgroRaicesWeb."""

from pathlib import Path
import csv
import re
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="AgroRaices API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Elevaciones promedio aproximadas por municipio (m s.n.m. - Altiplano Central)
ELEVACIONES_MUNICIPIO: Dict[str, float] = {
    "Chignahuapan": 2260.0,
    "Almoloya": 2520.0,
    "Apan": 2488.0,
    "Cuautepec de Hinojosa": 2250.0,
    "Emiliano Zapata": 2490.0,
    "Singuilucan": 2620.0,
    "Tepeapulco": 2500.0,
    "Calpulalpan": 2580.0,
    "Nanacamilpa de Mariano Arista": 2720.0,
}


def resolver_ruta_datos(nombre_archivo: str) -> Path:
    """Busca el archivo de datos usando rutas relativas seguras."""
    directorio_actual = Path(__file__).resolve().parent
    candidatos = [
        directorio_actual / "data" / nombre_archivo,
        directorio_actual.parent / "data" / nombre_archivo,
        Path("data") / nombre_archivo,
    ]
    for ruta in candidatos:
        if ruta.exists():
            return ruta
    raise FileNotFoundError(f"No se encontró el archivo de datos: {nombre_archivo}")


def parse_wkt_polygon(wkt: str) -> Optional[List[List[List[float]]]]:
    """Convierte WKT POLYGON / POLYGON Z a coordenadas GeoJSON [[[lon, lat], ...]]."""
    m = re.search(r"\(\((.*?)\)\)", wkt)
    if not m:
        return None
    coord_str = m.group(1).strip()
    points: List[List[float]] = []
    for pt in coord_str.split(","):
        parts = pt.strip().split()
        if len(parts) >= 2:
            try:
                lon = float(parts[0])
                lat = float(parts[1])
                points.append([lon, lat])
            except ValueError:
                continue
    if len(points) < 3:
        return None
    return [points]


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
    """Heurística que replica la fórmula de predicción basada en índices espectrales."""
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


@app.get("/api/parcelas")
@app.get("/parcelas")
def get_parcelas(estado: Optional[str] = Query(None, description="Filtrar por estado (Puebla, Hidalgo, Tlaxcala)")):
    """
    Carga parcelas.csv e ID_area_rendimiento...csv usando rutas relativas,
    unifica los registros por ID_POLIGONO y devuelve GeoJSON con métricas agregadas.
    """
    ruta_parcelas = resolver_ruta_datos("parcelas.csv")
    ruta_rendimiento = resolver_ruta_datos("ID_area_rendimiento_70_30_Reto_AgroCebada.csv")

    rend_map: Dict[str, Dict[str, Any]] = {}
    with open(ruta_rendimiento, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            pid = (r.get("ID_POLIGONO") or r.get("\ufeffID_POLIGONO") or "").strip()
            if pid:
                rend_map[pid] = r

    features: List[Dict[str, Any]] = []
    total_area_ha = 0.0
    rendimientos_conocidos: List[float] = []
    elevaciones: List[float] = []

    with open(ruta_parcelas, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for r in reader:
            est_raw = (r.get("Estado") or "").strip()
            if estado and est_raw.lower() != estado.strip().lower():
                continue

            pid = (r.get("ID_POLIGON") or r.get("ID_POLIGONO") or "").strip()
            wkt = r.get("geometry") or ""
            coords = parse_wkt_polygon(wkt)
            if not coords:
                continue

            try:
                area_ha = float(r.get("área_ha") or r.get("area_ha") or 0.0)
            except ValueError:
                area_ha = 0.0

            muni = (r.get("Municipio") or "").strip()
            elevacion_msnm = ELEVACIONES_MUNICIPIO.get(muni, 2450.0)

            rend_info = rend_map.get(pid, {})
            rend_val_raw = rend_info.get("RENDIMIENTO_T_HA") or ""
            conjunto = (rend_info.get("CONJUNTO") or r.get("CONJUNTO") or "").strip()

            if rend_val_raw:
                try:
                    rendimiento_t_ha = round(float(rend_val_raw), 2)
                    es_prediccion = False
                    rendimientos_conocidos.append(rendimiento_t_ha)
                except ValueError:
                    rendimiento_t_ha = 3.65
                    es_prediccion = True
            else:
                # Valor estimado referencial para parcelas del conjunto de predicción
                rendimiento_t_ha = 3.65
                es_prediccion = True

            total_area_ha += area_ha
            elevaciones.append(elevacion_msnm)

            # Clasificación cualitativa
            if rendimiento_t_ha < 3.2:
                nivel_rendimiento = "Bajo (< 3.2 t/ha)"
            elif rendimiento_t_ha <= 4.2:
                nivel_rendimiento = "Promedio (3.2 - 4.2 t/ha)"
            else:
                nivel_rendimiento = "Alto (> 4.2 t/ha)"

            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": coords,
                },
                "properties": {
                    "id_poligono": pid,
                    "cultivo": (r.get("Cultivo") or "Cebada").capitalize(),
                    "area_ha": round(area_ha, 2),
                    "municipio": muni,
                    "estado": est_raw,
                    "conjunto": conjunto,
                    "rendimiento_t_ha": rendimiento_t_ha,
                    "es_prediccion": es_prediccion,
                    "elevacion_msnm": elevacion_msnm,
                    "nivel_rendimiento": nivel_rendimiento,
                },
            }
            features.append(feature)

    rendimiento_promedio = (
        round(sum(rendimientos_conocidos) / len(rendimientos_conocidos), 2)
        if rendimientos_conocidos
        else 0.0
    )
    elevacion_promedio = (
        round(sum(elevaciones) / len(elevaciones), 1) if elevaciones else 0.0
    )

    return {
        "filtro_estado": estado or "Todos",
        "metricas": {
            "total_parcelas": len(features),
            "rendimiento_promedio_t_ha": rendimiento_promedio,
            "superficie_total_ha": round(total_area_ha, 2),
            "elevacion_promedio_msnm": elevacion_promedio,
            "parcelas_con_rendimiento_real": len(rendimientos_conocidos),
            "parcelas_para_prediccion": len(features) - len(rendimientos_conocidos),
        },
        "geojson": {
            "type": "FeatureCollection",
            "features": features,
        },
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
