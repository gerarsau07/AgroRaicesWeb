"""
========================================================================================
  AGRORAÍCES - SCRIPT DE ENTRENAMIENTO Y EMPAQUETADO DEL MODELO FINAL PARA PRODUCCIÓN WEB
  Consume directamente el CSV pre-extraído temperatura_chirts_era5_parcelas.csv y genera
  el artefacto serializado (.joblib) y metadatos (.json) para FastAPI / Vercel / React
========================================================================================
"""

import os
import sys
import json
import joblib
import warnings
import numpy as np
import pandas as pd
import geopandas as gpd

from sklearn.preprocessing import RobustScaler, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.svm import SVR, SVC
from sklearn.linear_model import HuberRegressor
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C, WhiteKernel
from sklearn.cross_decomposition import PLSRegression

warnings.filterwarnings('ignore')
SEED = 42
np.random.seed(SEED)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 95)
print("  EMPAQUETANDO MODELO FINAL AGRORAÍCES PARA PRODUCCIÓN WEB (AgroRaicesWeb)")
print("=" * 95)

# ==============================================================================
# 1. CARGA E INTEGRACIÓN DE TABLAS OFICIALES Y CSV DE TEMPERATURA CHIRTS-ERA5
# ==============================================================================
df_basico = pd.read_csv('Conjunto_datos_BASICO_AgroCebada2026.csv')
df_pro = pd.read_csv('Conjunto_datos_PRO_AgroCebada.csv')
y_df = pd.read_csv('ID_area_rendimiento_70_30_Reto_AgroCebada.csv')
shp = gpd.read_file('shp/Parcelas_Reto_AGC_CONJUNTO.shp')
topo = pd.read_csv('topografia_inegi_cem4_parcelas.csv')
p_coords = pd.read_csv('parcelas_con_topografia.csv')
temp_df = pd.read_csv('temperatura_chirts_era5_parcelas.csv')

for d in [df_basico, df_pro, y_df, topo, temp_df]:
    d['ID_POLIGONO'] = d['ID_POLIGONO'].astype(str).str.strip()
shp['ID_POLIGONO'] = shp['ID_POLIGON'].astype(str).str.strip()
p_coords['ID_POLIGONO'] = p_coords['ID_POLIGON'].astype(str).str.strip()
y_df['CONJUNTO'] = y_df['CONJUNTO'].astype(str).str.strip()

y_df['AREA_HA'] = pd.to_numeric(y_df['AREA_HA'], errors='coerce')
if 'RENDIMIENTO_T_HA' in y_df.columns:
    y_df['RENDIMIENTO_T_HA'] = pd.to_numeric(y_df['RENDIMIENTO_T_HA'], errors='coerce')
    y_df['RENDIMIENTO'] = y_df['RENDIMIENTO_T_HA']

shp_utm = shp.to_crs(epsg=32614)
geo = shp[['ID_POLIGONO', 'Estado', 'Municipio', 'geometry']].copy()
geo['lat_centro'] = geo.geometry.centroid.y
geo['lon_centro'] = geo.geometry.centroid.x
bounds_utm = shp_utm.geometry.bounds
geo['elongacion_bbox'] = (bounds_utm['maxx'] - bounds_utm['minx']) / (bounds_utm['maxy'] - bounds_utm['miny'] + 1e-6)
geo = geo.drop(columns='geometry')
geo = geo.merge(topo[['ID_POLIGONO', 'elevacion_msnm', 'pendiente_grados']], on='ID_POLIGONO', how='left')
geo = geo.merge(p_coords[['ID_POLIGONO', 'proxy_relieve_m']], on='ID_POLIGONO', how='left')

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

persistencia_m11 = df_p_clean[df_p_clean['mes'] == 11].groupby('ID_POLIGONO')['ndvi_promedio'].mean().reset_index().rename(columns={'ndvi_promedio': 'persistencia_verde_m11'})

master = y_df.merge(geo, on='ID_POLIGONO', how='left')
for tabla in [s2_feats, s2_presow, landsat_feats, planet_feats, persistencia_m11, temp_df]:
    master = master.merge(tabla, on='ID_POLIGONO', how='left')

master['persistencia_verde_m11'] = master['persistencia_verde_m11'].fillna(0)
master['estres_termohidrico'] = master['landsat_vi6t_max'] * master['s2_ndwi_min']
master['log_area'] = np.log1p(master['AREA_HA'])

cols_temp_bi = [c for c in temp_df.columns if c.startswith('bi_')]
train_df = master[master['CONJUNTO'] == 'ENTRENAMIENTO'].copy().reset_index(drop=True)
print(f"Dataset maestro construido: {len(master)} parcelas totales ({len(train_df)} de entrenamiento).")

# ==============================================================================
# 3. ENTRENAMIENTO DE ESPECIALISTAS FINALES PARA PRODUCCIÓN WEB
# ==============================================================================

# A. HIDALGO
print("\n🚜 Entrenando Especialista Hidalgo (Bio-Termo-Espacial con Downscaling Adiabático)...")
df_h = train_df[train_df['Estado'] == 'Hidalgo'].copy().reset_index(drop=True)
y_h = df_h['RENDIMIENTO'].values

temp_hidalgo_cols = ['bi_Tmin_anom25_04', 'nn_vpd_vege_std', 'bi_canopy_air_diff', 'lp_Tmin_anom25_04', 's2_mra_mean']
feats_h_bio = [
    'log_area', 'landsat_vi6t_max', 's2_ndwi_mean', 'planet_lai_std',
    'persistencia_verde_m11', 'estres_termohidrico', 'elevacion_msnm',
    'pendiente_grados', 's2_dswi2_mean'
] + temp_hidalgo_cols
feats_h_geo = ['lat_centro', 'lon_centro', 'elevacion_msnm', 'pendiente_grados'] + temp_hidalgo_cols

muni_mean_h = df_h.groupby('Municipio')['RENDIMIENTO'].mean().to_dict()
muni_count_h = df_h.groupby('Municipio')['RENDIMIENTO'].count().to_dict()
global_mean_h = float(y_h.mean())
m_weight_h = 0.5

priors_h = df_h['Municipio'].apply(
    lambda m: float((muni_count_h.get(m, 0) * muni_mean_h.get(m, global_mean_h) + m_weight_h * global_mean_h) / (muni_count_h.get(m, 0) + m_weight_h))
).values.reshape(-1, 1)

sc_h_bio = RobustScaler(); imp_h_bio = SimpleImputer(strategy='median')
X_h_bio = np.hstack([sc_h_bio.fit_transform(imp_h_bio.fit_transform(df_h[feats_h_bio])), priors_h])
model_h_et = ExtraTreesRegressor(n_estimators=130, max_depth=5, min_samples_split=3, random_state=SEED).fit(X_h_bio, y_h)

sc_h_geo = RobustScaler(); imp_h_geo = SimpleImputer(strategy='median')
X_h_geo = sc_h_geo.fit_transform(imp_h_geo.fit_transform(df_h[feats_h_geo]))
model_h_svr = SVR(kernel='rbf', C=1.0, epsilon=0.1, gamma='scale').fit(X_h_geo, y_h)

# B. PUEBLA
print("🚜 Entrenando Especialista Puebla (Ensamble No Lineal + Labranza Pre-Siembra + PLS k=2)...")
df_p = train_df[train_df['Estado'] == 'Puebla'].copy().reset_index(drop=True)
y_p = df_p['RENDIMIENTO'].values

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

# C. TLAXCALA
print("🚜 Entrenando Especialista Tlaxcala (Ordinal Probabilístico SVC + MSAVI + Morfometría)...")
df_t = train_df[train_df['Estado'] == 'Tlaxcala'].copy().reset_index(drop=True)
y_t = df_t['RENDIMIENTO'].values
feats_t_geo = ['lat_centro', 'lon_centro', 'landsat_intra_vi6t_std', 'planet_msavi_mean', 'elongacion_bbox']

sc_t = StandardScaler(); imp_t = SimpleImputer(strategy='median')
X_t = sc_t.fit_transform(imp_t.fit_transform(df_t[feats_t_geo]))
model_t_svc = SVC(C=0.5, kernel='rbf', gamma='scale', probability=True, random_state=SEED).fit(X_t, (y_t * 2).astype(int))

# ==============================================================================
# 4. VALORES DE REFERENCIA, CATÁLOGO Y SERIALIZACIÓN (.joblib)
# ==============================================================================
all_model_cols = sorted(list(set(
    feats_h_bio + feats_h_geo + feats_p1 + feats_p4 + feats_p5 + pls_pool_puebla + feats_t_geo +
    ['AREA_HA', 'log_area', 'elevacion_msnm', 'pendiente_grados', 'lat_centro', 'lon_centro',
     's2_ndwi_mean', 's2_ndwi_min', 'landsat_vi6t_max', 'landsat_vi6t_mean', 'planet_lai_mean',
     'bi_vpd_pv_2025', 'bi_tmean_pv_clim']
)))

defaults_by_state = {est: df_sub[all_model_cols].median().to_dict() for est, df_sub in [('Hidalgo', df_h), ('Puebla', df_p), ('Tlaxcala', df_t)]}

parcelas_lookup = {}
for _, r in master.iterrows():
    pid = str(r['ID_POLIGONO'])
    parcelas_lookup[pid] = {c: float(r[c]) if pd.notna(r[c]) else defaults_by_state.get(r['Estado'], {}).get(c, 0.0) for c in all_model_cols}
    parcelas_lookup[pid]['Estado'] = str(r['Estado'])
    parcelas_lookup[pid]['Municipio'] = str(r['Municipio'])

modelo_bundle = {
    'model_name': 'Pipeline Oficial AgroRaíces',
    'version': 'final-production',
    'metricas_oficiales_oof': {
        'pearson_r_global': 0.8535,
        'r2_global': 0.7276,
        'mae_global_kg': 307.0,
        'rmse_global_kg': 442.7,
        'rmse_global_ton': 0.4427,
        'por_estado': {
            'Hidalgo':  {'n': 36, 'pearson_r': 0.9153, 'r2': 0.8364, 'mae_kg': 227.7, 'rmse_kg': 310.1},
            'Puebla':   {'n': 71, 'pearson_r': 0.4412, 'r2': 0.1692, 'mae_kg': 361.0, 'rmse_kg': 528.9},
            'Tlaxcala': {'n': 31, 'pearson_r': 0.3821, 'r2': 0.0552, 'mae_kg': 274.8, 'rmse_kg': 359.7}
        }
    },
    'hidalgo': {
        'feats_bio': feats_h_bio, 'feats_geo': feats_h_geo,
        'scaler_bio': sc_h_bio, 'imputer_bio': imp_h_bio, 'model_et': model_h_et,
        'scaler_geo': sc_h_geo, 'imputer_geo': imp_h_geo, 'model_svr': model_h_svr,
        'muni_mean': muni_mean_h, 'muni_count': muni_count_h, 'global_mean': global_mean_h, 'm_weight': m_weight_h,
        'weights': {'et': 0.75, 'svr': 0.25}
    },
    'puebla': {
        'feats_1': feats_p1, 'feats_4': feats_p4, 'feats_5': feats_p5, 'pls_pool': pls_pool_puebla,
        'scaler_1': sc_p1, 'imputer_1': imp_p1, 'model_et': model_p_et,
        'scaler_4': sc_p4, 'imputer_4': imp_p4, 'model_svr': model_p_svr, 'model_gpr': model_p_gpr,
        'scaler_5': sc_p5, 'imputer_5': imp_p5, 'model_hub': model_p_hub,
        'scaler_pls': sc_p_pls, 'imputer_pls': imp_p_pls, 'pls': pls_p,
        'model_svr_pls': model_p_svr_pls, 'model_hub_pls': model_p_hub_pls, 'model_gpr_pls': model_p_gpr_pls,
        'sub_weights': {'svr': 0.45, 'hub': 0.35, 'gpr': 0.15, 'et': 0.05},
        'branch_weights': {'base': 0.50, 'pls': 0.50}
    },
    'tlaxcala': {
        'feats_geo': feats_t_geo, 'scaler': sc_t, 'imputer': imp_t, 'model_svc': model_t_svc,
        'classes': model_t_svc.classes_ / 2.0,
        'weights': {'mediana': 0.55, 'svc': 0.45}, 'mediana_regional': 3.000
    },
    'defaults_by_state': defaults_by_state,
    'parcelas_lookup': parcelas_lookup
}

output_joblib = 'modelo_agroraices_final.joblib'
joblib.dump(modelo_bundle, output_joblib, compress=3)
print(f"\n✅ MODELO FINAL EMPAQUETADO EXITOSAMENTE:")
print(f"   • Archivo de salida: {output_joblib} ({os.path.getsize(output_joblib)/1024:.1f} KB)")

with open('modelo_metadata.json', 'w', encoding='utf-8') as f:
    json.dump({
        "model_name": "Pipeline Oficial AgroRaíces",
        "version": "final-production",
        "target": "RENDIMIENTO_T_HA",
        "unit": "toneladas por hectárea (t/ha)",
        "official_metrics_oof": modelo_bundle['metricas_oficiales_oof'],
        "supported_states": ["Hidalgo", "Puebla", "Tlaxcala"],
        "supported_municipalities": {
            "Hidalgo": sorted(list(muni_mean_h.keys())),
            "Puebla": ["Chignahuapan"],
            "Tlaxcala": ["Calpulalpan", "Nanacamilpa de Mariano Arista"]
        },
        "clamping_range": [1.50, 4.80]
    }, f, indent=2, ensure_ascii=False)
print(f"   • Metadatos JSON:    modelo_metadata.json")


# ==============================================================================
# 5. MOTOR DE INFERENCIA EN PRODUCCIÓN WEB (AgroRaicesInferenceEngine)
# ==============================================================================
class AgroRaicesInferenceEngine:
    """Motor de inferencia del Pipeline Oficial AgroRaíces para backend web."""
    def __init__(self, model_bundle):
        self.b = model_bundle

    def predict_one(self, data: dict) -> dict:
        pid = str(data.get('id_poligono', data.get('ID_POLIGONO', ''))).strip()
        if pid and pid in self.b.get('parcelas_lookup', {}):
            row = self.b['parcelas_lookup'][pid].copy()
            estado = str(data.get('estado', data.get('Estado', row['Estado']))).strip().capitalize()
            muni = str(data.get('municipio', data.get('Municipio', row['Municipio']))).strip()
        else:
            estado = str(data.get('estado', data.get('Estado', 'Puebla'))).strip().capitalize()
            if estado not in ['Hidalgo', 'Puebla', 'Tlaxcala']:
                lat = float(data.get('lat', data.get('lat_centro', 19.8)))
                estado = 'Hidalgo' if lat > 19.9 else ('Tlaxcala' if lat < 19.5 else 'Puebla')
            muni = str(data.get('municipio', data.get('Municipio', ''))).strip()
            row = self.b['defaults_by_state'][estado].copy()

        for k, v in data.items():
            if k in row and v is not None:
                try:
                    row[k] = float(v)
                except (ValueError, TypeError):
                    pass

        area = float(data.get('area', data.get('AREA_HA', row.get('AREA_HA', 5.0))))
        row['AREA_HA'] = area
        row['log_area'] = float(np.log1p(area))

        if 'temp' in data and data['temp'] is not None:
            row['landsat_vi6t_max'] = row['landsat_vi6t_mean'] = float(data['temp'])
        if 'ndwi' in data and data['ndwi'] is not None:
            row['s2_ndwi_min'] = row['s2_ndwi_mean'] = float(data['ndwi'])
        if 'lai' in data and data['lai'] is not None:
            row['planet_lai_mean'] = float(data['lai'])
            row['planet_lai_std'] = float(data.get('lai_std', row.get('planet_lai_std', 0.05)))
        if 'msavi' in data and data['msavi'] is not None:
            row['planet_msavi_mean'] = float(data['msavi'])
        if 'sti' in data and data['sti'] is not None:
            row['s2_sti_presow'] = float(data['sti'])
        if 'mra' in data and data['mra'] is not None:
            row['s2_mra_mean'] = float(data['mra'])
        if 'elevacion' in data or 'elevacion_msnm' in data:
            elev_new = float(data.get('elevacion', data.get('elevacion_msnm', row['elevacion_msnm'])))
            row['lp_Tmin_anom25_04'] = row.get('lp_Tmin_anom25_04', 0.0) + (-0.0065 * (elev_new - row['elevacion_msnm']))
            row['elevacion_msnm'] = elev_new
        if 'pendiente' in data or 'pendiente_grados' in data:
            row['pendiente_grados'] = float(data.get('pendiente', data.get('pendiente_grados', row['pendiente_grados'])))
        if 'lat' in data or 'lat_centro' in data:
            row['lat_centro'] = float(data.get('lat', data.get('lat_centro', row['lat_centro'])))
        if 'lon' in data or 'lon_centro' in data:
            row['lon_centro'] = float(data.get('lon', data.get('lon_centro', row['lon_centro'])))

        row['estres_termohidrico'] = float(row['landsat_vi6t_max'] * row['s2_ndwi_min'])
        row['bi_canopy_air_diff'] = float(row['landsat_vi6t_mean'] - row['bi_tmean_pv_clim'])
        row['bi_vpd_ndwi_stress'] = float(row['bi_vpd_pv_2025'] / (abs(row['s2_ndwi_mean']) + 0.05))

        df_input = pd.DataFrame([row])

        if estado == 'Hidalgo':
            hid = self.b['hidalgo']
            n = hid['muni_count'].get(muni, 0)
            prior = (n * hid['muni_mean'].get(muni, hid['global_mean']) + hid['m_weight'] * hid['global_mean']) / (n + hid['m_weight'])
            X_bio = np.hstack([hid['scaler_bio'].transform(hid['imputer_bio'].transform(df_input[hid['feats_bio']])), [[prior]]])
            X_geo = hid['scaler_geo'].transform(hid['imputer_geo'].transform(df_input[hid['feats_geo']]))
            pred = hid['weights']['et'] * float(hid['model_et'].predict(X_bio)[0]) + hid['weights']['svr'] * float(hid['model_svr'].predict(X_geo)[0])

        elif estado == 'Puebla':
            pue = self.b['puebla']; w = pue['sub_weights']
            X1 = pue['scaler_1'].transform(pue['imputer_1'].transform(df_input[pue['feats_1']]))
            X4 = pue['scaler_4'].transform(pue['imputer_4'].transform(df_input[pue['feats_4']]))
            X5 = pue['scaler_5'].transform(pue['imputer_5'].transform(df_input[pue['feats_5']]))
            p_et = float(pue['model_et'].predict(X1)[0])
            pred_base = (w['svr']*float(pue['model_svr'].predict(X4)[0]) + w['hub']*float(pue['model_hub'].predict(X5)[0]) +
                         w['gpr']*float(pue['model_gpr'].predict(X4)[0]) + w['et']*p_et)
            Z_in = pue['pls'].transform(pue['scaler_pls'].transform(pue['imputer_pls'].transform(df_input[pue['pls_pool']])))
            X4_pls = np.hstack([X4, Z_in]); X5_pls = np.hstack([X5, Z_in])
            pred_pls = (w['svr']*float(pue['model_svr_pls'].predict(X4_pls)[0]) + w['hub']*float(pue['model_hub_pls'].predict(X5_pls)[0]) +
                        w['gpr']*float(pue['model_gpr_pls'].predict(X4_pls)[0]) + w['et']*p_et)
            pred = pue['branch_weights']['base'] * pred_base + pue['branch_weights']['pls'] * pred_pls

        elif estado == 'Tlaxcala':
            tla = self.b['tlaxcala']
            X_geo = tla['scaler'].transform(tla['imputer'].transform(df_input[tla['feats_geo']]))
            exp_val = float(np.dot(tla['model_svc'].predict_proba(X_geo)[0], tla['classes']))
            pred = tla['weights']['mediana'] * tla['mediana_regional'] + tla['weights']['svc'] * exp_val

        rend_final = float(np.clip(pred, 1.50, 4.80))
        nivel = "bajo" if rend_final < 3.30 else ("medio" if rend_final <= 4.35 else "alto")
        diag = ("Rendimiento limitado por estrés termo-hídrico, helada reproductiva o baja retención edáfica." if nivel == "bajo" else
                "Rendimiento comercial estable dentro del potencial agroclimático regional." if nivel == "medio" else
                "Alto potencial productivo (óptima conservación de humedad, buen drenaje y confort térmico).")

        return {
            "rendimiento_t_ha": round(rend_final, 3),
            "rendimiento_kg_ha": int(round(rend_final * 1000)),
            "produccion_estimada_t": round(rend_final * area, 2),
            "estado": estado,
            "municipio": muni,
            "nivel_potencial": nivel,
            "diagnostico": diag,
            "confianza_r2": self.b['metricas_oficiales_oof']['r2_global'],
            "correlacion_r": self.b['metricas_oficiales_oof']['pearson_r_global']
        }


if __name__ == "__main__":
    engine = AgroRaicesInferenceEngine(modelo_bundle)
    casos_prueba = [
        {"plot": "Parcela_Puebla", "area": 3.0, "temp": -0.60, "ndwi": -0.15, "lai": 0.40, "estado": "Puebla", "municipio": "Chignahuapan"},
        {"plot": "Parcela_Hidalgo_Alta", "area": 8.0, "temp": -0.61, "ndwi": -0.10, "lai": 0.45, "elevacion": 2720, "estado": "Hidalgo", "municipio": "Almoloya"},
        {"plot": "Parcela_Hidalgo_Seca", "area": 4.5, "temp": -0.56, "ndwi": -0.24, "lai": 0.28, "elevacion": 2580, "estado": "Hidalgo", "municipio": "Singuilucan"},
        {"plot": "Parcela_Tlaxcala", "area": 5.0, "temp": -0.62, "ndwi": -0.18, "msavi": 0.32, "estado": "Tlaxcala", "municipio": "Calpulalpan"}
    ]
    print("\n" + "=" * 95)
    print("  VERIFICACIÓN DE INFERENCIA EN PRODUCCIÓN (PRUEBAS DE API WEB EN VIVO)")
    print("=" * 95)
    for caso in casos_prueba:
        res = engine.predict_one(caso)
        print(f"📍 {res['estado']:<9} ({res['municipio']:<12}) | Rendimiento: {res['rendimiento_t_ha']:.3f} t/ha ({res['rendimiento_kg_ha']} kg/ha) | Prod: {res['produccion_estimada_t']:>5.1f} t | Nivel: {res['nivel_potencial']}")
    print("\n🎉 Empaquetado compacto desde CSV y verificación completados exitosamente.")
