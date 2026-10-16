import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Elevaciones promedio de referencia por municipio (Altiplano Central de México)
const ELEVACIONES_MUNICIPIO: Record<string, number> = {
  Chignahuapan: 2260,
  Almoloya: 2520,
  Apan: 2488,
  'Cuautepec de Hinojosa': 2250,
  'Emiliano Zapata': 2490,
  Singuilucan: 2620,
  Tepeapulco: 2500,
  Calpulalpan: 2580,
  'Nanacamilpa de Mariano Arista': 2720,
}

const MUNICIPIO_BENCHMARKS: Record<string, number> = {
  Chignahuapan: 4.48,
  Almoloya: 4.52,
  'Cuautepec de Hinojosa': 4.60,
  Tepeapulco: 4.45,
  'Emiliano Zapata': 3.50,
  Singuilucan: 3.08,
  Apan: 3.00,
  Calpulalpan: 3.00,
  'Nanacamilpa de Mariano Arista': 2.50,
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseWKTPolygon(wkt: string): [number, number][][] | null {
  const match = wkt.match(/\(\((.*?)\)\)/)
  if (!match) return null

  const points: [number, number][] = []
  const pairs = match[1].split(',')
  for (const pair of pairs) {
    const parts = pair.trim().split(/\s+/)
    if (parts.length >= 2) {
      const lon = parseFloat(parts[0])
      const lat = parseFloat(parts[1])
      if (!isNaN(lon) && !isNaN(lat)) {
        points.push([lon, lat])
      }
    }
  }

  if (points.length < 3) return null
  return [points]
}

function readBackendDataFile(filename: string): string {
  const backendDataPath = path.join(process.cwd(), 'backend', 'data', filename)
  if (fs.existsSync(backendDataPath)) {
    return fs.readFileSync(backendDataPath, 'utf8')
  }
  throw new Error(`Archivo no encontrado en backend/data/: ${filename}`)
}

function loadModelTelemetryMap(): Record<string, {
  rendimiento_real_t_ha?: number | null
  rendimiento_t_ha?: number
  nivel_potencial?: string
  diagnostico?: string
  vi6t_max?: number
  ndwi_mean?: number
  evi_std?: number
  lai_std?: number
  ndvi_mean?: number
  msavi_mean?: number
  dswi2_mean?: number
  sti_presow?: number
  mra_mean?: number
  proxy_relieve_m?: number
  grupo_homogeneo?: string
  deliberacion_qbaf?: string
  undercutting_activo?: boolean
  base_regional_t_ha?: number
  suma_shap_kg_ha?: number
  top_impulsores?: string
  top_frenadores?: string
}> {
  try {
    const metaPath = path.join(process.cwd(), 'backend', 'routers', 'modelo_metadata.json')
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
      return meta.parcelas_telemetria || {}
    }
  } catch {
    // Fallback silencioso
  }
  return {}
}

function loadCampana2026Meta(): {
  parcelas_2026: Record<string, any>
  pronostico_municipal_2026: Record<string, any>
  resumen_estatal_2026: Record<string, any>
  estrategia_datos_2026: Record<string, any>
} {
  try {
    const p2026Path = path.join(process.cwd(), 'backend', 'routers', 'predicciones_2026_meta.json')
    if (fs.existsSync(p2026Path)) {
      const parsed = JSON.parse(fs.readFileSync(p2026Path, 'utf8'))
      return {
        parcelas_2026: parsed.parcelas_2026 || {},
        pronostico_municipal_2026: parsed.pronostico_municipal_2026 || {},
        resumen_estatal_2026: parsed.resumen_estatal_2026 || {},
        estrategia_datos_2026: parsed.estrategia_datos_2026 || {},
      }
    }
  } catch {
    // Fallback silencioso
  }
  return {
    parcelas_2026: {},
    pronostico_municipal_2026: {},
    resumen_estatal_2026: {},
    estrategia_datos_2026: {},
  }
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estadoParam = searchParams.get('estado')

    // Intentar primero desde el backend FastAPI si está activo
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1200)
      const fastApiUrl = estadoParam
        ? `${BACKEND_URL}/api/parcelas?estado=${encodeURIComponent(estadoParam)}`
        : `${BACKEND_URL}/api/parcelas`
      const resFast = await fetch(fastApiUrl, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (resFast.ok) {
        return NextResponse.json(await resFast.json())
      }
    } catch {
      // Continuar con lectura directa desde backend/data/
    }

    const telemetryMap = loadModelTelemetryMap()
    const campana2026 = loadCampana2026Meta()
    const parcelas2026Map = campana2026.parcelas_2026

    // 1. Leer topografía y variables agroclimáticas desde backend/data/topografia_inegi_cem4_parcelas.csv
    const topoMap = new Map<string, { elevacion: number; pendiente: number; proxy_relieve_m: number }>()
    try {
      const topoContent = readBackendDataFile('topografia_inegi_cem4_parcelas.csv')
      const topoLines = topoContent.split(/\r?\n/).filter((l) => l.trim().length > 0)
      const topoHeader = parseCSVLine(topoLines[0]).map((h) => h.replace(/^\uFEFF/, '').trim())
      const idxIdTopo = topoHeader.findIndex((h) => h.includes('ID_POLIGONO'))
      const idxElevTopo = topoHeader.findIndex((h) => h.includes('elevacion_msnm'))
      const idxPendTopo = topoHeader.findIndex((h) => h.includes('pendiente_grados'))
      const idxRelieveTopo = topoHeader.findIndex((h) => h.includes('proxy_relieve_m'))

      for (let i = 1; i < topoLines.length; i++) {
        const cols = parseCSVLine(topoLines[i])
        const pid = cols[idxIdTopo]?.trim()
        if (!pid) continue
        const elev = parseFloat(cols[idxElevTopo] || '')
        const pend = parseFloat(cols[idxPendTopo] || '')
        const rel = idxRelieveTopo >= 0 ? parseFloat(cols[idxRelieveTopo] || '') : 250.0
        topoMap.set(pid, {
          elevacion: !isNaN(elev) ? elev : 2550,
          pendiente: !isNaN(pend) ? pend : 2.0,
          proxy_relieve_m: !isNaN(rel) ? rel : 250.0,
        })
      }
    } catch (e) {
      console.warn('No se pudo cargar backend/data/topografia_inegi_cem4_parcelas.csv', e)
    }

    // 2. Leer parcelas desde backend/data/parcelas.csv (sin depender de ID_area_rendimiento_70_30_Reto_AgroCebada.csv)
    const parcelasContent = readBackendDataFile('parcelas.csv')
    const parcelasLines = parcelasContent.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const pHeader = parseCSVLine(parcelasLines[0]).map((h) => h.replace(/^\uFEFF/, '').trim())

    const idxId = pHeader.findIndex((h) => h.toLowerCase().includes('id_poligon'))
    const idxCultivo = pHeader.findIndex((h) => h.toLowerCase().includes('cultivo'))
    const idxArea = pHeader.findIndex((h) => h.toLowerCase().includes('rea_ha'))
    const idxMunicipio = pHeader.findIndex((h) => h.toLowerCase() === 'municipio')
    const idxEstado = pHeader.findIndex((h) => h.toLowerCase() === 'estado')
    const idxConjunto = pHeader.findIndex((h) => h.toLowerCase() === 'conjunto')
    const idxGeom = pHeader.findIndex((h) => h.toLowerCase() === 'geometry')

    const features: any[] = []
    let totalAreaHa = 0
    const rendimientosReales: number[] = []
    const elevaciones: number[] = []
    const pendientes: number[] = []

    for (let i = 1; i < parcelasLines.length; i++) {
      const cols = parseCSVLine(parcelasLines[i])
      const estado = cols[idxEstado]?.trim() || ''

      if (estadoParam && estado.toLowerCase() !== estadoParam.trim().toLowerCase()) {
        continue
      }

      const pid = cols[idxId]?.trim() || ''
      const geomWKT = cols[idxGeom] || ''
      const coords = parseWKTPolygon(geomWKT)
      if (!coords) continue

      const area = parseFloat(cols[idxArea] || '0') || 0
      const municipio = cols[idxMunicipio]?.trim() || ''
      const cultivo = cols[idxCultivo]?.trim() || 'Cebada'
      const conjunto = (idxConjunto >= 0 ? cols[idxConjunto]?.trim() : 'ENTRENAMIENTO').toUpperCase()

      const topoInfo = topoMap.get(pid)
      const elevacion = topoInfo
        ? Math.round(topoInfo.elevacion * 10) / 10
        : (ELEVACIONES_MUNICIPIO[municipio] ?? 2450)
      const pendiente = topoInfo
        ? Math.round(topoInfo.pendiente * 100) / 100
        : 2.0
      const proxyRelieveM = topoInfo
        ? Math.round(topoInfo.proxy_relieve_m * 10) / 10
        : 250.0

      let tipoRelieve = 'Plano (< 2°)'
      if (pendiente > 4.5) {
        tipoRelieve = 'Moderado (> 4.5°)'
      } else if (pendiente >= 2.0) {
        tipoRelieve = 'Suave (2° - 4.5°)'
      }

      const tele = telemetryMap[pid] || {}
      const tele26 = parcelas2026Map[pid] || {}
      const esPrediccion = conjunto === 'PREDICCION'
      let rendimiento: number | null = null
      let nivel = 'Pendiente de inferencia'

      if (!esPrediccion) {
        const refVal = tele.rendimiento_real_t_ha ?? tele.rendimiento_t_ha
        rendimiento = refVal !== undefined && refVal !== null
          ? Math.round(refVal * 100) / 100
          : (MUNICIPIO_BENCHMARKS[municipio] ?? 3.85)
        rendimientosReales.push(rendimiento)
        if (rendimiento < 3.2) nivel = 'Bajo (< 3.2 t/ha)'
        else if (rendimiento > 4.2) nivel = 'Alto (> 4.2 t/ha)'
        else nivel = 'Promedio (3.2 - 4.2 t/ha)'
      }

      totalAreaHa += area
      elevaciones.push(elevacion)
      pendientes.push(pendiente)

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: coords,
        },
        properties: {
          id_poligono: pid,
          cultivo,
          area_ha: Math.round(area * 100) / 100,
          municipio,
          estado,
          conjunto,
          rendimiento_t_ha: rendimiento,
          rendimiento_predicho_t_ha: tele.rendimiento_t_ha ?? null,
          rendimiento_2026_t_ha: tele26.RENDIMIENTO_2026_PROYECTADO_T_HA ?? tele.rendimiento_t_ha ?? null,
          produccion_2026_t: tele26.PRODUCCION_2026_ESTIMADA_T ?? null,
          cambio_2026_vs_2025_kg_ha: tele26.CAMBIO_2026_VS_2025_KG_HA ?? 0,
          anom_tmin_abril_2026_c: tele26.anom_tmin_abril_2026_c ?? -1.72,
          tmean_pv_2026_c: tele26.tmean_pv_2026_c ?? 18.5,
          gdd_cardinales_pv_2026: tele26.gdd_cardinales_pv_2026 ?? 2950,
          vpd_pv_2026_kpa: tele26.vpd_pv_2026_kpa ?? 0.66,
          lluvia_proyectada_pv_2026_mm: tele26.lluvia_proyectada_pv_2026_mm ?? 590,
          s2_ndwi_mean_2026: tele26.s2_ndwi_mean_2026 ?? tele.ndwi_mean ?? -0.15,
          s2_ndwi_min_2026: tele26.s2_ndwi_min_2026 ?? tele.ndwi_mean ?? -0.18,
          s2_dswi2_mean_2026: tele26.s2_dswi2_mean_2026 ?? tele.dswi2_mean ?? 2.15,
          landsat_vi6t_max_2026: tele26.landsat_vi6t_max_2026 ?? tele.vi6t_max ?? -0.55,
          planet_ndvi_mean_2026: tele26.planet_ndvi_mean_2026 ?? tele.ndvi_mean ?? 0.36,
          planet_lai_mean_2026: tele26.planet_lai_mean_2026 ?? 1.25,
          top_impulsores_shap_2026: tele26.top_impulsores_shap_2026 ?? tele.top_impulsores ?? null,
          top_frenadores_shap_2026: tele26.top_frenadores_shap_2026 ?? tele.top_frenadores ?? null,
          shap_variables_2026: tele26.shap_variables ?? [],
          es_prediccion: esPrediccion,
          elevacion_msnm: elevacion,
          pendiente_grados: pendiente,
          proxy_relieve_m: proxyRelieveM,
          tipo_relieve: tipoRelieve,
          nivel_rendimiento: nivel,
          vi6t_max: tele.vi6t_max ?? -0.58,
          ndwi_mean: tele.ndwi_mean ?? -0.15,
          evi_std: tele.evi_std ?? 0.06,
          lai_std: tele.lai_std ?? 0.38,
          ndvi_mean: tele.ndvi_mean ?? 0.34,
          msavi_mean: tele.msavi_mean ?? 0.44,
          dswi2_mean: tele.dswi2_mean ?? -0.42,
          sti_presow: tele.sti_presow ?? 1.18,
          mra_mean: tele.mra_mean ?? 0.38,
          grupo_homogeneo: tele.grupo_homogeneo ?? null,
          deliberacion_qbaf: tele.deliberacion_qbaf ?? null,
          undercutting_activo: tele.undercutting_activo ?? false,
          base_regional_t_ha: tele.base_regional_t_ha ?? null,
          suma_shap_kg_ha: tele.suma_shap_kg_ha ?? null,
          top_impulsores: tele.top_impulsores ?? null,
          top_frenadores: tele.top_frenadores ?? null,
        },
      })
    }

    const rendPromedio =
      rendimientosReales.length > 0
        ? Math.round((rendimientosReales.reduce((a, b) => a + b, 0) / rendimientosReales.length) * 100) / 100
        : 0

    const elevPromedio =
      elevaciones.length > 0
        ? Math.round(elevaciones.reduce((a, b) => a + b, 0) / elevaciones.length)
        : 0

    const pendPromedio =
      pendientes.length > 0
        ? Math.round((pendientes.reduce((a, b) => a + b, 0) / pendientes.length) * 100) / 100
        : 0

    return NextResponse.json({
      filtro_estado: estadoParam || 'Todos',
      metricas: {
        total_parcelas: features.length,
        rendimiento_promedio_t_ha: rendPromedio,
        superficie_total_ha: Math.round(totalAreaHa * 100) / 100,
        elevacion_promedio_msnm: elevPromedio,
        pendiente_promedio_grados: pendPromedio,
        parcelas_con_rendimiento_real: rendimientosReales.length,
        parcelas_para_prediccion: features.length - rendimientosReales.length,
      },
      campana_2026: {
        pronostico_municipal_2026: campana2026.pronostico_municipal_2026,
        resumen_estatal_2026: campana2026.resumen_estatal_2026,
        estrategia_datos_2026: campana2026.estrategia_datos_2026,
      },
      geojson: {
        type: 'FeatureCollection',
        features,
      },
    })
  } catch (error: unknown) {
    console.error('Error en /api/parcelas:', error)
    return NextResponse.json(
      { error: 'Error interno al procesar los datos geoespaciales de parcelas.' },
      { status: 500 }
    )
  }
}
