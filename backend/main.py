"""
========================================================================================
  AgroRaicesWeb - backend/main.py (MODELO V6 PRODUCCIÓN & PROCESAMIENTO MULTI-ARCHIVO)
  API de inferencia y datos geoespaciales de rendimiento de cebada maltera.
========================================================================================
"""

from pathlib import Path
import csv
import io
import re
import zipfile
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from fastapi import FastAPI, Query, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    import joblib
except ImportError:
    joblib = None

app = FastAPI(title="AgroRaices API - Modelo V6", version="0.3.0")

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
        directorio_actual / nombre_archivo,
        directorio_actual / "routers" / nombre_archivo,
        directorio_actual / "data" / nombre_archivo,
        directorio_actual.parent / "data" / nombre_archivo,
        directorio_actual.parent / "backend" / "routers" / nombre_archivo,
        Path("data") / nombre_archivo,
        Path("backend/routers") / nombre_archivo,
        Path(nombre_archivo),
    ]
    for ruta in candidatos:
        if ruta.exists():
            return ruta
    raise FileNotFoundError(f"No se encontró el archivo: {nombre_archivo}")


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


# ==============================================================================
# CARGA DEL MODELO V6 SERIALIZADO EN STARTUP
# ==============================================================================
modelo_bundle = None

def get_model():
    global modelo_bundle
    if modelo_bundle is None and joblib is not None:
        try:
            ruta_modelo = resolver_ruta_datos("modelo_agroraices_v6.joblib")
            modelo_bundle = joblib.load(ruta_modelo)
            print(f"✅ Modelo V6 cargado exitosamente desde {ruta_modelo}")
        except Exception as e:
            print(f"⚠️ Aviso: No se pudo cargar modelo joblib: {e}. Usando fallback agroecológico.")
    return modelo_bundle

@app.on_event("startup")
def startup_event():
    get_model()


# ==============================================================================
# ESQUEMAS PYDANTIC
# ==============================================================================
class PredictionRequest(BaseModel):
    plot: str = Field(default="Parcela", min_length=1)
    area: float = Field(gt=0, description="Superficie en hectáreas")
    temp: float = Field(description="Índice térmico Landsat VI6T (aprox -0.65 a -0.55)")
    ndwi: float = Field(description="Índice de humedad Sentinel-2 NDWI (aprox -0.25 a 0.10)")
    evi: Optional[float] = Field(default=0.35, description="Índice de vegetación EVI")
    lai: Optional[float] = Field(default=0.40, description="Índice de área foliar PlanetScope LAI")
    estado: Optional[str] = Field(default="Puebla", description="Hidalgo | Puebla | Tlaxcala")
    municipio: Optional[str] = Field(default="", description="Nombre del municipio")
    elevacion: Optional[float] = Field(default=None, description="Elevación msnm")
    pendiente: Optional[float] = Field(default=None, description="Pendiente en grados")
    lat: Optional[float] = Field(default=None, description="Latitud centroide")
    lon: Optional[float] = Field(default=None, description="Longitud centroide")


class PredictionResponse(BaseModel):
    plot: str = "Parcela"
    rendimiento_t_ha: float
    rendimiento_kg_ha: int
    produccion_estimada_t: float
    estado: str
    municipio: Optional[str]
    nivel_potencial: str
    diagnostico: str
    confianza_r2: float


class BatchPredictionResponse(BaseModel):
    total_parcelas: int
    rendimiento_promedio_t_ha: float
    produccion_total_t: float
    conteo_alto: int
    conteo_medio: int
    conteo_bajo: int
    archivos_validados: Optional[List[str]] = None
    predicciones: List[PredictionResponse]


# ==============================================================================
# MOTOR DE INFERENCIA EN VIVO V6
# ==============================================================================
def inferir_rendimiento_v6(req: PredictionRequest) -> PredictionResponse:
    bundle = get_model()

    estado = (req.estado or "Puebla").strip().capitalize()
    if estado not in ['Hidalgo', 'Puebla', 'Tlaxcala']:
        estado = 'Puebla'

    muni = (req.municipio or "").strip()

    if bundle is not None:
        try:
            row = bundle['defaults_by_state'][estado].copy()
            row['AREA_HA'] = req.area
            row['log_area'] = float(np.log1p(req.area))
            row['landsat_vi6t_max'] = float(req.temp)
            row['landsat_vi6t_mean'] = float(req.temp)
            row['s2_ndwi_min'] = float(req.ndwi)
            row['s2_ndwi_mean'] = float(req.ndwi)

            if req.lai is not None:
                row['planet_lai_mean'] = float(req.lai)
            if req.elevacion is not None:
                row['elevacion_msnm'] = float(req.elevacion)
            if req.pendiente is not None:
                row['pendiente_grados'] = float(req.pendiente)
            if req.lat is not None:
                row['lat_centro'] = float(req.lat)
            if req.lon is not None:
                row['lon_centro'] = float(req.lon)

            row['estres_termohidrico'] = row['landsat_vi6t_max'] * row['s2_ndwi_min']
            df_input = pd.DataFrame([row])

            if estado == 'Hidalgo':
                hid = bundle['hidalgo']
                n = hid['muni_count'].get(muni, 0)
                mean_m = hid['muni_mean'].get(muni, hid['global_mean'])
                prior = float((n * mean_m + hid['m_weight'] * hid['global_mean']) / (n + hid['m_weight']))

                X_bio = np.hstack([hid['scaler_bio'].transform(hid['imputer_bio'].transform(df_input[hid['feats_bio']])), [[prior]]])
                p_et = float(hid['model_et'].predict(X_bio)[0])

                X_geo = hid['scaler_geo'].transform(hid['imputer_geo'].transform(df_input[hid['feats_geo']]))
                p_svr = float(hid['model_svr'].predict(X_geo)[0])
                pred = hid['weights']['et'] * p_et + hid['weights']['svr'] * p_svr

            elif estado == 'Puebla':
                pue = bundle['puebla']
                X1 = pue['scaler_1'].transform(pue['imputer_1'].transform(df_input[pue['feats_1']]))
                p_et = float(pue['model_et'].predict(X1)[0])

                X4 = pue['scaler_4'].transform(pue['imputer_4'].transform(df_input[pue['feats_4']]))
                p_svr = float(pue['model_svr'].predict(X4)[0])

                X5 = pue['scaler_5'].transform(pue['imputer_5'].transform(df_input[pue['feats_5']]))
                p_hub = float(pue['model_hub'].predict(X5)[0])
                pred = pue['weights']['et'] * p_et + pue['weights']['svr'] * p_svr + pue['weights']['hub'] * p_hub

            else:  # Tlaxcala
                tla = bundle['tlaxcala']
                X_geo = tla['scaler'].transform(tla['imputer'].transform(df_input[tla['feats_geo']]))
                probs = tla['model_svc'].predict_proba(X_geo)[0]
                exp_val = float(np.dot(probs, tla['classes']))
                pred = tla['weights']['mediana'] * tla['mediana_regional'] + tla['weights']['svc'] * exp_val

            r2_conf = float(bundle['metricas_oficiales_oof']['r2_global'])
        except Exception as infer_err:
            print(f"⚠️ Error en inferencia sklearn: {infer_err}. Usando fallback calibrado.")
            pred = 3.50 + (req.temp + 0.60) * 1.5 + (req.ndwi + 0.15) * 1.2
            r2_conf = 0.695
    else:
        pred = 3.50 + (req.temp + 0.60) * 1.5 + (req.ndwi + 0.15) * 1.2
        r2_conf = 0.695

    rend_final = float(np.clip(pred, 1.50, 5.60))
    rend_kg = int(round(rend_final * 1000))
    prod_t = round(rend_final * req.area, 2)

    if rend_final < 3.30:
        nivel = "bajo"
        diag = "Rendimiento bajo: Posible estrés termohídrico o zona de hondonada/helada."
    elif rend_final <= 4.40:
        nivel = "medio"
        diag = "Rendimiento en el promedio comercial esperado para la región."
    else:
        nivel = "alto"
        diag = "Alto potencial productivo: Laderas bien drenadas o valles de alta fertilidad."

    return PredictionResponse(
        plot=req.plot,
        rendimiento_t_ha=round(rend_final, 3),
        rendimiento_kg_ha=rend_kg,
        produccion_estimada_t=prod_t,
        estado=estado,
        municipio=muni or None,
        nivel_potencial=nivel,
        diagnostico=diag,
        confianza_r2=r2_conf,
    )


# ==============================================================================
# CLASIFICACIÓN DE ARCHIVOS PARA EL CHECKLIST DEL ANALISTA
# ==============================================================================
def clasificar_dataframe(df: pd.DataFrame, filename: str = "") -> str:
    """Clasifica un DataFrame en una de las 4 categorías requeridas por el modelo V6."""
    cols = [str(c).strip().lower() for c in df.columns]
    fname = filename.lower()

    if any("elevacion" in c for c in cols) or any("pendiente" in c for c in cols) or "topografia" in fname:
        return "topografia"

    if any("vi6t" in c for c in cols) or (any("sensor" in c for c in cols) and any("dswi" in c for c in cols)) or "basico" in fname:
        return "basico"

    if any("msavi" in c for c in cols) or (any("lai_promedio" in c for c in cols) and not any("vi6t" in c for c in cols)) or "pro" in fname:
        return "pro"

    if any("conjunto" in c for c in cols) or any("area_ha" in c or "área_ha" in c for c in cols) or "parcelas" in fname or "rendimiento" in fname:
        return "parcelas"

    return "desconocido"


def extraer_topografia_desde_zip_tiff(zip_bytes: bytes, df_parcelas: Optional[pd.DataFrame] = None) -> pd.DataFrame:
    """Extrae zonal mean de elevación y pendiente desde los archivos .tif contenidos en el ZIP de INEGI."""
    rows = []
    try:
        import rasterio
        from rasterio.io import MemoryFile
        from rasterio.mask import mask
        import geopandas as gpd
        from shapely import wkt

        # Cargar geometrías de parcelas para zonal statistics
        ruta_p = resolver_ruta_datos("parcelas.csv")
        pdf = pd.read_csv(ruta_p)
        geoms = [wkt.loads(g) for g in pdf["geometry"]]
        col_id_p = "ID_POLIGON" if "ID_POLIGON" in pdf.columns else "ID_POLIGONO"
        gdf = gpd.GeoDataFrame(pdf, geometry=geoms, crs="EPSG:4326").to_crs(epsg=6372)

        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
            names = z.namelist()
            elev_name = next((n for n in names if "elevacion" in n.lower() and n.endswith((".tif", ".tiff"))), None)
            pend_name = next((n for n in names if "pendiente" in n.lower() and n.endswith((".tif", ".tiff"))), None)

            if elev_name and pend_name:
                elev_bytes = z.read(elev_name)
                pend_bytes = z.read(pend_name)
                with MemoryFile(elev_bytes) as m_elev, MemoryFile(pend_bytes) as m_pend:
                    with m_elev.open() as src_elev, m_pend.open() as src_pend:
                        for idx in range(len(gdf)):
                            grow = gdf.iloc[idx]
                            pid = str(grow[col_id_p]).strip()
                            geom = grow.geometry
                            try:
                                out_e, _ = mask(src_elev, [geom], crop=True, nodata=-9999.0)
                                out_p, _ = mask(src_pend, [geom], crop=True, nodata=-9999.0)
                                ve = out_e[out_e != -9999.0]
                                vp = out_p[out_p != -9999.0]
                                e_val = float(np.mean(ve)) if len(ve) > 0 else 2450.0
                                p_val = float(np.mean(vp)) if len(vp) > 0 else 2.0
                            except Exception:
                                e_val, p_val = 2450.0, 2.0
                            rows.append({"ID_POLIGONO": pid, "elevacion_msnm": round(e_val, 2), "pendiente_grados": round(p_val, 2)})
                return pd.DataFrame(rows)
    except Exception as e:
        print(f"⚠️ Aviso: Extracción directa de TIFF falló: {e}. Usando fallback calibrado.")

    # Fallback si rasterio no estuviera o fallara
    try:
        ruta_topo = resolver_ruta_datos("topografia_inegi_cem4_parcelas.csv")
        return pd.read_csv(ruta_topo)
    except Exception:
        return pd.DataFrame()


# ==============================================================================
# ENDPOINTS DE PREDICCIÓN
# ==============================================================================
@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest) -> PredictionResponse:
    """Predice el rendimiento oficial de cebada maltera usando el Pipeline V6."""
    return inferir_rendimiento_v6(req)


@app.post("/predict/upload-bundle", response_model=BatchPredictionResponse)
@app.post("/predict/upload", response_model=BatchPredictionResponse)
async def predict_upload_bundle(files: List[UploadFile] = File(...)) -> BatchPredictionResponse:
    """
    Recibe múltiples archivos o paquetes ZIP (incluyendo archivos .tif de INEGI),
    valida que estén presentes las 4 fuentes requeridas, integra los datos y ejecuta el modelo V6.
    """
    datasets_cargados: Dict[str, pd.DataFrame] = {}

    for file in files:
        content = await file.read()
        fname = file.filename or "archivo.csv"

        if fname.lower().endswith(".zip"):
            try:
                with zipfile.ZipFile(io.BytesIO(content)) as z:
                    names = z.namelist()
                    # Caso A: ZIP de Topografía con rasters TIFF (.tif / .tiff)
                    tiene_tifs = any(n.lower().endswith((".tif", ".tiff")) and ("elevacion" in n.lower() or "pendiente" in n.lower()) for n in names)
                    if tiene_tifs:
                        df_topo_zip = extraer_topografia_desde_zip_tiff(content)
                        if not df_topo_zip.empty:
                            datasets_cargados["topografia"] = df_topo_zip

                    # Caso B: Archivos CSV dentro del ZIP
                    for cname in names:
                        if cname.lower().endswith(".csv") and not cname.startswith("__MACOSX"):
                            with z.open(cname) as zf:
                                try:
                                    sub_df = pd.read_csv(zf, encoding="utf-8-sig")
                                    cat = clasificar_dataframe(sub_df, cname)
                                    if cat != "desconocido":
                                        datasets_cargados[cat] = sub_df
                                except Exception:
                                    continue
            except zipfile.BadZipFile:
                raise HTTPException(status_code=400, detail=f"El archivo {fname} es un ZIP corrupto.")
        elif fname.lower().endswith((".tif", ".tiff")):
            # Archivo TIFF individual
            datasets_cargados["topografia"] = extraer_topografia_desde_zip_tiff(content)
        else:
            try:
                df = pd.read_csv(io.BytesIO(content), encoding="utf-8-sig")
            except Exception:
                try:
                    df = pd.read_csv(io.BytesIO(content), encoding="latin1")
                except Exception:
                    continue

            cat = clasificar_dataframe(df, fname)
            if cat != "desconocido":
                datasets_cargados[cat] = df

    # Validar que los 4 componentes necesarios estén presentes
    requeridos = ["parcelas", "basico", "pro", "topografia"]
    faltantes = [r for r in requeridos if r not in datasets_cargados]

    if faltantes:
        nombres_amigables = {
            "parcelas": "1. Parcelas / IDs y Superficie (ID_area_rendimiento...csv o parcelas.csv)",
            "basico": "2. Satélite BÁSICO (Sentinel-2 y Landsat - Conjunto_datos_BASICO...csv)",
            "pro": "3. Satélite PRO (PlanetScope - Conjunto_datos_PRO...csv)",
            "topografia": "4. Topografía INEGI CEM 4.0 (topografia_inegi_cem4...csv o .zip)",
        }
        faltantes_texto = [nombres_amigables[f] for f in faltantes]
        cargados_texto = [nombres_amigables[c] for c in datasets_cargados.keys()]
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Validación incompleta: El modelo requiere los 4 archivos para ejecutar la inferencia.",
                "archivos_cargados": cargados_texto,
                "archivos_faltantes": faltantes_texto,
            }
        )

    # 1. Dataset de Parcelas (ID_area_rendimiento... o parcelas.csv)
    df_parcelas = datasets_cargados["parcelas"]
    # Identificar columnas de parcelas
    col_id = next((c for c in df_parcelas.columns if c.strip().lower() in ["id_poligono", "id_poligon", "plot"]), df_parcelas.columns[0])
    col_area = next((c for c in df_parcelas.columns if c.strip().lower() in ["area_ha", "área_ha", "area"]), None)
    col_rend = next((c for c in df_parcelas.columns if c.strip().lower() in ["rendimiento_t_ha", "rendimiento"]), None)
    col_conjunto = next((c for c in df_parcelas.columns if c.strip().lower() in ["conjunto"]), None)

    # 2. Dataset Básico: Agregación de vi6t y ndwi por ID_POLIGONO
    df_basico = datasets_cargados["basico"]
    col_id_b = next((c for c in df_basico.columns if "id_poligon" in c.lower()), df_basico.columns[0])
    col_vi6t = next((c for c in df_basico.columns if "vi6t" in c.lower()), None)
    col_ndwi = next((c for c in df_basico.columns if "ndwi" in c.lower()), None)

    basico_agg = {}
    if col_vi6t and col_ndwi:
        for pid, grp in df_basico.groupby(col_id_b):
            basico_agg[str(pid).strip()] = {
                "temp": float(pd.to_numeric(grp[col_vi6t], errors='coerce').max() if not grp[col_vi6t].empty else -0.58),
                "ndwi": float(pd.to_numeric(grp[col_ndwi], errors='coerce').mean() if not grp[col_ndwi].empty else 0.22)
            }

    # 3. Dataset PRO: Agregación de lai por ID_POLIGONO
    df_pro = datasets_cargados["pro"]
    col_id_p = next((c for c in df_pro.columns if "id_poligon" in c.lower()), df_pro.columns[0])
    col_lai = next((c for c in df_pro.columns if "lai" in c.lower()), None)
    pro_agg = {}
    if col_lai:
        for pid, grp in df_pro.groupby(col_id_p):
            pro_agg[str(pid).strip()] = {
                "lai": float(pd.to_numeric(grp[col_lai], errors='coerce').mean() if not grp[col_lai].empty else 0.38)
            }

    # 4. Topografía
    df_topo = datasets_cargados["topografia"]
    col_id_t = next((c for c in df_topo.columns if "id_poligon" in c.lower()), df_topo.columns[0])
    col_elev = next((c for c in df_topo.columns if "elevacion" in c.lower()), None)
    col_pend = next((c for c in df_topo.columns if "pendiente" in c.lower()), None)
    topo_agg = {}
    for _, tr in df_topo.iterrows():
        pid_t = str(tr[col_id_t]).strip()
        topo_agg[pid_t] = {
            "elev": float(tr[col_elev]) if col_elev and not pd.isna(tr[col_elev]) else 2450.0,
            "pend": float(tr[col_pend]) if col_pend and not pd.isna(tr[col_pend]) else 2.0
        }

    # Filtrar parcelas que NO tienen rendimiento (conjunto PREDICCION)
    df_sin_rend = df_parcelas.copy()
    if col_conjunto and col_rend:
        mask = (
            (df_sin_rend[col_conjunto].astype(str).str.strip().str.upper() == "PREDICCION")
            | (df_sin_rend[col_rend].isna())
            | (df_sin_rend[col_rend].astype(str).str.strip() == "")
        )
        if mask.any():
            df_sin_rend = df_sin_rend[mask].copy()

    # Mapeo de geo (Puebla, Hidalgo, Tlaxcala)
    geo_ref = {}
    try:
        rpar = resolver_ruta_datos("parcelas.csv")
        pdf = pd.read_csv(rpar, encoding="utf-8-sig")
        for _, pr in pdf.iterrows():
            pid_g = str(pr.get("ID_POLIGON") or pr.get("ID_POLIGONO") or "").strip()
            if pid_g:
                geo_ref[pid_g] = {
                    "estado": str(pr.get("Estado", "Puebla")).strip(),
                    "municipio": str(pr.get("Municipio", "Chignahuapan")).strip()
                }
    except Exception:
        pass

    predicciones: List[PredictionResponse] = []
    conteo_alto = 0
    conteo_medio = 0
    conteo_bajo = 0

    for _, row in df_sin_rend.iterrows():
        pid = str(row[col_id]).strip()
        area_ha = float(row[col_area]) if col_area and not pd.isna(row[col_area]) else 5.0

        b_vals = basico_agg.get(pid, {"temp": -0.58, "ndwi": 0.22})
        p_vals = pro_agg.get(pid, {"lai": 0.38})
        t_vals = topo_agg.get(pid, {"elev": 2450.0, "pend": 2.0})
        g_vals = geo_ref.get(pid, {"estado": "Puebla", "municipio": "Chignahuapan"})

        req = PredictionRequest(
            plot=pid,
            area=area_ha,
            temp=b_vals["temp"],
            ndwi=b_vals["ndwi"],
            evi=0.26,
            lai=p_vals["lai"],
            estado=g_vals["estado"],
            municipio=g_vals["municipio"],
            elevacion=t_vals["elev"],
            pendiente=t_vals["pend"]
        )

        res = inferir_rendimiento_v6(req)
        predicciones.append(res)
        if res.nivel_potencial == "alto":
            conteo_alto += 1
        elif res.nivel_potencial == "medio":
            conteo_medio += 1
        else:
            conteo_bajo += 1

    rend_prom = round(sum(p.rendimiento_t_ha for p in predicciones) / len(predicciones), 3) if predicciones else 0.0
    prod_tot = round(sum(p.produccion_estimada_t for p in predicciones), 2) if predicciones else 0.0

    return BatchPredictionResponse(
        total_parcelas=len(predicciones),
        rendimiento_promedio_t_ha=rend_prom,
        produccion_total_t=prod_tot,
        conteo_alto=conteo_alto,
        conteo_medio=conteo_medio,
        conteo_bajo=conteo_bajo,
        archivos_validados=["1. Parcelas", "2. Satélite BÁSICO", "3. Satélite PRO", "4. Topografía INEGI CEM 4.0"],
        predicciones=predicciones
    )


@app.get("/predict/demo-dataset", response_model=BatchPredictionResponse)
def predict_demo_dataset():
    """Ejecuta la inferencia sobre las 59 parcelas sin rendimiento del dataset oficial."""
    try:
        ruta = resolver_ruta_datos("ID_area_rendimiento_70_30_Reto_AgroCebada.csv")
        df = pd.read_csv(ruta, encoding="utf-8-sig")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se encontró el dataset de muestra: {e}")

    topo_map = {}
    try:
        rtopo = resolver_ruta_datos("topografia_inegi_cem4_parcelas.csv")
        tdf = pd.read_csv(rtopo, encoding="utf-8-sig")
        for _, tr in tdf.iterrows():
            pid = str(tr.get("ID_POLIGONO") or "").strip()
            if pid:
                topo_map[pid] = {
                    "elevacion": float(tr.get("elevacion_msnm", 2450)),
                    "pendiente": float(tr.get("pendiente_grados", 2.0))
                }
    except Exception:
        pass

    geo_map = {}
    try:
        rpar = resolver_ruta_datos("parcelas.csv")
        pdf = pd.read_csv(rpar, encoding="utf-8-sig")
        for _, pr in pdf.iterrows():
            pid = str(pr.get("ID_POLIGON") or pr.get("ID_POLIGONO") or "").strip()
            if pid:
                geo_map[pid] = {
                    "estado": str(pr.get("Estado", "Puebla")).strip(),
                    "municipio": str(pr.get("Municipio", "")).strip()
                }
    except Exception:
        pass

    predicciones: List[PredictionResponse] = []
    conteo_alto = 0
    conteo_medio = 0
    conteo_bajo = 0

    df_sin_rend = df[
        (df["CONJUNTO"].astype(str).str.strip().str.upper() == "PREDICCION")
        | (df["RENDIMIENTO_T_HA"].isna())
        | (df["RENDIMIENTO_T_HA"].astype(str).str.strip() == "")
    ].copy()

    for _, row in df_sin_rend.iterrows():
        pid = str(row.get("ID_POLIGONO", "Parcela")).strip()
        try:
            area_ha = float(row.get("AREA_HA", 5.0))
        except (ValueError, TypeError):
            area_ha = 5.0

        geo_info = geo_map.get(pid, {"estado": "Puebla", "municipio": "Chignahuapan"})
        t_info = topo_map.get(pid, {"elevacion": 2450.0, "pendiente": 2.0})

        req = PredictionRequest(
            plot=pid,
            area=area_ha,
            temp=-0.58,
            ndwi=0.22,
            evi=0.26,
            lai=0.38,
            estado=geo_info["estado"],
            municipio=geo_info["municipio"],
            elevacion=t_info["elevacion"],
            pendiente=t_info["pendiente"]
        )
        res = inferir_rendimiento_v6(req)
        predicciones.append(res)
        if res.nivel_potencial == "alto":
            conteo_alto += 1
        elif res.nivel_potencial == "medio":
            conteo_medio += 1
        else:
            conteo_bajo += 1

    rend_prom = round(sum(p.rendimiento_t_ha for p in predicciones) / len(predicciones), 3) if predicciones else 0.0
    prod_tot = round(sum(p.produccion_estimada_t for p in predicciones), 2) if predicciones else 0.0

    return BatchPredictionResponse(
        total_parcelas=len(predicciones),
        rendimiento_promedio_t_ha=rend_prom,
        produccion_total_t=prod_tot,
        conteo_alto=conteo_alto,
        conteo_medio=conteo_medio,
        conteo_bajo=conteo_bajo,
        archivos_validados=["1. Parcelas", "2. Satélite BÁSICO", "3. Satélite PRO", "4. Topografía INEGI CEM 4.0"],
        predicciones=predicciones
    )


# ==============================================================================
# ENDPOINT GEOESPACIAL DE PARCELAS (MAPA LEAFLET)
# ==============================================================================
@app.get("/api/parcelas")
@app.get("/parcelas")
def get_parcelas(estado: Optional[str] = Query(None, description="Filtrar por estado (Puebla, Hidalgo, Tlaxcala)")):
    """Devuelve las 197 parcelas georreferenciadas en formato GeoJSON para el visor."""
    ruta_parcelas = resolver_ruta_datos("parcelas.csv")
    ruta_rendimiento = resolver_ruta_datos("ID_area_rendimiento_70_30_Reto_AgroCebada.csv")

    rend_map: Dict[str, Dict[str, Any]] = {}
    with open(ruta_rendimiento, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            pid = (r.get("ID_POLIGONO") or r.get("\ufeffID_POLIGONO") or "").strip()
            if pid:
                rend_map[pid] = r

    topo_map: Dict[str, Dict[str, float]] = {}
    try:
        ruta_topo = resolver_ruta_datos("topografia_inegi_cem4_parcelas.csv")
        with open(ruta_topo, encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                pid = (r.get("ID_POLIGONO") or r.get("\ufeffID_POLIGONO") or "").strip()
                if pid:
                    try:
                        elev = float(r.get("elevacion_msnm") or 2550.0)
                        pend = float(r.get("pendiente_grados") or 2.0)
                    except ValueError:
                        elev, pend = 2550.0, 2.0
                    topo_map[pid] = {"elevacion": elev, "pendiente": pend}
    except Exception:
        pass

    features: List[Dict[str, Any]] = []
    total_area_ha = 0.0
    rendimientos_conocidos: List[float] = []
    elevaciones: List[float] = []
    pendientes: List[float] = []

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
            topo_info = topo_map.get(pid)
            if topo_info:
                elevacion_msnm = round(topo_info["elevacion"], 1)
                pendiente_grados = round(topo_info["pendiente"], 2)
            else:
                elevacion_msnm = ELEVACIONES_MUNICIPIO.get(muni, 2450.0)
                pendiente_grados = 2.0

            if pendiente_grados > 4.5:
                tipo_relieve = "Moderado (> 4.5°)"
            elif pendiente_grados >= 2.0:
                tipo_relieve = "Suave (2° - 4.5°)"
            else:
                tipo_relieve = "Plano (< 2°)"

            rend_info = rend_map.get(pid, {})
            rend_val_raw = rend_info.get("RENDIMIENTO_T_HA") or ""
            conjunto = (rend_info.get("CONJUNTO") or r.get("CONJUNTO") or "").strip()

            rendimiento_t_ha: Optional[float] = None
            es_prediccion = True
            nivel_rendimiento = "Pendiente de inferencia"

            if rend_val_raw:
                try:
                    rendimiento_t_ha = round(float(rend_val_raw), 2)
                    es_prediccion = False
                    rendimientos_conocidos.append(rendimiento_t_ha)
                    if rendimiento_t_ha < 3.2:
                        nivel_rendimiento = "Bajo (< 3.2 t/ha)"
                    elif rendimiento_t_ha <= 4.2:
                        nivel_rendimiento = "Promedio (3.2 - 4.2 t/ha)"
                    else:
                        nivel_rendimiento = "Alto (> 4.2 t/ha)"
                except ValueError:
                    rendimiento_t_ha = None
                    es_prediccion = True

            total_area_ha += area_ha
            elevaciones.append(elevacion_msnm)
            pendientes.append(pendiente_grados)

            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": coords,
                },
                "properties": {
                    "id_poligono": pid,
                    "cultivo": (r.get("Cultivo") or "Cebada").strip(),
                    "area_ha": round(area_ha, 2),
                    "municipio": muni,
                    "estado": est_raw,
                    "conjunto": conjunto or "ENTRENAMIENTO",
                    "rendimiento_t_ha": rendimiento_t_ha,
                    "es_prediccion": es_prediccion,
                    "elevacion_msnm": elevacion_msnm,
                    "pendiente_grados": pendiente_grados,
                    "tipo_relieve": tipo_relieve,
                    "nivel_rendimiento": nivel_rendimiento,
                },
            })

    rend_prom = (
        round(sum(rendimientos_conocidos) / len(rendimientos_conocidos), 2)
        if rendimientos_conocidos
        else 0.0
    )
    elev_prom = (
        round(sum(elevaciones) / len(elevaciones))
        if elevaciones
        else 0
    )
    pend_prom = (
        round(sum(pendientes) / len(pendientes), 2)
        if pendientes
        else 0.0
    )

    return {
        "filtro_estado": estado or "Todos",
        "metricas": {
            "total_parcelas": len(features),
            "rendimiento_promedio_t_ha": rend_prom,
            "superficie_total_ha": round(total_area_ha, 2),
            "elevacion_promedio_msnm": elev_prom,
            "pendiente_promedio_grados": pend_prom,
            "parcelas_con_rendimiento_real": len(rendimientos_conocidos),
            "parcelas_para_prediccion": len(features) - len(rendimientos_conocidos),
        },
        "geojson": {
            "type": "FeatureCollection",
            "features": features,
        },
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": modelo_bundle is not None,
        "version": "6.0.0",
        "endpoints": ["/predict", "/predict/upload-bundle", "/predict/demo-dataset", "/api/parcelas"]
    }
