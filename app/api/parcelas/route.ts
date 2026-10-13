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
  rendimiento_t_ha?: number
  nivel_potencial?: string
  diagnostico?: string
  vi6t_max?: number
  ndwi_mean?: number
  evi_std?: number
  lai_std?: number
  proxy_relieve_m?: number
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estadoParam = searchParams.get('estado')

    // Intentar primero desde el backend FastAPI si está activo
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1200)
      const fastApiUrl = estadoParam
        ? `http://localhost:8000/api/parcelas?estado=${encodeURIComponent(estadoParam)}`
        : 'http://localhost:8000/api/parcelas'
      const resFast = await fetch(fastApiUrl, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (resFast.ok) {
        return NextResponse.json(await resFast.json())
      }
    } catch {
      // Continuar con lectura directa desde backend/data/
    }

    const telemetryMap = loadModelTelemetryMap()

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
      const esPrediccion = conjunto === 'PREDICCION'
      let rendimiento: number | null = null
      let nivel = 'Pendiente de inferencia'

      if (!esPrediccion) {
        rendimiento = tele.rendimiento_t_ha !== undefined
          ? Math.round(tele.rendimiento_t_ha * 100) / 100
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
          es_prediccion: esPrediccion,
          elevacion_msnm: elevacion,
          pendiente_grados: pendiente,
          proxy_relieve_m: proxyRelieveM,
          tipo_relieve: tipoRelieve,
          nivel_rendimiento: nivel,
          vi6t_max: tele.vi6t_max ?? -0.58,
          ndwi_mean: tele.ndwi_mean ?? 0.22,
          evi_std: tele.evi_std ?? 0.26,
          lai_std: tele.lai_std ?? 0.38,
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
      geojson: {
        type: 'FeatureCollection',
        features,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al procesar parcelas desde backend/data/' },
      { status: 500 }
    )
  }
}
