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

function readDataFile(filename: string): string {
  const primaryPath = path.join(process.cwd(), 'data', filename)
  if (fs.existsSync(primaryPath)) {
    return fs.readFileSync(primaryPath, 'utf8')
  }
  const fallbackPath = path.join(process.cwd(), 'backend', 'data', filename)
  if (fs.existsSync(fallbackPath)) {
    return fs.readFileSync(fallbackPath, 'utf8')
  }
  throw new Error(`Archivo no encontrado: ${filename}`)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estadoParam = searchParams.get('estado')

    // Leer rendimientos
    const rendContent = readDataFile('ID_area_rendimiento_70_30_Reto_AgroCebada.csv')
    const rendLines = rendContent.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const rendHeader = parseCSVLine(rendLines[0]).map((h) => h.replace(/^\uFEFF/, '').trim())
    const idIndexRend = rendHeader.findIndex((h) => h.includes('ID_POLIGONO'))
    const rendValIndex = rendHeader.findIndex((h) => h === 'RENDIMIENTO_T_HA')
    const conjuntoIndex = rendHeader.findIndex((h) => h === 'CONJUNTO')

    const rendMap = new Map<string, { rendimiento?: number; conjunto?: string }>()
    for (let i = 1; i < rendLines.length; i++) {
      const cols = parseCSVLine(rendLines[i])
      const pid = cols[idIndexRend]?.trim()
      if (!pid) continue
      const rendStr = cols[rendValIndex]?.trim()
      const rendNum = rendStr ? parseFloat(rendStr) : undefined
      rendMap.set(pid, {
        rendimiento: !isNaN(Number(rendNum)) ? Number(rendNum) : undefined,
        conjunto: cols[conjuntoIndex]?.trim(),
      })
    }

    // Leer topografía INEGI CEM 4.0 (elevación y pendiente de alta resolución)
    const topoMap = new Map<string, { elevacion: number; pendiente: number }>()
    try {
      const topoContent = readDataFile('topografia_inegi_cem4_parcelas.csv')
      const topoLines = topoContent.split(/\r?\n/).filter((l) => l.trim().length > 0)
      const topoHeader = parseCSVLine(topoLines[0]).map((h) => h.replace(/^\uFEFF/, '').trim())
      const idxIdTopo = topoHeader.findIndex((h) => h.includes('ID_POLIGONO'))
      const idxElevTopo = topoHeader.findIndex((h) => h.includes('elevacion_msnm'))
      const idxPendTopo = topoHeader.findIndex((h) => h.includes('pendiente_grados'))

      for (let i = 1; i < topoLines.length; i++) {
        const cols = parseCSVLine(topoLines[i])
        const pid = cols[idxIdTopo]?.trim()
        if (!pid) continue
        const elev = parseFloat(cols[idxElevTopo] || '')
        const pend = parseFloat(cols[idxPendTopo] || '')
        topoMap.set(pid, {
          elevacion: !isNaN(elev) ? elev : 2550,
          pendiente: !isNaN(pend) ? pend : 2.0,
        })
      }
    } catch (e) {
      console.warn('No se pudo cargar topografia_inegi_cem4_parcelas.csv, usando valores por municipio', e)
    }

    // Leer parcelas
    const parcelasContent = readDataFile('parcelas.csv')
    const parcelasLines = parcelasContent.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const pHeader = parseCSVLine(parcelasLines[0]).map((h) => h.replace(/^\uFEFF/, '').trim())

    const idxId = pHeader.findIndex((h) => h.toLowerCase().includes('id_poligon'))
    const idxCultivo = pHeader.findIndex((h) => h.toLowerCase().includes('cultivo'))
    const idxArea = pHeader.findIndex((h) => h.toLowerCase().includes('rea_ha'))
    const idxMunicipio = pHeader.findIndex((h) => h.toLowerCase() === 'municipio')
    const idxEstado = pHeader.findIndex((h) => h.toLowerCase() === 'estado')
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

      // Datos topográficos INEGI CEM v4 o fallback municipal
      const topoInfo = topoMap.get(pid)
      const elevacion = topoInfo
        ? Math.round(topoInfo.elevacion * 10) / 10
        : (ELEVACIONES_MUNICIPIO[municipio] ?? 2450)
      const pendiente = topoInfo
        ? Math.round(topoInfo.pendiente * 100) / 100
        : 2.0

      let tipoRelieve = 'Plano (< 2°)'
      if (pendiente > 4.5) {
        tipoRelieve = 'Moderado (> 4.5°)'
      } else if (pendiente >= 2.0) {
        tipoRelieve = 'Suave (2° - 4.5°)'
      }

      const rendInfo = rendMap.get(pid)
      const tieneRendReal = rendInfo?.rendimiento !== undefined
      const rendimiento = tieneRendReal ? rendInfo!.rendimiento! : 3.65

      if (tieneRendReal) {
        rendimientosReales.push(rendimiento)
      }
      totalAreaHa += area
      elevaciones.push(elevacion)
      pendientes.push(pendiente)

      let nivel = 'Promedio (3.2 - 4.2 t/ha)'
      if (rendimiento < 3.2) nivel = 'Bajo (< 3.2 t/ha)'
      else if (rendimiento > 4.2) nivel = 'Alto (> 4.2 t/ha)'

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
          conjunto: rendInfo?.conjunto || 'ENTRENAMIENTO',
          rendimiento_t_ha: Math.round(rendimiento * 100) / 100,
          es_prediccion: !tieneRendReal,
          elevacion_msnm: elevacion,
          pendiente_grados: pendiente,
          tipo_relieve: tipoRelieve,
          nivel_rendimiento: nivel,
        },
      })
    }

    const rendPromedio =
      rendimientosReales.length > 0
        ? Math.round(
            (rendimientosReales.reduce((a, b) => a + b, 0) / rendimientosReales.length) * 100
          ) / 100
        : 0

    const elevPromedio =
      elevaciones.length > 0
        ? Math.round(elevaciones.reduce((a, b) => a + b, 0) / elevaciones.length)
        : 0

    const pendPromedio =
      pendientes.length > 0
        ? Math.round(
            (pendientes.reduce((a, b) => a + b, 0) / pendientes.length) * 100
          ) / 100
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
      { error: error?.message || 'Error al procesar parcelas' },
      { status: 500 }
    )
  }
}
