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
  Info,
  CheckCircle2,
  Sparkles,
  Search,
  Sliders,
  Sprout,
  ArrowRight,
  ArrowLeft,
  Download,
  RefreshCw,
  BarChart3,
  Check,
  ChevronRight,
  Wheat,
  Calendar,
  CloudRain,
  Sun,
  CloudSun,
  Upload,
  FileText,
  FileArchive,
  Table,
  AlertCircle,
  XCircle,
  Satellite,
} from 'lucide-react'

export interface ParcelaProperties {
  id_poligono: string
  cultivo: string
  area_ha: number
  municipio: string
  estado: string
  conjunto: string
  rendimiento_t_ha: number | null
  es_prediccion: boolean
  elevacion_msnm: number
  pendiente_grados: number
  tipo_relieve: string
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
  pendiente_promedio_grados?: number
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

export interface MunicipioInfo {
  nombre: string
  estado: 'Puebla' | 'Hidalgo' | 'Tlaxcala'
  totalParcelas: number
  rendimientoPromedio: number
  elevacionPromedio: number
  centro: [number, number]
  zoom: number
  descripcion: string
}

const ESTADOS_CONFIG = [
  { id: 'todos', label: 'Todos', color: '#e2b957', border: 'border-[#e2b957]' },
  { id: 'Puebla', label: 'Puebla', color: '#10b981', border: 'border-emerald-500', emoji: '🟢' },
  { id: 'Hidalgo', label: 'Hidalgo', color: '#f59e0b', border: 'border-amber-500', emoji: '🟠' },
  { id: 'Tlaxcala', label: 'Tlaxcala', color: '#38bdf8', border: 'border-sky-500', emoji: '🔵' },
]

export const MUNICIPIOS_DATA: Record<string, MunicipioInfo> = {
  Chignahuapan: {
    nombre: 'Chignahuapan',
    estado: 'Puebla',
    totalParcelas: 100,
    rendimientoPromedio: 4.48,
    elevacionPromedio: 2260,
    centro: [19.8701, -98.247],
    zoom: 12,
    descripcion: 'Sierra Norte y Altiplano Oriental · Suelos volcánicos fértiles con excelente retención pluvial.',
  },
  Singuilucan: {
    nombre: 'Singuilucan',
    estado: 'Hidalgo',
    totalParcelas: 23,
    rendimientoPromedio: 3.08,
    elevacionPromedio: 2620,
    centro: [19.964, -98.4026],
    zoom: 12,
    descripcion: 'Altiplano Hidalguense · Región de altitud elevada con ciclo térmico templado-frío.',
  },
  Almoloya: {
    nombre: 'Almoloya',
    estado: 'Hidalgo',
    totalParcelas: 14,
    rendimientoPromedio: 4.52,
    elevacionPromedio: 2520,
    centro: [19.7776, -98.3095],
    zoom: 12,
    descripcion: 'Valle de Apan · Tierras tradicionales cebaderas de alta fertilidad y vigor foliar.',
  },
  'Cuautepec de Hinojosa': {
    nombre: 'Cuautepec de Hinojosa',
    estado: 'Hidalgo',
    totalParcelas: 9,
    rendimientoPromedio: 4.6,
    elevacionPromedio: 2250,
    centro: [19.9009, -98.3181],
    zoom: 12,
    descripcion: 'Valle de Tulancingo y ladera · Excelente régimen de humedad y desarrollo de espiga.',
  },
  'Emiliano Zapata': {
    nombre: 'Emiliano Zapata',
    estado: 'Hidalgo',
    totalParcelas: 3,
    rendimientoPromedio: 3.5,
    elevacionPromedio: 2490,
    centro: [19.642, -98.5827],
    zoom: 13,
    descripcion: 'Sur de Hidalgo · Topografía plana apta para siembra uniforme y cosecha mecanizada.',
  },
  Tepeapulco: {
    nombre: 'Tepeapulco',
    estado: 'Hidalgo',
    totalParcelas: 1,
    rendimientoPromedio: 4.45,
    elevacionPromedio: 2500,
    centro: [19.8387, -98.3936],
    zoom: 13,
    descripcion: 'Corredor Apan-Tepeapulco · Vocación histórica para cebada de maltería.',
  },
  Apan: {
    nombre: 'Apan',
    estado: 'Hidalgo',
    totalParcelas: 1,
    rendimientoPromedio: 3.0,
    elevacionPromedio: 2488,
    centro: [19.6096, -98.5223],
    zoom: 13,
    descripcion: 'Cuna nacional de la cebada maltera · Llanura del Altiplano Central.',
  },
  Calpulalpan: {
    nombre: 'Calpulalpan',
    estado: 'Tlaxcala',
    totalParcelas: 44,
    rendimientoPromedio: 3.0,
    elevacionPromedio: 2580,
    centro: [19.5675, -98.5663],
    zoom: 12,
    descripcion: 'Poniente de Tlaxcala · Amplia tradición de cultivo de temporal en cebada.',
  },
  'Nanacamilpa de Mariano Arista': {
    nombre: 'Nanacamilpa de Mariano Arista',
    estado: 'Tlaxcala',
    totalParcelas: 2,
    rendimientoPromedio: 2.5,
    elevacionPromedio: 2720,
    centro: [19.544, -98.5272],
    zoom: 13,
    descripcion: 'Zona montañosa y de altura · Altitud superior a 2,700 m s.n.m. con microclima fresco.',
  },
}

export const MUNICIPIOS_POR_ESTADO: Record<string, string[]> = {
  Puebla: ['Chignahuapan'],
  Hidalgo: ['Singuilucan', 'Almoloya', 'Cuautepec de Hinojosa', 'Emiliano Zapata', 'Tepeapulco', 'Apan'],
  Tlaxcala: ['Calpulalpan', 'Nanacamilpa de Mariano Arista'],
}

export interface PrediccionItem {
  plot: string
  rendimiento_t_ha: number
  rendimiento_kg_ha: number
  produccion_estimada_t: number
  estado: string
  municipio?: string
  nivel_potencial: string
  diagnostico: string
  confianza_r2: number
}

export interface BatchResultResponse {
  total_parcelas: number
  rendimiento_promedio_t_ha: number
  produccion_total_t: number
  conteo_alto: number
  conteo_medio: number
  conteo_bajo: number
  predicciones: PrediccionItem[]
}

export interface ArchivoSlot {
  file: File | null
  nombre: string
  cargado: boolean
  tamanoKb?: string
}

export interface ArchivosRequeridosState {
  parcelas: ArchivoSlot
  basico: ArchivoSlot
  pro: ArchivoSlot
  topografia: ArchivoSlot
}

const initialArchivosState: ArchivosRequeridosState = {
  parcelas: { file: null, nombre: '', cargado: false },
  basico: { file: null, nombre: '', cargado: false },
  pro: { file: null, nombre: '', cargado: false },
  topografia: { file: null, nombre: '', cargado: false },
}

interface FormValuesAnalista {
  plot: string
  area: string
  temp: string
  ndwi: string
  evi: string
  lai: string
}

const initialAnalistaValues: FormValuesAnalista = {
  plot: '',
  area: '10',
  temp: '-0.58',
  ndwi: '0.22',
  evi: '0.26',
  lai: '0.38',
}

export default function MapaParcelas() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const selectedLayerRef = useRef<L.Path | null>(null)
  const selectedParcelaRef = useRef<ParcelaProperties | null>(null)
  const layersByIdRef = useRef<Map<string, L.Path>>(new Map())

  // Estados principales de datos y filtros de mapa
  const [estado, setEstado] = useState<string>('todos')
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [selectedParcela, setSelectedParcela] = useState<ParcelaProperties | null>(null)

  // Modo de perfil: 'agricultor' | 'analista'
  const [perfilActivo, setPerfilActivo] = useState<'agricultor' | 'analista'>('agricultor')

  // --- ASISTENTE DEL AGRICULTOR EN 5 PASOS ---
  // 1: Estado | 2: Municipio | 3: Temporada y Fechas | 4: Parcela / Predio (Doble Camino) | 5: Diagnóstico
  const [pasoAgricultor, setPasoAgricultor] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [estadoAgricultor, setEstadoAgricultor] = useState<string>('')
  const [municipioAgricultor, setMunicipioAgricultor] = useState<string>('')

  // Paso 3: Temporada y Fechas
  type TipoTemporada = 'PV' | 'OI' | 'personalizado'
  const [temporada, setTemporada] = useState<TipoTemporada>('PV')
  const [fechaInicio, setFechaInicio] = useState<string>('2025-05-15')
  const [fechaFin, setFechaFin] = useState<string>('2025-10-30')

  // Paso 4: Doble Camino para Identificar Parcela
  type ModoSeleccionParcela = 'mapa_catalogo' | 'manual_hectareas'
  const [modoSeleccion, setModoSeleccion] = useState<ModoSeleccionParcela>('mapa_catalogo')
  const [filtroTamano, setFiltroTamano] = useState<'todos' | 'pequenas' | 'medianas' | 'grandes'>('todos')
  const [filtroTextoParcela, setFiltroTextoParcela] = useState<string>('')

  // Camino B: Estimación manual directa
  const [manualAreaHa, setManualAreaHa] = useState<string>('5.0')
  const [manualTipoTerreno, setManualTipoTerreno] = useState<'plano' | 'ladera_suave' | 'cerro'>('plano')
  const [manualRegimenAgua, setManualRegimenAgua] = useState<'temporal_bueno' | 'temporal_regular' | 'riego'>('temporal_bueno')

  // Sub-pestaña del analista: 'parametros' (en vivo) | 'archivos' (batch .csv / .zip)
  const [subPestanaAnalista, setSubPestanaAnalista] = useState<'parametros' | 'archivos'>('parametros')

  // Estado del Formulario de Analista
  const [analistaValues, setAnalistaValues] = useState<FormValuesAnalista>(initialAnalistaValues)
  const [analistaLoading, setAnalistaLoading] = useState(false)
  const [analistaResult, setAnalistaResult] = useState<number | null>(null)
  const [analistaDiag, setAnalistaDiag] = useState<string>('')
  const [analistaPotencial, setAnalistaPotencial] = useState<string>('')
  const [analistaError, setAnalistaError] = useState('')

  // Estado de Inferencia por Lotes con Verificación Multi-Archivo (4 Fuentes Requeridas)
  const [archivosState, setArchivosState] = useState<ArchivosRequeridosState>(initialArchivosState)
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResult, setBatchResult] = useState<BatchResultResponse | null>(null)
  const [batchError, setBatchError] = useState('')

  // Zoom controls
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

  // Auto-scroll directo al componente del modelo si se accede con #asistente-modelo
  useEffect(() => {
    const scrollToAsistente = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#asistente-modelo') {
        const timer = setTimeout(() => {
          const el = document.getElementById('asistente-modelo')
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 350)
        return () => clearTimeout(timer)
      }
    }

    scrollToAsistente()
    window.addEventListener('hashchange', scrollToAsistente)
    return () => window.removeEventListener('hashchange', scrollToAsistente)
  }, [])

  // Carga de datos de la API
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

  // Features de parcelas
  const filteredFeatures = useMemo(() => {
    return data?.geojson?.features || []
  }, [data])

  // Inicializar Leaflet con satélite Esri World Imagery
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.7, -98.35],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      })

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

  const getFeatureColor = (props: ParcelaProperties) => {
    if (props.estado.toLowerCase().includes('puebla')) return '#10b981'
    if (props.estado.toLowerCase().includes('hidalgo')) return '#f59e0b'
    if (props.estado.toLowerCase().includes('tlaxcala')) return '#38bdf8'
    return '#e2b957'
  }

  // Seleccionar parcela y sincronizar estilo visual en el mapa
  const selectParcela = (props: ParcelaProperties, centrar = false) => {
    selectedParcelaRef.current = props
    setSelectedParcela(props)

    if (selectedLayerRef.current) {
      const prevFeature = (selectedLayerRef.current as any).feature
      const prevProps = prevFeature?.properties as ParcelaProperties
      if (prevProps) {
        const prevSinRend = prevProps.rendimiento_t_ha === null
        selectedLayerRef.current.setStyle({
          color: getFeatureColor(prevProps),
          weight: 2,
          fillOpacity: prevSinRend ? 0.22 : 0.4,
          dashArray: prevSinRend ? '4, 4' : undefined,
        })
      }
    }

    const targetLayer = layersByIdRef.current.get(props.id_poligono)
    if (targetLayer) {
      targetLayer.setStyle({
        color: '#ffffff',
        weight: 3.5,
        fillOpacity: 0.75,
      })
      selectedLayerRef.current = targetLayer

      if (centrar && mapInstanceRef.current) {
        const bounds = (targetLayer as any).getBounds?.()
        if (bounds && bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
        }
      }
    }
  }

  // Renderizar capas GeoJSON
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !data) return

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current)
      geoJsonLayerRef.current = null
      selectedLayerRef.current = null
    }

    layersByIdRef.current.clear()

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
          const sinRendimiento = props.rendimiento_t_ha === null

          return {
            color: isSelected ? '#ffffff' : color,
            weight: isSelected ? 3.5 : 2,
            opacity: 0.95,
            fillColor: color,
            fillOpacity: isSelected ? 0.7 : (sinRendimiento ? 0.22 : 0.4),
            dashArray: sinRendimiento ? '4, 4' : undefined,
          }
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties as ParcelaProperties
          layersByIdRef.current.set(props.id_poligono, layer as L.Path)

          const color = getFeatureColor(props)
          const rendText = props.rendimiento_t_ha !== null
            ? `<b>${props.rendimiento_t_ha} t/ha</b>`
            : `<span style="color:#d97706;font-style:italic;">Por calcular</span>`

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; color: #10281f; padding: 2px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                <span>Predio de ${props.area_ha} ha</span>
                <span style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${props.estado}</span>
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">${props.municipio} · Ref: ${props.id_poligono}</div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <div><span style="color:#6b7280;">Rendimiento:</span> ${rendText}</div>
                <div><span style="color:#6b7280;">Elevación:</span> <b>${props.elevacion_msnm} m</b></div>
                <div><span style="color:#6b7280;">Pendiente:</span> <b>${props.pendiente_grados ?? '—'}°</b></div>
                <div><span style="color:#6b7280;">Relieve:</span> <b>${props.tipo_relieve}</b></div>
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
                fillOpacity: isSelected ? 0.7 : (props.rendimiento_t_ha === null ? 0.22 : 0.4),
                weight: isSelected ? 3.5 : 2,
                color: isSelected ? '#ffffff' : color,
                dashArray: props.rendimiento_t_ha === null ? '4, 4' : undefined,
              })
            },
            click: () => {
              selectParcela(props, false)

              if (perfilActivo === 'agricultor') {
                setEstadoAgricultor(props.estado)
                setMunicipioAgricultor(props.municipio)
                setModoSeleccion('mapa_catalogo')
                setPasoAgricultor(5)
              }
            },
          })
        },
      }
    ).addTo(map)

    geoJsonLayerRef.current = geoJsonLayer

    const bounds = geoJsonLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
    }
  }, [filteredFeatures])

  // --- CÁLCULO DE TEMPORADA Y FECHAS ---
  const diasCiclo = useMemo(() => {
    if (!fechaInicio || !fechaFin) return 150
    const d1 = new Date(fechaInicio).getTime()
    const d2 = new Date(fechaFin).getTime()
    if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 150
    return Math.max(30, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)))
  }, [fechaInicio, fechaFin])

  const infoTemporada = useMemo(() => {
    if (temporada === 'PV') {
      return {
        nombre: 'Primavera - Verano (P-V)',
        meses: 'Mayo a Noviembre (Temporal de lluvias)',
        deltaRend: 0.15,
        descripcion: 'Ciclo óptimo de temporal en el Altiplano Central con mayor humedad pluvial y desarrollo de espiga.',
        icono: '🌧️',
      }
    }
    if (temporada === 'OI') {
      return {
        nombre: 'Otoño - Invierno (O-I)',
        meses: 'Diciembre a Mayo (Riego o Humedad residual)',
        deltaRend: manualRegimenAgua === 'riego' ? 0.25 : -0.15,
        descripcion: 'Ciclo fresco con menor temperatura térmica nocturna. Dependiente de riego o humedad residual.',
        icono: '❄️',
      }
    }
    const factorDias = diasCiclo >= 110 && diasCiclo <= 160 ? 0.08 : diasCiclo < 100 ? -0.2 : 0
    return {
      nombre: `Personalizado (${diasCiclo} días)`,
      meses: `${fechaInicio} al ${fechaFin}`,
      deltaRend: factorDias,
      descripcion: `Ciclo calibrado a ${diasCiclo} días entre fecha de siembra y fecha estimada de cosecha.`,
      icono: '📅',
    }
  }, [temporada, fechaInicio, fechaFin, diasCiclo, manualRegimenAgua])

  // --- LÓGICA DE FILTRADO DE PARCELAS PARA CAMINO A ---
  const parcelasDelMunicipio = useMemo(() => {
    if (!data?.geojson?.features || !municipioAgricultor) return []
    return data.geojson.features
      .filter((f) => f.properties.municipio.toLowerCase() === municipioAgricultor.toLowerCase())
      .map((f) => f.properties)
  }, [data, municipioAgricultor])

  const parcelasFiltradasAmigables = useMemo(() => {
    return parcelasDelMunicipio.filter((p) => {
      // Filtro de tamaño
      if (filtroTamano === 'pequenas' && p.area_ha >= 5) return false
      if (filtroTamano === 'medianas' && (p.area_ha < 5 || p.area_ha > 15)) return false
      if (filtroTamano === 'grandes' && p.area_ha <= 15) return false

      // Búsqueda libre
      if (filtroTextoParcela.trim()) {
        const q = filtroTextoParcela.toLowerCase().trim()
        const matchId = p.id_poligono.toLowerCase().includes(q)
        const matchArea = p.area_ha.toString().includes(q)
        const matchRelieve = p.tipo_relieve.toLowerCase().includes(q)
        return matchId || matchArea || matchRelieve
      }

      return true
    })
  }, [parcelasDelMunicipio, filtroTamano, filtroTextoParcela])

  // --- CÁLCULO FINAL DE DIAGNÓSTICO (PASO 5) ---
  const diagnosticoAgricultor = useMemo(() => {
    const munInfo = MUNICIPIOS_DATA[municipioAgricultor]
    const munPromedio = munInfo?.rendimientoPromedio ?? 3.5

    let rendCalculado = 0
    let areaEfectivaHa = 0
    let nombrePredio = ''
    let esEstimado = false
    let elevacionMsnm = munInfo?.elevacionPromedio ?? 2450
    let pendienteGrados = 2.0
    let tipoRelieveTexto = 'Plano (< 2°)'

    if (modoSeleccion === 'mapa_catalogo' && selectedParcela) {
      // CAMINO A: Parcela satelital elegida
      areaEfectivaHa = selectedParcela.area_ha
      nombrePredio = `Predio de ${selectedParcela.area_ha} ha (${selectedParcela.id_poligono})`
      elevacionMsnm = selectedParcela.elevacion_msnm
      pendienteGrados = selectedParcela.pendiente_grados ?? 2.0
      tipoRelieveTexto = selectedParcela.tipo_relieve

      if (selectedParcela.rendimiento_t_ha !== null) {
        rendCalculado = selectedParcela.rendimiento_t_ha + infoTemporada.deltaRend
        esEstimado = false
      } else {
        esEstimado = true
        const ajustePendiente = (2.0 - (selectedParcela.pendiente_grados || 2.0)) * 0.08
        const ajusteAltitud = ((2500 - (selectedParcela.elevacion_msnm || 2500)) / 500) * 0.15
        rendCalculado = munPromedio + ajustePendiente + ajusteAltitud + infoTemporada.deltaRend
      }
    } else {
      // CAMINO B: Ingreso manual de hectáreas
      areaEfectivaHa = parseFloat(manualAreaHa) || 5.0
      nombrePredio = `Tu Predio de ${areaEfectivaHa} ha en ${municipioAgricultor}`
      esEstimado = true

      const ajusteTerreno = manualTipoTerreno === 'plano' ? 0.12 : manualTipoTerreno === 'ladera_suave' ? 0.0 : -0.22
      const ajusteAgua = manualRegimenAgua === 'riego' ? 0.35 : manualRegimenAgua === 'temporal_bueno' ? 0.10 : -0.28

      pendienteGrados = manualTipoTerreno === 'plano' ? 1.5 : manualTipoTerreno === 'ladera_suave' ? 3.2 : 5.8
      tipoRelieveTexto = manualTipoTerreno === 'plano' ? 'Plano de valle' : manualTipoTerreno === 'ladera_suave' ? 'Ladera suave' : 'Cerro / ladera'

      rendCalculado = munPromedio + ajusteTerreno + ajusteAgua + infoTemporada.deltaRend
    }

    // Acotar a rangos agronómicos de cebada maltera
    rendCalculado = Math.round(Math.min(5.6, Math.max(2.1, rendCalculado)) * 100) / 100
    const produccionTotalT = Math.round(rendCalculado * areaEfectivaHa * 10) / 10
    const bultos50kg = Math.round((produccionTotalT * 1000) / 50)
    const diffConMunicipio = Math.round((rendCalculado - munPromedio) * 100) / 100

    let estadoSalud: {
      titulo: string
      subtitulo: string
      colorBadge: string
      colorBorder: string
    }

    if (rendCalculado >= 4.2) {
      estadoSalud = {
        titulo: 'Vigor Óptimo y Alto Potencial',
        subtitulo: `Excelente proyección para el ${infoTemporada.nombre}. La combinación de suelo, humedad y ciclo favorece un alto peso específico y llenado de grano.`,
        colorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        colorBorder: 'border-emerald-500/30',
      }
    } else if (rendCalculado >= 3.2) {
      estadoSalud = {
        titulo: 'Rendimiento Promedio Regional',
        subtitulo: `Desarrollo estable y acorde a la media del Altiplano Central en el ${infoTemporada.nombre}. Mantener el monitoreo de fertilización y malezas.`,
        colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        colorBorder: 'border-amber-500/30',
      }
    } else {
      estadoSalud = {
        titulo: 'Requiere Monitoreo / Estrés Moderado',
        subtitulo: `Proyección por debajo de la media regional. Se recomienda supervisión de humedad en suelo y nutrición foliar de apoyo.`,
        colorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        colorBorder: 'border-rose-500/30',
      }
    }

    return {
      nombrePredio,
      areaEfectivaHa,
      rendimiento: rendCalculado,
      esEstimado,
      produccionTotalT,
      bultos50kg,
      munPromedio,
      diffConMunicipio,
      elevacionMsnm,
      pendienteGrados,
      tipoRelieveTexto,
      estadoSalud,
    }
  }, [
    modoSeleccion,
    selectedParcela,
    municipioAgricultor,
    manualAreaHa,
    manualTipoTerreno,
    manualRegimenAgua,
    infoTemporada,
  ])

  // Navegación del Asistente
  const handleSeleccionarEstado = (nuevoEstado: string) => {
    setEstadoAgricultor(nuevoEstado)
    setMunicipioAgricultor('')
    setEstado(nuevoEstado)
    setPasoAgricultor(2)
  }

  const handleSeleccionarMunicipio = (munNombre: string) => {
    setMunicipioAgricultor(munNombre)
    const munInfo = MUNICIPIOS_DATA[munNombre]
    if (munInfo && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(munInfo.centro, munInfo.zoom, { duration: 1.2 })
    }
    setPasoAgricultor(3)
  }

  const handleSeleccionarTemporadaYContinuar = () => {
    setPasoAgricultor(4)
  }

  const handleSeleccionarParcelaCaminoA = (parcela: ParcelaProperties) => {
    selectParcela(parcela, true)
    setModoSeleccion('mapa_catalogo')
    setPasoAgricultor(5)
  }

  const handleCalcularCaminoB = () => {
    setModoSeleccion('manual_hectareas')
    setPasoAgricultor(5)
  }

  const handleVerEnMapa = () => {
    const el = document.getElementById('mapa-interactivo')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleIrAlAsistente = () => {
    if (selectedParcela) {
      setPerfilActivo('agricultor')
      setEstadoAgricultor(selectedParcela.estado)
      setMunicipioAgricultor(selectedParcela.municipio)
      setModoSeleccion('mapa_catalogo')
      setPasoAgricultor(5)
    }
    const el = document.getElementById('asistente-modelo')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const descargarReporteAgricultor = () => {
    if (!diagnosticoAgricultor) return
    const csvContent = [
      'AgroRaices - Reporte de Rendimiento de Cebada Maltera',
      `Fecha de Consulta: ${new Date().toLocaleDateString('es-MX')}`,
      '',
      `Predio / Parcela,${diagnosticoAgricultor.nombrePredio}`,
      `Municipio,${municipioAgricultor}`,
      `Estado,${estadoAgricultor}`,
      `Temporada / Ciclo,${infoTemporada.nombre} (${infoTemporada.meses})`,
      `Superficie Evaluada (ha),${diagnosticoAgricultor.areaEfectivaHa}`,
      `Elevacion Estimada (msnm),${diagnosticoAgricultor.elevacionMsnm}`,
      `Relieve / Pendiente,${diagnosticoAgricultor.tipoRelieveTexto} (${diagnosticoAgricultor.pendienteGrados}°)`,
      `Rendimiento Estimado (t/ha),${diagnosticoAgricultor.rendimiento}`,
      `Produccion Total Proyectada (toneladas),${diagnosticoAgricultor.produccionTotalT}`,
      `Costales Estimados (50 kg),${diagnosticoAgricultor.bultos50kg}`,
      `Promedio Historico Municipal (t/ha),${diagnosticoAgricultor.munPromedio}`,
      `Diferencia con Municipio,${diagnosticoAgricultor.diffConMunicipio >= 0 ? '+' : ''}${diagnosticoAgricultor.diffConMunicipio} t/ha`,
      `Diagnostico del Cultivo,${diagnosticoAgricultor.estadoSalud.titulo}`,
      `Metodo de Entrada,${modoSeleccion === 'mapa_catalogo' ? 'Poligono Satelital del Catalogo' : 'Superficie y Manejo Manual'}`,
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Ficha_Productor_${municipioAgricultor}_${diagnosticoAgricultor.areaEfectivaHa}ha.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // --- LÓGICA DEL MODO ANALISTA ---
  const handleCalcularAnalista = async (e: React.FormEvent) => {
    e.preventDefault()
    setAnalistaError('')
    const nums = [
      Number(analistaValues.area),
      Number(analistaValues.temp),
      Number(analistaValues.ndwi),
      Number(analistaValues.evi),
      Number(analistaValues.lai),
    ]

    if (nums.some((n) => !Number.isFinite(n)) || Number(analistaValues.area) <= 0) {
      setAnalistaError('Introduce valores numéricos válidos en todos los campos.')
      return
    }

    setAnalistaLoading(true)
    setAnalistaResult(null)

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot: analistaValues.plot || 'Parcela_Analista',
          area: Number(analistaValues.area),
          temp: Number(analistaValues.temp),
          ndwi: Number(analistaValues.ndwi),
          evi: Number(analistaValues.evi),
          lai: Number(analistaValues.lai),
          estado: selectedParcela?.estado || 'Puebla',
          municipio: selectedParcela?.municipio || 'Chignahuapan',
          elevacion: selectedParcela?.elevacion_msnm,
          pendiente: selectedParcela?.pendiente_grados,
        }),
      })

      if (!res.ok) {
        throw new Error('Error al conectar con el motor de inferencia V6')
      }

      const json = await res.json()
      setAnalistaResult(Number(json.rendimiento_t_ha))
      setAnalistaDiag(json.diagnostico || '')
      setAnalistaPotencial(json.nivel_potencial || '')
    } catch {
      // Fallback local en caso de error
      const [, temp, ndwi, evi, lai] = nums
      const predFallback = Math.min(
        5.6,
        Math.max(
          1.5,
          3.35 +
            (Number(evi) - 0.2) * 4 +
            (Number(lai) - 0.3) * 2.3 +
            (Number(ndwi) - 0.1) * 1.4 +
            (Number(temp) + 0.6) * 1.8
        )
      )
      setAnalistaResult(Number(predFallback.toFixed(2)))
      setAnalistaDiag('Inferencia local estimada.')
      setAnalistaPotencial(predFallback >= 4.2 ? 'alto' : predFallback >= 3.2 ? 'medio' : 'bajo')
    } finally {
      setAnalistaLoading(false)
    }
  }

  const cargarTelemetriaSeleccionadaAnalista = () => {
    if (!selectedParcela) return
    setAnalistaValues({
      plot: selectedParcela.id_poligono,
      area: selectedParcela.area_ha.toString(),
      temp: '-0.58',
      ndwi: '0.22',
      evi: '0.26',
      lai: '0.38',
    })
    setAnalistaResult(null)
    setAnalistaError('')
  }

  // Clasificar y asignar archivos arrastrados o seleccionados a sus ranuras correspondientes
  const clasificarYAsignarArchivos = async (archivosList: File[]) => {
    setBatchError('')
    const nuevoEstado = { ...archivosState }

    for (const file of archivosList) {
      try {
        const text = await file.slice(0, 4096).text()
        const firstLine = text.split(/\r?\n/)[0]?.toLowerCase() || ''
        const fname = file.name.toLowerCase()

        let slot: keyof ArchivosRequeridosState | null = null

        if (firstLine.includes('elevacion') || firstLine.includes('pendiente') || fname.includes('topografia')) {
          slot = 'topografia'
        } else if (firstLine.includes('vi6t') || (firstLine.includes('sensor') && firstLine.includes('dswi')) || fname.includes('basico')) {
          slot = 'basico'
        } else if (firstLine.includes('msavi') || (firstLine.includes('lai') && !firstLine.includes('vi6t')) || fname.includes('pro')) {
          slot = 'pro'
        } else if (firstLine.includes('conjunto') || firstLine.includes('area_ha') || firstLine.includes('área_ha') || fname.includes('parcelas') || fname.includes('rendimiento')) {
          slot = 'parcelas'
        }

        if (slot) {
          nuevoEstado[slot] = {
            file,
            nombre: file.name,
            cargado: true,
            tamanoKb: (file.size / 1024).toFixed(1),
          }
        }
      } catch {
        continue
      }
    }

    setArchivosState(nuevoEstado)
  }

  const asignarSlotIndividual = (slotKey: keyof ArchivosRequeridosState, file: File) => {
    setBatchError('')
    setArchivosState((prev) => ({
      ...prev,
      [slotKey]: {
        file,
        nombre: file.name,
        cargado: true,
        tamanoKb: (file.size / 1024).toFixed(1),
      },
    }))
  }

  const conteoCargados = Object.values(archivosState).filter((s) => s.cargado).length
  const todosListos = conteoCargados === 4

  // Inferencia por lotes con los 4 archivos verificados
  const handleProcesarArchivoLote = async () => {
    if (!todosListos) {
      setBatchError('Debes subir los 4 archivos requeridos para que el modelo pueda ejecutar la inferencia.')
      return
    }

    setBatchLoading(true)
    setBatchError('')

    try {
      const formData = new FormData()
      Object.entries(archivosState).forEach(([key, slot]) => {
        if (slot.file) {
          formData.append('files', slot.file, slot.nombre)
        }
      })

      const res = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        const errorMsg = errJson.error || errJson.detail?.error || 'Error procesando los archivos.'
        throw new Error(errorMsg)
      }

      const json: BatchResultResponse = await res.json()
      setBatchResult(json)
    } catch (err: any) {
      setBatchError(err.message || 'No se pudieron procesar los archivos.')
    } finally {
      setBatchLoading(false)
    }
  }

  // Cargar dataset oficial de muestra (las 4 fuentes oficiales)
  const handleCargarDemoDataset = async () => {
    setBatchLoading(true)
    setBatchError('')

    setArchivosState({
      parcelas: { file: null, nombre: 'ID_area_rendimiento_70_30_Reto_AgroCebada.csv', cargado: true, tamanoKb: '4.8' },
      basico: { file: null, nombre: 'Conjunto_datos_BASICO_AgroCebada2026.csv', cargado: true, tamanoKb: '14,240' },
      pro: { file: null, nombre: 'Conjunto_datos_PRO_AgroCebada.csv', cargado: true, tamanoKb: '5,620' },
      topografia: { file: null, nombre: 'topografia_inegi_cem4_parcelas.csv', cargado: true, tamanoKb: '8.2' },
    })

    try {
      const res = await fetch('/api/predict?demo=true')
      if (!res.ok) {
        throw new Error('No se pudo cargar el dataset oficial de muestra.')
      }
      const json: BatchResultResponse = await res.json()
      setBatchResult(json)
    } catch (err: any) {
      setBatchError(err.message || 'Error cargando dataset demo.')
    } finally {
      setBatchLoading(false)
    }
  }

  // Descargar CSV con columnas predichas por el modelo V6
  const handleDescargarCsvLote = () => {
    if (!batchResult) return
    const lines = [
      'ID_POLIGONO,Estado,Municipio,Rendimiento_Predicho_t_ha,Rendimiento_kg_ha,Produccion_Estimada_t,Nivel_Potencial,Diagnostico,Confianza_R2',
      ...batchResult.predicciones.map(
        (p) =>
          `"${p.plot}","${p.estado}","${p.municipio || ''}",${p.rendimiento_t_ha},${p.rendimiento_kg_ha},${p.produccion_estimada_t},"${p.nivel_potencial}","${p.diagnostico}",${p.confianza_r2}`
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Predicciones_V6_Lote_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const metricas = data?.metricas

  return (
    <div className="space-y-8 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Plataforma de Inteligencia Geoespacial AgroCebada 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Mapa y Modelo de <span className="text-[#e2b957]">Rendimiento Agrícola</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#a8c3b4] max-w-3xl leading-relaxed">
          Explora 197 parcelas georreferenciadas con imágenes satelitales Esri y topografía INEGI CEM 4.0, y prueba el modelo en vivo seleccionando si eres <b>agricultor</b> o <b>analista</b>.
        </p>
      </div>

      {/* --- SECCIÓN 1: VISOR DE MAPA SATELITAL --- */}
      <div id="mapa-interactivo" className="scroll-mt-28 space-y-4">
        {/* Panel de Filtros Rápidos de Estado */}
        <div className="bg-[#16392c]/70 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a8c3b4] mr-1">
              Filtro Estado:
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
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? `${cfg.border} bg-white/10 text-white shadow-lg ring-1 ring-white/30`
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
        </div>

        {/* Tarjetas de Métricas de Campo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
            <div className="text-xs uppercase tracking-wider text-[#a8c3b4] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#e2b957]" />
              Rendimiento Medio
            </div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {metricas ? `${metricas.rendimiento_promedio_t_ha} ` : '—'}
              <span className="text-sm font-semibold text-[#e2b957]">t/ha</span>
            </div>
            <div className="text-[11px] text-[#a8c3b4] mt-0.5">
              {metricas ? `${Math.round(metricas.rendimiento_promedio_t_ha * 1000)} kg/ha` : '...'}
            </div>
          </div>

          <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
            <div className="text-xs uppercase tracking-wider text-[#a8c3b4] flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              Superficie Total
            </div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {metricas ? `${metricas.superficie_total_ha} ` : '—'}
              <span className="text-sm font-semibold text-emerald-400">ha</span>
            </div>
            <div className="text-[11px] text-[#a8c3b4] mt-0.5">
              {filteredFeatures.length} parcelas registradas
            </div>
          </div>

          <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
            <div className="text-xs uppercase tracking-wider text-[#a8c3b4] flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-sky-400" />
              Elevación INEGI
            </div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {metricas ? `${metricas.elevacion_promedio_msnm} ` : '—'}
              <span className="text-sm font-semibold text-sky-400">m s.n.m.</span>
            </div>
            <div className="text-[11px] text-[#a8c3b4] mt-0.5">
              Pendiente media: {metricas?.pendiente_promedio_grados ?? 2.0}°
            </div>
          </div>

          <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
            <div className="text-xs uppercase tracking-wider text-[#a8c3b4] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Muestras Monitoreadas
            </div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {metricas?.total_parcelas ?? 0}
              <span className="text-xs font-normal text-[#a8c3b4] ml-2">predios</span>
            </div>
            <div className="text-[11px] text-[#a8c3b4] mt-0.5">
              {metricas ? `${metricas.parcelas_con_rendimiento_real} reales / ${metricas.parcelas_para_prediccion} reto` : '...'}
            </div>
          </div>
        </div>

        {/* Mapa y Sidebar de Detalle */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-[#16392c]/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[480px]">
            <div className="px-4 py-2 bg-[#10281f]/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#a8c3b4]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Puebla (100)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Hidalgo (51)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Tlaxcala (46)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#a8c3b4] bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  🛰️ Satélite Esri
                </span>

                <div className="flex items-center bg-black/60 rounded-xl border border-white/10 p-0.5 shadow-lg">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-white/20 text-white rounded-lg transition cursor-pointer"
                    title="Acercar (+)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-white/20 text-white rounded-lg transition cursor-pointer"
                    title="Alejar (-)"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="p-1.5 hover:bg-white/20 text-[#e2b957] rounded-lg transition cursor-pointer"
                    title="Reajustar vista"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative w-full flex-1 z-0 min-h-[440px]">
              <div
                ref={mapContainerRef}
                className="absolute inset-0 w-full h-full [&_.leaflet-control-zoom]:!hidden [&_.leaflet-control-attribution]:!hidden"
              />

              {loading && (
                <div className="absolute inset-0 bg-[#10281f]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
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
          </div>

          {/* Panel Lateral: Parcela Seleccionada */}
          <div className="bg-[#16392c]/50 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#e2b957]" />
                  Detalle de Parcela
                </h3>
                {selectedParcela ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/20">
                    {selectedParcela.estado}
                  </span>
                ) : (
                  <span className="text-xs text-white/40">Sin selección</span>
                )}
              </div>

              {selectedParcela ? (
                <div className="space-y-3.5">
                  <div className="bg-[#10281f]/80 p-3 rounded-xl border border-white/5">
                    <div className="text-[10px] text-[#a8c3b4] uppercase tracking-wider">Superficie de Predio</div>
                    <div className="text-xl font-extrabold text-white">{selectedParcela.area_ha} hectáreas</div>
                    <div className="text-xs text-[#a8c3b4] mt-0.5">{selectedParcela.municipio}, {selectedParcela.estado} · Ref: {selectedParcela.id_poligono}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#10281f]/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#a8c3b4] block">Elevación CEM 4.0</span>
                      <span className="text-sm font-bold text-white">{selectedParcela.elevacion_msnm} m</span>
                    </div>

                    <div className="bg-[#10281f]/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#a8c3b4] block">Pendiente / Relieve</span>
                      <span className="text-sm font-bold text-sky-400">
                        {selectedParcela.pendiente_grados ?? '—'}° ({selectedParcela.tipo_relieve})
                      </span>
                    </div>

                    <div className="bg-[#10281f]/60 p-2.5 rounded-xl border border-white/5 col-span-2">
                      <span className="text-[10px] text-[#a8c3b4] block">Rendimiento Histórico</span>
                      {selectedParcela.rendimiento_t_ha !== null ? (
                        <span className="text-base font-bold text-[#e2b957]">{selectedParcela.rendimiento_t_ha} t/ha</span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-300 italic">Reto de predicción</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleIrAlAsistente}
                    className="w-full mt-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1e6846] to-[#175237] hover:from-[#258257] hover:to-[#1c6443] text-white text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-500/30 shadow-md cursor-pointer transition active:scale-[0.98]"
                  >
                    <Sprout className="w-4 h-4 text-[#e2b957]" />
                    <span>Evaluar esta parcela en el modelo ⬇</span>
                  </button>
                </div>
              ) : (
                <div className="py-10 px-4 text-center text-[#a8c3b4] flex flex-col items-center justify-center">
                  <Info className="w-8 h-8 text-white/20 mb-2" />
                  <p className="text-xs font-medium text-white/80">Ninguna parcela seleccionada</p>
                  <p className="text-[11px] text-white/50 mt-1 max-w-xs">
                    Haz clic en cualquier polígono en la foto satelital para ver sus hectáreas o usa el asistente guiado más abajo.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#a8c3b4]/80 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Coordenadas en EPSG:4326 (WGS 84).</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 2: INTEGRACIÓN DEL MODELO CON LOS 2 BOTONES --- */}
      <div id="asistente-modelo" className="scroll-mt-24 pt-6 border-t border-white/15">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e2b957]/10 border border-[#e2b957]/30 text-[#e2b957] text-xs font-semibold mb-2">
            <Wheat className="w-3.5 h-3.5" />
            Funciones para Probar el Modelo
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            ¿Cómo deseas evaluar tu cultivo?
          </h2>
          <p className="text-xs sm:text-sm text-[#a8c3b4] mt-1.5">
            Selecciona tu perfil para adaptar las preguntas y resultados a tus necesidades de campo o análisis técnico.
          </p>

          <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-[#16392c]/90 border border-white/15 shadow-2xl gap-2 w-full max-w-lg">
            <button
              type="button"
              onClick={() => setPerfilActivo('agricultor')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
                perfilActivo === 'agricultor'
                  ? 'bg-gradient-to-r from-[#1e6846] to-[#155538] text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/40 ring-1 ring-[#e2b957]/40'
                  : 'text-[#a8c3b4] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Sprout className={`w-4 h-4 ${perfilActivo === 'agricultor' ? 'text-[#e2b957]' : ''}`} />
              <div className="text-left">
                <div className="leading-tight">Soy Agricultor</div>
                <div className="text-[10px] font-normal opacity-80">Asistente guiado paso a paso</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPerfilActivo('analista')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
                perfilActivo === 'analista'
                  ? 'bg-gradient-to-r from-[#17352a] to-[#0f241c] text-white shadow-lg border border-sky-400/40 ring-1 ring-sky-400/30'
                  : 'text-[#a8c3b4] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Sliders className={`w-4 h-4 ${perfilActivo === 'analista' ? 'text-sky-400' : ''}`} />
              <div className="text-left">
                <div className="leading-tight flex items-center gap-1.5">
                  Soy Analista
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30">Técnico</span>
                </div>
                <div className="text-[10px] font-normal opacity-80">Parámetros espectrales</div>
              </div>
            </button>
          </div>
        </div>

        {/* --- VISTA PERFIL AGRICULTOR EN 5 PASOS --- */}
        {perfilActivo === 'agricultor' && (
          <div className="bg-[#16392c]/60 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Indicador de 5 Pasos */}
            <div className="mb-8">
              <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 -z-0" />
                {[
                  { paso: 1, label: '1. Estado' },
                  { paso: 2, label: '2. Municipio' },
                  { paso: 3, label: '3. Temporada' },
                  { paso: 4, label: '4. Parcela' },
                  { paso: 5, label: '5. Diagnóstico' },
                ].map((s) => {
                  const completado = pasoAgricultor > s.paso
                  const actual = pasoAgricultor === s.paso
                  return (
                    <button
                      key={s.paso}
                      type="button"
                      disabled={s.paso > pasoAgricultor && !selectedParcela}
                      onClick={() => {
                        if (
                          s.paso <= pasoAgricultor ||
                          (s.paso === 3 && municipioAgricultor) ||
                          (s.paso === 4 && municipioAgricultor) ||
                          (s.paso === 5 && (selectedParcela || manualAreaHa))
                        ) {
                          setPasoAgricultor(s.paso as any)
                        }
                      }}
                      className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed group"
                    >
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          actual
                            ? 'bg-[#e2b957] text-[#10281f] ring-4 ring-[#e2b957]/30 shadow-lg'
                            : completado
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#10281f] border border-white/20 text-white/50 group-hover:border-white/40'
                        }`}
                      >
                        {completado ? <Check className="w-4 h-4" /> : s.paso}
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-semibold text-center ${actual ? 'text-[#e2b957]' : completado ? 'text-emerald-400' : 'text-white/50'}`}>
                        {s.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* PASO 1: ¿A qué estado perteneces? */}
            {pasoAgricultor === 1 && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-wider text-[#e2b957] font-semibold">Paso 1 de 4</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    ¿En qué estado se encuentra tu parcela de cebada?
                  </h3>
                  <p className="text-xs text-[#a8c3b4] mt-1">
                    Selecciona una de las 3 entidades monitoreadas con imágenes satelitales en el Altiplano Central.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    {
                      nombre: 'Puebla',
                      color: 'border-emerald-500/50 hover:border-emerald-400',
                      bg: 'bg-emerald-500/10',
                      badge: '100 parcelas monitoreadas',
                      badgeColor: 'text-emerald-300 bg-emerald-500/20',
                      emoji: '🟢',
                      region: 'Chignahuapan / Sierra Norte',
                    },
                    {
                      nombre: 'Hidalgo',
                      color: 'border-amber-500/50 hover:border-amber-400',
                      bg: 'bg-amber-500/10',
                      badge: '51 parcelas monitoreadas',
                      badgeColor: 'text-amber-300 bg-amber-500/20',
                      emoji: '🟠',
                      region: 'Valle de Apan / Singuilucan',
                    },
                    {
                      nombre: 'Tlaxcala',
                      color: 'border-sky-500/50 hover:border-sky-400',
                      bg: 'bg-sky-500/10',
                      badge: '46 parcelas monitoreadas',
                      badgeColor: 'text-sky-300 bg-sky-500/20',
                      emoji: '🔵',
                      region: 'Calpulalpan / Nanacamilpa',
                    },
                  ].map((edo) => (
                    <button
                      key={edo.nombre}
                      type="button"
                      onClick={() => handleSeleccionarEstado(edo.nombre)}
                      className={`p-5 rounded-2xl border ${edo.color} ${edo.bg} flex flex-col items-center text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg group`}
                    >
                      <span className="text-3xl mb-2">{edo.emoji}</span>
                      <h4 className="text-lg font-bold text-white group-hover:text-[#e2b957] transition">{edo.nombre}</h4>
                      <span className="text-[11px] text-[#a8c3b4] mt-0.5">{edo.region}</span>
                      <span className={`mt-3 px-2.5 py-1 rounded-full text-xs font-semibold ${edo.badgeColor}`}>
                        {edo.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 2: ¿En qué municipio se encuentra tu cultivo? */}
            {pasoAgricultor === 2 && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#e2b957] font-semibold">Paso 2 de 4</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      ¿En qué municipio de {estadoAgricultor} está tu predio?
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasoAgricultor(1)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#a8c3b4] hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Cambiar estado
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(MUNICIPIOS_POR_ESTADO[estadoAgricultor] || []).map((munKey) => {
                    const info = MUNICIPIOS_DATA[munKey]
                    if (!info) return null
                    return (
                      <button
                        key={munKey}
                        type="button"
                        onClick={() => handleSeleccionarMunicipio(munKey)}
                        className="p-4 rounded-2xl bg-[#10281f]/80 border border-white/10 hover:border-[#e2b957]/60 hover:bg-[#10281f] text-left transition-all duration-200 cursor-pointer shadow-md group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-white group-hover:text-[#e2b957] transition">
                              {info.nombre}
                            </h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                              {info.totalParcelas} predios satelitales
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a8c3b4] mt-2 leading-relaxed">
                            {info.descripcion}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-[#a8c3b4]">Promedio histórico:</span>
                          <span className="font-bold text-[#e2b957]">{info.rendimientoPromedio} t/ha</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* PASO 3: TEMPORADA AGRÍCOLA Y RANGO DE FECHAS */}
            {pasoAgricultor === 3 && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#e2b957] font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Factor Fenológico Esencial
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      ¿En qué temporada o fechas cultivas en {municipioAgricultor}?
                    </h3>
                    <p className="text-xs text-[#a8c3b4] mt-0.5">
                      La temporada y duración del ciclo modulan directamente la radiación térmica y la humedad acumulada en el modelo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasoAgricultor(2)}
                    className="inline-flex items-center gap-1 text-xs text-[#a8c3b4] hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Municipio
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Opción 1: Ciclo P-V */}
                  <div
                    onClick={() => {
                      setTemporada('PV')
                      setFechaInicio('2025-05-15')
                      setFechaFin('2025-10-30')
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      temporada === 'PV'
                        ? 'bg-[#10281f] border-[#e2b957] ring-2 ring-[#e2b957]/40 shadow-xl'
                        : 'bg-[#10281f]/60 border-white/10 hover:border-white/30 hover:bg-[#10281f]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CloudRain className="w-5 h-5 text-emerald-400" />
                          <h4 className="font-bold text-white text-base">Primavera - Verano (P-V)</h4>
                        </div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Más Común
                        </span>
                      </div>
                      <p className="text-xs text-[#a8c3b4] mt-2 leading-relaxed">
                        Ciclo principal de temporal en el Altiplano Central. Siembra entre Mayo y Junio con cosecha entre Septiembre y Noviembre.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#e2b957] font-semibold flex items-center justify-between">
                      <span>Mayo ➔ Noviembre (~168 días)</span>
                      <span>Óptima biomasa</span>
                    </div>
                  </div>

                  {/* Opción 2: Ciclo O-I */}
                  <div
                    onClick={() => {
                      setTemporada('OI')
                      setFechaInicio('2024-12-01')
                      setFechaFin('2025-04-30')
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      temporada === 'OI'
                        ? 'bg-[#10281f] border-[#e2b957] ring-2 ring-[#e2b957]/40 shadow-xl'
                        : 'bg-[#10281f]/60 border-white/10 hover:border-white/30 hover:bg-[#10281f]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sun className="w-5 h-5 text-amber-400" />
                          <h4 className="font-bold text-white text-base">Otoño - Invierno (O-I)</h4>
                        </div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          Riego / Residual
                        </span>
                      </div>
                      <p className="text-xs text-[#a8c3b4] mt-2 leading-relaxed">
                        Ciclo con temperaturas invernales más frías. Siembra en Diciembre-Enero con cosecha primaveral en Abril-Mayo.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#e2b957] font-semibold flex items-center justify-between">
                      <span>Diciembre ➔ Mayo (~150 días)</span>
                      <span>Régimen térmico frío</span>
                    </div>
                  </div>
                </div>

                {/* Opción 3: Personalizar Rango de Fechas */}
                <div className="p-5 rounded-2xl bg-[#10281f]/70 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                      <input
                        type="radio"
                        name="tipoTemporada"
                        checked={temporada === 'personalizado'}
                        onChange={() => setTemporada('personalizado')}
                        className="accent-[#e2b957] w-4 h-4 cursor-pointer"
                      />
                      <span>O definir rango de fechas exactas de siembra y cosecha</span>
                    </label>

                    {temporada === 'personalizado' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e2b957]/20 text-[#e2b957] font-semibold">
                        Duración: {diasCiclo} días de ciclo
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <label className="flex flex-col gap-1.5 text-xs text-[#a8c3b4]">
                      Fecha de siembra / inicio:
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => {
                          setFechaInicio(e.target.value)
                          setTemporada('personalizado')
                        }}
                        className="h-10 rounded-xl border border-white/10 bg-[#10281f] px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs text-[#a8c3b4]">
                      Fecha estimada de corte / cosecha:
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => {
                          setFechaFin(e.target.value)
                          setTemporada('personalizado')
                        }}
                        className="h-10 rounded-xl border border-white/10 bg-[#10281f] px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSeleccionarTemporadaYContinuar}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#1e6846] to-[#155538] hover:from-[#258257] hover:to-[#1c6443] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <span>Continuar a Ubicación de Parcela</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: LOCALIZA TU PARCELA (OPCIÓN 3 - DOBLE CAMINO) */}
            {pasoAgricultor === 4 && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#e2b957] font-semibold">Paso 4 de 4</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      ¿Cómo deseas ubicar tu predio en {municipioAgricultor}?
                    </h3>
                    <p className="text-xs text-[#a8c3b4] mt-0.5">
                      No necesitas saber códigos técnicos: encuéntrala por sus hectáreas en el mapa satelital o ingresa tu superficie directamente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPasoAgricultor(3)}
                    className="inline-flex items-center gap-1 text-xs text-[#a8c3b4] hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Temporada
                  </button>
                </div>

                {/* SELECTOR DE CAMINO: CAMINO A VS CAMINO B */}
                <div className="flex rounded-2xl bg-[#10281f] p-1.5 border border-white/10 gap-2">
                  <button
                    type="button"
                    onClick={() => setModoSeleccion('mapa_catalogo')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      modoSeleccion === 'mapa_catalogo'
                        ? 'bg-[#1e6846] text-white shadow-md border border-emerald-400/30'
                        : 'text-[#a8c3b4] hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[#e2b957]" />
                    <span>Camino A: Tocar en foto satelital / Catálogo por tamaño</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModoSeleccion('manual_hectareas')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      modoSeleccion === 'manual_hectareas'
                        ? 'bg-[#1e6846] text-white shadow-md border border-emerald-400/30'
                        : 'text-[#a8c3b4] hover:text-white'
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-[#e2b957]" />
                    <span>Camino B: Mi predio no está marcado / Ingresar mis hectáreas</span>
                  </button>
                </div>

                {/* CAMINO A: SELECCIÓN VISUAL POR TAMAÑO Y SATÉLITE */}
                {modoSeleccion === 'mapa_catalogo' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#10281f]/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-white">Filtrar parcelas por tamaño aproximado:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            { id: 'todos', label: 'Todas las parcelas' },
                            { id: 'pequenas', label: 'Pequeñas (< 5 ha)' },
                            { id: 'medianas', label: 'Medianas (5 a 15 ha)' },
                            { id: 'grandes', label: 'Grandes (> 15 ha)' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setFiltroTamano(t.id as any)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                                filtroTamano === t.id
                                  ? 'bg-[#e2b957] text-[#10281f] font-bold border-[#e2b957]'
                                  : 'bg-white/5 border-white/10 text-[#a8c3b4] hover:text-white'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerEnMapa}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#e2b957]" /> Tocar polígono en el mapa arriba
                      </button>
                    </div>

                    {/* Buscador libre */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        value={filtroTextoParcela}
                        onChange={(e) => setFiltroTextoParcela(e.target.value)}
                        placeholder="Buscar por tamaño (ej. 4.8 ha) o característica..."
                        className="w-full pl-8 pr-3 py-2 bg-[#10281f]/80 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#e2b957]"
                      />
                    </div>

                    {/* Grid de Predios sin nombres crípticos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                      {parcelasFiltradasAmigables.map((p) => {
                        const isSelected = selectedParcela?.id_poligono === p.id_poligono
                        return (
                          <div
                            key={p.id_poligono}
                            onClick={() => handleSeleccionarParcelaCaminoA(p)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#10281f] border-[#e2b957] ring-2 ring-[#e2b957]/40 shadow-lg'
                                : 'bg-[#10281f]/70 border-white/10 hover:border-white/30 hover:bg-[#10281f]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-white text-base">
                                  Predio de {p.area_ha} ha
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                                  {p.area_ha < 5 ? 'Pequeña' : p.area_ha <= 15 ? 'Mediana' : 'Grande'}
                                </span>
                              </div>

                              <div className="text-xs text-[#a8c3b4] mt-2 space-y-1">
                                <div>Altitud: <b className="text-white">{p.elevacion_msnm} m s.n.m.</b></div>
                                <div>Relieve: <b className="text-sky-300">{p.tipo_relieve}</b> ({p.pendiente_grados ?? '—'}°)</div>
                                <div className="text-[10px] text-white/40 pt-1">Referencia técnica: {p.id_poligono}</div>
                              </div>
                            </div>

                            <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-emerald-400 font-medium">
                                {p.rendimiento_t_ha !== null ? 'Dato real verificado' : 'Inferencia IA'}
                              </span>
                              <span className="text-[#e2b957] font-bold inline-flex items-center gap-1">
                                Elegir predio <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* CAMINO B: INGRESO MANUAL DE HECTÁREAS */}
                {modoSeleccion === 'manual_hectareas' && (
                  <div className="p-6 rounded-2xl bg-[#10281f]/80 border border-white/10 space-y-5">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-base">
                        Estimar con la superficie y condiciones de tu predio
                      </h4>
                      <p className="text-xs text-[#a8c3b4]">
                        Si tu parcela no se encuentra entre los 197 polígonos del satélite, el modelo calculará la producción usando los patrones satelitales y climáticos calibrados para {municipioAgricultor}.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {/* Superficie en ha */}
                      <label className="flex flex-col gap-1.5 text-xs text-[#a8c3b4]">
                        <span className="font-semibold text-white">Superficie de tu terreno (ha):</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={manualAreaHa}
                          onChange={(e) => setManualAreaHa(e.target.value)}
                          placeholder="Ej. 6.5"
                          className="h-11 rounded-xl border border-white/15 bg-[#10281f] px-3.5 text-sm font-bold text-white outline-none focus:border-[#e2b957] focus:ring-1 focus:ring-[#e2b957]"
                        />
                        <span className="text-[10px] text-white/50">Hectáreas sembradas</span>
                      </label>

                      {/* Tipo de terreno */}
                      <label className="flex flex-col gap-1.5 text-xs text-[#a8c3b4]">
                        <span className="font-semibold text-white">Tipo de terreno:</span>
                        <select
                          value={manualTipoTerreno}
                          onChange={(e) => setManualTipoTerreno(e.target.value as any)}
                          className="h-11 rounded-xl border border-white/15 bg-[#10281f] px-3 text-xs text-white outline-none focus:border-[#e2b957] cursor-pointer"
                        >
                          <option value="plano">Plano de valle (Poca pendiente)</option>
                          <option value="ladera_suave">Ladera suave (Lomerío)</option>
                          <option value="cerro">Cerro o ladera empinada</option>
                        </select>
                        <span className="text-[10px] text-white/50">Influye en la retención de agua</span>
                      </label>

                      {/* Régimen de agua */}
                      <label className="flex flex-col gap-1.5 text-xs text-[#a8c3b4]">
                        <span className="font-semibold text-white">Régimen de agua / manejo:</span>
                        <select
                          value={manualRegimenAgua}
                          onChange={(e) => setManualRegimenAgua(e.target.value as any)}
                          className="h-11 rounded-xl border border-white/15 bg-[#10281f] px-3 text-xs text-white outline-none focus:border-[#e2b957] cursor-pointer"
                        >
                          <option value="temporal_bueno">Temporal favorable (Buen régimen)</option>
                          <option value="temporal_regular">Temporal regular / seco</option>
                          <option value="riego">Riego de auxilio / residual</option>
                        </select>
                        <span className="text-[10px] text-white/50">Disponibilidad hídrica</span>
                      </label>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-[#a8c3b4]">
                        Calibrado con datos de {municipioAgricultor} ({infoTemporada.nombre})
                      </span>

                      <button
                        type="button"
                        onClick={handleCalcularCaminoB}
                        className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#1e6846] to-[#155538] hover:from-[#258257] hover:to-[#1c6443] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
                      >
                        <Sprout className="w-4 h-4 text-[#e2b957]" />
                        <span>Calcular Cosecha de mi Terreno</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASO 5: DIAGNÓSTICO Y ESTIMACIÓN DE COSECHA */}
            {pasoAgricultor === 5 && diagnosticoAgricultor && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Estimación completada para tu cultivo
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5">
                      {diagnosticoAgricultor.nombrePredio}
                    </h3>
                    <p className="text-xs text-[#a8c3b4] mt-0.5">
                      {municipioAgricultor}, {estadoAgricultor} · {infoTemporada.nombre} ({infoTemporada.meses})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPasoAgricultor(4)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Cambiar de predio
                    </button>
                    <button
                      type="button"
                      onClick={handleVerEnMapa}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#e2b957]" /> Ver en el mapa
                    </button>
                  </div>
                </div>

                {/* Tarjetas Principales de Resultados */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rendimiento Esperado */}
                  <div className="bg-[#10281f] border border-[#e2b957]/40 rounded-2xl p-5 relative overflow-hidden shadow-xl md:col-span-1">
                    <span className="text-xs uppercase tracking-wider text-[#a8c3b4] font-semibold">
                      Rendimiento Esperado
                    </span>
                    <div className="mt-2 text-4xl sm:text-5xl font-black text-[#e2b957] tracking-tight">
                      {diagnosticoAgricultor.rendimiento}{' '}
                      <span className="text-lg font-normal text-white/80">t/ha</span>
                    </div>
                    <div className="mt-1 text-xs text-[#a8c3b4]">
                      ≈ {Math.round(diagnosticoAgricultor.rendimiento * 1000).toLocaleString('es-MX')} kg por hectárea
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/70">
                      {diagnosticoAgricultor.esEstimado ? (
                        <span className="inline-flex items-center gap-1 text-[#e2b957]">
                          <Sparkles className="w-3 h-3" /> Inferencia de Inteligencia Artificial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Verificado en campo (Cosecha real)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cosecha Total Proyectada */}
                  <div className="bg-[#10281f] border border-white/10 rounded-2xl p-5 shadow-xl md:col-span-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#a8c3b4] font-semibold">
                        Cosecha Total Proyectada
                      </span>
                      <div className="mt-2 text-3xl font-extrabold text-white">
                        {diagnosticoAgricultor.produccionTotalT}{' '}
                        <span className="text-sm font-normal text-emerald-400">toneladas</span>
                      </div>
                      <div className="text-xs text-[#a8c3b4] mt-1">
                        Superficie evaluada: <b>{diagnosticoAgricultor.areaEfectivaHa} ha</b>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-[#a8c3b4]">
                      Equivale a aproximadamente{' '}
                      <b className="text-white font-bold">{diagnosticoAgricultor.bultos50kg.toLocaleString('es-MX')}</b> costales de 50 kg.
                    </div>
                  </div>

                  {/* Comparativa Municipal */}
                  <div className="bg-[#10281f] border border-white/10 rounded-2xl p-5 shadow-xl md:col-span-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#a8c3b4] font-semibold">
                        Comparativa {municipioAgricultor}
                      </span>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {diagnosticoAgricultor.munPromedio}{' '}
                        <span className="text-sm font-normal text-[#a8c3b4]">t/ha promedio</span>
                      </div>
                      <div className="text-xs mt-1">
                        {diagnosticoAgricultor.diffConMunicipio >= 0 ? (
                          <span className="text-emerald-400 font-semibold">
                            +{diagnosticoAgricultor.diffConMunicipio} t/ha por encima del promedio
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">
                            {diagnosticoAgricultor.diffConMunicipio} t/ha por debajo del promedio
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-[#a8c3b4] bg-white/5 p-2 rounded-xl">
                      Ciclo: {infoTemporada.nombre} ({infoTemporada.meses})
                    </div>
                  </div>
                </div>

                {/* Semáforo de Salud Agronómica */}
                <div className={`p-5 rounded-2xl border ${diagnosticoAgricultor.estadoSalud.colorBorder} bg-[#10281f]/90 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Diagnóstico del Cultivo
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${diagnosticoAgricultor.estadoSalud.colorBadge}`}>
                      {diagnosticoAgricultor.estadoSalud.titulo}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#a8c3b4] leading-relaxed">
                    {diagnosticoAgricultor.estadoSalud.subtitulo}
                  </p>
                </div>

                {/* Recomendaciones Agronómicas Estacionales */}
                <div className="bg-[#10281f]/80 p-5 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-[#e2b957]" />
                    Recomendaciones Estacionales para tu Predio
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#a8c3b4]">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <b className="text-white block mb-1">Manejo de Suelo y Pendiente</b>
                      {diagnosticoAgricultor.pendienteGrados > 3
                        ? `Pendiente de ${diagnosticoAgricultor.pendienteGrados}°. Se sugiere surcado al contorno para retener humedad pluvial de temporal y evitar deslaves.`
                        : 'Terreno plano de valle. Permite distribución uniforme de nutrientes y buen drenaje sin pérdida de suelo.'}
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <b className="text-white block mb-1">Temporada y Régimen Térmico</b>
                      {temporada === 'PV'
                        ? 'En Primavera-Verano, supervisar el llenado de grano en Agosto-Septiembre para evitar afectaciones por heladas tempranas de otoño.'
                        : 'En Otoño-Invierno, asegurar riegos oportunos de auxilio en etapa de macollamiento y espigado para mantener vigor.'}
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <b className="text-white block mb-1">Cosecha y Calidad Maltera</b>
                      Monitorear el corte cuando la humedad del grano esté entre 12% y 13.5% para garantizar el porcentaje de germinación exigido en maltería.
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPasoAgricultor(1)
                      setEstadoAgricultor('')
                      setMunicipioAgricultor('')
                      setSelectedParcela(null)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#a8c3b4] hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Iniciar nueva consulta
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPasoAgricultor(3)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#e2b957]" /> Ajustar temporada/fechas
                    </button>

                    <button
                      type="button"
                      onClick={descargarReporteAgricultor}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e6846] hover:bg-[#165538] text-white text-xs font-semibold shadow-lg transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Descargar Ficha del Productor (CSV)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VISTA PERFIL ANALISTA --- */}
        {perfilActivo === 'analista' && (
          <div className="bg-[#16392c]/60 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Cabecera y Sub-Pestañas del Analista */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-xs font-medium mb-1">
                  <Sliders className="w-3.5 h-3.5" /> Modo Técnico y de Investigación
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Laboratorio de Modelado AgroCebada V6</h3>
                <p className="text-xs text-[#a8c3b4] mt-0.5">
                  Evalúa polígonos individuales con parámetros biofísicos o procesa datasets completos en formato .csv o .zip.
                </p>
              </div>

              {subPestanaAnalista === 'parametros' && selectedParcela && (
                <button
                  type="button"
                  onClick={cargarTelemetriaSeleccionadaAnalista}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-xs font-semibold transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" /> Cargar telemetría de {selectedParcela.id_poligono}
                </button>
              )}
            </div>

            {/* Selector de Sub-Pestañas */}
            <div className="flex border-b border-white/10 mb-6 gap-2">
              <button
                type="button"
                onClick={() => setSubPestanaAnalista('parametros')}
                className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  subPestanaAnalista === 'parametros'
                    ? 'border-sky-400 text-white'
                    : 'border-transparent text-[#a8c3b4] hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Inferencia Paramétrica (En vivo)</span>
              </button>

              <button
                type="button"
                onClick={() => setSubPestanaAnalista('archivos')}
                className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  subPestanaAnalista === 'archivos'
                    ? 'border-sky-400 text-white'
                    : 'border-transparent text-[#a8c3b4] hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Procesar Archivos (.csv / .zip)</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300">Lote</span>
              </button>
            </div>

            {/* PESTAÑA A: INFERENCIA PARAMÉTRICA INDIVIDUAL */}
            {subPestanaAnalista === 'parametros' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleCalcularAnalista} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <label className="flex flex-col gap-1.5 text-xs font-medium text-[#a8c3b4]">
                      ID de Polígono / Predio
                      <input
                        type="text"
                        required
                        placeholder="Ej. AGC_001"
                        value={analistaValues.plot}
                        onChange={(e) => setAnalistaValues({ ...analistaValues, plot: e.target.value })}
                        className="h-10 rounded-xl border border-white/10 bg-[#10281f]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957] focus:ring-1 focus:ring-[#e2b957]"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-medium text-[#a8c3b4]">
                      Superficie (ha)
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        required
                        placeholder="Ej. 15.5"
                        value={analistaValues.area}
                        onChange={(e) => setAnalistaValues({ ...analistaValues, area: e.target.value })}
                        className="h-10 rounded-xl border border-white/10 bg-[#10281f]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957] focus:ring-1 focus:ring-[#e2b957]"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-medium text-[#a8c3b4]">
                      vi6t_max · Temperatura satelital
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="-0.58"
                        value={analistaValues.temp}
                        onChange={(e) => setAnalistaValues({ ...analistaValues, temp: e.target.value })}
                        className="h-10 rounded-xl border border-white/10 bg-[#10281f]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957] focus:ring-1 focus:ring-[#e2b957]"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-medium text-[#a8c3b4]">
                      ndwi_mean · Estrés hídrico
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="0.22"
                        value={analistaValues.ndwi}
                        onChange={(e) => setAnalistaValues({ ...analistaValues, ndwi: e.target.value })}
                        className="h-10 rounded-xl border border-white/10 bg-[#10281f]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957] focus:ring-1 focus:ring-[#e2b957]"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-medium text-[#a8c3b4]">
                      evi_std · Variabilidad de verdor
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="0.26"
                        value={analistaValues.evi}
                        onChange={(e) => setAnalistaValues({ ...analistaValues, evi: e.target.value })}
                        className="h-10 rounded-xl border border-white/10 bg-[#10281f]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957] focus:ring-1 focus:ring-[#e2b957]"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-medium text-[#a8c3b4]">
                      lai_std · Área foliar
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="0.38"
                        value={analistaValues.lai}
                        onChange={(e) => setAnalistaValues({ ...analistaValues, lai: e.target.value })}
                        className="h-10 rounded-xl border border-white/10 bg-[#10281f]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957] focus:ring-1 focus:ring-[#e2b957]"
                      />
                    </label>
                  </div>

                  {analistaError && (
                    <p className="text-xs text-rose-400">{analistaError}</p>
                  )}

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={analistaLoading}
                      className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {analistaLoading ? 'Calculando ensamble V6...' : 'Ejecutar Inferencia del Modelo'}
                      {!analistaLoading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAnalistaValues(initialAnalistaValues)
                        setAnalistaResult(null)
                      }}
                      className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#a8c3b4] text-xs transition cursor-pointer"
                      title="Reiniciar valores"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Panel de Salida del Ensamble V6 */}
                <div className="bg-[#10281f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[300px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
                        Salida Oficial Modelo V6
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                        ExtraTrees + SVR + Huber
                      </span>
                    </div>

                    {analistaResult === null ? (
                      <div className="py-12 text-center text-[#a8c3b4] flex flex-col items-center">
                        <BarChart3 className="w-10 h-10 text-white/20 mb-3" />
                        <p className="text-sm font-semibold text-white">Parámetros listos para inferencia</p>
                        <p className="text-xs text-white/50 max-w-xs mt-1">
                          Presiona «Ejecutar Inferencia del Modelo» para obtener el rendimiento oficial y métricas de error.
                        </p>
                      </div>
                    ) : (
                      <div className="py-4 space-y-4">
                        <div>
                          <span className="text-xs text-[#a8c3b4]">Rendimiento Predicho:</span>
                          <div className="text-4xl font-black text-[#e2b957] mt-1">
                            {analistaResult.toFixed(2)} <span className="text-lg font-normal text-white">t/ha</span>
                          </div>
                          <div className="text-xs text-[#a8c3b4] mt-0.5">
                            ≈ {Math.round(analistaResult * 1000).toLocaleString('es-MX')} kg/ha
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#a8c3b4] block">Producción Total:</span>
                            <b className="text-white">
                              {(analistaResult * Number(analistaValues.area)).toFixed(1)} t
                            </b>
                          </div>
                          <div>
                            <span className="text-[#a8c3b4] block">Nivel Potencial:</span>
                            <b className={analistaPotencial === 'alto' ? 'text-emerald-400' : analistaPotencial === 'medio' ? 'text-amber-400' : 'text-rose-400'}>
                              {analistaPotencial ? analistaPotencial.toUpperCase() : 'MEDIO'}
                            </b>
                          </div>
                        </div>

                        {analistaDiag && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-[#a8c3b4]">
                            <b className="text-white block mb-0.5">Diagnóstico Agroecológico:</b>
                            {analistaDiag}
                          </div>
                        )}

                        {selectedParcela && selectedParcela.rendimiento_t_ha !== null && (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                            <span className="text-emerald-300 font-semibold block">Validación Cruzada (Residuo OOF):</span>
                            <div className="text-white mt-1">
                              Real: <b>{selectedParcela.rendimiento_t_ha} t/ha</b> · Predicho: <b>{analistaResult} t/ha</b>
                            </div>
                            <div className="text-[#a8c3b4] mt-0.5">
                              Error residual absoluto: <b>{Math.abs(selectedParcela.rendimiento_t_ha - analistaResult).toFixed(2)} t/ha</b>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 text-[11px] text-[#a8c3b4] flex items-center justify-between">
                    <span>Métricas Oficiales OOF: R² = 0.695 · Pearson r = 0.834</span>
                    <span>AgroCebada 2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA B: PROCESAMIENTO MULTI-ARCHIVO (.CSV Y .ZIP) CON VALIDACIÓN ESTRICTA */}
            {subPestanaAnalista === 'archivos' && (
              <div className="space-y-6">
                {/* Cabecera del Checklist y Estado de Ingesta */}
                <div className="p-5 rounded-2xl bg-[#10281f]/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <h4 className="font-bold text-white text-base">
                        Matriz de Ingesta Obligatoria (4 Fuentes Requeridas)
                      </h4>
                    </div>
                    <p className="text-xs text-[#a8c3b4] mt-1 leading-relaxed max-w-2xl">
                      El Modelo Maestro V6 requiere estrictamente las 4 fuentes de datos para ejecutar la inferencia. Puedes subir los archivos juntos, seleccionarlos uno a uno o usar el dataset oficial.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                        todosListos
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {todosListos ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{conteoCargados} de 4 Fuentes Listas</span>
                    </span>
                  </div>
                </div>

                {/* Grid con las 4 Ranuras de Archivos Requeridos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Slot 1: Parcelas */}
                  <div
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      archivosState.parcelas.cargado
                        ? 'bg-[#10281f] border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-[#10281f]/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            archivosState.parcelas.cargado
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {archivosState.parcelas.cargado ? '✓ Listo' : 'Pendiente'}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs mt-2.5">1. Parcelas y Superficie</h5>
                      <p className="text-[11px] text-[#a8c3b4] mt-1 leading-snug">
                        ID_area_rendimiento...csv o parcelas.csv (Superficie, Estado y Municipio)
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <input
                        type="file"
                        id="slot-parcelas"
                        accept=".csv"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) asignarSlotIndividual('parcelas', f)
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="slot-parcelas"
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-[#e2b957] font-semibold text-center block cursor-pointer transition truncate"
                      >
                        {archivosState.parcelas.cargado ? archivosState.parcelas.nombre : '+ Subir Parcelas'}
                      </label>
                    </div>
                  </div>

                  {/* Slot 2: Satélite BÁSICO */}
                  <div
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      archivosState.basico.cargado
                        ? 'bg-[#10281f] border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-[#10281f]/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Satellite className="w-5 h-5 text-emerald-400" />
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            archivosState.basico.cargado
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {archivosState.basico.cargado ? '✓ Listo' : 'Pendiente'}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs mt-2.5">2. Satélite BÁSICO</h5>
                      <p className="text-[11px] text-[#a8c3b4] mt-1 leading-snug">
                        Conjunto_datos_BASICO...csv (Sentinel-2 y Landsat: vi6t, ndwi, dswi2)
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <input
                        type="file"
                        id="slot-basico"
                        accept=".csv"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) asignarSlotIndividual('basico', f)
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="slot-basico"
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-emerald-300 font-semibold text-center block cursor-pointer transition truncate"
                      >
                        {archivosState.basico.cargado ? archivosState.basico.nombre : '+ Subir BÁSICO'}
                      </label>
                    </div>
                  </div>

                  {/* Slot 3: Satélite PRO */}
                  <div
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      archivosState.pro.cargado
                        ? 'bg-[#10281f] border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-[#10281f]/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Satellite className="w-5 h-5 text-sky-400" />
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            archivosState.pro.cargado
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {archivosState.pro.cargado ? '✓ Listo' : 'Pendiente'}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs mt-2.5">3. Satélite PRO</h5>
                      <p className="text-[11px] text-[#a8c3b4] mt-1 leading-snug">
                        Conjunto_datos_PRO...csv (PlanetScope: lai_mean, lai_std, msavi)
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <input
                        type="file"
                        id="slot-pro"
                        accept=".csv"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) asignarSlotIndividual('pro', f)
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="slot-pro"
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-sky-300 font-semibold text-center block cursor-pointer transition truncate"
                      >
                        {archivosState.pro.cargado ? archivosState.pro.nombre : '+ Subir PRO'}
                      </label>
                    </div>
                  </div>

                  {/* Slot 4: Topografía INEGI */}
                  <div
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      archivosState.topografia.cargado
                        ? 'bg-[#10281f] border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-[#10281f]/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Mountain className="w-5 h-5 text-indigo-400" />
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            archivosState.topografia.cargado
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {archivosState.topografia.cargado ? '✓ Listo' : 'Pendiente'}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs mt-2.5">4. Topografía INEGI CEM 4.0</h5>
                      <p className="text-[11px] text-[#a8c3b4] mt-1 leading-snug">
                        Reto_...Topografia_INEGI_CEM4.zip (Archivos .tif de 120m) o .csv
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <input
                        type="file"
                        id="slot-topografia"
                        accept=".zip,.tif,.tiff,.csv"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) asignarSlotIndividual('topografia', f)
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="slot-topografia"
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-indigo-300 font-semibold text-center block cursor-pointer transition truncate"
                      >
                        {archivosState.topografia.cargado ? archivosState.topografia.nombre : '+ Subir .zip o .tif INEGI'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Zona de Carga Rápida Múltiple y Botón Demo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Zona de Drag & Drop de Archivos Múltiples */}
                  <div className="md:col-span-2 p-5 rounded-2xl border-2 border-dashed border-white/20 hover:border-sky-400/60 transition bg-[#10281f]/70 flex flex-col items-center justify-center text-center">
                    <input
                      type="file"
                      id="multi-upload-analista"
                      multiple
                      accept=".csv,.zip,.tif,.tiff"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length > 0) clasificarYAsignarArchivos(files)
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="multi-upload-analista"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-white text-sm">
                        Arrastra o selecciona tus 4 archivos a la vez
                      </div>
                      <div className="text-xs text-[#a8c3b4] max-w-md">
                        El clasificador inteligente detectará automáticamente qué archivo corresponde a cada una de las 4 fuentes requeridas.
                      </div>
                    </label>

                    {/* Botón de Inferencia sobre los 4 archivos */}
                    <button
                      type="button"
                      onClick={handleProcesarArchivoLote}
                      disabled={!todosListos || batchLoading}
                      className={`mt-4 py-2.5 px-6 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                        todosListos && !batchLoading
                          ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shadow-lg'
                          : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      {batchLoading
                        ? 'Procesando con Modelo V6...'
                        : todosListos
                        ? 'Ejecutar Inferencia V6 sobre los 4 Archivos'
                        : `Sube los 4 archivos para habilitar (${conteoCargados}/4 listos)`}
                      {todosListos && !batchLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Tarjeta de Carga Rápida Oficial (Las 4 fuentes juntas) */}
                  <div className="p-5 rounded-2xl bg-[#10281f] border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#e2b957] uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" /> Reto Oficial AgroCebada
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        Cargar las 4 fuentes oficiales
                      </h4>
                      <p className="text-xs text-[#a8c3b4] mt-1.5 leading-relaxed">
                        Carga automáticamente los 4 archivos del proyecto (<code className="text-[#e2b957]">ID_area_rendimiento</code>, <code className="text-emerald-400">BASICO</code>, <code className="text-sky-400">PRO</code> y <code className="text-indigo-400">Topografía</code>) y predice las <b>59 parcelas sin rendimiento</b>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCargarDemoDataset}
                      disabled={batchLoading}
                      className="mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1e6846] to-[#155538] hover:from-[#258257] hover:to-[#1c6443] text-white font-bold text-xs transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {batchLoading ? 'Calculando 59 parcelas...' : '⚡ Cargar 4 Fuentes Oficiales (59 Predios)'}
                    </button>
                  </div>
                </div>

                {/* Spinner de Carga */}
                {batchLoading && (
                  <div className="p-8 rounded-2xl bg-[#10281f]/80 border border-white/10 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-white">
                      Validando y cruzando las 4 fuentes de datos con el Modelo Maestro V6...
                    </span>
                  </div>
                )}

                {/* Error de lote */}
                {batchError && (
                  <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <div>
                      <b>Validación de archivos:</b> {batchError}
                    </div>
                  </div>
                )}

                {/* Resultados del Lote */}
                {batchResult && !batchLoading && (
                  <div className="space-y-4 pt-2">
                    {/* Resumen Global */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      <div className="bg-[#10281f] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#a8c3b4] uppercase tracking-wider block">Parcelas Evaluadas</span>
                        <div className="text-2xl font-black text-white mt-1">{batchResult.total_parcelas}</div>
                        <span className="text-[10px] text-white/50">Predios sin rendimiento previo</span>
                      </div>

                      <div className="bg-[#10281f] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#a8c3b4] uppercase tracking-wider block">Rendimiento Medio</span>
                        <div className="text-2xl font-black text-[#e2b957] mt-1">
                          {batchResult.rendimiento_promedio_t_ha} <span className="text-sm font-normal text-white">t/ha</span>
                        </div>
                        <span className="text-[10px] text-[#a8c3b4]">
                          ≈ {Math.round(batchResult.rendimiento_promedio_t_ha * 1000)} kg/ha
                        </span>
                      </div>

                      <div className="bg-[#10281f] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#a8c3b4] uppercase tracking-wider block">Producción Total</span>
                        <div className="text-2xl font-black text-emerald-400 mt-1">
                          {batchResult.produccion_total_t} <span className="text-sm font-normal text-white">t</span>
                        </div>
                        <span className="text-[10px] text-white/50">Estimación en tolva</span>
                      </div>

                      <div className="bg-[#10281f] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#a8c3b4] uppercase tracking-wider block">Distribución</span>
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                          <span className="text-emerald-400">{batchResult.conteo_alto} Alto</span>
                          <span className="text-white/30">·</span>
                          <span className="text-amber-400">{batchResult.conteo_medio} Medio</span>
                          <span className="text-white/30">·</span>
                          <span className="text-rose-400">{batchResult.conteo_bajo} Bajo</span>
                        </div>
                        <span className="text-[10px] text-white/50">Por potencial agroecológico</span>
                      </div>
                    </div>

                    {/* Tabla de Predicciones */}
                    <div className="bg-[#10281f] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-sky-400" />
                          <h4 className="font-bold text-white text-sm">
                            Predicciones Oficiales del Reto ({batchResult.total_parcelas} Parcelas)
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={handleDescargarCsvLote}
                          className="py-2 px-4 rounded-xl bg-[#1e6846] hover:bg-[#155538] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar Resultados en CSV (Formato Oficial)</span>
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        <table className="w-full text-left text-xs text-[#a8c3b4]">
                          <thead className="bg-black/30 text-[11px] uppercase tracking-wider text-white/70 sticky top-0">
                            <tr>
                              <th className="py-2.5 px-4">ID Predio</th>
                              <th className="py-2.5 px-4">Estado / Municipio</th>
                              <th className="py-2.5 px-4">Rendimiento (t/ha)</th>
                              <th className="py-2.5 px-4">Rendimiento (kg/ha)</th>
                              <th className="py-2.5 px-4">Producción (t)</th>
                              <th className="py-2.5 px-4">Nivel Potencial</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {batchResult.predicciones.map((p, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition">
                                <td className="py-2.5 px-4 font-mono font-bold text-white">{p.plot}</td>
                                <td className="py-2.5 px-4">
                                  {p.estado} {p.municipio ? `· ${p.municipio}` : ''}
                                </td>
                                <td className="py-2.5 px-4 font-bold text-[#e2b957]">{p.rendimiento_t_ha}</td>
                                <td className="py-2.5 px-4">{p.rendimiento_kg_ha.toLocaleString('es-MX')}</td>
                                <td className="py-2.5 px-4">{p.produccion_estimada_t}</td>
                                <td className="py-2.5 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      p.nivel_potencial === 'alto'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : p.nivel_potencial === 'medio'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-rose-500/20 text-rose-300'
                                    }`}
                                  >
                                    {p.nivel_potencial.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
