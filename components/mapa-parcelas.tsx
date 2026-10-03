'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Layers,
  MapPin,
  TrendingUp,
  Mountain,
  Maximize2,
  Minus,
  Plus,
  RefreshCw,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react'

export interface ParcelaProperties {
  id_poligono: string
  cultivo: string
  area_ha: number
  municipio: string
  estado: string
  conjunto: string
  rendimiento_t_ha: number
  es_prediccion: boolean
  elevacion_msnm: number
  nivel_rendimiento: string
}

export interface ParcelaFeature {
  type: 'Feature'
  geometry: {
    type: 'Polygon'
    coordinates: [number, number][][]
  }
  properties: ParcelaProperties
}

export interface MetricasResponse {
  total_parcelas: number
  rendimiento_promedio_t_ha: number
  superficie_total_ha: number
  elevacion_promedio_msnm: number
  parcelas_con_rendimiento_real: number
  parcelas_para_prediccion: number
}

export interface ApiResponse {
  filtro_estado: string
  metricas: MetricasResponse
  geojson: {
    type: 'FeatureCollection'
    features: ParcelaFeature[]
  }
}

const ESTADOS_CONFIG = [
  { id: 'todos', label: 'Todos', color: '#e2b957', border: 'border-[#e2b957]' },
  { id: 'Puebla', label: 'Puebla', color: '#10b981', border: 'border-emerald-500', emoji: '🟢' },
  { id: 'Hidalgo', label: 'Hidalgo', color: '#f59e0b', border: 'border-amber-500', emoji: '🟠' },
  { id: 'Tlaxcala', label: 'Tlaxcala', color: '#38bdf8', border: 'border-sky-500', emoji: '🔵' },
]

export default function MapaParcelas() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const selectedLayerRef = useRef<L.Path | null>(null)
  const selectedParcelaRef = useRef<ParcelaProperties | null>(null)

  const [estado, setEstado] = useState<string>('todos')
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [selectedParcela, setSelectedParcela] = useState<ParcelaProperties | null>(null)
  const [filtroConjunto, setFiltroConjunto] = useState<'todos' | 'ENTRENAMIENTO' | 'PREDICCION'>('todos')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Funciones de control de zoom y centrado
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut()
  }

  const handleResetView = () => {
    if (geoJsonLayerRef.current && mapInstanceRef.current) {
      const bounds = geoJsonLayerRef.current.getBounds()
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
      }
    }
  }

  // Cargar datos de la API (soporta Next.js API y fallback a FastAPI si estuviera en localhost:8000)
  const fetchData = async (filtro: string) => {
    setLoading(true)
    setError('')
    try {
      const url = filtro === 'todos' ? '/api/parcelas' : `/api/parcelas?estado=${encodeURIComponent(filtro)}`
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Error ${res.status}: no se pudieron cargar las parcelas`)
      }
      const json: ApiResponse = await res.json()
      setData(json)
    } catch (err: any) {
      console.warn('Fallo cargando de /api/parcelas, probando fallback...', err)
      try {
        const fallbackUrl = filtro === 'todos' ? 'http://localhost:8000/api/parcelas' : `http://localhost:8000/api/parcelas?estado=${encodeURIComponent(filtro)}`
        const resFb = await fetch(fallbackUrl)
        if (!resFb.ok) throw new Error('Servidor backend no disponible')
        const jsonFb = await resFb.json()
        setData(jsonFb)
      } catch (fbErr: any) {
        setError('No se pudieron obtener los datos satelitales de parcelas.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(estado)
  }, [estado])

  // Filtrar features en memoria si aplica filtro de conjunto o búsqueda
  const filteredFeatures = useMemo(() => {
    if (!data?.geojson?.features) return []
    return data.geojson.features.filter((f) => {
      const matchConjunto = filtroConjunto === 'todos' || f.properties.conjunto === filtroConjunto
      const matchSearch =
        !searchTerm.trim() ||
        f.properties.id_poligono.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.properties.municipio.toLowerCase().includes(searchTerm.toLowerCase())
      return matchConjunto && matchSearch
    })
  }, [data, filtroConjunto, searchTerm])

  // Inicializar Leaflet Map con Esri World Imagery satelital
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.7, -98.35],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      })

      // Fondo Satelital Real permanente (Esri World Imagery)
      const baseLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          maxZoom: 19,
        }
      ).addTo(map)

      tileLayerRef.current = baseLayer
      mapInstanceRef.current = map
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize()
    }, 200)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Definición de color por estado y rendimiento
  const getFeatureColor = (props: ParcelaProperties) => {
    if (props.estado.toLowerCase().includes('puebla')) return '#10b981'
    if (props.estado.toLowerCase().includes('hidalgo')) return '#f59e0b'
    if (props.estado.toLowerCase().includes('tlaxcala')) return '#38bdf8'
    return '#e2b957'
  }

  // Actualizar capa GeoJSON cuando cambien las features filtradas
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !data) return

    // Limpiar capa anterior
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current)
      geoJsonLayerRef.current = null
      selectedLayerRef.current = null
    }

    if (filteredFeatures.length === 0) return

    const geoJsonLayer = L.geoJSON(
      {
        type: 'FeatureCollection',
        features: filteredFeatures as any,
      } as any,
      {
        style: (feature) => {
          const props = (feature?.properties || {}) as ParcelaProperties
          const color = getFeatureColor(props)
          const isSelected = selectedParcelaRef.current?.id_poligono === props.id_poligono

          return {
            color: isSelected ? '#ffffff' : color,
            weight: isSelected ? 3.5 : 2,
            opacity: 0.95,
            fillColor: color,
            fillOpacity: isSelected ? 0.7 : 0.35,
          }
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties as ParcelaProperties
          const color = getFeatureColor(props)

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; color: #10281f; padding: 2px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                <span>${props.id_poligono}</span>
                <span style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${props.estado}</span>
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">${props.municipio} · ${props.area_ha} ha</div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <div><span style="color:#6b7280;">Rendimiento:</span> <b>${props.rendimiento_t_ha} t/ha</b></div>
                <div><span style="color:#6b7280;">Elevación:</span> <b>${props.elevacion_msnm} m</b></div>
                <div><span style="color:#6b7280;">Conjunto:</span> <b>${props.conjunto}</b></div>
                <div><span style="color:#6b7280;">Producción est.:</span> <b>${(props.rendimiento_t_ha * props.area_ha).toFixed(1)} t</b></div>
              </div>
            </div>
          `

          layer.bindPopup(popupContent, { maxWidth: 280, autoPan: false })

          layer.on({
            mouseover: (e) => {
              const l = e.target as L.Path
              if (selectedParcelaRef.current?.id_poligono !== props.id_poligono) {
                l.setStyle({ fillOpacity: 0.65, weight: 2.8 })
              }
            },
            mouseout: (e) => {
              const l = e.target as L.Path
              const isSelected = selectedParcelaRef.current?.id_poligono === props.id_poligono
              l.setStyle({
                fillOpacity: isSelected ? 0.7 : 0.35,
                weight: isSelected ? 3.5 : 2,
                color: isSelected ? '#ffffff' : color,
              })
            },
            click: (e) => {
              const l = e.target as L.Path

              // Restaurar estilo de la parcela previamente seleccionada
              if (selectedLayerRef.current && selectedLayerRef.current !== l) {
                const prevFeature = (selectedLayerRef.current as any).feature
                const prevProps = prevFeature?.properties as ParcelaProperties
                if (prevProps) {
                  selectedLayerRef.current.setStyle({
                    color: getFeatureColor(prevProps),
                    weight: 2,
                    fillOpacity: 0.35,
                  })
                }
              }

              // Resaltar la parcela actual sin modificar el zoom o posición del mapa
              l.setStyle({
                color: '#ffffff',
                weight: 3.5,
                fillOpacity: 0.75,
              })

              selectedLayerRef.current = l
              selectedParcelaRef.current = props
              setSelectedParcela(props)
            },
          })
        },
      }
    ).addTo(map)

    geoJsonLayerRef.current = geoJsonLayer

    // Ajustar vista automáticamente solo cuando cambian las parcelas filtradas
    const bounds = geoJsonLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
    }
  }, [filteredFeatures])

  // Descargar datos en CSV
  const descargarCSV = () => {
    if (!filteredFeatures.length) return
    const header = 'id_poligono,estado,municipio,area_ha,rendimiento_t_ha,produccion_t,elevacion_msnm,conjunto\n'
    const rows = filteredFeatures.map((f) => {
      const p = f.properties
      return `${p.id_poligono},${p.estado},"${p.municipio}",${p.area_ha},${p.rendimiento_t_ha},${(p.rendimiento_t_ha * p.area_ha).toFixed(1)},${p.elevacion_msnm},${p.conjunto}`
    }).join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `parcelas-${estado.toLowerCase()}-${filtroConjunto}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const metricas = data?.metricas

  return (
    <div className="space-y-6 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Monitoreo Geoespacial Altiplano Central
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Mapa Interactivo de <span className="text-[#e2b957]">Rendimiento</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#a8c3b4] max-w-2xl">
            Visualización georreferenciada de 197 parcelas de cebada maltera en Puebla, Hidalgo y Tlaxcala, integrando índices satelitales y estimación de rendimiento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(estado)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition disabled:opacity-50"
            title="Recargar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#e2b957]' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={descargarCSV}
            disabled={!filteredFeatures.length}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e2b957] hover:bg-[#d6a849] text-[#10281f] text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Panel de Control y Filtros de Estado */}
      <div className="bg-[#16392c]/70 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Botones de selección de estado */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a8c3b4] mr-2">
              Estado:
            </span>
            <div className="flex flex-wrap gap-2">
              {ESTADOS_CONFIG.map((cfg) => {
                const isActive = estado === cfg.id
                return (
                  <button
                    key={cfg.id}
                    onClick={() => {
                      setEstado(cfg.id)
                      setSelectedParcela(null)
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                      isActive
                        ? `${cfg.border} bg-white/10 text-white shadow-lg shadow-black/20 ring-1 ring-white/30`
                        : 'border-white/10 bg-white/5 text-[#a8c3b4] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{cfg.emoji || '🌐'}</span>
                    <span>{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filtros complementarios */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador de parcela o municipio */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ID o municipio..."
                className="pl-8 pr-3 py-1.5 bg-[#10281f]/80 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#e2b957] w-44"
              />
            </div>

            {/* Filtro por conjunto */}
            <select
              value={filtroConjunto}
              onChange={(e) => setFiltroConjunto(e.target.value as any)}
              className="bg-[#10281f]/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e2b957]"
            >
              <option value="todos">Todos los conjuntos</option>
              <option value="ENTRENAMIENTO">Entrenamiento (Rend. Real)</option>
              <option value="PREDICCION">Predicción (Reto)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Panel de Métricas / Resultados del Modelo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rendimiento Promedio */}
        <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition text-[#e2b957]">
            <TrendingUp className="w-16 h-16 -mr-4 -mt-4" />
          </div>
          <div className="text-xs uppercase tracking-wider text-[#a8c3b4] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#e2b957]" />
            Rendimiento Promedio
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            {metricas ? `${metricas.rendimiento_promedio_t_ha} ` : '—'}
            <span className="text-sm font-semibold text-[#e2b957]">t/ha</span>
          </div>
          <div className="mt-1 text-xs text-[#a8c3b4]">
            {metricas ? `${Math.round(metricas.rendimiento_promedio_t_ha * 1000)} kg/ha aprox.` : 'Calculando...'}
          </div>
        </div>

        {/* Superficie Total */}
        <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition text-emerald-400">
            <Maximize2 className="w-16 h-16 -mr-4 -mt-4" />
          </div>
          <div className="text-xs uppercase tracking-wider text-[#a8c3b4] flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            Superficie Total
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            {metricas ? `${metricas.superficie_total_ha} ` : '—'}
            <span className="text-sm font-semibold text-emerald-400">ha</span>
          </div>
          <div className="mt-1 text-xs text-[#a8c3b4]">
            {filteredFeatures.length} parcelas registradas
          </div>
        </div>

        {/* Elevación Promedio */}
        <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition text-sky-400">
            <Mountain className="w-16 h-16 -mr-4 -mt-4" />
          </div>
          <div className="text-xs uppercase tracking-wider text-[#a8c3b4] flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-sky-400" />
            Elevación Promedio
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            {metricas ? `${metricas.elevacion_promedio_msnm} ` : '—'}
            <span className="text-sm font-semibold text-sky-400">m s.n.m.</span>
          </div>
          <div className="mt-1 text-xs text-[#a8c3b4]">Altiplano central mexicano</div>
        </div>

        {/* Total Parcelas & Desglose */}
        <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition text-amber-400">
            <Layers className="w-16 h-16 -mr-4 -mt-4" />
          </div>
          <div className="text-xs uppercase tracking-wider text-[#a8c3b4] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Muestras & División
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            {metricas?.total_parcelas ?? 0}
            <span className="text-xs font-normal text-[#a8c3b4] ml-2">polígonos</span>
          </div>
          <div className="mt-1 text-xs text-[#a8c3b4]">
            {metricas
              ? `${metricas.parcelas_con_rendimiento_real} reales / ${metricas.parcelas_para_prediccion} predicción`
              : 'Analizando...'}
          </div>
        </div>
      </div>

      {/* Contenedor del Mapa Interactivo y Panel de Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Interactivo */}
        <div className="lg:col-span-2 bg-[#16392c]/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[500px]">
          {/* Barra superior de controles del mapa */}
          <div className="px-4 py-2.5 bg-[#10281f]/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#a8c3b4]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                Puebla (100)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
                Hidalgo (51)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50"></span>
                Tlaxcala (46)
              </span>
            </div>

            {/* Indicador de Satélite Esri y Controles de Zoom */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#a8c3b4] bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                🛰️ Satélite Esri
              </span>

              {/* Botones Acercar / Alejar / Reajustar */}
              <div className="flex items-center bg-black/60 rounded-xl border border-white/10 p-0.5 shadow-lg">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-white/20 active:bg-white/30 text-white rounded-lg transition"
                  title="Acercar mapa (+)"
                  aria-label="Acercar mapa"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-white/10 my-auto" />
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-white/20 active:bg-white/30 text-white rounded-lg transition"
                  title="Alejar mapa (-)"
                  aria-label="Alejar mapa"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-white/10 my-auto" />
                <button
                  type="button"
                  onClick={handleResetView}
                  className="p-1.5 hover:bg-white/20 active:bg-white/30 text-[#e2b957] rounded-lg transition"
                  title="Reajustar vista a todas las parcelas"
                  aria-label="Reajustar vista"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Visor de mapa Leaflet con controles flotantes */}
          <div className="relative w-full flex-1 z-0 min-h-[460px]">
            <div
              ref={mapContainerRef}
              className="absolute inset-0 w-full h-full [&_.leaflet-control-zoom]:!hidden [&_.leaflet-control-attribution]:!hidden"
            />

            {/* Botones de zoom flotantes en el mapa */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-[#10281f]/85 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-2xl">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl transition"
                title="Acercar (+)"
                aria-label="Acercar"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl transition"
                title="Alejar (-)"
                aria-label="Alejar"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="w-8 h-8 flex items-center justify-center bg-[#e2b957]/20 hover:bg-[#e2b957]/30 text-[#e2b957] active:scale-95 rounded-xl transition border border-[#e2b957]/30"
                title="Reajustar vista completa"
                aria-label="Reajustar vista completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loader animado */}
          {loading && (
            <div className="absolute inset-0 bg-[#10281f]/75 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-[#e2b957] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-white">Cargando geometrías satelitales...</span>
            </div>
          )}

          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl z-20">
              {error}
            </div>
          )}
        </div>

        {/* Panel lateral: Detalle de la Parcela Seleccionada */}
        <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#e2b957]" />
                Detalle de Parcela
              </h3>
              {selectedParcela ? (
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                    selectedParcela.estado.toLowerCase().includes('puebla')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : selectedParcela.estado.toLowerCase().includes('hidalgo')
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}
                >
                  {selectedParcela.estado}
                </span>
              ) : (
                <span className="text-xs text-white/40">Sin selección</span>
              )}
            </div>

            {selectedParcela ? (
              <div className="space-y-4">
                <div className="bg-[#10281f]/80 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[11px] text-[#a8c3b4] uppercase tracking-wider">Identificador</div>
                  <div className="text-xl font-extrabold text-white mt-0.5">{selectedParcela.id_poligono}</div>
                  <div className="text-xs text-[#a8c3b4] mt-1">{selectedParcela.municipio}, {selectedParcela.estado}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#10281f]/60 p-3 rounded-xl border border-white/5">
                    <span className="text-[11px] text-[#a8c3b4] block">Superficie</span>
                    <span className="text-base font-bold text-white">{selectedParcela.area_ha} ha</span>
                  </div>

                  <div className="bg-[#10281f]/60 p-3 rounded-xl border border-white/5">
                    <span className="text-[11px] text-[#a8c3b4] block">Elevación</span>
                    <span className="text-base font-bold text-white">{selectedParcela.elevacion_msnm} m</span>
                  </div>

                  <div className="bg-[#10281f]/60 p-3 rounded-xl border border-white/5">
                    <span className="text-[11px] text-[#a8c3b4] block">Rendimiento</span>
                    <span className="text-base font-bold text-[#e2b957]">{selectedParcela.rendimiento_t_ha} t/ha</span>
                  </div>

                  <div className="bg-[#10281f]/60 p-3 rounded-xl border border-white/5">
                    <span className="text-[11px] text-[#a8c3b4] block">Producción Est.</span>
                    <span className="text-base font-bold text-white">
                      {(selectedParcela.rendimiento_t_ha * selectedParcela.area_ha).toFixed(1)} t
                    </span>
                  </div>
                </div>

                <div className="bg-[#10281f]/60 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a8c3b4]">Conjunto de datos:</span>
                    <span className="font-semibold text-white">{selectedParcela.conjunto}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a8c3b4]">Clasificación:</span>
                    <span className="font-semibold text-[#e2b957]">{selectedParcela.nivel_rendimiento}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a8c3b4]">Tipo de dato:</span>
                    <span className="font-semibold text-white">
                      {selectedParcela.es_prediccion ? 'Estimado (Reto)' : 'Rendimiento Verificado'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center text-[#a8c3b4] flex flex-col items-center justify-center">
                <Info className="w-10 h-10 text-white/20 mb-3" />
                <p className="text-sm font-medium text-white/80">Ninguna parcela seleccionada</p>
                <p className="text-xs text-white/50 mt-1 max-w-xs">
                  Haz clic sobre un polígono en el mapa para consultar sus variables biofísicas, municipio y producción estimada.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-[#a8c3b4]/80 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Coordenadas proyectadas en EPSG:4326 (WGS 84).</span>
          </div>
        </div>
      </div>
    </div>
  )
}
