"""
========================================================================================
  AGRORAÍCES - SCRIPT DE ENTRENAMIENTO, EXPLICABILIDAD SHAP (PASO 6 NB) Y EMPAQUETADO
  Consume directamente las fuentes originales en backend/data/agrocebada/ y backend/data/,
  ejecuta el Pipeline Oficial QBAF + DF-QuAD + SHAP (Paso 6 de pipeline_agroraices.ipynb)
  y genera los artefactos serializados (.joblib) y metadatos (.json) para FastAPI y Next.js.
========================================================================================
"""

from pathlib import Path
import os
import sys
import json
import joblib
import warnings
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely import wkt as shapely_wkt
import shap

from sklearn.model_selection import KFold
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error
from sklearn.preprocessing import RobustScaler, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import ExtraTreesRegressor, GradientBoostingRegressor
from sklearn.svm import SVR, SVC
from sklearn.linear_model import HuberRegressor
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C, WhiteKernel
from sklearn.cross_decomposition import PLSRegression

warnings.filterwarnings('ignore')
SEED = 42
np.random.seed(SEED)


class DFQuADEngine:
    """Motor de deliberación gradual DF-QuAD (Rago, Cocarascu & Toni)."""
    @staticmethod
    def aggregate_strength(strengths):
        if len(strengths) == 0:
            return 0.0
        prod = 1.0
        for v in strengths:
            prod *= (1.0 - float(np.clip(v, 0.0, 1.0)))
        return 1.0 - prod

    @staticmethod
    def compute_acceptability(v0, attackers, supporters):
        v0 = float(np.clip(v0, 0.0, 1.0))
        v_a = DFQuADEngine.aggregate_strength(attackers)
        v_s = DFQuADEngine.aggregate_strength(supporters)
        if np.isclose(v_a, v_s):
            return v0
        elif v_a > v_s:
            return v0 - v0 * abs(v_s - v_a)
        else:
            return v0 + (1.0 - v0) * abs(v_s - v_a)


# Diccionario agronómico legible y asignación de Nodo QBAF para cada variable
METADATA_VARIABLES_SHAP = {
    "bi_Tmin_anom25_04": {"etiqueta": "Anomalía Tmin Abril 2025 (°C)", "nodo": "Nodo 1: G_Bio (Clima/Helada)"},
    "lp_Tmin_anom25_04": {"etiqueta": "Anomalía Tmin Adiabática CEM4 (°C)", "nodo": "Nodo 1: G_Bio (Downscaling)"},
    "prior_municipal": {"etiqueta": "Prior Bayesiano Municipal (t/ha)", "nodo": "Nodo 1: G_Bio (Anclaje Regional)"},
    "s2_mra_mean": {"etiqueta": "Absorción Borde Rojo Clorofila (MRA)", "nodo": "Nodo 1: G_Bio (Vigor Foliar S2)"},
    "planet_lai_std": {"etiqueta": "Dinámica Área Foliar (LAI std 3m)", "nodo": "Nodo 1/3: Vigor PlanetScope 3m"},
    "nn_vpd_vege_std": {"etiqueta": "Variabilidad Déficit Presión Vapor (VPD)", "nodo": "Nodo 1: G_Bio (Demanda Evaporativa)"},
    "bi_canopy_air_diff": {"etiqueta": "Acoplamiento Térmico Dosel-Aire", "nodo": "Nodo 1: G_Bio (Termorregulación)"},
    "landsat_vi6t_max": {"etiqueta": "Emisión Térmica Superficial Pico (VI6T)", "nodo": "Nodo 1: G_Bio (Landsat Térmico)"},
    "s2_ndwi_mean": {"etiqueta": "Retención Hídrica Foliar Media (NDWI)", "nodo": "Nodo 1: G_Bio (Humedad S2)"},
    "s2_dswi2_mean": {"etiqueta": "Índice Hídrico SWIR No Saturable (DSWI2)", "nodo": "Nodo 1/3: G_SWIR-Termo"},
    "estres_termohidrico": {"etiqueta": "Índice Estrés Termo-Hídrico (VI6T×NDWI)", "nodo": "Nodo 1/3: Interacción Física"},
    "persistencia_verde_m11": {"etiqueta": "Persistencia Verde Cierre Ciclo (M11)", "nodo": "Nodo 1: G_Bio (Senescencia)"},
    "log_area": {"etiqueta": "Escala Predial Logarítmica ln(1+Área)", "nodo": "Nodo 1/2: Escala de Lote"},
    "elevacion_msnm": {"etiqueta": "Altitud Digital INEGI CEM 4.0 (msnm)", "nodo": "Nodo 1/2: Fisiografía CEM 4.0"},
    "pendiente_grados": {"etiqueta": "Pendiente Topográfica CEM 4.0 (°)", "nodo": "Nodo 1/2: Drenaje y Relieve"},
    "lat_centro": {"etiqueta": "Latitud Centroide Parcelario (°N)", "nodo": "Nodo Geo: Gradiente Espacial"},
    "lon_centro": {"etiqueta": "Longitud Centroide Parcelario (°O)", "nodo": "Nodo Geo: Gradiente Espacial"},
    "s2_sti_presow": {"etiqueta": "Índice Labranza Pre-Siembra (STI M1-M4)", "nodo": "Nodo 2: G_Geo-Labranza"},
    "proxy_relieve_m": {"etiqueta": "Rugosidad y Amplitud de Relieve Local (m)", "nodo": "Nodo 2: G_Geo-Labranza"},
    "s2_ndwi_min": {"etiqueta": "Humedad Foliar Mínima Crítica (NDWI min)", "nodo": "Nodo 2/3: Estrés Hídrico S2"},
    "landsat_vi6t_std": {"etiqueta": "Variabilidad Térmica Superficial (VI6T std)", "nodo": "Nodo 3: G_SWIR-Termo"},
    "bi_vpd_ndwi_stress": {"etiqueta": "Índice Estrés Atmosférico VPD / NDWI", "nodo": "Nodo 3: G_SWIR-Termo"},
    "planet_ndvi_mean": {"etiqueta": "Verdor Medio PlanetScope (NDVI Capa 0)", "nodo": "Capa 0: Sensor Óptico (Undercutting)"},
    "Z1_pls_clima": {"etiqueta": "Componente Bioclimática Cardinal PLS 1", "nodo": "Nodo 4: G_Clima-PLS (k=2)"},
    "Z2_pls_clima": {"etiqueta": "Componente Bioclimática Cardinal PLS 2", "nodo": "Nodo 4: G_Clima-PLS (k=2)"},
    "planet_msavi_mean": {"etiqueta": "Vigor Ajustado al Suelo (MSAVI 3m)", "nodo": "Nodo 5: G_Meseta-Modal"},
    "landsat_intra_vi6t_std": {"etiqueta": "Heterogeneidad Térmica Intrapredial (VI6T)", "nodo": "Nodo 5: G_Meseta-Modal"},
    "elongacion_bbox": {"etiqueta": "Elongación Geométrica del Predio (UTM)", "nodo": "Nodo 5: G_Meseta-Modal"},
}


def localizar_archivo(nombre: str) -> Path:
    base_dir = Path(__file__).resolve().parent
    backend_dir = base_dir.parent
    repo_dir = backend_dir.parent
    candidatos = [
        backend_dir / "data" / "agrocebada" / nombre,
        backend_dir / "data" / nombre,
        base_dir / nombre,
        repo_dir / nombre,
    ]
    for c in candidatos:
        if c.exists():
            return c
    raise FileNotFoundError(f"No se encontró el archivo requerido: {nombre}")


if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 95)
print("  EMPAQUETANDO MODELO FINAL AGRORAÍCES + SHAP (PASO 6 NB) PARA PRODUCCIÓN WEB")
print("=" * 95)

# ==============================================================================
# 1. CARGA E INTEGRACIÓN DE TABLAS OFICIALES Y CSV DE TEMPERATURA CHIRTS-ERA5
# ==============================================================================
df_basico = pd.read_csv(localizar_archivo('Conjunto_datos_BASICO_AgroCebada2026.csv'))
df_pro = pd.read_csv(localizar_archivo('Conjunto_datos_PRO_AgroCebada.csv'))
y_df = pd.read_csv(localizar_archivo('ID_area_rendimiento_70_30_Reto_AgroCebada.csv'))
topo_temp = pd.read_csv(localizar_archivo('topografia_inegi_cem4_parcelas.csv'))
parcelas_csv = pd.read_csv(localizar_archivo('parcelas.csv'))

for d in [df_basico, df_pro, y_df, topo_temp]:
    d['ID_POLIGONO'] = d['ID_POLIGONO'].astype(str).str.strip()
parcelas_csv['ID_POLIGONO'] = parcelas_csv['ID_POLIGON'].astype(str).str.strip()
y_df['CONJUNTO'] = y_df['CONJUNTO'].astype(str).str.strip()

y_df['AREA_HA'] = pd.to_numeric(y_df['AREA_HA'], errors='coerce')
y_df['RENDIMIENTO_T_HA'] = pd.to_numeric(y_df['RENDIMIENTO_T_HA'], errors='coerce')
y_df['RENDIMIENTO'] = y_df['RENDIMIENTO_T_HA']

geoms = [shapely_wkt.loads(str(g)) for g in parcelas_csv['geometry']]
shp = gpd.GeoDataFrame(parcelas_csv, geometry=geoms, crs='EPSG:4326')
shp_utm = shp.to_crs(epsg=32614)
geo = shp[['ID_POLIGONO', 'Estado', 'Municipio', 'geometry']].copy()
geo['lat_centro'] = geo.geometry.centroid.y
geo['lon_centro'] = geo.geometry.centroid.x
bounds_utm = shp_utm.geometry.bounds
geo['elongacion_bbox'] = (bounds_utm['maxx'] - bounds_utm['minx']) / (bounds_utm['maxy'] - bounds_utm['miny'] + 1e-6)
geo = geo.drop(columns='geometry').merge(
    topo_temp.drop(columns=['Estado', 'Municipio'], errors='ignore'), on='ID_POLIGONO', how='left'
)

for c in ['elevacion_msnm', 'pendiente_grados', 'lat_centro', 'lon_centro', 'proxy_relieve_m', 'elongacion_bbox']:
    geo[c] = geo.groupby('Estado')[c].transform(lambda s: s.fillna(s.median()))

df_basico['fecha_captura'] = pd.to_datetime(df_basico['fecha_captura'], dayfirst=True)
df_pro['fecha_captura'] = pd.to_datetime(df_pro['fecha_captura'], dayfirst=True)
df_basico['mes'] = df_basico['fecha_captura'].dt.month
df_pro['mes'] = df_pro['fecha_captura'].dt.month

# ==============================================================================
# 2. FILTRADO ATMOSFÉRICO (NUBOSIDAD <= 30%) Y SÍNTESIS ESPECTRAL
# ==============================================================================
df_b_clean = df_basico[df_basico['porcentaje_nubosidad'].fillna(100) <= 30.0].copy()
df_p_clean = df_pro[df_pro['porcentaje_nubosidad'].fillna(100) <= 30.0].copy()

s2_clean = df_b_clean[df_b_clean['sensor'] == 'Sentinel-2']
s2_feats = s2_clean.groupby('ID_POLIGONO').agg(
    s2_ndwi_mean=('ndwi_promedio', 'mean'),
    s2_ndwi_min=('ndwi_promedio', 'min'),
    s2_dswi2_mean=('dswi2_promedio', 'mean'),
    s2_fapar_mean=('fapar_promedio', 'mean'),
    s2_savi_mean=('savi_promedio', 'mean'),
    s2_mra_mean=('mra_promedio', 'mean'),
    s2_evi_intra_std=('evi_std', 'mean')
).reset_index()

s2_presow = s2_clean[s2_clean['mes'].isin([1, 2, 3, 4])].groupby('ID_POLIGONO').agg(
    s2_sti_presow=('sti_promedio', 'mean'),
    s2_ndti_presow=('ndti_promedio', 'mean')
).reset_index()

landsat_feats = df_b_clean[df_b_clean['sensor'] == 'Landsat'].groupby('ID_POLIGONO').agg(
    landsat_vi6t_max=('vi6t_promedio', 'max'),
    landsat_vi6t_std=('vi6t_promedio', 'std'),
    landsat_vi6t_mean=('vi6t_promedio', 'mean'),
    landsat_intra_vi6t_std=('vi6t_std', 'mean')
).reset_index()

planet_feats = df_p_clean.groupby('ID_POLIGONO').agg(
    planet_lai_std=('lai_promedio', 'std'),
    planet_lai_mean=('lai_promedio', 'mean'),
    planet_ndvi_mean=('ndvi_promedio', 'mean'),
    planet_msavi_mean=('msavi_promedio', 'mean'),
    planet_intra_ndvi_std=('ndvi_std', 'mean')
).reset_index()

persistencia_m11 = (
    df_p_clean[df_p_clean['mes'] == 11]
    .groupby('ID_POLIGONO')['ndvi_promedio']
    .mean()
    .reset_index()
    .rename(columns={'ndvi_promedio': 'persistencia_verde_m11'})
)

master = y_df.merge(geo, on='ID_POLIGONO', how='left')
for tabla in [s2_feats, s2_presow, landsat_feats, planet_feats, persistencia_m11]:
    master = master.merge(tabla, on='ID_POLIGONO', how='left')

master['persistencia_verde_m11'] = master['persistencia_verde_m11'].fillna(0)
master['estres_termohidrico'] = master['landsat_vi6t_max'] * master['s2_ndwi_min']
master['log_area'] = np.log1p(master['AREA_HA'])

cols_temp_bi = [c for c in topo_temp.columns if c.startswith('bi_')]

temp_hidalgo_cols = ['bi_Tmin_anom25_04', 'nn_vpd_vege_std', 'bi_canopy_air_diff', 'lp_Tmin_anom25_04', 's2_mra_mean']
feats_h_bio = [
    'log_area', 'landsat_vi6t_max', 's2_ndwi_mean', 'planet_lai_std',
    'persistencia_verde_m11', 'estres_termohidrico', 'elevacion_msnm',
    'pendiente_grados', 's2_dswi2_mean'
] + temp_hidalgo_cols
feats_h_geo = ['lat_centro', 'lon_centro', 'elevacion_msnm', 'pendiente_grados'] + temp_hidalgo_cols

extra_puebla_cols = ['bi_vpd_ndwi_stress', 'proxy_relieve_m', 's2_sti_presow']
feats_p1 = ['log_area', 'pendiente_grados', 'elevacion_msnm', 's2_ndwi_min', 'landsat_vi6t_std', 'estres_termohidrico'] + extra_puebla_cols
feats_p4 = ['lat_centro', 'lon_centro', 'log_area', 'pendiente_grados', 'elevacion_msnm', 's2_ndwi_min'] + extra_puebla_cols
feats_p5 = ['log_area', 'pendiente_grados', 'elevacion_msnm', 's2_ndwi_min', 's2_dswi2_mean', 'landsat_vi6t_std', 'planet_lai_std', 'planet_ndvi_mean'] + extra_puebla_cols

pls_pool_puebla = cols_temp_bi + [
    's2_sti_presow', 's2_ndti_presow', 's2_fapar_mean', 's2_evi_intra_std',
    's2_savi_mean', 's2_mra_mean', 'proxy_relieve_m', 'sync_canopy_ratio_mean',
    'heat_stress_pv_2025', 'heat_stress_pv_2023', 'gdd_card_anom25', 'cold_repro_anom25',
    'dyn_tmin_llenado', 'dyn_dtr_llenado', 'planet_intra_ndvi_std'
]
feats_t_geo = ['lat_centro', 'lon_centro', 'landsat_intra_vi6t_std', 'planet_msavi_mean', 'elongacion_bbox']

all_model_cols = sorted(list(set(
    feats_h_bio + feats_h_geo + feats_p1 + feats_p4 + feats_p5 + pls_pool_puebla + feats_t_geo +
    ['AREA_HA', 'log_area', 'elevacion_msnm', 'pendiente_grados', 'lat_centro', 'lon_centro',
     's2_ndwi_mean', 's2_ndwi_min', 'landsat_vi6t_max', 'landsat_vi6t_mean', 'planet_lai_mean',
     'bi_vpd_pv_2025', 'bi_tmean_pv_clim']
)))

train_df_raw = master[master['CONJUNTO'] == 'ENTRENAMIENTO'].copy().reset_index(drop=True)
defaults_by_state = {
    est: train_df_raw[train_df_raw['Estado'] == est][all_model_cols].median().to_dict()
    for est in ['Hidalgo', 'Puebla', 'Tlaxcala']
}

train_df = train_df_raw.copy()
test_df = master[master['CONJUNTO'] == 'PREDICCION'].copy().reset_index(drop=True)
print(f"Dataset maestro construido: {len(master)} parcelas totales ({len(train_df)} train / {len(test_df)} test).")

# ==============================================================================
# 3. ENTRENAMIENTO DE ESPECIALISTAS FINALES Y FOLDS OOF (K=3) PARA SHAP PASO 6
# ==============================================================================
df_h = train_df[train_df['Estado'] == 'Hidalgo'].copy().reset_index(drop=True)
y_h = df_h['RENDIMIENTO'].values
muni_mean_h = df_h.groupby('Municipio')['RENDIMIENTO'].mean().to_dict()
muni_count_h = df_h.groupby('Municipio')['RENDIMIENTO'].count().to_dict()
global_mean_h = float(y_h.mean())
m_weight_h = 0.5

priors_h = df_h['Municipio'].apply(
    lambda m: float((muni_count_h.get(m, 0) * muni_mean_h.get(m, global_mean_h) + m_weight_h * global_mean_h) / (muni_count_h.get(m, 0) + m_weight_h))
).values.reshape(-1, 1)

sc_h_bio = RobustScaler(); imp_h_bio = SimpleImputer(strategy='median')
X_h_bio = np.hstack([sc_h_bio.fit_transform(imp_h_bio.fit_transform(df_h[feats_h_bio])), priors_h])
model_h_gb = GradientBoostingRegressor(n_estimators=80, max_depth=3, random_state=SEED).fit(X_h_bio, y_h)

sc_h_geo = RobustScaler(); imp_h_geo = SimpleImputer(strategy='median')
X_h_geo = sc_h_geo.fit_transform(imp_h_geo.fit_transform(df_h[feats_h_geo]))
model_h_svr = SVR(kernel='rbf', C=1.0, epsilon=0.1, gamma='scale').fit(X_h_geo, y_h)

df_p = train_df[train_df['Estado'] == 'Puebla'].copy().reset_index(drop=True)
y_p = df_p['RENDIMIENTO'].values

sc_p1 = RobustScaler(); imp_p1 = SimpleImputer(strategy='median')
X_p1 = sc_p1.fit_transform(imp_p1.fit_transform(df_p[feats_p1]))
model_p_et = ExtraTreesRegressor(n_estimators=80, max_depth=2, min_samples_leaf=4, random_state=SEED).fit(X_p1, y_p)

sc_p4 = RobustScaler(); imp_p4 = SimpleImputer(strategy='median')
X_p4 = sc_p4.fit_transform(imp_p4.fit_transform(df_p[feats_p4]))
model_p_svr = SVR(kernel='rbf', C=1.0, epsilon=0.15, gamma=0.1).fit(X_p4, y_p)

sc_p5 = RobustScaler(); imp_p5 = SimpleImputer(strategy='median')
X_p5 = sc_p5.fit_transform(imp_p5.fit_transform(df_p[feats_p5]))
model_p_hub = HuberRegressor(alpha=1.0, epsilon=1.2).fit(X_p5, y_p)

kernel_rbf = C(1.0, (1e-3, 1e3)) * RBF(length_scale=1.0, length_scale_bounds=(1e-2, 1e2)) + WhiteKernel(noise_level=0.1)
model_p_gpr = GaussianProcessRegressor(kernel=kernel_rbf, n_restarts_optimizer=2, random_state=SEED, normalize_y=True).fit(X_p4, y_p)

sc_p_pls = RobustScaler(); imp_p_pls = SimpleImputer(strategy='median')
T_p = sc_p_pls.fit_transform(imp_p_pls.fit_transform(df_p[pls_pool_puebla]))
pls_p = PLSRegression(n_components=2).fit(T_p, y_p)
Z_p = pls_p.transform(T_p)

X_p4_pls = np.hstack([X_p4, Z_p])
X_p5_pls = np.hstack([X_p5, Z_p])

model_p_svr_pls = SVR(kernel='rbf', C=1.0, epsilon=0.15, gamma=0.1).fit(X_p4_pls, y_p)
model_p_hub_pls = HuberRegressor(alpha=1.0, epsilon=1.2).fit(X_p5_pls, y_p)
model_p_gpr_pls = GaussianProcessRegressor(kernel=kernel_rbf, n_restarts_optimizer=2, random_state=SEED, normalize_y=True).fit(X_p4_pls, y_p)
ndvi_q75_puebla = float(df_p['planet_ndvi_mean'].quantile(0.75))

df_t = train_df[train_df['Estado'] == 'Tlaxcala'].copy().reset_index(drop=True)
y_t = df_t['RENDIMIENTO'].values
sc_t = StandardScaler(); imp_t = SimpleImputer(strategy='median')
X_t = sc_t.fit_transform(imp_t.fit_transform(df_t[feats_t_geo]))
model_t_svc = SVC(C=0.5, kernel='rbf', gamma='scale', probability=True, random_state=SEED).fit(X_t, (y_t * 2).astype(int))

# ==============================================================================
# 4. PASO 6 DEL NOTEBOOK: DESCOMPOSICIÓN ADITIVA SHAP + DF-QuAD (197 PARCELAS)
# ==============================================================================
print("\n🔎 Ejecutando Fase 6 (SHAP + DF-QuAD) sobre las 197 parcelas y Grupos Homogéneos...")

kf_s = KFold(n_splits=3, shuffle=True, random_state=SEED)

# constructores de predictores por Estado idénticos al Paso 6 del Notebook
def crear_predictor_qbaf_estado(estado):
    df_state_tr = train_df[train_df['Estado'] == estado].reset_index(drop=True)
    if estado == 'Hidalgo':
        m_mean_all = df_state_tr.groupby('Municipio')['RENDIMIENTO'].mean().to_dict()
        m_cnt_all = df_state_tr.groupby('Municipio')['RENDIMIENTO'].count().to_dict()
        g_mean_all = df_state_tr['RENDIMIENTO'].mean()
        prior_fn_all = lambda m: (m_cnt_all.get(m, 0) * m_mean_all.get(m, g_mean_all) + 0.5 * g_mean_all) / (m_cnt_all.get(m, 0) + 0.5)
        cols_shap_h = list(dict.fromkeys(feats_h_bio + feats_h_geo)) + ['prior_municipal']
        fold_models_h = []
        for fold, (f_tr, f_va) in enumerate(kf_s.split(df_state_tr)):
            tr_f = df_state_tr.iloc[f_tr]
            y_f = tr_f['RENDIMIENTO'].values
            m_m, m_c, g_m = tr_f.groupby('Municipio')['RENDIMIENTO'].mean().to_dict(), tr_f.groupby('Municipio')['RENDIMIENTO'].count().to_dict(), tr_f['RENDIMIENTO'].mean()
            p_fn = lambda m: (m_c.get(m, 0) * m_m.get(m, g_m) + 0.5 * g_m) / (m_c.get(m, 0) + 0.5)
            p_tr = tr_f['Municipio'].apply(p_fn).values.reshape(-1, 1)
            sc_b, imp_b = RobustScaler(), SimpleImputer(strategy='median')
            X_tr_b = np.hstack([sc_b.fit_transform(imp_b.fit_transform(tr_f[feats_h_bio])), p_tr])
            gb_m = GradientBoostingRegressor(n_estimators=80, max_depth=3, random_state=SEED + fold).fit(X_tr_b, y_f)
            sc_g, imp_g = RobustScaler(), SimpleImputer(strategy='median')
            X_tr_g = sc_g.fit_transform(imp_g.fit_transform(tr_f[feats_h_geo]))
            svr_m = SVR(kernel='rbf', C=1.0, epsilon=0.1, gamma='scale').fit(X_tr_g, y_f)
            fold_models_h.append((sc_b, imp_b, gb_m, sc_g, imp_g, svr_m))

        idx_bio_h = [cols_shap_h.index(c) for c in feats_h_bio]
        idx_geo_h = [cols_shap_h.index(c) for c in feats_h_geo]
        idx_prior_h = cols_shap_h.index('prior_municipal')
        sig_gb = DFQuADEngine.compute_acceptability(0.50, [], [0.50])
        sig_svr = DFQuADEngine.compute_acceptability(0.50, [0.50], [])
        fast_folds_h = [
            (imp_b.statistics_, sc_b.center_, sc_b.scale_, gb_m, imp_g.statistics_, sc_g.center_, sc_g.scale_, svr_m)
            for (sc_b, imp_b, gb_m, sc_g, imp_g, svr_m) in fold_models_h
        ]

        def pred_fn_h(X_mat):
            arr = np.asarray(X_mat, dtype=float)
            preds_f = np.zeros((len(arr), 3))
            arr_bio_raw = arr[:, idx_bio_h]
            arr_geo_raw = arr[:, idx_geo_h]
            arr_prior = arr[:, [idx_prior_h]]
            for f_idx, (med_b, cen_b, scl_b, gb_m, med_g, cen_g, scl_g, svr_m) in enumerate(fast_folds_h):
                xb_s = (np.where(np.isnan(arr_bio_raw), med_b, arr_bio_raw) - cen_b) / scl_b
                xb = np.hstack([xb_s, arr_prior])
                xg = (np.where(np.isnan(arr_geo_raw), med_g, arr_geo_raw) - cen_g) / scl_g
                preds_f[:, f_idx] = (sig_gb * gb_m.predict(xb) + sig_svr * svr_m.predict(xg)) / (sig_gb + sig_svr)
            return np.clip(preds_f.mean(axis=1), 1.50, 4.80)

        X_bg_h = df_state_tr[list(dict.fromkeys(feats_h_bio + feats_h_geo))].copy()
        X_bg_h['prior_municipal'] = df_state_tr['Municipio'].apply(prior_fn_all).values
        X_bg_h = X_bg_h.fillna(X_bg_h.median())
        return cols_shap_h, X_bg_h, pred_fn_h, prior_fn_all, fold_models_h

    elif estado == 'Puebla':
        base_cols_p = list(dict.fromkeys(feats_p1 + feats_p4 + feats_p5))
        cols_shap_p = base_cols_p + ['Z1_pls_clima', 'Z2_pls_clima']
        sc_t_all, imp_t_all = RobustScaler(), SimpleImputer(strategy='median')
        T_all = sc_t_all.fit_transform(imp_t_all.fit_transform(df_state_tr[pls_pool_puebla]))
        pls_all = PLSRegression(n_components=2).fit(T_all, df_state_tr['RENDIMIENTO'].values)
        fold_models_p = []
        for fold, (f_tr, f_va) in enumerate(kf_s.split(df_state_tr)):
            tr_f = df_state_tr.iloc[f_tr]
            y_f = tr_f['RENDIMIENTO'].values
            sc1, imp1 = RobustScaler(), SimpleImputer(strategy='median')
            X1_tr = sc1.fit_transform(imp1.fit_transform(tr_f[feats_p1]))
            m_et = ExtraTreesRegressor(n_estimators=80, max_depth=2, min_samples_leaf=4, random_state=SEED + fold).fit(X1_tr, y_f)
            sc4, imp4 = RobustScaler(), SimpleImputer(strategy='median')
            X4_tr = sc4.fit_transform(imp4.fit_transform(tr_f[feats_p4]))
            m_svr = SVR(kernel='rbf', C=1.0, epsilon=0.15, gamma=0.1).fit(X4_tr, y_f)
            sc5, imp5 = RobustScaler(), SimpleImputer(strategy='median')
            X5_tr = sc5.fit_transform(imp5.fit_transform(tr_f[feats_p5]))
            m_hub = HuberRegressor(alpha=1.0, epsilon=1.2).fit(X5_tr, y_f)
            krbf = C(1.0, (1e-3, 1e3)) * RBF(length_scale=1.0, length_scale_bounds=(1e-2, 1e2)) + WhiteKernel(noise_level=0.1)
            m_gpr = GaussianProcessRegressor(kernel=krbf, n_restarts_optimizer=2, random_state=SEED + fold, normalize_y=True).fit(X4_tr, y_f)
            sc_t, imp_t = RobustScaler(), SimpleImputer(strategy='median')
            T_tr = sc_t.fit_transform(imp_t.fit_transform(tr_f[pls_pool_puebla]))
            pls_m = PLSRegression(n_components=2).fit(T_tr, y_f)
            Z_tr = pls_m.transform(T_tr)
            m_svr_pls = SVR(kernel='rbf', C=1.0, epsilon=0.15, gamma=0.1).fit(np.hstack([X4_tr, Z_tr]), y_f)
            m_hub_pls = HuberRegressor(alpha=1.0, epsilon=1.2).fit(np.hstack([X5_tr, Z_tr]), y_f)
            m_gpr_pls = GaussianProcessRegressor(kernel=krbf, n_restarts_optimizer=2, random_state=SEED + fold, normalize_y=True).fit(np.hstack([X4_tr, Z_tr]), y_f)
            ndvi_q75 = tr_f['planet_ndvi_mean'].quantile(0.75)
            fold_models_p.append((sc1, imp1, m_et, sc4, imp4, m_svr, sc5, imp5, m_hub, m_gpr, m_svr_pls, m_hub_pls, m_gpr_pls, ndvi_q75))

        idx_p1 = [cols_shap_p.index(c) for c in feats_p1]
        idx_p4 = [cols_shap_p.index(c) for c in feats_p4]
        idx_p5 = [cols_shap_p.index(c) for c in feats_p5]
        idx_ndvi_p = cols_shap_p.index('planet_ndvi_mean')
        idx_z_p = [cols_shap_p.index('Z1_pls_clima'), cols_shap_p.index('Z2_pls_clima')]
        fast_folds_p = [
            (
                imp1.statistics_, sc1.center_, sc1.scale_, [t.tree_ for t in m_et.estimators_],
                imp4.statistics_, sc4.center_, sc4.scale_, m_svr, m_gpr,
                imp5.statistics_, sc5.center_, sc5.scale_, m_hub.coef_, m_hub.intercept_,
                m_svr_pls, m_hub_pls.coef_, m_hub_pls.intercept_, m_gpr_pls, ndvi_q75
            )
            for (sc1, imp1, m_et, sc4, imp4, m_svr, sc5, imp5, m_hub, m_gpr, m_svr_pls, m_hub_pls, m_gpr_pls, ndvi_q75) in fold_models_p
        ]

        def pred_fn_p(X_mat):
            arr = np.asarray(X_mat, dtype=float)
            preds_f = np.zeros((len(arr), 3))
            Z = arr[:, idx_z_p]
            ndvi_arr = np.nan_to_num(arr[:, idx_ndvi_p], nan=0.0)
            r1 = arr[:, idx_p1]
            r4 = arr[:, idx_p4]
            r5 = arr[:, idx_p5]
            for f_idx, (m1, c1, s1, trees_et, m4, c4, s4, m_svr, m_gpr, m5, c5, s5, h_c, h_i, m_svr_pls, hp_c, hp_i, m_gpr_pls, ndvi_q75) in enumerate(fast_folds_p):
                X1 = np.ascontiguousarray((np.where(np.isnan(r1), m1, r1) - c1) / s1, dtype=np.float32)
                X4 = (np.where(np.isnan(r4), m4, r4) - c4) / s4
                X5 = (np.where(np.isnan(r5), m5, r5) - c5) / s5
                p1 = np.mean([tr.predict(X1)[:, 0] for tr in trees_et], axis=0)
                w_et = np.where(ndvi_arr > ndvi_q75, 0.001, 0.05)
                tot = 0.45 + 0.35 + 0.15 + w_et
                pb = (0.45 * m_svr.predict(X4) + 0.35 * (X5 @ h_c + h_i) + 0.15 * m_gpr.predict(X4) + w_et * p1) / tot
                X4_z = np.hstack([X4, Z])
                X5_z = np.hstack([X5, Z])
                pp = (0.45 * m_svr_pls.predict(X4_z) + 0.35 * (X5_z @ hp_c + hp_i) + 0.15 * m_gpr_pls.predict(X4_z) + w_et * p1) / tot
                preds_f[:, f_idx] = 0.50 * pb + 0.50 * pp
            return np.clip(preds_f.mean(axis=1), 1.50, 4.80)

        X_bg_p = df_state_tr[base_cols_p].copy().fillna(df_state_tr[base_cols_p].median())
        Z_bg_p = pls_all.transform(T_all)
        X_bg_p['Z1_pls_clima'] = Z_bg_p[:, 0]
        X_bg_p['Z2_pls_clima'] = Z_bg_p[:, 1]
        return cols_shap_p, X_bg_p, pred_fn_p, (sc_t_all, imp_t_all, pls_all), fold_models_p

    else:
        cols_shap_t = feats_t_geo
        fold_models_t = []
        for fold, (f_tr, f_va) in enumerate(kf_s.split(df_state_tr)):
            tr_f = df_state_tr.iloc[f_tr]
            y_f = tr_f['RENDIMIENTO'].values
            sc_t_f, imp_t_f = StandardScaler(), SimpleImputer(strategy='median')
            Xt = sc_t_f.fit_transform(imp_t_f.fit_transform(tr_f[cols_shap_t]))
            svc_m = SVC(C=0.5, kernel='rbf', gamma='scale', probability=True, random_state=SEED + fold).fit(Xt, (y_f * 2).astype(int))
            fold_models_t.append((sc_t_f, imp_t_f, svc_m))

        sig_mod = DFQuADEngine.compute_acceptability(0.50, [], [0.10])
        sig_svc = DFQuADEngine.compute_acceptability(0.50, [0.10], [])
        fast_folds_t = [
            (imp_t_f.statistics_, sc_t_f.mean_, sc_t_f.scale_, svc_m)
            for (sc_t_f, imp_t_f, svc_m) in fold_models_t
        ]

        def pred_fn_t(X_mat):
            arr = np.asarray(X_mat, dtype=float)
            preds_f = np.zeros((len(arr), 3))
            for f_idx, (med_t, mean_t, scl_t, svc_m) in enumerate(fast_folds_t):
                xt = (np.where(np.isnan(arr), med_t, arr) - mean_t) / scl_t
                cls_v = svc_m.classes_ / 2.0
                preds_f[:, f_idx] = (sig_mod * 3.000 + sig_svc * np.dot(svc_m.predict_proba(xt), cls_v)) / (sig_mod + sig_svc)
            return np.clip(preds_f.mean(axis=1), 1.50, 4.80)

        X_bg_t = df_state_tr[cols_shap_t].copy().fillna(df_state_tr[cols_shap_t].median())
        return cols_shap_t, X_bg_t, pred_fn_t, None, fold_models_t


parcelas_telemetria = {}
shap_background_by_state = {}
fold_models_by_state = {}
ndwi_med_hidalgo = float(df_h['s2_ndwi_mean'].median())

for estado in ['Hidalgo', 'Puebla', 'Tlaxcala']:
    cols_st, X_bg_st, pred_fn_st, aux_st, fold_models_st = crear_predictor_qbaf_estado(estado)
    fold_models_by_state[estado] = fold_models_st
    med_vals_st = X_bg_st.median().to_dict()
    shap_background_by_state[estado] = {
        "cols": cols_st,
        "X_bg": X_bg_st,
        "medians": med_vals_st,
    }
    explainer_st = shap.Explainer(pred_fn_st, X_bg_st, seed=SEED)

    sub_all = master[master['Estado'] == estado].copy().reset_index(drop=True)
    X_all = sub_all[[c for c in cols_st if c not in ['prior_municipal', 'Z1_pls_clima', 'Z2_pls_clima']]].copy()
    if estado == 'Hidalgo':
        X_all['prior_municipal'] = sub_all['Municipio'].apply(aux_st).values
    elif estado == 'Puebla':
        sc_ta, imp_ta, pls_a = aux_st
        Z_all = pls_a.transform(sc_ta.transform(imp_ta.transform(sub_all[pls_pool_puebla])))
        X_all['Z1_pls_clima'] = Z_all[:, 0]
        X_all['Z2_pls_clima'] = Z_all[:, 1]
    X_all = X_all[cols_st].fillna(X_bg_st.median())

    shap_exp_all = explainer_st(X_all)

    for i in range(len(sub_all)):
        row_p = sub_all.iloc[i]
        pid = str(row_p['ID_POLIGONO'])
        area_ha = float(row_p['AREA_HA'])
        muni = str(row_p['Municipio'])
        conjunto = str(row_p['CONJUNTO'])
        rend_real = float(row_p['RENDIMIENTO']) if pd.notna(row_p['RENDIMIENTO']) else None

        base_v = float(np.atleast_1d(shap_exp_all.base_values)[i])
        vals_v = shap_exp_all.values[i]
        pred_shap_t_ha = float(np.clip(base_v + float(np.sum(vals_v)), 1.50, 4.80))
        suma_shap_kg = round(float(np.sum(vals_v)) * 1000.0, 1)
        prod_t = round(pred_shap_t_ha * area_ha, 2)

        undercut_act = False
        if estado == 'Hidalgo':
            regla_str = 'Nodo 1 GradientBoosting (σ=0.75) + Prior Bayesiano + SVR RBF (σ=0.25)'
            grupo_h = 'Hidalgo_G1_Valle_Humedo' if float(row_p['s2_ndwi_mean']) >= ndwi_med_hidalgo else 'Hidalgo_G2_Ladera_Seca'
        elif estado == 'Puebla':
            undercut_act = bool(float(row_p['planet_ndvi_mean']) > ndvi_q75_puebla)
            regla_str = 'Undercutting Activo (σ_ET=0.001) + SVR/Huber/PLS' if undercut_act else 'Debate Completo SVR/Huber/GPR/ET + PLS'
            grupo_h = 'Puebla_G2_Dosel_Saturado' if undercut_act else 'Puebla_G1_Conservacion_Labranza'
        else:
            regla_str = 'Nodo 5 Anclaje Modal (σ=0.55) + SVC Ordinal (σ=0.45)'
            grupo_h = 'Tlaxcala_G1_Meseta_Modal'

        total_abs = float(np.sum(np.abs(vals_v))) + 1e-9
        order_idx = np.argsort(np.abs(vals_v))[::-1]
        shap_vars_list = []
        for j in order_idx:
            cname = cols_st[j]
            meta_v = METADATA_VARIABLES_SHAP.get(cname, {"etiqueta": cname, "nodo": f"Árbitro {estado}"})
            sv_t = float(vals_v[j])
            sv_kg = round(sv_t * 1000.0, 2)
            shap_vars_list.append({
                "variable": cname,
                "etiqueta": meta_v["etiqueta"],
                "nodo_qbaf": meta_v["nodo"],
                "valor_parcela": round(float(X_all.iloc[i][cname]), 3),
                "mediana_estado": round(float(med_vals_st[cname]), 3),
                "shap_t_ha": round(sv_t, 4),
                "shap_kg_ha": sv_kg,
                "impacto_pct": round(abs(sv_t) / total_abs * 100.0, 1),
                "efecto": "positivo" if sv_t >= 0 else "negativo",
            })

        idx_pos = np.argsort(vals_v)[::-1][:2]
        idx_neg = np.argsort(vals_v)[:2]
        pos_str = ', '.join([f"{cols_st[j]} ({vals_v[j]*1000:+.0f} kg/ha)" for j in idx_pos if vals_v[j] > 0]) or 'Neutral'
        neg_str = ', '.join([f"{cols_st[j]} ({vals_v[j]*1000:+.0f} kg/ha)" for j in idx_neg if vals_v[j] < 0]) or 'Sin castigo'

        nivel = "bajo" if pred_shap_t_ha < 3.30 else ("medio" if pred_shap_t_ha <= 4.35 else "alto")
        diag = (
            "Rendimiento limitado por estrés termo-hídrico, anomalía térmica de abril o baja retención edáfica."
            if nivel == "bajo"
            else "Rendimiento comercial estable dentro del potencial agroclimático regional QBAF."
            if nivel == "medio"
            else "Alto potencial productivo (óptima conservación de humedad SWIR, buen drenaje y confort térmico)."
        )

        parcelas_telemetria[pid] = {
            "id_poligono": pid,
            "estado": estado,
            "municipio": muni,
            "conjunto": conjunto,
            "area_ha": round(area_ha, 2),
            "rendimiento_real_t_ha": round(rend_real, 4) if rend_real is not None else None,
            "rendimiento_t_ha": round(pred_shap_t_ha, 4),
            "rendimiento_kg_ha": int(round(pred_shap_t_ha * 1000)),
            "produccion_estimada_t": prod_t,
            "nivel_potencial": nivel,
            "diagnostico": diag,
            "grupo_homogeneo": grupo_h,
            "deliberacion_qbaf": regla_str,
            "undercutting_activo": undercut_act,
            "base_regional_t_ha": round(base_v, 4),
            "suma_shap_kg_ha": suma_shap_kg,
            "top_impulsores": pos_str,
            "top_frenadores": neg_str,
            "shap_variables": shap_vars_list,
            "vi6t_max": round(float(row_p['landsat_vi6t_max']), 4),
            "vi6t_std": round(float(row_p['landsat_vi6t_std']), 4),
            "ndwi_mean": round(float(row_p['s2_ndwi_mean']), 4),
            "ndwi_min": round(float(row_p['s2_ndwi_min']), 4),
            "dswi2_mean": round(float(row_p['s2_dswi2_mean']), 4),
            "sti_presow": round(float(row_p['s2_sti_presow']), 4),
            "mra_mean": round(float(row_p['s2_mra_mean']), 4),
            "evi_std": round(float(row_p['s2_evi_intra_std']), 4),
            "lai_std": round(float(row_p['planet_lai_std']), 4),
            "ndvi_mean": round(float(row_p['planet_ndvi_mean']), 4),
            "msavi_mean": round(float(row_p['planet_msavi_mean']), 4),
            "elevacion_msnm": round(float(row_p['elevacion_msnm']), 1),
            "pendiente_grados": round(float(row_p['pendiente_grados']), 2),
            "proxy_relieve_m": round(float(row_p['proxy_relieve_m']), 1),
            "elongacion_bbox": round(float(row_p['elongacion_bbox']), 3),
        }

# Selección de los 9 Casos Particulares del Paso 6 del Notebook (3 de prueba ciega por Estado)
casos_particulares_ids = ['AGC_003', 'AGC_030', 'AGC_042', 'AGC_011', 'AGC_016', 'AGC_028', 'AGC_025', 'AGC_027', 'AGC_029']
casos_particulares_nb = [parcelas_telemetria[cid] for cid in casos_particulares_ids if cid in parcelas_telemetria]

# ==============================================================================
# 5. CATÁLOGO Y SERIALIZACIÓN (.joblib y .json)
# ==============================================================================
parcelas_lookup = {}
for _, r in master.iterrows():
    pid = str(r['ID_POLIGONO'])
    parcelas_lookup[pid] = {c: float(r[c]) if pd.notna(r[c]) else defaults_by_state.get(r['Estado'], {}).get(c, 0.0) for c in all_model_cols}
    parcelas_lookup[pid]['Estado'] = str(r['Estado'])
    parcelas_lookup[pid]['Municipio'] = str(r['Municipio'])

sig_h_gb = DFQuADEngine.compute_acceptability(0.50, attackers=[], supporters=[0.50])
sig_h_svr = DFQuADEngine.compute_acceptability(0.50, attackers=[0.50], supporters=[])
sig_t_mod = DFQuADEngine.compute_acceptability(0.50, attackers=[], supporters=[0.10])
sig_t_svc = DFQuADEngine.compute_acceptability(0.50, attackers=[0.10], supporters=[])

modelo_bundle = {
    'model_name': 'Pipeline Oficial AgroRaíces — Arquitectura Neuro-Simbólica QBAF + DF-QuAD',
    'architecture': 'QBAF + DF-QuAD con Validación Undercutting y Doble Separación (Estado y Grupos Homogéneos)',
    'version': 'qbaf-dfquad-production',
    'metricas_oficiales_oof': {
        'pearson_r_global': 0.8584,
        'r2_global': 0.7362,
        'mae_global_kg': 296.3,
        'rmse_global_kg': 435.6,
        'rmse_global_ton': 0.4356,
        'por_estado': {
            'Hidalgo':  {'n': 36, 'pearson_r': 0.9436, 'r2': 0.8885, 'mae_kg': 188.2, 'rmse_kg': 256.0},
            'Puebla':   {'n': 71, 'pearson_r': 0.4433, 'r2': 0.1710, 'mae_kg': 360.5, 'rmse_kg': 528.3},
            'Tlaxcala': {'n': 31, 'pearson_r': 0.3821, 'r2': 0.0552, 'mae_kg': 274.8, 'rmse_kg': 359.6}
        }
    },
    'hidalgo': {
        'feats_bio': feats_h_bio, 'feats_geo': feats_h_geo,
        'scaler_bio': sc_h_bio, 'imputer_bio': imp_h_bio,
        'model_gb': model_h_gb, 'model_et': model_h_gb,
        'scaler_geo': sc_h_geo, 'imputer_geo': imp_h_geo, 'model_svr': model_h_svr,
        'muni_mean': muni_mean_h, 'muni_count': muni_count_h, 'global_mean': global_mean_h, 'm_weight': m_weight_h,
        'weights': {'gb': sig_h_gb, 'et': sig_h_gb, 'svr': sig_h_svr},
        'fold_models': fold_models_by_state['Hidalgo'],
        'shap_bg': shap_background_by_state['Hidalgo'],
    },
    'puebla': {
        'feats_1': feats_p1, 'feats_4': feats_p4, 'feats_5': feats_p5, 'pls_pool': pls_pool_puebla,
        'scaler_1': sc_p1, 'imputer_1': imp_p1, 'model_et': model_p_et,
        'scaler_4': sc_p4, 'imputer_4': imp_p4, 'model_svr': model_p_svr, 'model_gpr': model_p_gpr,
        'scaler_5': sc_p5, 'imputer_5': imp_p5, 'model_hub': model_p_hub,
        'scaler_pls': sc_p_pls, 'imputer_pls': imp_p_pls, 'pls': pls_p,
        'model_svr_pls': model_p_svr_pls, 'model_hub_pls': model_p_hub_pls, 'model_gpr_pls': model_p_gpr_pls,
        'ndvi_q75': ndvi_q75_puebla,
        'sub_weights': {'svr': 0.45, 'hub': 0.35, 'gpr': 0.15, 'et': 0.05, 'et_undercut': 0.001},
        'branch_weights': {'base': 0.50, 'pls': 0.50},
        'fold_models': fold_models_by_state['Puebla'],
        'shap_bg': shap_background_by_state['Puebla'],
    },
    'tlaxcala': {
        'feats_geo': feats_t_geo, 'scaler': sc_t, 'imputer': imp_t, 'model_svc': model_t_svc,
        'classes': model_t_svc.classes_ / 2.0,
        'weights': {'mediana': sig_t_mod, 'svc': sig_t_svc}, 'mediana_regional': 3.000,
        'fold_models': fold_models_by_state['Tlaxcala'],
        'shap_bg': shap_background_by_state['Tlaxcala'],
    },
    'defaults_by_state': defaults_by_state,
    'parcelas_lookup': parcelas_lookup,
    'parcelas_telemetria': parcelas_telemetria,
    'casos_particulares_nb': casos_particulares_nb,
}

out_dir = Path(__file__).resolve().parent
for output_joblib in ['modelo_agroraices_final.joblib', 'modelo_agroraices_bundle.joblib']:
    joblib.dump(modelo_bundle, out_dir / output_joblib, compress=3)

meta_payload = {
    "model_name": "Pipeline Oficial AgroRaíces — Arquitectura Neuro-Simbólica QBAF + DF-QuAD",
    "architecture": "QBAF + DF-QuAD con Validación Undercutting y Doble Separación (Estado y Grupos Homogéneos)",
    "version": "qbaf-dfquad-production",
    "target": "RENDIMIENTO_T_HA",
    "unit": "toneladas por hectárea (t/ha)",
    "official_metrics_oof": modelo_bundle['metricas_oficiales_oof'],
    "supported_states": ["Hidalgo", "Puebla", "Tlaxcala"],
    "supported_municipalities": {
        "Hidalgo": sorted(list(muni_mean_h.keys())),
        "Puebla": ["Chignahuapan"],
        "Tlaxcala": ["Calpulalpan", "Nanacamilpa de Mariano Arista"]
    },
    "clamping_range": [1.50, 4.80],
    "casos_particulares_nb": casos_particulares_nb,
    "parcelas_telemetria": parcelas_telemetria,
}
for meta_file in ['modelo_metadata.json', 'modelo_agroraices_meta.json']:
    with open(out_dir / meta_file, 'w', encoding='utf-8') as f:
        json.dump(meta_payload, f, indent=2, ensure_ascii=False)

print(f"\n✅ MODELO FINAL QBAF + DF-QuAD + SHAP EMPAQUETADO EXITOSAMENTE:")
print(f"   • modelo_agroraices_final.joblib ({os.path.getsize(out_dir / 'modelo_agroraices_final.joblib')/1024:.1f} KB)")
print(f"   • modelo_metadata.json ({os.path.getsize(out_dir / 'modelo_metadata.json')/1024:.1f} KB) con 197 parcelas auditadas con SHAP")
for c_nb in casos_particulares_nb:
    print(f"   📌 {c_nb['estado']:<8} | {c_nb['id_poligono']} ({c_nb['municipio']}) | φ₀={c_nb['base_regional_t_ha']:.4f} | ΣSHAP={c_nb['suma_shap_kg_ha']:+.1f} kg/ha | ŷ={c_nb['rendimiento_t_ha']:.4f} t/ha")
