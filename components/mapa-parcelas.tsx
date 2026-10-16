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
import { construirResumenAgricultorSHAP } from '@/lib/agronomy-translations'

export interface ParcelaProperties {
  id_poligono: string
  cultivo: string
  area_ha: number
  municipio: string
  estado: string
  conjunto: string
  rendimiento_t_ha: number | null
  rendimiento_predicho_t_ha?: number | null
  es_prediccion: boolean
  elevacion_msnm: number
  pendiente_grados: number
  proxy_relieve_m?: number
  tipo_relieve: string
  nivel_rendimiento: string
  vi6t_max?: number
  ndwi_mean?: number
  evi_std?: number
  lai_std?: number
  ndvi_mean?: number
  msavi_mean?: number
  dswi2_mean?: number
  sti_presow?: number
  mra_mean?: number
  grupo_homogeneo?: string | null
  deliberacion_qbaf?: string | null
  undercutting_activo?: boolean
  base_regional_t_ha?: number | null
  suma_shap_kg_ha?: number | null
  top_impulsores?: string | null
  top_frenadores?: string | null
  rendimiento_2026_t_ha?: number | null
  produccion_2026_t?: number | null
  cambio_2026_vs_2025_kg_ha?: number
  anom_tmin_abril_2026_c?: number
  tmean_pv_2026_c?: number
  gdd_cardinales_pv_2026?: number
  vpd_pv_2026_kpa?: number
  lluvia_proyectada_pv_2026_mm?: number
  s2_ndwi_mean_2026?: number
  s2_ndwi_min_2026?: number
  s2_dswi2_mean_2026?: number
  landsat_vi6t_max_2026?: number
  planet_ndvi_mean_2026?: number
  planet_lai_mean_2026?: number
  top_impulsores_shap_2026?: string | null
  top_frenadores_shap_2026?: string | null
  shap_variables_2026?: ShapVariableContribution[]
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
  campana_2026?: {
    pronostico_municipal_2026?: Record<string, {
      municipio: string
      estado: string
      lat_centro_mun: number
      lon_centro_mun: number
      elevacion_media_msnm: number
      fuente_clima_2026: string
      anom_tmax_2026: Record<string, number>
      anom_tmin_2026: Record<string, number>
      precip_pv_2026_mm: number
    }>
    resumen_estatal_2026?: Record<string, {
      n_parcelas: number
      rend_2025_medio: number
      rend_2026_medio: number
      prod_total_2026_t: number
    }>
    estrategia_datos_2026?: Record<string, any>
  }
  geojson: {
    type: 'FeatureCollection'
    features: ParcelaFeature[]
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeCsvText(value: unknown): string {
  const str = String(value ?? '').replace(/"/g, '""')
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str}"`
  }
  return `"${str}"`
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
  { id: 'Puebla', label: 'Puebla', color: '#d87a52', border: 'border-[#d87a52]' },
  { id: 'Hidalgo', label: 'Hidalgo', color: '#e2b957', border: 'border-[#e2b957]' },
  { id: 'Tlaxcala', label: 'Tlaxcala', color: '#38bdf8', border: 'border-sky-500' },
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

export interface ShapVariableContribution {
  variable: string
  etiqueta: string
  nodo_qbaf: string
  valor_parcela: number
  mediana_estado: number
  shap_t_ha: number
  shap_kg_ha: number
  impacto_pct: number
  efecto: 'positivo' | 'negativo'
}

export interface ShapGroupVariableSummary {
  variable: string
  etiqueta: string
  nodo_qbaf: string
  importancia_media_abs_kg_ha: number
  impacto_neto_medio_kg_ha: number
  importancia_relativa_pct: number
  frecuencia_parcelas: number
  efecto_dominante: 'impulsor' | 'frenador'
}

export interface PrediccionItem {
  plot: string
  rendimiento_t_ha: number
  rendimiento_kg_ha: number
  produccion_estimada_t: number
  estado: string
  municipio?: string
  conjunto?: string
  rendimiento_real_t_ha?: number | null
  nivel_potencial: string
  diagnostico: string
  arquitectura?: string
  grupo_homogeneo?: string
  deliberacion_qbaf?: string
  undercutting_activo?: boolean
  base_regional_t_ha?: number
  suma_shap_kg_ha?: number
  top_impulsores?: string
  top_frenadores?: string
  shap_variables?: ShapVariableContribution[]
  confianza_r2: number
  correlacion_r?: number
}

export interface BatchResultResponse {
  total_parcelas: number
  rendimiento_promedio_t_ha: number
  produccion_total_t: number
  conteo_alto: number
  conteo_medio: number
  conteo_bajo: number
  modo_grupo?: string
  filtro_estado?: string
  filtro_grupo_homogeneo?: string
  archivos_validados?: string[]
  shap_resumen_grupal?: ShapGroupVariableSummary[]
  casos_particulares_nb?: PrediccionItem[]
  predicciones: PrediccionItem[]
}

export const CASOS_PARTICULARES_PASO6 = [
  { id: 'AGC_003', estado: 'Hidalgo', municipio: 'Singuilucan', desc: 'Castigo por helada Abril + VPD' },
  { id: 'AGC_030', estado: 'Hidalgo', municipio: 'Singuilucan', desc: 'Ladera seca · Anomalía térmica' },
  { id: 'AGC_042', estado: 'Hidalgo', municipio: 'Apan', desc: 'Estrés térmico severo (-1,038 kg/ha)' },
  { id: 'AGC_011', estado: 'Puebla', municipio: 'Chignahuapan', desc: 'Labranza STI + Humedad (+173 kg/ha)' },
  { id: 'AGC_016', estado: 'Puebla', municipio: 'Chignahuapan', desc: 'Castigo por baja cobertura STI' },
  { id: 'AGC_028', estado: 'Puebla', municipio: 'Chignahuapan', desc: 'Undercutting Capa 0 Activo (NDVI>P75)' },
  { id: 'AGC_025', estado: 'Tlaxcala', municipio: 'Calpulalpan', desc: 'Meseta Modal + Vigor MSAVI (+12 kg/ha)' },
  { id: 'AGC_027', estado: 'Tlaxcala', municipio: 'Calpulalpan', desc: 'Meseta Modal · Castigo MSAVI (-14 kg/ha)' },
  { id: 'AGC_029', estado: 'Tlaxcala', municipio: 'Calpulalpan', desc: 'Óptimo MSAVI + Homogeneidad (+27 kg/ha)' },
]

export const GRUPOS_HOMOGENEOS_QBAF = [
  { id: 'todos', label: 'Todos los Grupos Homogéneos QBAF' },
  { id: 'Hidalgo_G1_Valle_Humedo', label: 'Hidalgo · G1 Valle Húmedo (NDWI ≥ mediana)' },
  { id: 'Hidalgo_G2_Ladera_Seca', label: 'Hidalgo · G2 Ladera Seca y Riesgo Térmico' },
  { id: 'Puebla_G1_Conservacion_Labranza', label: 'Puebla · G1 Conservación y Labranza STI' },
  { id: 'Puebla_G2_Dosel_Saturado', label: 'Puebla · G2 Dosel Saturado (Undercutting Activo)' },
  { id: 'Tlaxcala_G1_Meseta_Modal', label: 'Tlaxcala · G1 Meseta Modal (Ancla 3.0 t/ha + SVC)' },
]

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
  parcelas: { file: null, nombre: 'parcelas.csv (backend/data/)', cargado: true, tamanoKb: '742.5' },
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
  ndvi: string
  sti: string
}

const initialAnalistaValues: FormValuesAnalista = {
  plot: 'AGC_003',
  area: '18.68',
  temp: '-0.5624',
  ndwi: '-0.1811',
  evi: '0.0363',
  lai: '0.7351',
  ndvi: '0.3210',
  sti: '1.1650',
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

  // Paso 3: Temporada y Fechas (Ciclo Principal Abril - Octubre 2026)
  type TipoTemporada = 'PV' | 'personalizado'
  const [temporada, setTemporada] = useState<TipoTemporada>('PV')
  const [fechaInicio, setFechaInicio] = useState<string>('2026-04-01')
  const [fechaFin, setFechaFin] = useState<string>('2026-10-31')

  // Paso 4: Doble Camino para Identificar Parcela
  type ModoSeleccionParcela = 'mapa_catalogo' | 'manual_hectareas'
  const [modoSeleccion, setModoSeleccion] = useState<ModoSeleccionParcela>('mapa_catalogo')
  const [filtroTamano, setFiltroTamano] = useState<'todos' | 'pequenas' | 'medianas' | 'grandes'>('todos')
  const [filtroTextoParcela, setFiltroTextoParcela] = useState<string>('')

  // Camino B: Estimación manual directa
  const [manualAreaHa, setManualAreaHa] = useState<string>('5.0')
  const [manualTipoTerreno, setManualTipoTerreno] = useState<'plano' | 'ladera_suave' | 'cerro'>('plano')
  const [manualRegimenAgua, setManualRegimenAgua] = useState<'temporal_bueno' | 'temporal_regular' | 'riego'>('temporal_bueno')

  // Estado de la explicación validada por Google Gemini LLM para el Agricultor (Paso 5)
  const [llmExplicacion, setLlmExplicacion] = useState<{
    generado_por_llm?: boolean
    modelo_llm?: string
    diagnosticoSubtitulo?: string
    resumenNarrativo?: string
    comentarioPositivo?: string | null
    comentarioNegativoYCuidados?: string | null
  } | null>(null)
  const [llmLoading, setLlmLoading] = useState<boolean>(false)

  // Sub-pestaña del analista: 'parametros' (Casos Particulares + SHAP) | 'archivos' (Grupos de Parcelas + SHAP Grupal) | 'campana2026' (Predicción Próximo Año 2026)
  const [subPestanaAnalista, setSubPestanaAnalista] = useState<'parametros' | 'archivos' | 'campana2026'>('parametros')

  // Estado del Analista — Predicción Completa Próximo Año (Campaña 2026 · 197 Parcelas)
  const [campana2026Loading, setCampana2026Loading] = useState<boolean>(false)
  const [campana2026Data, setCampana2026Data] = useState<any | null>(null)
  const [campana2026Error, setCampana2026Error] = useState<string>('')
  const [campana2026Conjunto, setCampana2026Conjunto] = useState<'TODOS' | 'PREDICCION' | 'ENTRENAMIENTO'>('TODOS')
  const [campana2026Estado, setCampana2026Estado] = useState<string>('todos')
  const [campana2026Escenario, setCampana2026Escenario] = useState<'base_api' | 'humedo_favorable' | 'sequia_calor' | 'helada_abril'>('base_api')
  const [campana2026DeltaTemp, setCampana2026DeltaTemp] = useState<number>(0)
  const [campana2026DeltaLluvia, setCampana2026DeltaLluvia] = useState<number>(0)
  const [parcelaDetalle2026, setParcelaDetalle2026] = useState<any | null>(null)

  // Estado del Analista — Caso Particular + Explicabilidad SHAP (Paso 6 NB)
  const [analistaValues, setAnalistaValues] = useState<FormValuesAnalista>(initialAnalistaValues)
  const [analistaLoading, setAnalistaLoading] = useState(false)
  const [analistaResult, setAnalistaResult] = useState<number | null>(null)
  const [analistaDiag, setAnalistaDiag] = useState<string>('')
  const [analistaPotencial, setAnalistaPotencial] = useState<string>('')
  const [analistaFullPred, setAnalistaFullPred] = useState<PrediccionItem | null>(null)
  const [analistaError, setAnalistaError] = useState('')

  // Estado del Analista — Análisis por Grupos de Parcelas + SHAP Grupal
  const [modoGrupoAnalista, setModoGrupoAnalista] = useState<'PREDICCION' | 'CASOS_PASO6' | 'ENTRENAMIENTO' | 'TODOS'>('PREDICCION')
  const [filtroEstadoGrupo, setFiltroEstadoGrupo] = useState<string>('todos')
  const [filtroMunicipioGrupo, setFiltroMunicipioGrupo] = useState<string>('todos')
  const [filtroRendimientoGrupo, setFiltroRendimientoGrupo] = useState<string>('todos')
  const [filtroGrupoHomogeneo, setFiltroGrupoHomogeneo] = useState<string>('todos')
  const [parcelaDetalleGrupo, setParcelaDetalleGrupo] = useState<PrediccionItem | null>(null)
  const [mostrarSubidaManual, setMostrarSubidaManual] = useState<boolean>(false)

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
    const doScroll = () => {
      if (typeof window !== 'undefined' && window.location.hash.includes('asistente-modelo')) {
        const el = document.getElementById('asistente-modelo')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          return true
        }
      }
      return false
    }

    if (!doScroll()) {
      const t1 = setTimeout(doScroll, 150)
      const t2 = setTimeout(doScroll, 400)
      const t3 = setTimeout(doScroll, 800)
      const t4 = setTimeout(doScroll, 1400)
      window.addEventListener('hashchange', doScroll)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearTimeout(t4)
        window.removeEventListener('hashchange', doScroll)
      }
    }

    window.addEventListener('hashchange', doScroll)
    return () => window.removeEventListener('hashchange', doScroll)
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
    if (props.estado.toLowerCase().includes('puebla')) return '#d87a52'
    if (props.estado.toLowerCase().includes('hidalgo')) return '#e2b957'
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
          const safeArea = escapeHtml(props.area_ha)
          const safeEstado = escapeHtml(props.estado)
          const safeMunicipio = escapeHtml(props.municipio)
          const safeId = escapeHtml(props.id_poligono)
          const safeElev = escapeHtml(props.elevacion_msnm)
          const safePend = escapeHtml(props.pendiente_grados ?? '—')
          const safeRelieve = escapeHtml(props.tipo_relieve)
          const rendText = props.rendimiento_t_ha !== null
            ? `<b>${escapeHtml(props.rendimiento_t_ha)} t/ha</b>`
            : `<span style="color:#d97706;font-style:italic;">Por calcular</span>`

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; color: #1e1713; padding: 2px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                <span>Predio de ${safeArea} ha</span>
                <span style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${safeEstado}</span>
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">${safeMunicipio}, ${safeEstado}</div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <div><span style="color:#6b7280;">Rendimiento:</span> ${rendText}</div>
                <div><span style="color:#6b7280;">Elevación:</span> <b>${safeElev} m</b></div>
                <div><span style="color:#6b7280;">Pendiente:</span> <b>${safePend}°</b></div>
                <div><span style="color:#6b7280;">Relieve:</span> <b>${safeRelieve}</b></div>
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
              setAnalistaValues({
                plot: props.id_poligono,
                area: props.area_ha.toString(),
                temp: (props.vi6t_max ?? -0.58).toString(),
                ndwi: (props.ndwi_mean ?? -0.15).toString(),
                evi: (props.evi_std ?? 0.06).toString(),
                lai: (props.lai_std ?? 0.38).toString(),
                ndvi: (props.ndvi_mean ?? 0.34).toString(),
                sti: (props.sti_presow ?? 1.18).toString(),
              })

              if (perfilActivo === 'agricultor') {
                setEstadoAgricultor(props.estado)
                setMunicipioAgricultor(props.municipio)
                setModoSeleccion('mapa_catalogo')
                setPasoAgricultor(4)
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
        nombre: 'Ciclo Principal de Temporal 2026 (Abril – Octubre)',
        meses: 'Abril a Octubre 2026 (01/04/2026 al 31/10/2026)',
        deltaRend: 0.0,
        descripcion: 'Campaña 2026 calibrada con pronóstico térmico OpenWeather/Open-Meteo + normal INEGI CEM 4.0 y síntesis espectral GEE (Sentinel-2 / Landsat / PlanetScope).',
      }
    }
    const factorDias = diasCiclo >= 110 && diasCiclo <= 170 ? 0.04 : diasCiclo < 100 ? -0.18 : -0.05
    return {
      nombre: `Ciclo Personalizado 2026 (${diasCiclo} días)`,
      meses: `${fechaInicio} al ${fechaFin}`,
      deltaRend: factorDias,
      descripcion: `Ciclo calibrado a ${diasCiclo} días entre fecha de siembra y fecha estimada de cosecha en 2026.`,
    }
  }, [temporada, fechaInicio, fechaFin, diasCiclo])

  // Síntesis de variables agroclimáticas 2026 (API Clima + INEGI CEM 4.0) y señales satelitales GEE 2026
  const sintesisSatelital = useMemo(() => {
    const munInfo = MUNICIPIOS_DATA[municipioAgricultor]
    const pronosticoMun2026 = data?.campana_2026?.pronostico_municipal_2026?.[municipioAgricultor]
    const elev = selectedParcela?.elevacion_msnm ?? pronosticoMun2026?.elevacion_media_msnm ?? munInfo?.elevacionPromedio ?? 2550
    const esPV = temporada === 'PV'
    const dias = diasCiclo

    // Clima 2026 proyectado por API (OpenWeatherMap / Open-Meteo + Downscaling Adiabático INEGI -0.0065 °C/m)
    const factorAltitud = (2550 - elev) * 0.0065
    const anomAbril2026 = pronosticoMun2026?.anom_tmin_2026?.['04'] ?? 0.04
    const tMaxProm = esPV ? 23.4 + factorAltitud : 19.6 + factorAltitud
    const tMinProm = esPV ? 12.6 + factorAltitud + anomAbril2026 : 6.2 + factorAltitud
    const tMaxPico = esPV ? 26.2 + factorAltitud : 22.8 + factorAltitud
    const tMeanPv2026 = selectedParcela?.tmean_pv_2026_c ?? Math.round(((tMaxProm + tMinProm) / 2) * 100) / 100

    // Grados Días de Desarrollo Cardinales (Base 2°C - Tope 20°C) en 2026
    const gddDiario = Math.max(0, Math.min(20, (tMaxProm + tMinProm) / 2) - 2.0)
    const gddTotal = selectedParcela?.gdd_cardinales_pv_2026
      ? Math.round(selectedParcela.gdd_cardinales_pv_2026)
      : Math.round(gddDiario * Math.min(dias, 180))

    // Días con riesgo de heladas (Tmin <= 2°C)
    const diasHelada = esPV ? (elev > 2680 ? 2 : 0) : (elev > 2600 ? 12 : 6)

    // Lluvias acumuladas proyectadas para 2026 (mm)
    const esRiego = manualRegimenAgua === 'riego'
    const esTemporalBueno = manualRegimenAgua === 'temporal_bueno'
    const lluviaApiMun = pronosticoMun2026?.precip_pv_2026_mm ?? (municipioAgricultor === 'Chignahuapan' ? 619 : 590)
    const lluviasCicloMm = esPV
      ? Math.round(selectedParcela?.lluvia_proyectada_pv_2026_mm ?? lluviaApiMun)
      : (esRiego ? 480 : 240)

    // Señales Satelitales 2026 (Opción A: Conector GEE Sentinel-2 / Landsat / PlanetScope + Acoplamiento Climático 2026)
    const baseVi6t = -0.56
    const modTemp = (tMaxPico - 25.0) * 0.012
    const vi6tSintetizado = (modoSeleccion === 'mapa_catalogo' && selectedParcela?.landsat_vi6t_max_2026 !== undefined)
      ? selectedParcela.landsat_vi6t_max_2026
      : Math.round(Math.min(-0.48, Math.max(-0.68, baseVi6t + modTemp)) * 10000) / 10000

    const baseNdwi = esRiego ? 0.04 : esTemporalBueno ? -0.04 : -0.16
    const modAgua = (lluviasCicloMm - 550) * 0.00025
    const ndwiSintetizado = (modoSeleccion === 'mapa_catalogo' && selectedParcela?.s2_ndwi_min_2026 !== undefined)
      ? selectedParcela.s2_ndwi_min_2026
      : Math.round(Math.min(0.20, Math.max(-0.35, baseNdwi + modAgua)) * 10000) / 10000

    const ndwiMean2026 = (modoSeleccion === 'mapa_catalogo' && selectedParcela?.s2_ndwi_mean_2026 !== undefined)
      ? selectedParcela.s2_ndwi_mean_2026
      : Math.round((ndwiSintetizado + 0.08) * 10000) / 10000

    const dswi2Mean2026 = (modoSeleccion === 'mapa_catalogo' && selectedParcela?.s2_dswi2_mean_2026 !== undefined)
      ? selectedParcela.s2_dswi2_mean_2026
      : Math.round((2.20 + modAgua * 2.5) * 10000) / 10000

    const ndviMean2026 = (modoSeleccion === 'mapa_catalogo' && selectedParcela?.planet_ndvi_mean_2026 !== undefined)
      ? selectedParcela.planet_ndvi_mean_2026
      : Math.round((esRiego ? 0.42 : esTemporalBueno ? 0.37 : 0.31) * 10000) / 10000

    const factorGdd = Math.min(1.05, gddTotal / 2850)
    const penalizacionHelada = diasHelada * 0.02
    const baseLai = esRiego ? 1.55 : esTemporalBueno ? 1.32 : 1.08
    const laiSintetizado = (modoSeleccion === 'mapa_catalogo' && selectedParcela?.planet_lai_mean_2026 !== undefined)
      ? selectedParcela.planet_lai_mean_2026
      : Math.round(Math.max(0.75, Math.min(2.40, (baseLai * factorGdd) - penalizacionHelada)) * 1000) / 1000

    const estresTermohidrico = Math.round((vi6tSintetizado * ndwiSintetizado) * 10000) / 10000

    return {
      fuenteClima: pronosticoMun2026?.fuente_clima_2026 ?? 'OpenWeatherMap + Open-Meteo Climate 2026 + Normal INEGI CEM 4.0',
      clima: {
        tMaxProm: Math.round(tMaxProm * 10) / 10,
        tMinProm: Math.round(tMinProm * 10) / 10,
        tMaxPico: Math.round(tMaxPico * 10) / 10,
        tMeanPv2026,
        anomAbril2026: selectedParcela?.anom_tmin_abril_2026_c ?? anomAbril2026,
        vpdPv2026: selectedParcela?.vpd_pv_2026_kpa ?? 0.66,
        gddTotal,
        diasHelada,
        lluviasCicloMm,
      },
      sensores: {
        vi6t_max: vi6tSintetizado,
        ndwi_min: ndwiSintetizado,
        ndwi_mean: ndwiMean2026,
        dswi2_mean: dswi2Mean2026,
        ndvi_mean: ndviMean2026,
        lai_mean: laiSintetizado,
        estres_termohidrico: estresTermohidrico,
      },
    }
  }, [municipioAgricultor, temporada, diasCiclo, manualRegimenAgua, data, selectedParcela, modoSeleccion])

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

  // --- CÁLCULO FINAL DE DIAGNÓSTICO 2026 (PASO 5) ---
  const diagnosticoAgricultor = useMemo(() => {
    const munInfo = MUNICIPIOS_DATA[municipioAgricultor]
    const munPromedio = munInfo?.rendimientoPromedio ?? 3.5

    let rendCalculado = 0
    let rendReal2025: number | null = null
    let rendModelo2025: number | null = null
    let cambio2026KgHa = 0
    let conjuntoReto = 'PERSONALIZADO'
    let areaEfectivaHa = 0
    let nombrePredio = ''
    let esEstimado = true
    let elevacionMsnm = munInfo?.elevacionPromedio ?? 2450
    let pendienteGrados = 2.0
    let proxyRelieveM = 350.0
    let tipoRelieveTexto = 'Plano (< 2°)'
    let topImpulsores2026 = 'Humedad foliar Sentinel-2 NDWI y confort térmico 2026'
    let topFrenadores2026 = 'Sin castigo severo detectado'
    let shapVars2026: ShapVariableContribution[] = []
    let grupoHomogeneo = ''
    let deliberacionQbaf = ''

    if (modoSeleccion === 'mapa_catalogo' && selectedParcela) {
      // CAMINO A: Parcela de las 197 del catálogo (138 ENTRENAMIENTO + 59 PREDICCION)
      areaEfectivaHa = selectedParcela.area_ha
      nombrePredio = `Parcela de ${selectedParcela.area_ha} ha en ${selectedParcela.municipio}, ${selectedParcela.estado}`
      elevacionMsnm = selectedParcela.elevacion_msnm
      pendienteGrados = selectedParcela.pendiente_grados ?? 2.0
      proxyRelieveM = selectedParcela.proxy_relieve_m ?? 350.0
      tipoRelieveTexto = selectedParcela.tipo_relieve
      conjuntoReto = selectedParcela.conjunto || (selectedParcela.es_prediccion ? 'PREDICCION' : 'ENTRENAMIENTO')
      rendReal2025 = selectedParcela.rendimiento_t_ha
      rendModelo2025 = selectedParcela.rendimiento_predicho_t_ha ?? selectedParcela.rendimiento_t_ha
      grupoHomogeneo = selectedParcela.grupo_homogeneo ?? ''
      deliberacionQbaf = selectedParcela.deliberacion_qbaf ?? ''
      topImpulsores2026 = selectedParcela.top_impulsores_shap_2026 ?? selectedParcela.top_impulsores ?? topImpulsores2026
      topFrenadores2026 = selectedParcela.top_frenadores_shap_2026 ?? selectedParcela.top_frenadores ?? topFrenadores2026
      shapVars2026 = selectedParcela.shap_variables_2026 ?? []

      const base2026 =
        selectedParcela.rendimiento_2026_t_ha ??
        selectedParcela.rendimiento_predicho_t_ha ??
        selectedParcela.rendimiento_t_ha ??
        munPromedio
      rendCalculado = base2026 + infoTemporada.deltaRend
      esEstimado = true
      if (rendModelo2025 !== null && rendModelo2025 !== undefined) {
        cambio2026KgHa = Math.round((rendCalculado - rendModelo2025) * 1000)
      } else {
        cambio2026KgHa = Math.round((selectedParcela.cambio_2026_vs_2025_kg_ha ?? 0) + infoTemporada.deltaRend * 1000)
      }
    } else {
      // CAMINO B: Ingreso manual de hectáreas en el municipio
      areaEfectivaHa = parseFloat(manualAreaHa) || 5.0
      nombrePredio = `Parcela de ${areaEfectivaHa} ha en ${municipioAgricultor}, ${estadoAgricultor}`
      esEstimado = true

      const ajusteTerreno = manualTipoTerreno === 'plano' ? 0.12 : manualTipoTerreno === 'ladera_suave' ? 0.0 : -0.22
      const ajusteAgua = manualRegimenAgua === 'riego' ? 0.35 : manualRegimenAgua === 'temporal_bueno' ? 0.10 : -0.28

      pendienteGrados = manualTipoTerreno === 'plano' ? 1.5 : manualTipoTerreno === 'ladera_suave' ? 3.2 : 5.8
      proxyRelieveM = manualTipoTerreno === 'plano' ? 220 : manualTipoTerreno === 'ladera_suave' ? 450 : 780
      tipoRelieveTexto = manualTipoTerreno === 'plano' ? 'Plano de valle' : manualTipoTerreno === 'ladera_suave' ? 'Ladera suave' : 'Cerro / ladera'

      const modSatelital = (sintesisSatelital.sensores.lai_mean - 1.35) * 0.35 + (sintesisSatelital.sensores.ndwi_min + 0.12) * 0.25
      rendCalculado = munPromedio + ajusteTerreno + ajusteAgua + infoTemporada.deltaRend + modSatelital
      rendModelo2025 = munPromedio
      cambio2026KgHa = Math.round((rendCalculado - munPromedio) * 1000)
    }

    // Acotar a rangos agronómicos del Árbitro QBAF (1.50 a 4.80 t/ha, o hasta 5.20 con riego)
    rendCalculado = Math.round(Math.min(5.2, Math.max(1.8, rendCalculado)) * 100) / 100
    const produccionTotalT = Math.round(rendCalculado * areaEfectivaHa * 100) / 100
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
        titulo: 'Vigor Óptimo y Alto Potencial 2026',
        subtitulo: `Excelente proyección para el ${infoTemporada.nombre}. La combinación de fisiografía fija INEGI CEM 4.0 y balance termo-hídrico 2026 favorece un alto llenado de grano.`,
        colorBadge: 'bg-[#b85c38]/20 text-[#f5e3d7] border-[#d87a52]/40',
        colorBorder: 'border-[#d87a52]/30',
      }
    } else if (rendCalculado >= 3.2) {
      estadoSalud = {
        titulo: 'Rendimiento Comercial Estable 2026',
        subtitulo: `Desarrollo acorde al potencial regional del Altiplano Central en el ${infoTemporada.nombre}. Mantener monitoreo de humedad y nutrición foliar.`,
        colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        colorBorder: 'border-amber-500/30',
      }
    } else {
      estadoSalud = {
        titulo: 'Requiere Monitoreo / Estrés Termo-Hídrico',
        subtitulo: `Proyección 2026 moderada por pendiente o estrés hídrico/térmico. Se recomienda conservación de humedad edáfica y apoyo nutricional.`,
        colorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        colorBorder: 'border-rose-500/30',
      }
    }

    return {
      nombrePredio,
      areaEfectivaHa,
      rendimiento: rendCalculado,
      rendReal2025,
      rendModelo2025,
      cambio2026KgHa,
      conjuntoReto,
      esEstimado,
      produccionTotalT,
      bultos50kg,
      munPromedio,
      diffConMunicipio,
      elevacionMsnm,
      pendienteGrados,
      proxyRelieveM,
      tipoRelieveTexto,
      topImpulsores2026,
      topFrenadores2026,
      shapVars2026,
      grupoHomogeneo,
      deliberacionQbaf,
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
    sintesisSatelital,
  ])

  // Consultar automáticamente a Google Gemini (/api/explicar-agricultor) cuando el Agricultor llega al Paso 5
  useEffect(() => {
    if (perfilActivo !== 'agricultor' || pasoAgricultor !== 5 || !diagnosticoAgricultor || !municipioAgricultor) {
      return
    }
    let cancelado = false
    setLlmLoading(true)
    fetch('/api/explicar-agricultor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_poligono: modoSeleccion === 'mapa_catalogo' && selectedParcela ? selectedParcela.id_poligono : 'Manual',
        municipio: municipioAgricultor,
        estado: estadoAgricultor,
        area_ha: diagnosticoAgricultor.areaEfectivaHa,
        rendimiento_t_ha: diagnosticoAgricultor.rendimiento,
        pendiente_grados: diagnosticoAgricultor.pendienteGrados,
        elevacion_msnm: diagnosticoAgricultor.elevacionMsnm,
        regimen_agua: manualRegimenAgua,
        temporada: infoTemporada.nombre,
        shap_variables: diagnosticoAgricultor.shapVars2026,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((resJson) => {
        if (!cancelado && resJson) {
          setLlmExplicacion(resJson)
        }
      })
      .catch(() => {
        if (!cancelado) setLlmExplicacion(null)
      })
      .finally(() => {
        if (!cancelado) setLlmLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [
    perfilActivo,
    pasoAgricultor,
    modoSeleccion,
    selectedParcela?.id_poligono,
    municipioAgricultor,
    estadoAgricultor,
    diagnosticoAgricultor?.rendimiento,
    diagnosticoAgricultor?.areaEfectivaHa,
    diagnosticoAgricultor?.pendienteGrados,
    manualRegimenAgua,
    infoTemporada.nombre,
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
      'AgroRaices - Reporte de Prediccion de Rendimiento 2026 (QBAF + DF-QuAD + SHAP)',
      `Fecha de Consulta: ${new Date().toLocaleDateString('es-MX')}`,
      '',
      '--- 1. IDENTIFICACION Y DATOS FIJOS (INEGI CEM 4.0 + GEOMETRIA) ---,',
      `Predio / Parcela,${sanitizeCsvText(diagnosticoAgricultor.nombrePredio)}`,
      `Conjunto en el Reto,${diagnosticoAgricultor.conjuntoReto}`,
      `Municipio,${municipioAgricultor}`,
      `Estado,${estadoAgricultor}`,
      `Temporada / Ciclo,${sanitizeCsvText(`${infoTemporada.nombre} (${infoTemporada.meses})`)}`,
      `Superficie Evaluada Fija (ha),${diagnosticoAgricultor.areaEfectivaHa}`,
      `Elevacion Fija INEGI CEM 4.0 (msnm),${diagnosticoAgricultor.elevacionMsnm}`,
      `Relieve / Pendiente Fija INEGI CEM 4.0,${sanitizeCsvText(`${diagnosticoAgricultor.tipoRelieveTexto} (${diagnosticoAgricultor.pendienteGrados}°)`)}`,
      `Rugosidad de Relieve Local (m),${diagnosticoAgricultor.proxyRelieveM}`,
      '',
      '--- 2. PREDICCION 2026 Y COMPARATIVA VS CICLO 2025 ---,',
      `Rendimiento Proyectado 2026 (t/ha),${diagnosticoAgricultor.rendimiento}`,
      `Produccion Total Proyectada 2026 (toneladas),${diagnosticoAgricultor.produccionTotalT}`,
      `Costales Estimados (50 kg),${diagnosticoAgricultor.bultos50kg}`,
      `Rendimiento Real Cosecha 2025 (t/ha),${diagnosticoAgricultor.rendReal2025 ?? 'Oculto (Test Ciego 59 Parcelas)'}`,
      `Rendimiento Modelo Base 2025 (t/ha),${diagnosticoAgricultor.rendModelo2025 ?? 'N/D'}`,
      `Cambio Proyectado 2026 vs 2025 (kg/ha),${diagnosticoAgricultor.cambio2026KgHa >= 0 ? '+' : ''}${diagnosticoAgricultor.cambio2026KgHa}`,
      `Promedio Historico Municipal (t/ha),${diagnosticoAgricultor.munPromedio}`,
      `Diferencia con Municipio,${diagnosticoAgricultor.diffConMunicipio >= 0 ? '+' : ''}${diagnosticoAgricultor.diffConMunicipio} t/ha`,
      `Diagnostico del Cultivo,${sanitizeCsvText(diagnosticoAgricultor.estadoSalud.titulo)}`,
      '',
      '--- 3. DATOS DINAMICOS CREADOS PARA 2026 (CLIMA API + SATELITE GEE) ---,',
      `Fuente Pronostico Climatico 2026,${sanitizeCsvText(sintesisSatelital.fuenteClima)}`,
      `Anomalia Termica Abril 2026 (°C),${sintesisSatelital.clima.anomAbril2026}`,
      `Temperatura Media P-V 2026 (°C),${sintesisSatelital.clima.tMeanPv2026}`,
      `Temperatura Pico Proyectada 2026 (°C),${sintesisSatelital.clima.tMaxPico}`,
      `GDD Cardinales Acumulados 2026,${sintesisSatelital.clima.gddTotal}`,
      `Deficit Presion de Vapor VPD 2026 (kPa),${sintesisSatelital.clima.vpdPv2026}`,
      `Lluvias Proyectadas Ciclo 2026 (mm),~${sintesisSatelital.clima.lluviasCicloMm}`,
      `Sentinel-2 NDWI Medio 2026 (GEE),${sintesisSatelital.sensores.ndwi_mean}`,
      `Sentinel-2 NDWI Minimo 2026 (GEE),${sintesisSatelital.sensores.ndwi_min}`,
      `Sentinel-2 DSWI2 SWIR 2026 (GEE),${sintesisSatelital.sensores.dswi2_mean}`,
      `Landsat VI6T Termico Pico 2026 (GEE),${sintesisSatelital.sensores.vi6t_max}`,
      `PlanetScope / S2 NDVI Medio 2026 (GEE),${sintesisSatelital.sensores.ndvi_mean}`,
      `PlanetScope / S2 LAI Area Foliar 2026,${sintesisSatelital.sensores.lai_mean}`,
      '',
      '--- 4. EXPLICABILIDAD SHAP 2026 (IMPULSORES Y FRENADORES) ---,',
      `Principales Impulsores (+ kg/ha),${sanitizeCsvText(diagnosticoAgricultor.topImpulsores2026)}`,
      `Principales Frenadores (- kg/ha),${sanitizeCsvText(diagnosticoAgricultor.topFrenadores2026)}`,
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Ficha_Productor_2026_${municipioAgricultor}_${diagnosticoAgricultor.areaEfectivaHa}ha.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // --- LÓGICA DEL MODO ANALISTA (QBAF + DF-QuAD + SHAP · PASO 6 NB) ---
  const ejecutarInferenciaIndividual = async (payload: {
    plot: string
    area: number
    temp: number
    ndwi: number
    evi: number
    lai: number
    ndvi?: number
    sti?: number
    estado?: string
    municipio?: string
    elevacion?: number
    pendiente?: number
  }) => {
    setAnalistaError('')
    setAnalistaLoading(true)

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Error al conectar con el motor de inferencia QBAF + DF-QuAD')
      }

      const json: PrediccionItem = await res.json()
      setAnalistaFullPred(json)
      setAnalistaResult(Number(json.rendimiento_t_ha))
      setAnalistaDiag(json.diagnostico || '')
      setAnalistaPotencial(json.nivel_potencial || '')
    } catch {
      const predFallback = Math.min(
        4.8,
        Math.max(
          1.5,
          3.35 +
            (Number(payload.evi) - 0.2) * 3 +
            (Number(payload.lai) - 0.3) * 2.0 +
            (Number(payload.ndwi) - 0.1) * 1.2 +
            (Number(payload.temp) + 0.6) * 1.5
        )
      )
      setAnalistaResult(Number(predFallback.toFixed(2)))
      setAnalistaDiag('Inferencia local estimada.')
      setAnalistaPotencial(predFallback > 4.35 ? 'alto' : predFallback >= 3.3 ? 'medio' : 'bajo')
    } finally {
      setAnalistaLoading(false)
    }
  }

  const handleSeleccionarCasoParticular = async (plotId: string, centrarEnMapa = false) => {
    const feat = data?.geojson?.features.find((f) => f.properties.id_poligono === plotId)
    const p = feat?.properties
    if (p) {
      selectParcela(p, centrarEnMapa)
      const nextVals: FormValuesAnalista = {
        plot: p.id_poligono,
        area: p.area_ha.toString(),
        temp: (p.vi6t_max ?? -0.58).toString(),
        ndwi: (p.ndwi_mean ?? -0.15).toString(),
        evi: (p.evi_std ?? 0.06).toString(),
        lai: (p.lai_std ?? 0.38).toString(),
        ndvi: (p.ndvi_mean ?? 0.34).toString(),
        sti: (p.sti_presow ?? 1.18).toString(),
      }
      setAnalistaValues(nextVals)
      await ejecutarInferenciaIndividual({
        plot: p.id_poligono,
        area: p.area_ha,
        temp: p.vi6t_max ?? -0.58,
        ndwi: p.ndwi_mean ?? -0.15,
        evi: p.evi_std ?? 0.06,
        lai: p.lai_std ?? 0.38,
        ndvi: p.ndvi_mean ?? 0.34,
        sti: p.sti_presow ?? 1.18,
        estado: p.estado,
        municipio: p.municipio,
        elevacion: p.elevacion_msnm,
        pendiente: p.pendiente_grados,
      })
    } else {
      setAnalistaValues((prev) => ({ ...prev, plot: plotId }))
      await ejecutarInferenciaIndividual({
        plot: plotId,
        area: Number(analistaValues.area) || 10,
        temp: Number(analistaValues.temp) || -0.58,
        ndwi: Number(analistaValues.ndwi) || -0.15,
        evi: Number(analistaValues.evi) || 0.06,
        lai: Number(analistaValues.lai) || 0.38,
      })
    }
  }

  // Cargar automáticamente el primer caso particular (AGC_003) y el grupo de prueba ciega al activar modo Analista
  useEffect(() => {
    if (perfilActivo === 'analista' && !analistaFullPred) {
      handleSeleccionarCasoParticular(selectedParcela?.id_poligono || 'AGC_003', false)
    }
    if (perfilActivo === 'analista' && !batchResult && !batchLoading) {
      handleAnalizarGrupoParcelas('PREDICCION', 'todos', 'todos')
    }
  }, [perfilActivo])

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

    const featMatch = data?.geojson?.features.find((f) => f.properties.id_poligono === analistaValues.plot.trim())
    const refProps = featMatch?.properties || selectedParcela

    await ejecutarInferenciaIndividual({
      plot: analistaValues.plot || 'Parcela_Analista',
      area: Number(analistaValues.area),
      temp: Number(analistaValues.temp),
      ndwi: Number(analistaValues.ndwi),
      evi: Number(analistaValues.evi),
      lai: Number(analistaValues.lai),
      ndvi: analistaValues.ndvi ? Number(analistaValues.ndvi) : undefined,
      sti: analistaValues.sti ? Number(analistaValues.sti) : undefined,
      estado: refProps?.estado || 'Puebla',
      municipio: refProps?.municipio || 'Chignahuapan',
      elevacion: refProps?.elevacion_msnm,
      pendiente: refProps?.pendiente_grados,
    })
  }

  const cargarTelemetriaSeleccionadaAnalista = () => {
    if (!selectedParcela) return
    handleSeleccionarCasoParticular(selectedParcela.id_poligono, false)
  }

  // Sincronizar las predicciones del lote del Analista directamente sobre el Mapa Interactivo
  const aplicarPrediccionesAlMapa = (res: BatchResultResponse) => {
    const predMap = new Map<string, PrediccionItem>()
    for (const p of res.predicciones) {
      predMap.set(p.plot, p)
    }

    setData((prev) => {
      if (!prev) return prev
      const updatedFeatures = prev.geojson.features.map((feat) => {
        const match = predMap.get(feat.properties.id_poligono)
        if (!match) return feat
        const rVal = Math.round(match.rendimiento_t_ha * 100) / 100
        const niv =
          rVal < 3.2
            ? 'Bajo (< 3.2 t/ha)'
            : rVal > 4.2
            ? 'Alto (> 4.2 t/ha)'
            : 'Promedio (3.2 - 4.2 t/ha)'
        return {
          ...feat,
          properties: {
            ...feat.properties,
            rendimiento_t_ha: rVal,
            nivel_rendimiento: niv,
          },
        }
      })
      return {
        ...prev,
        geojson: {
          ...prev.geojson,
          features: updatedFeatures,
        },
      }
    })
  }

  const handleFocalizarParcelaEnMapa = (plotId: string) => {
    const feat = data?.geojson?.features.find((f) => f.properties.id_poligono === plotId)
    if (feat) {
      selectParcela(feat.properties, true)
      handleVerEnMapa()
    }
  }

  const handleInspeccionarParcelaDeGrupo = (item: PrediccionItem) => {
    setParcelaDetalleGrupo(item)
    setAnalistaFullPred(item)
    setAnalistaResult(item.rendimiento_t_ha)
    setAnalistaDiag(item.diagnostico)
    setAnalistaPotencial(item.nivel_potencial)
    const feat = data?.geojson?.features.find((f) => f.properties.id_poligono === item.plot)
    if (feat) {
      const p = feat.properties
      selectParcela(p, false)
      setAnalistaValues({
        plot: p.id_poligono,
        area: p.area_ha.toString(),
        temp: (p.vi6t_max ?? -0.58).toString(),
        ndwi: (p.ndwi_mean ?? -0.15).toString(),
        evi: (p.evi_std ?? 0.06).toString(),
        lai: (p.lai_std ?? 0.38).toString(),
        ndvi: (p.ndvi_mean ?? 0.34).toString(),
        sti: (p.sti_presow ?? 1.18).toString(),
      })
    }
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

        if (
          fname.includes('topografia') ||
          fname.includes('cem4') ||
          fname.includes('temperatura') ||
          firstLine.includes('elevacion') ||
          firstLine.includes('pendiente')
        ) {
          slot = 'topografia'
        } else if (firstLine.includes('vi6t') || (firstLine.includes('sensor') && firstLine.includes('dswi')) || fname.includes('basico')) {
          slot = 'basico'
        } else if (firstLine.includes('msavi') || (firstLine.includes('lai') && !firstLine.includes('vi6t')) || fname.includes('pro')) {
          slot = 'pro'
        } else if (
          fname.includes('parcelas') ||
          fname.includes('70_30') ||
          firstLine.includes('geometry') ||
          firstLine.includes('conjunto') ||
          firstLine.includes('area_ha') ||
          firstLine.includes('área_ha')
        ) {
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

  // Inferencia por lotes con los archivos verificados
  const handleProcesarArchivoLote = async () => {
    if (!todosListos) {
      setBatchError('Debes subir los archivos requeridos para que el modelo pueda ejecutar la inferencia.')
      return
    }

    setBatchLoading(true)
    setBatchError('')

    try {
      const formData = new FormData()
      Object.entries(archivosState).forEach(([, slot]) => {
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
      if (json.predicciones.length > 0) {
        setParcelaDetalleGrupo(json.predicciones[0])
      }
      aplicarPrediccionesAlMapa(json)
    } catch (err: any) {
      setBatchError(err.message || 'No se pudieron procesar los archivos.')
    } finally {
      setBatchLoading(false)
    }
  }

  // Analizar cualquier grupo de parcelas con SHAP Grupal + Individual
  const handleAnalizarGrupoParcelas = async (
    modo: 'PREDICCION' | 'CASOS_PASO6' | 'ENTRENAMIENTO' | 'TODOS' = modoGrupoAnalista,
    estFiltro: string = filtroEstadoGrupo,
    munFiltro: string = filtroMunicipioGrupo,
    rendFiltro: string = filtroRendimientoGrupo,
    grupoHomFiltro: string = filtroGrupoHomogeneo
  ) => {
    setBatchLoading(true)
    setBatchError('')
    setModoGrupoAnalista(modo)
    setFiltroEstadoGrupo(estFiltro)
    setFiltroMunicipioGrupo(munFiltro)
    setFiltroRendimientoGrupo(rendFiltro)
    setFiltroGrupoHomogeneo(grupoHomFiltro)

    setArchivosState({
      parcelas: { file: null, nombre: 'parcelas.csv + ID_area_rendimiento_70_30.csv', cargado: true, tamanoKb: '748.5' },
      basico: { file: null, nombre: 'Conjunto_datos_BASICO_AgroCebada2026.csv', cargado: true, tamanoKb: '32,879.3' },
      pro: { file: null, nombre: 'Conjunto_datos_PRO_AgroCebada.csv', cargado: true, tamanoKb: '4,883.1' },
      topografia: { file: null, nombre: 'Topografia_INEGI_CEM4.zip + Temperatura_CHIRPS.zip', cargado: true, tamanoKb: '192,410.0' },
    })

    try {
      const qs = new URLSearchParams({ demo: 'true', modo_grupo: modo })
      if (estFiltro && estFiltro !== 'todos') qs.set('estado', estFiltro)
      if (munFiltro && munFiltro !== 'todos') qs.set('municipio', munFiltro)
      if (rendFiltro && rendFiltro !== 'todos') qs.set('nivel_rendimiento', rendFiltro)
      if (grupoHomFiltro && grupoHomFiltro !== 'todos') qs.set('grupo_homogeneo', grupoHomFiltro)

      const res = await fetch(`/api/predict?${qs.toString()}`)
      if (!res.ok) {
        throw new Error('No se pudieron procesar los datos del grupo de parcelas.')
      }
      const json: BatchResultResponse = await res.json()
      setBatchResult(json)
      if (json.predicciones.length > 0) {
        setParcelaDetalleGrupo(json.predicciones[0])
      } else {
        setParcelaDetalleGrupo(null)
      }
      aplicarPrediccionesAlMapa(json)
    } catch (err: any) {
      setBatchError(err.message || 'Error cargando el grupo de parcelas.')
    } finally {
      setBatchLoading(false)
    }
  }

  const handleCargarDemoDataset = async () => {
    await handleAnalizarGrupoParcelas(modoGrupoAnalista, filtroEstadoGrupo, filtroMunicipioGrupo, filtroRendimientoGrupo, filtroGrupoHomogeneo)
  }

  // Descargar CSV con auditoría SHAP + DF-QuAD (Paso 6 NB)
  const handleDescargarCsvLote = () => {
    if (!batchResult) return
    const lines = [
      'ID_POLIGONO,Estado,Municipio,Conjunto,Grupo_Homogeneo_QBAF,Deliberacion_DFQuAD,Base_Regional_t_ha,Suma_SHAP_kg_ha,Rendimiento_Predicho_t_ha,Rendimiento_Real_t_ha,Rendimiento_kg_ha,Produccion_Estimada_t,Top_Impulsores_SHAP,Top_Frenadores_SHAP,Nivel_Potencial',
      ...batchResult.predicciones.map(
        (p) =>
          `${sanitizeCsvText(p.plot)},${sanitizeCsvText(p.estado)},${sanitizeCsvText(p.municipio || '')},${sanitizeCsvText(p.conjunto || 'PREDICCION')},${sanitizeCsvText(p.grupo_homogeneo || '')},${sanitizeCsvText(p.deliberacion_qbaf || '')},${Number(p.base_regional_t_ha ?? 0)},${Number(p.suma_shap_kg_ha ?? 0)},${Number(p.rendimiento_t_ha)},${p.rendimiento_real_t_ha !== null && p.rendimiento_real_t_ha !== undefined ? Number(p.rendimiento_real_t_ha) : ''},${Number(p.rendimiento_kg_ha)},${Number(p.produccion_estimada_t)},${sanitizeCsvText(p.top_impulsores || '')},${sanitizeCsvText(p.top_frenadores || '')},${sanitizeCsvText(p.nivel_potencial)}`
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Auditoria_SHAP_QBAF_AgroRaices_${batchResult.modo_grupo || 'Lote'}_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // --- LÓGICA DEL ANALISTA: PREDICCIÓN COMPLETA PRÓXIMO AÑO (CAMPAÑA 2026 · 197 PARCELAS) ---
  const ejecutarPrediccionCampana2026 = async (
    conj: 'TODOS' | 'PREDICCION' | 'ENTRENAMIENTO' = campana2026Conjunto,
    est: string = campana2026Estado,
    esc: 'base_api' | 'humedo_favorable' | 'sequia_calor' | 'helada_abril' = campana2026Escenario,
    dTemp: number = campana2026DeltaTemp,
    dLluvia: number = campana2026DeltaLluvia
  ) => {
    setCampana2026Loading(true)
    setCampana2026Error('')
    setCampana2026Conjunto(conj)
    setCampana2026Estado(est)
    setCampana2026Escenario(esc)
    setCampana2026DeltaTemp(dTemp)
    setCampana2026DeltaLluvia(dLluvia)

    try {
      const qs = new URLSearchParams({
        campana_2026: 'true',
        conjunto: conj,
        estado: est,
        escenario: esc,
        delta_temp_c: dTemp.toString(),
        delta_lluvia_pct: dLluvia.toString(),
      })
      const res = await fetch(`/api/predict?${qs.toString()}`)
      if (!res.ok) {
        throw new Error('No se pudo generar la predicción de la campaña 2026.')
      }
      const json = await res.json()
      setCampana2026Data(json)
      if (json.predicciones_2026 && json.predicciones_2026.length > 0) {
        setParcelaDetalle2026(json.predicciones_2026[0])
      } else {
        setParcelaDetalle2026(null)
      }
    } catch (err: any) {
      setCampana2026Error(err.message || 'Error ejecutando la predicción 2026.')
    } finally {
      setCampana2026Loading(false)
    }
  }

  const handleDescargarCsvCampana2026 = () => {
    if (!campana2026Data?.predicciones_2026) return
    const rows = campana2026Data.predicciones_2026 as any[]
    const lines = [
      'ID_POLIGONO,Estado,Municipio,CONJUNTO_RETO,AREA_HA,elevacion_msnm_fija,pendiente_grados_fija,proxy_relieve_m_fijo,anom_tmin_abril_2026_c,tmean_pv_2026_c,gdd_cardinales_pv_2026,lluvia_proyectada_pv_2026_mm,s2_ndwi_mean_2026,s2_ndwi_min_2026,s2_dswi2_mean_2026,landsat_vi6t_max_2026,planet_ndvi_mean_2026,planet_lai_mean_2026,RENDIMIENTO_2025_REAL_T_HA,RENDIMIENTO_2025_MODELO_T_HA,RENDIMIENTO_2026_PROYECTADO_T_HA,PRODUCCION_2026_ESTIMADA_T,CAMBIO_2026_VS_2025_KG_HA,top_impulsores_shap_2026,top_frenadores_shap_2026',
      ...rows.map(
        (r) =>
          `${sanitizeCsvText(r.ID_POLIGONO)},${sanitizeCsvText(r.Estado)},${sanitizeCsvText(r.Municipio)},${sanitizeCsvText(r.CONJUNTO_RETO)},${r.AREA_HA},${r.elevacion_msnm_fija},${r.pendiente_grados_fija},${r.proxy_relieve_m_fijo},${r.anom_tmin_abril_2026_c},${r.tmean_pv_2026_c},${r.gdd_cardinales_pv_2026},${r.lluvia_proyectada_pv_2026_mm},${r.s2_ndwi_mean_2026},${r.s2_ndwi_min_2026},${r.s2_dswi2_mean_2026},${r.landsat_vi6t_max_2026},${r.planet_ndvi_mean_2026},${r.planet_lai_mean_2026},${r.RENDIMIENTO_2025_REAL_T_HA ?? ''},${r.RENDIMIENTO_2025_MODELO_T_HA},${r.RENDIMIENTO_2026_PROYECTADO_T_HA},${r.PRODUCCION_2026_ESTIMADA_T},${r.CAMBIO_2026_VS_2025_KG_HA},${sanitizeCsvText(r.top_impulsores_shap_2026 || '')},${sanitizeCsvText(r.top_frenadores_shap_2026 || '')}`
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Predicciones_Campana_2026_${campana2026Conjunto}_${campana2026Escenario}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const metricas = data?.metricas

  return (
    <div className="space-y-8 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b85c38]/15 border border-[#d87a52]/20 text-[#e2b957] text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Plataforma de Inteligencia Geoespacial AgroCebada 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Mapa y Modelo de <span className="text-[#e2b957]">Rendimiento Agrícola</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#c9b7aa] max-w-3xl leading-relaxed">
          Explora 197 parcelas georreferenciadas con imágenes satelitales Esri y topografía INEGI CEM 4.0, y prueba el modelo en vivo seleccionando si eres <b>agricultor</b> o <b>analista</b>.
        </p>
      </div>

      {/* --- SECCIÓN 1: VISOR DE MAPA SATELITAL --- */}
      <div id="mapa-interactivo" className="scroll-mt-28 space-y-4">
        {/* Panel de Filtros Rápidos de Estado */}
        <div className="bg-[#291e17]/70 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#c9b7aa] mr-1">
              Filtro Estado:
            </span>
            <div className="flex flex-wrap gap-2">
              {ESTADOS_CONFIG.map((cfg) => {
                const isActive = estado === cfg.id
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => {
                      setEstado(cfg.id)
                      setSelectedParcela(null)
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? `${cfg.border} bg-white/10 text-white shadow-lg ring-1 ring-white/30`
                        : 'border-white/10 bg-white/5 text-[#c9b7aa] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} aria-hidden="true" />
                    <span>{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tarjetas de Métricas de Campo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-[#291e17]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
            <div className="text-xs uppercase tracking-wider text-[#c9b7aa] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#e2b957]" />
              Rendimiento Medio
            </div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {metricas ? `${metricas.rendimiento_promedio_t_ha} ` : '—'}
              <span className="text-sm font-semibold text-[#e2b957]">t/ha</span>
            </div>
            <div className="text-[11px] text-[#c9b7aa] mt-0.5">
              {metricas ? `${Math.round(metricas.rendimiento_promedio_t_ha * 1000)} kg/ha` : '...'}
            </div>
          </div>

          <div className="bg-[#291e17]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
            <div className="text-xs uppercase tracking-wider text-[#c9b7aa] flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#e2b957]" />
              Superficie Total
            </div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {metricas ? `${metricas.superficie_total_ha} ` : '—'}
              <span className="text-sm font-semibold text-[#e2b957]">ha</span>
            </div>
            <div className="text-[11px] text-[#c9b7aa] mt-0.5">
              {filteredFeatures.length} parcelas registradas
            </div>
          </div>

          <div className="bg-[#291e17]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
            <div className="text-xs uppercase tracking-wider text-[#c9b7aa] flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-sky-400" />
              Elevación INEGI
            </div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {metricas ? `${metricas.elevacion_promedio_msnm} ` : '—'}
              <span className="text-sm font-semibold text-sky-400">m s.n.m.</span>
            </div>
            <div className="text-[11px] text-[#c9b7aa] mt-0.5">
              Pendiente media: {metricas?.pendiente_promedio_grados ?? 2.0}°
            </div>
          </div>

          <div className="bg-[#291e17]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
            <div className="text-xs uppercase tracking-wider text-[#c9b7aa] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Muestras Monitoreadas
            </div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {metricas?.total_parcelas ?? 0}
              <span className="text-xs font-normal text-[#c9b7aa] ml-2">predios</span>
            </div>
            <div className="text-[11px] text-[#c9b7aa] mt-0.5">
              {metricas ? `${metricas.parcelas_con_rendimiento_real} reales / ${metricas.parcelas_para_prediccion} reto` : '...'}
            </div>
          </div>
        </div>

        {/* Mapa y Sidebar de Detalle */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-[#291e17]/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[480px]">
            <div className="px-4 py-2 bg-[#1e1713]/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#c9b7aa]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d87a52]"></span> Puebla (100)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Hidalgo (51)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Tlaxcala (46)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#c9b7aa] bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
                  <span>Satélite Esri</span>
                </span>

                <div className="flex items-center bg-black/60 rounded-xl border border-white/10 p-0.5 shadow-lg">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    aria-label="Acercar mapa"
                    className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                    title="Acercar (+)"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    aria-label="Alejar mapa"
                    className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                    title="Alejar (-)"
                  >
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetView}
                    aria-label="Reajustar vista del mapa"
                    className="p-1.5 hover:bg-white/20 text-[#e2b957] rounded-lg transition-colors cursor-pointer"
                    title="Reajustar vista"
                  >
                    <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
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
                <div className="absolute inset-0 bg-[#1e1713]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-3 border-[#e2b957] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-white">Cargando geometrías satelitales...</span>
                </div>
              )}

              {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl z-20">
                  {error}
                </div>
              )}

              {/* Globo flotante de confirmación "Mapa-Primero" para el Agricultor */}
              {perfilActivo === 'agricultor' && selectedParcela && (
                <div className="absolute bottom-4 left-4 right-4 z-[500] bg-[#1e1713]/95 border-2 border-[#e2b957] rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e2b957]/20 border border-[#e2b957]/40 flex items-center justify-center shrink-0 text-[#e2b957]">
                      <MapPin className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-[#e2b957] block">
                        ¿Es esta tu parcela en {selectedParcela.municipio}?
                      </span>
                      <div className="text-base sm:text-lg font-extrabold text-white tabular-nums">
                        Tiene aproximadamente <span className="text-[#e2b957]">{selectedParcela.area_ha} hectáreas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEstadoAgricultor(selectedParcela.estado)
                        setMunicipioAgricultor(selectedParcela.municipio)
                        setModoSeleccion('mapa_catalogo')
                        setPasoAgricultor(5)
                        const el = document.getElementById('asistente-modelo')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#b85c38] to-[#c96a45] hover:from-[#c96a45] hover:to-[#d87a52] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition"
                    >
                      <Check className="w-4 h-4 text-[#e2b957]" />
                      <span>Sí, esta es</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedParcela(null)}
                      className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-[#c9b7aa] hover:text-white font-semibold cursor-pointer transition"
                    >
                      No, buscar otra
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel Lateral: Parcela Seleccionada */}
          <div className="bg-[#291e17]/50 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
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
                  <div className="bg-[#1e1713]/80 p-3 rounded-xl border border-white/5">
                    <div className="text-[10px] text-[#c9b7aa] uppercase tracking-wider">Superficie de Predio</div>
                    <div className="text-xl font-extrabold text-white tabular-nums">{selectedParcela.area_ha} hectáreas</div>
                    <div className="text-xs text-[#c9b7aa] mt-0.5">
                      {selectedParcela.municipio}, {selectedParcela.estado}
                      {perfilActivo === 'analista' ? ` · ID: ${selectedParcela.id_poligono}` : ''}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#1e1713]/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#c9b7aa] block">Elevación CEM 4.0</span>
                      <span className="text-sm font-bold text-white">{selectedParcela.elevacion_msnm} m</span>
                    </div>

                    <div className="bg-[#1e1713]/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#c9b7aa] block">Pendiente / Relieve</span>
                      <span className="text-sm font-bold text-sky-400">
                        {selectedParcela.pendiente_grados ?? '—'}° ({selectedParcela.tipo_relieve})
                      </span>
                    </div>

                    <div className="bg-[#1e1713]/60 p-2.5 rounded-xl border border-white/5 col-span-2">
                      <span className="text-[10px] text-[#c9b7aa] block">Rendimiento Histórico</span>
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
                    className="w-full mt-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#b85c38] to-[#c96a45] hover:from-[#c96a45] hover:to-[#d87a52] text-white text-xs font-semibold flex items-center justify-center gap-2 border border-[#d87a52]/30 shadow-md cursor-pointer transition active:scale-[0.98]"
                  >
                    <Sprout className="w-4 h-4 text-[#e2b957]" />
                    <span>Evaluar esta parcela en el modelo ⬇</span>
                  </button>
                </div>
              ) : (
                <div className="py-10 px-4 text-center text-[#c9b7aa] flex flex-col items-center justify-center">
                  <Info className="w-8 h-8 text-white/20 mb-2" />
                  <p className="text-xs font-medium text-white/80">Ninguna parcela seleccionada</p>
                  <p className="text-[11px] text-white/50 mt-1 max-w-xs">
                    Haz clic en cualquier polígono en la foto satelital para ver sus hectáreas o usa el asistente guiado más abajo.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#c9b7aa]/80 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#e2b957] shrink-0" />
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
          <p className="text-xs sm:text-sm text-[#c9b7aa] mt-1.5">
            Selecciona tu perfil para adaptar las preguntas y resultados a tus necesidades de campo o análisis técnico.
          </p>

          <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-[#291e17]/90 border border-white/15 shadow-2xl gap-2 w-full max-w-lg">
            <button
              type="button"
              onClick={() => setPerfilActivo('agricultor')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
                perfilActivo === 'agricultor'
                  ? 'bg-gradient-to-r from-[#b85c38] to-[#c96a45] text-white shadow-lg shadow-[#b85c38]/25 border border-[#d87a52]/50 ring-1 ring-[#e2b957]/40'
                  : 'text-[#c9b7aa] hover:text-white hover:bg-white/5 border border-transparent'
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
                  ? 'bg-gradient-to-r from-[#3d2a1f] to-[#291b14] text-white shadow-lg border border-[#e2b957]/50 ring-1 ring-[#e2b957]/30'
                  : 'text-[#c9b7aa] hover:text-white hover:bg-white/5 border border-transparent'
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
          <div className="bg-[#291e17]/60 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
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
                            ? 'bg-[#e2b957] text-[#1e1713] ring-4 ring-[#e2b957]/30 shadow-lg'
                            : completado
                            ? 'bg-[#d87a52] text-white'
                            : 'bg-[#1e1713] border border-white/20 text-white/50 group-hover:border-white/40'
                        }`}
                      >
                        {completado ? <Check className="w-4 h-4" /> : s.paso}
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-semibold text-center ${actual ? 'text-[#e2b957]' : completado ? 'text-[#e2b957]' : 'text-white/50'}`}>
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
                  <p className="text-xs text-[#c9b7aa] mt-1">
                    Selecciona una de las 3 entidades monitoreadas con imágenes satelitales en el Altiplano Central.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    {
                      nombre: 'Puebla',
                      color: 'border-[#d87a52]/50 hover:border-[#d87a52]',
                      bg: 'bg-[#b85c38]/15',
                      badge: '100 parcelas monitoreadas',
                      badgeColor: 'text-[#f5e3d7] bg-[#b85c38]/20',
                      dotColor: 'bg-[#d87a52]',
                      region: 'Chignahuapan / Sierra Norte',
                    },
                    {
                      nombre: 'Hidalgo',
                      color: 'border-amber-500/50 hover:border-amber-400',
                      bg: 'bg-amber-500/10',
                      badge: '51 parcelas monitoreadas',
                      badgeColor: 'text-amber-300 bg-amber-500/20',
                      dotColor: 'bg-amber-400',
                      region: 'Valle de Apan / Singuilucan',
                    },
                    {
                      nombre: 'Tlaxcala',
                      color: 'border-sky-500/50 hover:border-sky-400',
                      bg: 'bg-sky-500/10',
                      badge: '46 parcelas monitoreadas',
                      badgeColor: 'text-sky-300 bg-sky-500/20',
                      dotColor: 'bg-sky-400',
                      region: 'Calpulalpan / Nanacamilpa',
                    },
                  ].map((edo) => (
                    <button
                      key={edo.nombre}
                      type="button"
                      onClick={() => handleSeleccionarEstado(edo.nombre)}
                      className={`p-5 rounded-2xl border ${edo.color} ${edo.bg} flex flex-col items-center text-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg group`}
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-black/30 border border-white/10">
                        <span className={`h-3 w-3 rounded-full ${edo.dotColor}`} aria-hidden="true" />
                      </div>
                      <h4 className="text-lg font-bold text-white group-hover:text-[#e2b957] transition-colors">{edo.nombre}</h4>
                      <span className="text-[11px] text-[#c9b7aa] mt-0.5">{edo.region}</span>
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
                    className="inline-flex items-center gap-1.5 text-xs text-[#c9b7aa] hover:text-white transition cursor-pointer"
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
                        className="p-4 rounded-2xl bg-[#1e1713]/80 border border-white/10 hover:border-[#e2b957]/60 hover:bg-[#1e1713] text-left transition-all duration-200 cursor-pointer shadow-md group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-white group-hover:text-[#e2b957] transition">
                              {info.nombre}
                            </h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#b85c38]/20 text-[#f5e3d7]">
                              {info.totalParcelas} predios satelitales
                            </span>
                          </div>
                          <p className="text-[11px] text-[#c9b7aa] mt-2 leading-relaxed">
                            {info.descripcion}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-[#c9b7aa]">Promedio histórico:</span>
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
                    <p className="text-xs text-[#c9b7aa] mt-0.5">
                      La temporada y duración del ciclo modulan directamente la radiación térmica y la humedad acumulada en el modelo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasoAgricultor(2)}
                    className="inline-flex items-center gap-1 text-xs text-[#c9b7aa] hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Municipio
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Ciclo Principal de Temporal 2026 (Abril - Octubre) */}
                  <button
                    type="button"
                    onClick={() => {
                      setTemporada('PV')
                      setFechaInicio('2026-04-01')
                      setFechaFin('2026-10-31')
                    }}
                    className="w-full text-left p-5 sm:p-6 rounded-2xl border border-[#e2b957] bg-[#1e1713] ring-2 ring-[#e2b957]/40 shadow-xl transition-colors cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CloudRain className="w-6 h-6 text-[#e2b957]" aria-hidden="true" />
                          <h4 className="font-bold text-white text-lg">Ciclo Principal de Temporal 2026 (Abril – Octubre)</h4>
                        </div>
                        <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-[#b85c38]/20 text-[#f5e3d7] border border-[#d87a52]/30">
                          Temporada Principal
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#c9b7aa] mt-2.5 leading-relaxed">
                        Temporada tradicional de lluvias en el Altiplano Central: siembra y nacencia de Abril a Junio, con espigado, llenado de grano y cosecha entre Septiembre y Octubre.
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-white/10 text-xs text-[#e2b957] font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>01 Abril 2026 al 31 Octubre 2026 (~214 días)</span>
                      </span>
                      <span className="text-[#e2b957] font-medium">Aprovechamiento de lluvias de verano</span>
                    </div>
                  </button>
                </div>

                {/* Condiciones de Clima Esperadas para el Municipio y Temporada */}
                <div className="p-4 rounded-2xl bg-[#1e1713]/90 border border-white/10 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-[#e2b957]" />
                      Clima esperado en {municipioAgricultor} durante tu ciclo:
                    </span>
                    <span className="text-[#e2b957] font-bold">
                      Temporada {temporada === 'PV' ? 'Abril – Octubre 2026' : 'Personalizada'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#c9b7aa]">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/60 block">Temperatura promedio:</span>
                      <b className="text-white text-xs block mt-0.5">{sintesisSatelital.clima.tMeanPv2026}°C</b>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/60 block">Lluvias esperadas:</span>
                      <b className="text-[#e2b957] text-xs block mt-0.5">~{sintesisSatelital.clima.lluviasCicloMm} mm</b>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/60 block">Riesgo de heladas:</span>
                      <b className="text-sky-300 text-xs block mt-0.5">{sintesisSatelital.clima.diasHelada} días</b>
                    </div>
                  </div>
                </div>

                {/* Opción 3: Personalizar Rango de Fechas */}
                <div className="p-5 rounded-2xl bg-[#1e1713]/70 border border-white/10 space-y-4">
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
                    <label className="flex flex-col gap-1.5 text-xs text-[#c9b7aa]">
                      Fecha de siembra / inicio:
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => {
                          setFechaInicio(e.target.value)
                          setTemporada('personalizado')
                        }}
                        className="h-10 rounded-xl border border-white/10 bg-[#1e1713] px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs text-[#c9b7aa]">
                      Fecha estimada de corte / cosecha:
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => {
                          setFechaFin(e.target.value)
                          setTemporada('personalizado')
                        }}
                        className="h-10 rounded-xl border border-white/10 bg-[#1e1713] px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSeleccionarTemporadaYContinuar}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#b85c38] to-[#c96a45] hover:from-[#c96a45] hover:to-[#d87a52] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
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
                    <p className="text-xs text-[#c9b7aa] mt-0.5">
                      No necesitas saber códigos técnicos: encuéntrala por sus hectáreas en el mapa satelital o ingresa tu superficie directamente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPasoAgricultor(3)}
                    className="inline-flex items-center gap-1 text-xs text-[#c9b7aa] hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Temporada
                  </button>
                </div>

                {/* SELECTOR DE CAMINO: CAMINO A (MAPA-PRIMERO) VS CAMINO B (MANUAL) */}
                <div className="flex rounded-2xl bg-[#1e1713] p-1.5 border border-white/10 gap-2">
                  <button
                    type="button"
                    onClick={() => setModoSeleccion('mapa_catalogo')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      modoSeleccion === 'mapa_catalogo'
                        ? 'bg-[#b85c38] text-white shadow-md border border-emerald-400/30'
                        : 'text-[#c9b7aa] hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[#e2b957]" />
                    <span>Camino A: Ubicar mi parcela en el mapa satelital</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModoSeleccion('manual_hectareas')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      modoSeleccion === 'manual_hectareas'
                        ? 'bg-[#b85c38] text-white shadow-md border border-emerald-400/30'
                        : 'text-[#c9b7aa] hover:text-white'
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-[#e2b957]" />
                    <span>Camino B: Mi predio no está marcado / Ingresar mis hectáreas</span>
                  </button>
                </div>

                {/* CAMINO A: DISEÑO "MAPA-PRIMERO" (VISUAL Y SIMPLE) */}
                {modoSeleccion === 'mapa_catalogo' && (
                  <div className="space-y-5">
                    {/* 1. Tarjeta de Confirmación Directa cuando ya tocó un polígono en el mapa */}
                    {selectedParcela && selectedParcela.municipio.toLowerCase() === municipioAgricultor.toLowerCase() ? (
                      <div className="p-6 sm:p-7 rounded-3xl bg-[#1e1713] border-2 border-[#e2b957] shadow-2xl space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#e2b957]/20 border border-[#e2b957]/40 flex items-center justify-center text-[#e2b957] shrink-0">
                              <MapPin className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <div>
                              <span className="text-xs uppercase tracking-wider font-bold text-[#e2b957] block">
                                Parcela seleccionada en el mapa de {municipioAgricultor}
                              </span>
                              <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5 tabular-nums">
                                ¿Es esta tu parcela? Tiene aproximadamente{' '}
                                <span className="text-[#e2b957]">{selectedParcela.area_ha} hectáreas</span>
                              </h4>
                              <p className="text-xs text-[#c9b7aa] mt-1">
                                Si reconoces la ubicación y el tamaño de este terreno en la foto satelital, confírmalo para ver tu estimación de cosecha.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => handleSeleccionarParcelaCaminoA(selectedParcela)}
                            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#b85c38] to-[#c96a45] hover:from-[#c96a45] hover:to-[#d87a52] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-colors"
                          >
                            <Check className="w-5 h-5 text-[#e2b957]" aria-hidden="true" />
                            <span>Sí, esta es mi parcela (Ver mi cosecha)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedParcela(null)
                              handleVerEnMapa()
                            }}
                            className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-[#e2b957]" aria-hidden="true" />
                            <span>No, buscar otra en el mapa arriba</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 2. Invitación Visual "Mapa-Primero" cuando aún no ha tocado una parcela */
                      <div className="p-6 sm:p-8 rounded-3xl bg-[#1e1713]/90 border border-[#e2b957]/40 text-center space-y-4 shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-[#e2b957]/15 border border-[#e2b957]/30 flex items-center justify-center mx-auto text-[#e2b957]">
                          <MapPin className="w-7 h-7" aria-hidden="true" />
                        </div>
                        <div className="max-w-lg mx-auto space-y-1.5">
                          <h4 className="text-lg sm:text-xl font-extrabold text-white">
                            Toca tu terreno directamente en la foto satelital
                          </h4>
                          <p className="text-xs sm:text-sm text-[#c9b7aa] leading-relaxed">
                            El mapa de arriba ya está ubicado en <b>{municipioAgricultor}</b>. Sube al mapa, toca el dibujo de tu parcela y te preguntaremos si es la tuya mostrándote sus hectáreas.
                          </p>
                        </div>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={handleVerEnMapa}
                            className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-[#b85c38] to-[#c96a45] hover:from-[#c96a45] hover:to-[#d87a52] text-white text-sm font-bold inline-flex items-center gap-2.5 shadow-xl cursor-pointer transition-transform hover:scale-[1.01]"
                          >
                            <MapPin className="w-4 h-4 text-[#e2b957]" aria-hidden="true" />
                            <span>Subir al Mapa Satelital y tocar mi parcela</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CAMINO B: INGRESO MANUAL DE HECTÁREAS */}
                {modoSeleccion === 'manual_hectareas' && (
                  <div className="p-6 rounded-2xl bg-[#1e1713]/80 border border-white/10 space-y-5">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-base">
                        Estimar con la superficie y condiciones de tu predio
                      </h4>
                      <p className="text-xs text-[#c9b7aa]">
                        Si tu parcela no se encuentra entre los 197 polígonos del satélite, el modelo calculará la producción usando los patrones satelitales y climáticos calibrados para {municipioAgricultor}.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {/* Superficie en ha */}
                      <label className="flex flex-col gap-1.5 text-xs text-[#c9b7aa]">
                        <span className="font-semibold text-white">Superficie de tu terreno (ha):</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={manualAreaHa}
                          onChange={(e) => setManualAreaHa(e.target.value)}
                          placeholder="Ej. 6.5"
                          className="h-11 rounded-xl border border-white/15 bg-[#1e1713] px-3.5 text-sm font-bold text-white outline-none focus:border-[#e2b957] focus:ring-1 focus:ring-[#e2b957]"
                        />
                        <span className="text-[10px] text-white/50">Hectáreas sembradas</span>
                      </label>

                      {/* Tipo de terreno */}
                      <label className="flex flex-col gap-1.5 text-xs text-[#c9b7aa]">
                        <span className="font-semibold text-white">Tipo de terreno:</span>
                        <select
                          value={manualTipoTerreno}
                          onChange={(e) => setManualTipoTerreno(e.target.value as any)}
                          className="h-11 rounded-xl border border-white/15 bg-[#1e1713] px-3 text-xs text-white outline-none focus:border-[#e2b957] cursor-pointer"
                        >
                          <option value="plano">Plano de valle (Poca pendiente)</option>
                          <option value="ladera_suave">Ladera suave (Lomerío)</option>
                          <option value="cerro">Cerro o ladera empinada</option>
                        </select>
                        <span className="text-[10px] text-white/50">Influye en la retención de agua</span>
                      </label>

                      {/* Régimen de agua */}
                      <label className="flex flex-col gap-1.5 text-xs text-[#c9b7aa]">
                        <span className="font-semibold text-white">Régimen de agua / manejo:</span>
                        <select
                          value={manualRegimenAgua}
                          onChange={(e) => setManualRegimenAgua(e.target.value as any)}
                          className="h-11 rounded-xl border border-white/15 bg-[#1e1713] px-3 text-xs text-white outline-none focus:border-[#e2b957] cursor-pointer"
                        >
                          <option value="temporal_bueno">Temporal favorable (Buen régimen)</option>
                          <option value="temporal_regular">Temporal regular / seco</option>
                          <option value="riego">Riego de auxilio / residual</option>
                        </select>
                        <span className="text-[10px] text-white/50">Disponibilidad hídrica</span>
                      </label>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-[#c9b7aa]">
                        Calibrado con datos de {municipioAgricultor} ({infoTemporada.nombre})
                      </span>

                      <button
                        type="button"
                        onClick={handleCalcularCaminoB}
                        className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#b85c38] to-[#c96a45] hover:from-[#c96a45] hover:to-[#d87a52] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
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
                    <span className="text-xs uppercase tracking-wider text-[#e2b957] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Estimación completada para tu cultivo
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5 tabular-nums">
                      {diagnosticoAgricultor.nombrePredio}
                    </h3>
                    <p className="text-xs text-[#c9b7aa] mt-0.5">
                      Estado: <b className="text-white">{estadoAgricultor}</b> · Municipio: <b className="text-white">{municipioAgricultor}</b> · Superficie: <b className="text-white">{diagnosticoAgricultor.areaEfectivaHa} ha</b> · {infoTemporada.nombre}
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
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-[#b85c38]/20 text-[#f5e3d7] border border-[#d87a52]/30 hover:bg-[#d87a52]/30 transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#e2b957]" /> Ver en el mapa
                    </button>
                  </div>
                </div>

                {/* Tarjetas Principales de Resultados */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rendimiento Proyectado 2026 */}
                  <div className="bg-[#1e1713] border border-[#e2b957]/40 rounded-2xl p-5 relative overflow-hidden shadow-xl md:col-span-1">
                    <span className="text-xs uppercase tracking-wider text-[#c9b7aa] font-semibold">
                      Rendimiento Proyectado 2026
                    </span>
                    <div className="mt-2 text-4xl sm:text-5xl font-black text-[#e2b957] tracking-tight">
                      {diagnosticoAgricultor.rendimiento}{' '}
                      <span className="text-lg font-normal text-white/80">t/ha</span>
                    </div>
                    <div className="mt-1 text-xs text-[#c9b7aa]">
                      ≈ {Math.round(diagnosticoAgricultor.rendimiento * 1000).toLocaleString('es-MX')} kg por hectárea
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/80 space-y-1">
                      <div className="inline-flex items-center gap-1 text-[#e2b957] font-semibold">
                        <Sparkles className="w-3 h-3" /> Estimación para tu parcela
                      </div>
                      <div className="text-[10px] text-[#c9b7aa]">
                        {diagnosticoAgricultor.rendReal2025 !== null
                          ? `Cosecha anterior registrada: ${diagnosticoAgricultor.rendReal2025} t/ha`
                          : `Referencia ciclo anterior: ${diagnosticoAgricultor.rendModelo2025?.toFixed(2) ?? '—'} t/ha`}
                      </div>
                    </div>
                  </div>

                  {/* Cosecha Total Proyectada */}
                  <div className="bg-[#1e1713] border border-white/10 rounded-2xl p-5 shadow-xl md:col-span-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#c9b7aa] font-semibold">
                        Cosecha Total Proyectada 2026
                      </span>
                      <div className="mt-2 text-3xl font-extrabold text-white">
                        {diagnosticoAgricultor.produccionTotalT}{' '}
                        <span className="text-sm font-normal text-[#e2b957]">toneladas</span>
                      </div>
                      <div className="text-xs text-[#c9b7aa] mt-1">
                        Superficie fija del lote: <b>{diagnosticoAgricultor.areaEfectivaHa} ha</b>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-[#c9b7aa]">
                      Equivale a aproximadamente{' '}
                      <b className="text-white font-bold">{diagnosticoAgricultor.bultos50kg.toLocaleString('es-MX')}</b> costales de 50 kg.
                    </div>
                  </div>

                  {/* Comparativa Municipal y vs 2025 */}
                  <div className="bg-[#1e1713] border border-white/10 rounded-2xl p-5 shadow-xl md:col-span-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#c9b7aa] font-semibold">
                        Comparativa {municipioAgricultor} y Ciclo 2025
                      </span>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {diagnosticoAgricultor.munPromedio}{' '}
                        <span className="text-sm font-normal text-[#c9b7aa]">t/ha media municipal</span>
                      </div>
                      <div className="text-xs mt-1">
                        {diagnosticoAgricultor.diffConMunicipio >= 0 ? (
                          <span className="text-[#e2b957] font-semibold">
                            +{diagnosticoAgricultor.diffConMunicipio} t/ha vs. promedio municipal
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">
                            {diagnosticoAgricultor.diffConMunicipio} t/ha vs. promedio municipal
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-[#c9b7aa] bg-white/5 p-2.5 rounded-xl flex items-center justify-between">
                      <span>Variación 2026 vs 2025:</span>
                      <b className={diagnosticoAgricultor.cambio2026KgHa >= 0 ? 'text-emerald-300' : 'text-amber-300'}>
                        {diagnosticoAgricultor.cambio2026KgHa >= 0 ? '+' : ''}
                        {diagnosticoAgricultor.cambio2026KgHa} kg/ha
                      </b>
                    </div>
                  </div>
                </div>

                {/* Semáforo de Salud Agronómica y Resumen Basado en las Variables de Mayor Peso (Validado por Google Gemini LLM sin mencionar sensores) */}
                {(() => {
                  const explicacionAmigable = construirResumenAgricultorSHAP(
                    diagnosticoAgricultor.shapVars2026,
                    diagnosticoAgricultor.rendimiento,
                    municipioAgricultor,
                    diagnosticoAgricultor.pendienteGrados,
                    manualRegimenAgua
                  )
                  const textoDiagnostico = llmExplicacion?.diagnosticoSubtitulo || explicacionAmigable.diagnosticoSubtitulo
                  const textoNarrativo = llmExplicacion?.resumenNarrativo || explicacionAmigable.resumenNarrativo

                  return (
                    <>
                      {/* PARTE 1: Diagnóstico del Cultivo generado según el resultado y factores de mayor peso */}
                      <div className={`p-5 rounded-2xl border ${diagnosticoAgricultor.estadoSalud.colorBorder} bg-[#1e1713]/90 space-y-2`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                            Diagnóstico del Cultivo
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${diagnosticoAgricultor.estadoSalud.colorBadge}`}>
                            {diagnosticoAgricultor.estadoSalud.titulo}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#c9b7aa] leading-relaxed">
                          {textoDiagnostico}
                        </p>
                      </div>

                      {/* PARTE 2: Resumen Explicativo validado por IA (Google Gemini) y las 4 Condiciones de Mayor Peso (0% sensores) */}
                      <div className="bg-[#1e1713]/90 p-5 rounded-2xl border border-sky-500/30 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#e2b957]" />
                            <h4 className="text-sm font-bold text-white">
                              ¿Por qué se estima esta cosecha en tu terreno? ({infoTemporada.nombre})
                            </h4>
                          </div>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold self-start sm:self-auto">
                            {llmLoading
                              ? 'Validando explicación con Google Gemini...'
                              : llmExplicacion?.generado_por_llm
                              ? '✓ Explicación Validada por Google Gemini'
                              : 'Factores de Mayor Peso en tu Predio'}
                          </span>
                        </div>

                        {/* Texto generado con base en las variables de mayor peso en la predicción */}
                        <p className="text-xs sm:text-sm text-[#f5e3d7] leading-relaxed">
                          {textoNarrativo}
                        </p>

                        {/* Las 4 tarjetas de las condiciones que tuvieron más peso en la predicción (sin mencionar sensores) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                          {explicacionAmigable.top4FactoresPeso.map((f, idx) => {
                            const esPos = f.efecto === 'positivo'
                            return (
                              <div key={f.variable + idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-1.5">
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] text-[#c9b7aa] uppercase tracking-wider font-semibold">
                                      {f.etiquetaCorta}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-bold tabular-nums">
                                      {f.pesoPct}% peso
                                    </span>
                                  </div>
                                  <b
                                    className={`text-sm block mt-1.5 tabular-nums ${
                                      esPos ? 'text-emerald-300' : 'text-amber-300'
                                    }`}
                                  >
                                    {esPos ? `Ayudó (+${f.impactoKgHa} kg/ha)` : `En contra (${f.impactoKgHa} kg/ha)`}
                                  </b>
                                </div>
                                <span className="text-[11px] text-white/70 leading-snug block pt-0.5">
                                  {f.resumenCorto}
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Explicación detallada de lo que ayudó vs lo que afectó en contra y qué problemas puede generar */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-2 border-t border-white/10">
                          <div className="p-3.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/25 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>Lo que favoreció tu cosecha según la predicción</span>
                            </span>
                            {llmExplicacion?.comentarioPositivo && (
                              <p className="text-xs text-white/90 leading-relaxed pb-1 border-b border-white/10">
                                {llmExplicacion.comentarioPositivo}
                              </p>
                            )}
                            {explicacionAmigable.factoresPositivos.length === 0 ? (
                              <p className="text-xs text-[#c9b7aa]">
                                El terreno mantiene condiciones promedio para la zona sin un factor extraordinario a favor.
                              </p>
                            ) : (
                              explicacionAmigable.factoresPositivos.slice(0, 2).map((f, i) => (
                                <div key={f.variable + i} className="text-xs text-[#c9b7aa] leading-relaxed">
                                  <b className="text-white">{f.tituloAmigable} (+{f.impactoKgHa} kg/ha):</b> {f.explicacion}
                                </div>
                              ))
                            )}
                          </div>

                          <div className="p-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/25 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>Lo que jugó en contra y qué problemas puede causar</span>
                            </span>
                            {llmExplicacion?.comentarioNegativoYCuidados && (
                              <p className="text-xs text-white/90 leading-relaxed pb-1 border-b border-white/10">
                                {llmExplicacion.comentarioNegativoYCuidados}
                              </p>
                            )}
                            {explicacionAmigable.factoresNegativos.length === 0 ? (
                              <p className="text-xs text-emerald-300">
                                No se detectaron problemas fuertes de falta de humedad, clima o terreno que reduzcan tu cosecha.
                              </p>
                            ) : (
                              explicacionAmigable.factoresNegativos.slice(0, 2).map((f, i) => (
                                <div key={f.variable + i} className="text-xs text-[#c9b7aa] leading-relaxed">
                                  <b className="text-white">{f.tituloAmigable} ({f.impactoKgHa} kg/ha):</b> {f.explicacion}{' '}
                                  <span className="text-[#e2b957] font-medium">({f.recomendacionAccion})</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}

                {/* Recomendaciones Agronómicas Estacionales */}
                <div className="bg-[#1e1713]/80 p-5 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-[#e2b957]" />
                    Recomendaciones Estacionales para tu Predio
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#c9b7aa]">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <b className="text-white block mb-1">Manejo de Suelo y Pendiente</b>
                      {diagnosticoAgricultor.pendienteGrados > 3
                        ? `Pendiente de ${diagnosticoAgricultor.pendienteGrados}°. Se sugiere surcado al contorno para retener humedad pluvial de temporal y evitar deslaves.`
                        : 'Terreno plano de valle. Permite distribución uniforme de nutrientes y buen drenaje sin pérdida de suelo.'}
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <b className="text-white block mb-1">Temporada y Régimen Térmico</b>
                      En el ciclo principal Abril–Octubre, supervisar el llenado de grano en Agosto–Septiembre para evitar afectaciones por heladas tempranas y asegurar el peso de grano cervecero.
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
                    className="inline-flex items-center gap-1.5 text-xs text-[#c9b7aa] hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Iniciar nueva consulta
                  </button>

                  <div className="flex flex-wrap items-center gap-2.5">
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
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b85c38] hover:bg-[#165538] text-white text-xs font-semibold shadow-lg transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Descargar Ficha del Productor (CSV)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VISTA PERFIL ANALISTA (ARQUITECTURA QBAF + DF-QuAD + SHAP · PASO 6 NB) --- */}
        {perfilActivo === 'analista' && (
          <div className="bg-[#291e17]/60 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Cabecera y Sub-Pestañas del Analista */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Laboratorio del Analista · Casos Particulares y Grupos de Parcelas
                </h3>
                <p className="text-xs text-[#c9b7aa] mt-0.5">
                  Audita qué variables impulsaron o frenaron la predicción del modelo mediante valores de Shapley y deliberación gradual sobre el conjunto de datos original.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSubPestanaAnalista('campana2026')
                    if (!campana2026Data) {
                      ejecutarPrediccionCampana2026('TODOS', 'todos', 'base_api', 0, 0)
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#b85c38] to-[#c96a45] hover:from-[#c96a45] hover:to-[#d87a52] text-white text-xs font-bold shadow-lg transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#e2b957]" aria-hidden="true" />
                  <span>Generar Predicción Próximo Año</span>
                </button>

                {selectedParcela && (
                  <button
                    type="button"
                    onClick={cargarTelemetriaSeleccionadaAnalista}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Auditar {selectedParcela.id_poligono}
                  </button>
                )}
              </div>
            </div>

            {/* Selector de Sub-Pestañas: Casos Particulares vs Grupos de Parcelas vs Predicción Próximo Año */}
            <div className="flex flex-wrap border-b border-white/10 mb-6 gap-2">
              <button
                type="button"
                onClick={() => setSubPestanaAnalista('parametros')}
                className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  subPestanaAnalista === 'parametros'
                    ? 'border-sky-400 text-white'
                    : 'border-transparent text-[#c9b7aa] hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4 text-sky-400" aria-hidden="true" />
                <span>1. Casos Particulares y Simulación en Vivo</span>
              </button>

              <button
                type="button"
                onClick={() => setSubPestanaAnalista('archivos')}
                className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  subPestanaAnalista === 'archivos'
                    ? 'border-sky-400 text-white'
                    : 'border-transparent text-[#c9b7aa] hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-sky-400" aria-hidden="true" />
                <span>2. Análisis con Grupos de Parcelas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubPestanaAnalista('campana2026')
                  if (!campana2026Data) {
                    ejecutarPrediccionCampana2026('TODOS', 'todos', 'base_api', 0, 0)
                  }
                }}
                className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  subPestanaAnalista === 'campana2026'
                    ? 'border-[#e2b957] text-white'
                    : 'border-transparent text-[#c9b7aa] hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#e2b957]" aria-hidden="true" />
                <span>3. Predicción Próximo Año</span>
              </button>
            </div>

            {/* ===========================================================================
                PESTAÑA 1: ANÁLISIS DE CASOS PARTICULARES + SIMULACIÓN PARAMÉTRICA SHAP
            =========================================================================== */}
            {subPestanaAnalista === 'parametros' && (
              <div className="space-y-6">
                {/* Selector Rápido de los 9 Casos Particulares del Paso 6 del Notebook + Catálogo Completo */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#1e1713]/90 border border-white/10 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#e2b957] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Casos Particulares Destacados
                      </span>
                      <p className="text-xs text-[#c9b7aa] mt-0.5">
                        Selecciona cualquiera de los 9 casos particulares de prueba ciega (3 por Estado) o elige cualquier polígono del catálogo para descomponer su predicción con SHAP:
                      </p>
                    </div>

                    {/* Selector desplegable de cualquiera de las 197 parcelas */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        aria-label="Seleccionar polígono del catálogo AgroCebada"
                        value={analistaValues.plot}
                        onChange={(e) => handleSeleccionarCasoParticular(e.target.value, true)}
                        className="h-9 rounded-xl border border-white/15 bg-[#291e17] px-3 text-xs text-white outline-none focus:border-sky-400"
                      >
                        {(data?.geojson?.features || []).map((f) => (
                          <option key={f.properties.id_poligono} value={f.properties.id_poligono}>
                            {f.properties.id_poligono} · {f.properties.estado} ({f.properties.municipio}) [{f.properties.conjunto}]
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tarjetas de los 9 Casos Particulares Destacados del Paso 6 NB */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
                    {CASOS_PARTICULARES_PASO6.map((caso) => {
                      const isActive = analistaValues.plot === caso.id
                      const badgeColor =
                        caso.estado === 'Hidalgo'
                          ? 'text-[#e2b957] border-[#e2b957]/40'
                          : caso.estado === 'Puebla'
                          ? 'text-[#d87a52] border-[#d87a52]/40'
                          : 'text-sky-300 border-sky-400/40'
                      return (
                        <button
                          key={caso.id}
                          type="button"
                          onClick={() => handleSeleccionarCasoParticular(caso.id, false)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isActive
                              ? 'bg-sky-500/20 border-sky-400 ring-1 ring-sky-400/50 shadow-md'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-xs text-white">{caso.id}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${badgeColor}`}>
                              {caso.estado.slice(0, 3).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#c9b7aa] mt-1 line-clamp-2 leading-tight">
                            {caso.desc}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Grid Principal: Izquierda Formulario Paramétrico + Resumen QBAF | Derecha Descomposición Aditiva SHAP */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Columna Izquierda (5 cols): Parámetros de Entrada y Resumen de Deliberación QBAF */}
                  <div className="lg:col-span-5 space-y-4">
                    <form onSubmit={handleCalcularAnalista} className="bg-[#1e1713] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <span className="text-xs uppercase tracking-wider text-sky-400 font-bold block">
                            Covariables del Caso Particular
                          </span>
                          <span className="text-[11px] text-[#c9b7aa]">
                            Modifica cualquier índice satelital para simular sensibilidad SHAP en vivo
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFocalizarParcelaEnMapa(analistaValues.plot)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-[#e2b957] font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <MapPin className="w-3 h-3" /> Ver en Mapa
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 text-xs font-medium text-[#c9b7aa]">
                          ID de Polígono / Predio
                          <input
                            type="text"
                            required
                            placeholder="Ej. AGC_003"
                            value={analistaValues.plot}
                            onChange={(e) => setAnalistaValues({ ...analistaValues, plot: e.target.value })}
                            className="h-9 rounded-xl border border-white/10 bg-[#291e17]/80 px-3 text-xs text-white font-mono outline-none focus:border-[#e2b957]"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-[#c9b7aa]">
                          Superficie (ha) · <span className="text-[10px] text-white/50">log_area</span>
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            required
                            value={analistaValues.area}
                            onChange={(e) => setAnalistaValues({ ...analistaValues, area: e.target.value })}
                            className="h-9 rounded-xl border border-white/10 bg-[#291e17]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-[#c9b7aa]">
                          vi6t_max · <span className="text-[10px] text-amber-300">Landsat Térmico</span>
                          <input
                            type="number"
                            step="any"
                            required
                            value={analistaValues.temp}
                            onChange={(e) => setAnalistaValues({ ...analistaValues, temp: e.target.value })}
                            className="h-9 rounded-xl border border-white/10 bg-[#291e17]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-[#c9b7aa]">
                          ndwi_mean · <span className="text-[10px] text-sky-300">Humedad S2</span>
                          <input
                            type="number"
                            step="any"
                            required
                            value={analistaValues.ndwi}
                            onChange={(e) => setAnalistaValues({ ...analistaValues, ndwi: e.target.value })}
                            className="h-9 rounded-xl border border-white/10 bg-[#291e17]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-[#c9b7aa]">
                          lai_std · <span className="text-[10px] text-emerald-300">Área Foliar 3m</span>
                          <input
                            type="number"
                            step="any"
                            required
                            value={analistaValues.lai}
                            onChange={(e) => setAnalistaValues({ ...analistaValues, lai: e.target.value })}
                            className="h-9 rounded-xl border border-white/10 bg-[#291e17]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-[#c9b7aa]">
                          planet_ndvi · <span className="text-[10px] text-purple-300">Capa 0 Undercut</span>
                          <input
                            type="number"
                            step="any"
                            value={analistaValues.ndvi}
                            onChange={(e) => setAnalistaValues({ ...analistaValues, ndvi: e.target.value })}
                            className="h-9 rounded-xl border border-white/10 bg-[#291e17]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-[#c9b7aa]">
                          s2_sti_presow · <span className="text-[10px] text-[#e2b957]">Labranza STI</span>
                          <input
                            type="number"
                            step="any"
                            value={analistaValues.sti}
                            onChange={(e) => setAnalistaValues({ ...analistaValues, sti: e.target.value })}
                            className="h-9 rounded-xl border border-white/10 bg-[#291e17]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-[#c9b7aa]">
                          evi_std · <span className="text-[10px] text-white/50">Variabilidad EVI</span>
                          <input
                            type="number"
                            step="any"
                            required
                            value={analistaValues.evi}
                            onChange={(e) => setAnalistaValues({ ...analistaValues, evi: e.target.value })}
                            className="h-9 rounded-xl border border-white/10 bg-[#291e17]/80 px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                          />
                        </label>
                      </div>

                      {analistaError && <p className="text-xs text-rose-400">{analistaError}</p>}

                      <div className="pt-1 flex items-center gap-2.5">
                        <button
                          type="submit"
                          disabled={analistaLoading}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {analistaLoading ? 'Auditando con QBAF + SHAP...' : 'Recalcular Predicción y SHAP'}
                          {!analistaLoading && <ArrowRight className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSeleccionarCasoParticular(analistaValues.plot || 'AGC_003', false)}
                          className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#c9b7aa] text-xs transition cursor-pointer"
                          title="Restaurar valores originales del polígono"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </form>

                    {/* Tarjeta de Deliberación QBAF + DF-QuAD del Caso Particular */}
                    {analistaFullPred && (
                      <div className="bg-[#1e1713] border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                          <span className="text-xs uppercase tracking-wider text-[#e2b957] font-bold">
                            Árbitro Regional {analistaFullPred.estado}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">
                            {analistaFullPred.conjunto || 'PREDICCION'}
                          </span>
                        </div>

                        {/* Ecuación Aditiva SHAP: Base + Suma SHAP = Predicción */}
                        <div className="grid grid-cols-3 gap-2 text-center bg-black/30 p-3 rounded-xl border border-white/5">
                          <div>
                            <span className="text-[10px] text-[#c9b7aa] block">Base Regional φ₀</span>
                            <b className="text-sm sm:text-base text-white font-mono">
                              {(analistaFullPred.base_regional_t_ha ?? 3.77).toFixed(3)}
                            </b>
                            <span className="text-[9px] text-white/40 block">t/ha</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#c9b7aa] block">Aporte Neto ΣSHAP</span>
                            <b
                              className={`text-sm sm:text-base font-mono ${
                                (analistaFullPred.suma_shap_kg_ha ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {(analistaFullPred.suma_shap_kg_ha ?? 0) >= 0 ? '+' : ''}
                              {analistaFullPred.suma_shap_kg_ha ?? 0}
                            </b>
                            <span className="text-[9px] text-white/40 block">kg/ha</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#c9b7aa] block">Predicción Final ŷ</span>
                            <b className="text-sm sm:text-base text-[#e2b957] font-mono">
                              {analistaFullPred.rendimiento_t_ha.toFixed(3)}
                            </b>
                            <span className="text-[9px] text-white/40 block">
                              t/ha ({analistaFullPred.produccion_estimada_t} t)
                            </span>
                          </div>
                        </div>

                        {/* Metadatos de Grupo Homogéneo y Undercutting */}
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <span className="text-[#c9b7aa]">Grupo Homogéneo QBAF:</span>
                            <span className="font-mono font-bold text-sky-300 text-[11px]">
                              {analistaFullPred.grupo_homogeneo || 'General'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[#c9b7aa] block text-[11px]">Regla de Deliberación DF-QuAD:</span>
                            <b className="text-white text-[11px] block mt-0.5">{analistaFullPred.deliberacion_qbaf}</b>
                            {analistaFullPred.estado === 'Puebla' && (
                              <span
                                className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold ${
                                  analistaFullPred.undercutting_activo
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-emerald-500/15 text-emerald-300'
                                }`}
                              >
                                {analistaFullPred.undercutting_activo
                                  ? '⚡ Capa 0 Undercutting Activo (NDVI > P75 → σ_ET = 0.001)'
                                  : '✓ Capa 0 Sin Saturación Óptica (Debate Completo)'}
                              </span>
                            )}
                          </div>

                          {analistaFullPred.rendimiento_real_t_ha !== null &&
                            analistaFullPred.rendimiento_real_t_ha !== undefined && (
                              <div className="p-2.5 rounded-xl bg-[#b85c38]/15 border border-[#d87a52]/30 flex items-center justify-between">
                                <span className="text-[#f5e3d7]">Rendimiento Real (Entrenamiento):</span>
                                <b className="text-white">
                                  {analistaFullPred.rendimiento_real_t_ha.toFixed(2)} t/ha (Error:{' '}
                                  {Math.round(
                                    Math.abs(analistaFullPred.rendimiento_real_t_ha - analistaFullPred.rendimiento_t_ha) *
                                      1000
                                  )}{' '}
                                  kg/ha)
                                </b>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Columna Derecha (7 cols): Cascada y Tabla de Explicabilidad SHAP Variable por Variable (Paso 6 NB) */}
                  <div className="lg:col-span-7 bg-[#1e1713] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
                        <div>
                          <span className="text-xs uppercase tracking-wider text-[#e2b957] font-bold block">
                            Descomposición Aditiva SHAP · ¿Qué Variables Afectaron la Predicción?
                          </span>
                          <span className="text-[11px] text-[#c9b7aa]">
                            Impacto marginal exacto de cada variable sobre la línea base regional φ₀ en{' '}
                            <b className="text-white">{analistaFullPred?.plot || analistaValues.plot}</b> (
                            {analistaFullPred?.estado || 'Hidalgo'})
                          </span>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#c9b7aa]">
                          r = 0.8584 · R² = 0.7362
                        </span>
                      </div>

                      {!analistaFullPred || !analistaFullPred.shap_variables ? (
                        <div className="py-16 text-center text-[#c9b7aa] flex flex-col items-center">
                          <BarChart3 className="w-10 h-10 text-white/20 mb-3" />
                          <p className="text-sm font-semibold text-white">Cargando auditoría SHAP del caso particular...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Tarjetas Resumen: Top Impulsores vs Top Frenadores */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                                ▲ Principales Impulsores (SHAP &gt; 0)
                              </span>
                              <p className="text-xs font-mono text-white mt-1">{analistaFullPred.top_impulsores}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                                ▼ Principales Frenadores (SHAP &lt; 0)
                              </span>
                              <p className="text-xs font-mono text-white mt-1">{analistaFullPred.top_frenadores}</p>
                            </div>
                          </div>

                          {/* Barras Divergentes y Tabla Detallada de Variables SHAP */}
                          <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
                            {(() => {
                              const vars = analistaFullPred.shap_variables || []
                              const maxAbsKg = Math.max(...vars.map((v) => Math.abs(v.shap_kg_ha)), 50)
                              return vars.map((sv, idx) => {
                                const isPos = sv.shap_kg_ha >= 0
                                const widthPct = Math.min(100, Math.max(4, (Math.abs(sv.shap_kg_ha) / maxAbsKg) * 100))
                                return (
                                  <div
                                    key={sv.variable + idx}
                                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-white text-[11px]">{sv.variable}</span>
                                        <span className="text-[#c9b7aa] text-[11px]">· {sv.etiqueta}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                                          {sv.nodo_qbaf}
                                        </span>
                                        <span
                                          className={`font-mono font-bold text-xs ${
                                            isPos ? 'text-emerald-400' : 'text-rose-400'
                                          }`}
                                        >
                                          {isPos ? '+' : ''}
                                          {sv.shap_kg_ha.toFixed(1)} kg/ha
                                        </span>
                                        <span className="text-[10px] text-white/40 w-11 text-right">
                                          ({sv.impacto_pct}%)
                                        </span>
                                      </div>
                                    </div>

                                    {/* Barra visual de contribución SHAP y comparación Valor Parcela vs Mediana Regional */}
                                    <div className="mt-1.5 flex items-center gap-3">
                                      <div className="text-[10px] text-[#c9b7aa] w-44 shrink-0 font-mono">
                                        Valor: <b className="text-white">{sv.valor_parcela}</b>{' '}
                                        <span className="text-white/40">(Med: {sv.mediana_estado})</span>
                                      </div>
                                      <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden flex">
                                        <div
                                          style={{ width: `${widthPct}%` }}
                                          className={`h-full rounded-full ${
                                            isPos
                                              ? 'bg-gradient-to-r from-emerald-500/70 to-[#e2b957]'
                                              : 'bg-gradient-to-r from-rose-600 to-amber-500/80'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-4 border-t border-white/10 text-[11px] text-[#c9b7aa] flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Fórmula Aditiva SHAP: <b>φ₀ + Σ φᵢ = ŷ</b> · Explicabilidad exacta del Árbitro QBAF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===========================================================================
                PESTAÑA 2: ANÁLISIS CON GRUPOS DE PARCELAS (SHAP GRUPAL + DATASET AGROCEBADA)
            =========================================================================== */}
            {subPestanaAnalista === 'archivos' && (
              <div className="space-y-6">
                {/* Panel de Selección de Grupos de Parcelas */}
                <div className="p-5 rounded-2xl bg-[#1e1713]/95 border border-white/10 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#e2b957]" aria-hidden="true" />
                        <h4 className="font-bold text-white text-base">
                          Explorador de Grupos de Parcelas con SHAP
                        </h4>
                      </div>
                      <p className="text-xs text-[#c9b7aa] mt-1 leading-relaxed max-w-3xl">
                        Filtra por subconjunto, estado, municipio o nivel de rendimiento (alto o bajo) para calcular el <b>Ranking de Importancia SHAP Grupal</b> y el desglose individual de cada predio.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMostrarSubidaManual(!mostrarSubidaManual)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-sky-300 font-semibold transition cursor-pointer self-start lg:self-auto shrink-0 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{mostrarSubidaManual ? 'Ocultar subida manual' : 'Subir lote externo'}</span>
                    </button>
                  </div>

                  {/* Botones de Modo de Grupo */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { id: 'PREDICCION', label: 'Prueba Ciega · 59 Parcelas' },
                      { id: 'ENTRENAMIENTO', label: 'Entrenamiento · 138 Parcelas' },
                      { id: 'TODOS', label: 'Catálogo Completo · 197 Parcelas' },
                    ].map((m) => {
                      const active = modoGrupoAnalista === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            handleAnalizarGrupoParcelas(
                              m.id as 'PREDICCION' | 'CASOS_PASO6' | 'ENTRENAMIENTO' | 'TODOS',
                              filtroEstadoGrupo,
                              filtroMunicipioGrupo,
                              filtroRendimientoGrupo,
                              filtroGrupoHomogeneo
                            )
                          }
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                            active
                              ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                              : 'bg-white/5 border-white/10 text-[#c9b7aa] hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>{m.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Filtros por Estado, Municipio y Nivel de Rendimiento (Alto / Bajo) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <select
                      aria-label="Filtrar grupo por Estado"
                      value={filtroEstadoGrupo}
                      onChange={(e) => {
                        const nuevoEst = e.target.value
                        handleAnalizarGrupoParcelas(
                          modoGrupoAnalista,
                          nuevoEst,
                          'todos',
                          filtroRendimientoGrupo,
                          filtroGrupoHomogeneo
                        )
                      }}
                      className="h-9 rounded-xl border border-white/15 bg-[#291e17] px-3 text-xs text-white outline-none focus:border-sky-400"
                    >
                      <option value="todos">Estado: Todos</option>
                      <option value="Puebla">Puebla</option>
                      <option value="Hidalgo">Hidalgo</option>
                      <option value="Tlaxcala">Tlaxcala</option>
                    </select>

                    <select
                      aria-label="Filtrar grupo por Municipio"
                      value={filtroMunicipioGrupo}
                      onChange={(e) =>
                        handleAnalizarGrupoParcelas(
                          modoGrupoAnalista,
                          filtroEstadoGrupo,
                          e.target.value,
                          filtroRendimientoGrupo,
                          filtroGrupoHomogeneo
                        )
                      }
                      className="h-9 rounded-xl border border-white/15 bg-[#291e17] px-3 text-xs text-white outline-none focus:border-sky-400"
                    >
                      <option value="todos">Municipio: Todos</option>
                      {(filtroEstadoGrupo !== 'todos'
                        ? MUNICIPIOS_POR_ESTADO[filtroEstadoGrupo] || []
                        : Object.keys(MUNICIPIOS_DATA)
                      ).map((mun) => (
                        <option key={mun} value={mun}>
                          {mun}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filtrar por nivel de rendimiento"
                      value={filtroRendimientoGrupo}
                      onChange={(e) =>
                        handleAnalizarGrupoParcelas(
                          modoGrupoAnalista,
                          filtroEstadoGrupo,
                          filtroMunicipioGrupo,
                          e.target.value,
                          filtroGrupoHomogeneo
                        )
                      }
                      className="h-9 rounded-xl border border-white/15 bg-[#291e17] px-3 text-xs text-white outline-none focus:border-sky-400"
                    >
                      <option value="todos">Rendimiento: Todos</option>
                      <option value="alto">Alto Rendimiento (&gt; 4.35 t/ha)</option>
                      <option value="medio">Rendimiento Medio (3.30 – 4.35 t/ha)</option>
                      <option value="bajo">Bajo Rendimiento (&lt; 3.30 t/ha)</option>
                    </select>
                  </div>
                </div>

                {/* Sección colapsable de subida manual de las 4 fuentes (.csv / .zip) */}
                {mostrarSubidaManual && (
                  <div className="p-5 rounded-2xl bg-[#1e1713]/80 border border-sky-500/30 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h5 className="text-sm font-bold text-white">
                          Ingesta Manual de Archivos (.csv / .zip de <code className="text-[#e2b957]">backend/data/agrocebada/</code>)
                        </h5>
                        <p className="text-xs text-[#c9b7aa]">
                          Puedes arrastrar tus propios archivos <code className="text-white">.csv</code> o <code className="text-white">.zip</code> para procesarlos con el Pipeline Oficial.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#b85c38]/20 text-[#f5e3d7] border border-[#d87a52]/40">
                        {conteoCargados} de 4 Fuentes Listas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(['parcelas', 'basico', 'pro', 'topografia'] as const).map((slotKey, i) => {
                        const slot = archivosState[slotKey]
                        const titles = {
                          parcelas: '1. Parcelas (parcelas.csv)',
                          basico: '2. Satélite BÁSICO (.csv)',
                          pro: '3. Satélite PRO (.csv)',
                          topografia: '4. Topografía y Clima (.zip/.csv)',
                        }
                        return (
                          <div key={slotKey} className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{titles[slotKey]}</span>
                              <span className="text-[10px] text-emerald-400 font-bold">
                                {slot.cargado ? '✓ Listo' : `Slot ${i + 1}`}
                              </span>
                            </div>
                            <input
                              type="file"
                              id={`slot-${slotKey}`}
                              accept=".csv,.zip,.tif,.tiff"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) asignarSlotIndividual(slotKey, f)
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor={`slot-${slotKey}`}
                              className="mt-2 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-[#e2b957] font-semibold text-center block cursor-pointer transition truncate"
                            >
                              {slot.cargado ? slot.nombre : `+ Subir ${slotKey}`}
                            </label>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleProcesarArchivoLote}
                        disabled={!todosListos || batchLoading}
                        className="py-2 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        Ejecutar Inferencia sobre Archivos Subidos
                      </button>
                    </div>
                  </div>
                )}

                {/* Spinner de Carga */}
                {batchLoading && (
                  <div className="p-8 rounded-2xl bg-[#1e1713]/80 border border-white/10 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-white">
                      Auditando grupo de parcelas con el motor QBAF + DF-QuAD + SHAP...
                    </span>
                  </div>
                )}

                {/* Error de lote */}
                {batchError && (
                  <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <div>
                      <b>Aviso:</b> {batchError}
                    </div>
                  </div>
                )}

                {/* Resultados del Grupo de Parcelas */}
                {batchResult && !batchLoading && (
                  <div className="space-y-5">
                    {/* KPIs del Grupo de Parcelas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      <div className="bg-[#1e1713] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#c9b7aa] uppercase tracking-wider block">Parcelas en el Grupo</span>
                        <div className="text-2xl font-black text-white mt-1">{batchResult.total_parcelas}</div>
                        <span className="text-[10px] text-sky-300">
                          Modo: {batchResult.modo_grupo || modoGrupoAnalista} · {batchResult.filtro_estado || 'Todos'}
                        </span>
                      </div>

                      <div className="bg-[#1e1713] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#c9b7aa] uppercase tracking-wider block">Rendimiento Medio Grupo</span>
                        <div className="text-2xl font-black text-[#e2b957] mt-1">
                          {batchResult.rendimiento_promedio_t_ha} <span className="text-sm font-normal text-white">t/ha</span>
                        </div>
                        <span className="text-[10px] text-[#c9b7aa]">
                          ≈ {Math.round(batchResult.rendimiento_promedio_t_ha * 1000).toLocaleString('es-MX')} kg/ha
                        </span>
                      </div>

                      <div className="bg-[#1e1713] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#c9b7aa] uppercase tracking-wider block">Producción Acumulada</span>
                        <div className="text-2xl font-black text-[#e2b957] mt-1">
                          {batchResult.produccion_total_t.toLocaleString('es-MX')}{' '}
                          <span className="text-sm font-normal text-white">t</span>
                        </div>
                        <span className="text-[10px] text-white/50">Volumen estimado en tolva</span>
                      </div>

                      <div className="bg-[#1e1713] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#c9b7aa] uppercase tracking-wider block">Potencial del Grupo</span>
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                          <span className="text-[#e2b957]">{batchResult.conteo_alto} Alto</span>
                          <span className="text-white/30">·</span>
                          <span className="text-amber-400">{batchResult.conteo_medio} Medio</span>
                          <span className="text-white/30">·</span>
                          <span className="text-rose-400">{batchResult.conteo_bajo} Bajo</span>
                        </div>
                        <span className="text-[10px] text-white/50">Clasificación QBAF</span>
                      </div>
                    </div>

                    {/* SECCIÓN SHAP GRUPAL + INSPECTOR SHAP DEL PREDIO SELECCIONADO EN EL GRUPO */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Panel Izquierdo (7 cols): Importancia Global SHAP del Grupo de Parcelas */}
                      <div className="lg:col-span-7 bg-[#1e1713] rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-[#e2b957] font-bold block">
                              Importancia SHAP del Grupo de Parcelas (mean |SHAP| en kg/ha)
                            </span>
                            <span className="text-[11px] text-[#c9b7aa]">
                              Variables que tuvieron mayor magnitud de impacto sobre las {batchResult.total_parcelas} parcelas del grupo seleccionado
                            </span>
                          </div>
                        </div>

                        {!batchResult.shap_resumen_grupal || batchResult.shap_resumen_grupal.length === 0 ? (
                          <p className="text-xs text-[#c9b7aa] py-6 text-center">
                            No hay variables SHAP para mostrar en este filtro.
                          </p>
                        ) : (
                          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                            {(() => {
                              const gVars = batchResult.shap_resumen_grupal || []
                              const maxMeanAbs = Math.max(...gVars.map((g) => g.importancia_media_abs_kg_ha), 20)
                              return gVars.map((gv, i) => {
                                const widthPct = Math.min(
                                  100,
                                  Math.max(5, (gv.importancia_media_abs_kg_ha / maxMeanAbs) * 100)
                                )
                                const isImpulsor = gv.impacto_neto_medio_kg_ha >= 0
                                return (
                                  <div
                                    key={gv.variable + i}
                                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#e2b957] font-mono">
                                          #{i + 1}
                                        </span>
                                        <span className="font-mono font-bold text-white text-[11px]">{gv.variable}</span>
                                        <span className="text-[#c9b7aa] text-[11px]">· {gv.etiqueta}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                                          {gv.nodo_qbaf}
                                        </span>
                                        <span className="font-mono font-bold text-[#e2b957] text-xs">
                                          |SHAP|: {gv.importancia_media_abs_kg_ha} kg/ha
                                        </span>
                                        <span
                                          className={`font-mono text-[11px] ${
                                            isImpulsor ? 'text-emerald-400' : 'text-rose-400'
                                          }`}
                                        >
                                          (Neto: {isImpulsor ? '+' : ''}
                                          {gv.impacto_neto_medio_kg_ha} kg/ha)
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="text-[10px] text-white/50 w-36 shrink-0">
                                        Peso grupo: <b className="text-white">{gv.importancia_relativa_pct}%</b> ({gv.frecuencia_parcelas} predios)
                                      </div>
                                      <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                                        <div
                                          style={{ width: `${widthPct}%` }}
                                          className={`h-full rounded-full ${
                                            isImpulsor
                                              ? 'bg-gradient-to-r from-sky-500 to-emerald-400'
                                              : 'bg-gradient-to-r from-[#d87a52] to-amber-400'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Panel Derecho (5 cols): Detalle SHAP Rápido del Predio Seleccionado en la Tabla del Grupo */}
                      <div className="lg:col-span-5 bg-[#1e1713] rounded-2xl border border-white/10 p-5 flex flex-col justify-between shadow-xl">
                        <div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                            <div>
                              <span className="text-xs uppercase tracking-wider text-sky-400 font-bold block">
                                Inspector de Parcela del Grupo
                              </span>
                              <span className="text-[11px] text-[#c9b7aa]">
                                Haz clic en cualquier fila de la tabla inferior para auditar sus variables SHAP
                              </span>
                            </div>
                            {parcelaDetalleGrupo && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleInspeccionarParcelaDeGrupo(parcelaDetalleGrupo)
                                  setSubPestanaAnalista('parametros')
                                }}
                                className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-semibold cursor-pointer transition"
                              >
                                Simular en Vivo →
                              </button>
                            )}
                          </div>

                          {parcelaDetalleGrupo ? (
                            <div className="space-y-3">
                              <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                                <div>
                                  <span className="font-mono font-bold text-base text-white">
                                    {parcelaDetalleGrupo.plot}
                                  </span>
                                  <span className="text-xs text-[#c9b7aa] ml-2">
                                    {parcelaDetalleGrupo.estado} · {parcelaDetalleGrupo.municipio}
                                  </span>
                                  <span className="block text-[10px] text-sky-300 font-mono mt-0.5">
                                    {parcelaDetalleGrupo.grupo_homogeneo}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-black text-[#e2b957]">
                                    {parcelaDetalleGrupo.rendimiento_t_ha.toFixed(3)} <span className="text-xs text-white">t/ha</span>
                                  </div>
                                  <div className="text-[10px] text-[#c9b7aa]">
                                    φ₀={(parcelaDetalleGrupo.base_regional_t_ha ?? 0).toFixed(2)} | ΣSHAP=
                                    {(parcelaDetalleGrupo.suma_shap_kg_ha ?? 0) >= 0 ? '+' : ''}
                                    {parcelaDetalleGrupo.suma_shap_kg_ha} kg/ha
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                                {(parcelaDetalleGrupo.shap_variables || []).slice(0, 8).map((sv, idx) => (
                                  <div
                                    key={sv.variable + idx}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                                  >
                                    <div className="truncate pr-2">
                                      <span className="font-mono font-bold text-white text-[11px]">{sv.variable}</span>
                                      <span className="text-[10px] text-[#c9b7aa] block truncate">{sv.etiqueta}</span>
                                    </div>
                                    <span
                                      className={`font-mono font-bold shrink-0 ${
                                        sv.shap_kg_ha >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                      }`}
                                    >
                                      {sv.shap_kg_ha >= 0 ? '+' : ''}
                                      {sv.shap_kg_ha.toFixed(1)} kg/ha
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-[#c9b7aa] py-10 text-center">
                              Selecciona una parcela de la tabla para inspeccionar su descomposición SHAP.
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-white/10 text-[11px] text-[#c9b7aa] flex items-center justify-between">
                          <span>Doble separación: Estado y Grupos Homogéneos</span>
                          <span className="text-[#e2b957]">QBAF + DF-QuAD</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabla Ejecutiva de Auditoría SHAP + DF-QuAD del Grupo de Parcelas */}
                    <div className="bg-[#1e1713] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-sky-400" />
                          <h4 className="font-bold text-white text-sm">
                            Auditoría SHAP + DF-QuAD por Parcela ({batchResult.total_parcelas} Predios · Clic en fila para inspeccionar SHAP)
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={handleDescargarCsvLote}
                          className="py-2 px-4 rounded-xl bg-[#b85c38] hover:bg-[#c96a45] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          <span>Exportar Auditoría SHAP en CSV</span>
                        </button>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-xs text-[#c9b7aa]">
                          <thead className="bg-black/40 text-[10px] uppercase tracking-wider text-white/70 sticky top-0">
                            <tr>
                              <th className="py-2.5 px-3">ID Predio</th>
                              <th className="py-2.5 px-3">Estado · Municipio</th>
                              <th className="py-2.5 px-3">Grupo Homogéneo QBAF</th>
                              <th className="py-2.5 px-3">Base φ₀</th>
                              <th className="py-2.5 px-3">Σ SHAP (kg/ha)</th>
                              <th className="py-2.5 px-3">Predicción ŷ</th>
                              <th className="py-2.5 px-3">Top Impulsor (+)</th>
                              <th className="py-2.5 px-3">Top Frenador (-)</th>
                              <th className="py-2.5 px-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {batchResult.predicciones.map((p, idx) => {
                              const isSelectedRow = parcelaDetalleGrupo?.plot === p.plot
                              const sumShap = p.suma_shap_kg_ha ?? 0
                              return (
                                <tr
                                  key={p.plot + idx}
                                  onClick={() => handleInspeccionarParcelaDeGrupo(p)}
                                  className={`transition cursor-pointer ${
                                    isSelectedRow ? 'bg-sky-500/15' : 'hover:bg-white/5'
                                  }`}
                                >
                                  <td className="py-2.5 px-3 font-mono font-bold text-white">{p.plot}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="text-white font-medium">{p.estado}</span>
                                    {p.municipio ? ` · ${p.municipio}` : ''}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-sky-300">
                                    {p.grupo_homogeneo || 'General'}
                                    {p.undercutting_activo && (
                                      <span className="ml-1.5 px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px]">
                                        Undercut
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono">{(p.base_regional_t_ha ?? 0).toFixed(3)}</td>
                                  <td
                                    className={`py-2.5 px-3 font-mono font-bold ${
                                      sumShap >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {sumShap >= 0 ? '+' : ''}
                                    {sumShap}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-[#e2b957]">
                                    {p.rendimiento_t_ha.toFixed(3)} t/ha
                                    {p.rendimiento_real_t_ha !== null && p.rendimiento_real_t_ha !== undefined && (
                                      <span className="block text-[10px] text-white/50 font-normal">
                                        Real: {p.rendimiento_real_t_ha.toFixed(2)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-[11px] text-emerald-300 font-mono max-w-[180px] truncate">
                                    {p.top_impulsores || '—'}
                                  </td>
                                  <td className="py-2.5 px-3 text-[11px] text-rose-300 font-mono max-w-[180px] truncate">
                                    {p.top_frenadores || '—'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={(ev) => {
                                        ev.stopPropagation()
                                        handleFocalizarParcelaEnMapa(p.plot)
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold mr-2 cursor-pointer"
                                    >
                                      <MapPin className="w-3 h-3" /> Mapa
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===========================================================================
                PESTAÑA 3: SECCIÓN COMPLETA DE PREDICCIÓN PRÓXIMO AÑO (CAMPAÑA 2026 · 197 PARCELAS)
            =========================================================================== */}
            {subPestanaAnalista === 'campana2026' && (
              <div className="space-y-6">
                {/* 1. Panel de Control y Ejecución de la Predicción 2026 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#1e1713]/95 border border-[#e2b957]/30 space-y-5 shadow-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#e2b957] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Motor de Proyección Agrícola · Ciclo Abril – Octubre 2026
                      </span>
                      <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                        Gestión de Covariables 2026 e Inferencia Completa sobre las 197 Parcelas
                      </h4>
                      <p className="text-xs text-[#c9b7aa] mt-1 leading-relaxed">
                        El reto proporciona el rendimiento de 2025 para <b>138 parcelas de entrenamiento</b> y mantiene ocultas <b>59 parcelas de predicción</b>. Esta sección conserva las <b>variables estáticas fijas (INEGI CEM 4.0 + Geometría WKT)</b> y genera las <b>variables dinámicas 2026</b> (Clima API OpenWeather/Open-Meteo + Satélite GEE Sentinel-2/Landsat) para estimar el rendimiento del próximo año en las 197 parcelas.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          ejecutarPrediccionCampana2026(
                            campana2026Conjunto,
                            campana2026Estado,
                            campana2026Escenario,
                            campana2026DeltaTemp,
                            campana2026DeltaLluvia
                          )
                        }
                        disabled={campana2026Loading}
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#b85c38] to-[#c96a45] hover:from-[#c96a45] hover:to-[#d87a52] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${campana2026Loading ? 'animate-spin' : ''}`} />
                        <span>{campana2026Loading ? 'Calculando Campaña 2026...' : 'Ejecutar Predicción Completa 2026'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDescargarCsvCampana2026}
                        disabled={!campana2026Data}
                        className="py-2.5 px-4 rounded-xl bg-sky-600/80 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exportar CSV 2026 ({campana2026Data?.total_parcelas ?? 197} Predios)</span>
                      </button>
                    </div>
                  </div>

                  {/* Controles de Alcance, Estado y Escenario Climático/Satelital 2026 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Selector de Universo de Parcelas */}
                    <label className="flex flex-col gap-1.5 text-xs text-[#c9b7aa]">
                      <span className="font-semibold text-white">1. Universo de Parcelas a Predecir:</span>
                      <select
                        value={campana2026Conjunto}
                        onChange={(e) => {
                          const val = e.target.value as 'TODOS' | 'PREDICCION' | 'ENTRENAMIENTO'
                          ejecutarPrediccionCampana2026(val, campana2026Estado, campana2026Escenario, campana2026DeltaTemp, campana2026DeltaLluvia)
                        }}
                        className="h-10 rounded-xl border border-white/15 bg-[#291e17] px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                      >
                        <option value="TODOS">Universo Total: 197 Parcelas (138 Train + 59 Test)</option>
                        <option value="PREDICCION">Solo 59 Parcelas Ocultas (Conjunto PREDICCIÓN)</option>
                        <option value="ENTRENAMIENTO">Solo 138 Parcelas con Cosecha 2025 (ENTRENAMIENTO)</option>
                      </select>
                    </label>

                    {/* Selector de Estado */}
                    <label className="flex flex-col gap-1.5 text-xs text-[#c9b7aa]">
                      <span className="font-semibold text-white">2. Filtrar por Entidad Federativa:</span>
                      <select
                        value={campana2026Estado}
                        onChange={(e) => {
                          const val = e.target.value
                          ejecutarPrediccionCampana2026(campana2026Conjunto, val, campana2026Escenario, campana2026DeltaTemp, campana2026DeltaLluvia)
                        }}
                        className="h-10 rounded-xl border border-white/15 bg-[#291e17] px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                      >
                        <option value="todos">Todos los Estados (Hidalgo, Puebla, Tlaxcala)</option>
                        <option value="Puebla">Puebla · Chignahuapan (100 parcelas)</option>
                        <option value="Hidalgo">Hidalgo · Valle de Apan / Singuilucan (51 parcelas)</option>
                        <option value="Tlaxcala">Tlaxcala · Calpulalpan / Nanacamilpa (46 parcelas)</option>
                      </select>
                    </label>

                    {/* Selector de Escenario Agroclimático 2026 */}
                    <label className="flex flex-col gap-1.5 text-xs text-[#c9b7aa]">
                      <span className="font-semibold text-white">3. Escenario Climático y Satelital 2026:</span>
                      <select
                        value={campana2026Escenario}
                        onChange={(e) => {
                          const esc = e.target.value as 'base_api' | 'humedo_favorable' | 'sequia_calor' | 'helada_abril'
                          const dT = esc === 'humedo_favorable' ? -0.3 : esc === 'sequia_calor' ? 1.1 : esc === 'helada_abril' ? -1.2 : 0
                          const dL = esc === 'humedo_favorable' ? 15 : esc === 'sequia_calor' ? -18 : esc === 'helada_abril' ? -5 : 0
                          ejecutarPrediccionCampana2026(campana2026Conjunto, campana2026Estado, esc, dT, dL)
                        }}
                        className="h-10 rounded-xl border border-white/15 bg-[#291e17] px-3 text-xs text-white outline-none focus:border-[#e2b957]"
                      >
                        <option value="base_api">Pronóstico Oficial API 2026 (OpenWeather / Open-Meteo + INEGI)</option>
                        <option value="humedo_favorable">Escenario Húmedo Favorable (+15% lluvia / confort térmico)</option>
                        <option value="sequia_calor">Escenario Sequía Moderada y Calor (+1.1°C / -18% lluvia)</option>
                        <option value="helada_abril">Escenario Helada Tardía en Abril (-1.2°C Tmin Abril)</option>
                      </select>
                    </label>
                  </div>

                  {/* Controles Finos de Perturbación Climática 2026 */}
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#c9b7aa] font-medium">Ajuste Térmico Campaña 2026 (ΔT °C):</span>
                        <span className="font-mono font-bold text-amber-300">
                          {campana2026DeltaTemp >= 0 ? '+' : ''}
                          {campana2026DeltaTemp.toFixed(1)} °C
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-1.5"
                        max="1.5"
                        step="0.1"
                        value={campana2026DeltaTemp}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          setCampana2026DeltaTemp(val)
                        }}
                        onMouseUp={() =>
                          ejecutarPrediccionCampana2026(
                            campana2026Conjunto,
                            campana2026Estado,
                            campana2026Escenario,
                            campana2026DeltaTemp,
                            campana2026DeltaLluvia
                          )
                        }
                        className="w-full accent-[#e2b957] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#c9b7aa] font-medium">Ajuste Precipitación / Humedad S2 2026 (Δ%):</span>
                        <span className="font-mono font-bold text-sky-300">
                          {campana2026DeltaLluvia >= 0 ? '+' : ''}
                          {campana2026DeltaLluvia}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-25"
                        max="25"
                        step="1"
                        value={campana2026DeltaLluvia}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          setCampana2026DeltaLluvia(val)
                        }}
                        onMouseUp={() =>
                          ejecutarPrediccionCampana2026(
                            campana2026Conjunto,
                            campana2026Estado,
                            campana2026Escenario,
                            campana2026DeltaTemp,
                            campana2026DeltaLluvia
                          )
                        }
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Spinner o Error */}
                {campana2026Loading && (
                  <div className="p-8 rounded-2xl bg-[#1e1713]/80 border border-white/10 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#e2b957] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-white">
                      Generando covariables 2026 y evaluando el Árbitro QBAF + DF-QuAD + SHAP...
                    </span>
                  </div>
                )}

                {campana2026Error && (
                  <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <div>
                      <b>Error:</b> {campana2026Error}
                    </div>
                  </div>
                )}

                {/* Resultados Completos de la Campaña 2026 */}
                {campana2026Data && !campana2026Loading && (
                  <div className="space-y-6">
                    {/* 2. KPIs Globales 2026 vs 2025 */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div className="bg-[#1e1713] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#c9b7aa] uppercase tracking-wider block">Parcelas Evaluadas (2026)</span>
                        <div className="text-2xl font-black text-white mt-1">{campana2026Data.total_parcelas}</div>
                        <span className="text-[10px] text-sky-300">
                          {campana2026Data.parcelas_entrenamiento_con_2025} Entrenamiento · {campana2026Data.parcelas_prediccion_ciegas} Predicción Ciega
                        </span>
                      </div>

                      <div className="bg-[#1e1713] p-4 rounded-2xl border border-[#e2b957]/30">
                        <span className="text-xs text-[#c9b7aa] uppercase tracking-wider block">Rendimiento Medio 2026</span>
                        <div className="text-2xl font-black text-[#e2b957] mt-1">
                          {campana2026Data.rendimiento_2026_medio_t_ha}{' '}
                          <span className="text-sm font-normal text-white">t/ha</span>
                        </div>
                        <span className="text-[10px] text-[#c9b7aa]">
                          Base 2025: {campana2026Data.rendimiento_2025_medio_t_ha} t/ha (
                          <b className={campana2026Data.cambio_medio_2026_vs_2025_kg_ha >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {campana2026Data.cambio_medio_2026_vs_2025_kg_ha >= 0 ? '+' : ''}
                            {campana2026Data.cambio_medio_2026_vs_2025_kg_ha} kg/ha
                          </b>
                          )
                        </span>
                      </div>

                      <div className="bg-[#1e1713] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#c9b7aa] uppercase tracking-wider block">Cosecha Total Proyectada 2026</span>
                        <div className="text-2xl font-black text-white mt-1">
                          {Number(campana2026Data.produccion_total_2026_t).toLocaleString('es-MX')}{' '}
                          <span className="text-sm font-normal text-[#e2b957]">t</span>
                        </div>
                        <span className="text-[10px] text-white/50">Volumen estimado ciclo Abr–Oct 2026</span>
                      </div>

                      <div className="bg-[#1e1713] p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-[#c9b7aa] uppercase tracking-wider block">Distribución Potencial 2026</span>
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                          <span className="text-emerald-400">{campana2026Data.conteo_alto} Alto</span>
                          <span className="text-white/30">·</span>
                          <span className="text-amber-400">{campana2026Data.conteo_medio} Medio</span>
                          <span className="text-white/30">·</span>
                          <span className="text-rose-400">{campana2026Data.conteo_bajo} Bajo</span>
                        </div>
                        <span className="text-[10px] text-white/50">Deliberación QBAF + DF-QuAD</span>
                      </div>
                    </div>

                    {/* 3. Comparativa Estatal 2025 vs 2026 */}
                    {campana2026Data.resumen_estatal_2026 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(campana2026Data.resumen_estatal_2026).map(([estName, st]: [string, any]) => (
                          <div key={estName} className="p-4 rounded-2xl bg-[#1e1713] border border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-sm">{estName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#e2b957] font-semibold">
                                {st.n_parcelas} parcelas
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                              <div className="p-2 rounded-lg bg-white/5">
                                <span className="text-[10px] text-[#c9b7aa] block">Media 2025</span>
                                <b className="text-white font-mono">{st.rend_2025_medio} t/ha</b>
                              </div>
                              <div className="p-2 rounded-lg bg-[#e2b957]/10 border border-[#e2b957]/20">
                                <span className="text-[10px] text-[#e2b957] block">Proy. 2026</span>
                                <b className="text-[#e2b957] font-mono">{st.rend_2026_medio} t/ha</b>
                              </div>
                              <div className="p-2 rounded-lg bg-white/5">
                                <span className="text-[10px] text-[#c9b7aa] block">Cambio</span>
                                <b className={`font-mono ${st.cambio_kg_ha >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {st.cambio_kg_ha >= 0 ? '+' : ''}
                                  {st.cambio_kg_ha} kg
                                </b>
                              </div>
                            </div>
                            <div className="text-[11px] text-[#c9b7aa] pt-1 flex items-center justify-between border-t border-white/5">
                              <span>Producción estatal 2026:</span>
                              <b className="text-white">{Number(st.prod_total_2026_t).toLocaleString('es-MX')} t</b>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 4. Arquitectura Técnica de Datos 2026: Variables Estáticas Fijas vs. Dinámicas Creadas */}
                    <div className="p-5 rounded-2xl bg-[#1e1713] border border-sky-500/30 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Satellite className="w-4 h-4 text-sky-400" />
                          <h5 className="text-sm font-bold text-white">
                            Arquitectura de Ingesta 2026 (Auditoría de Variables Fijas INEGI vs. Covariables Dinámicas Creadas)
                          </h5>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                          backend/scripts/generar_covariables_2026.py
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                        {/* Bloque 1: Estáticas */}
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <b className="text-[#e2b957] uppercase tracking-wider text-[11px]">1. Variables Estáticas (Fijas)</b>
                            <span className="text-[10px] text-white/60">INEGI CEM 4.0 + WKT</span>
                          </div>
                          <p className="text-[11px] text-[#c9b7aa]">
                            Permanecen constantes entre campañas agrícolas (extraídas de <code className="text-white">Reto_AgroCebada_Topografia_INEGI_CEM4.zip</code> y <code className="text-white">parcelas.csv</code>):
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(campana2026Data.estrategia_datos_2026?.variables_estaticas_fijas?.columnas || []).map((c: string) => (
                              <span key={c} className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bloque 2: Dinámicas Clima 2026 */}
                        <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <b className="text-amber-300 uppercase tracking-wider text-[11px]">2. Clima Dinámico 2026 (Opción 1)</b>
                            <span className="text-[10px] text-amber-200/80">OpenWeather / Open-Meteo + INEGI</span>
                          </div>
                          <p className="text-[11px] text-[#c9b7aa]">
                            Pronóstico por coordenadas municipales anclado a la normal INEGI/CHIRTS con downscaling adiabático CEM 4.0 (<code className="text-white">-0.0065 °C/m</code>):
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(campana2026Data.estrategia_datos_2026?.variables_dinamicas_clima_2026?.columnas || []).map((c: string) => (
                              <span key={c} className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-200 font-mono text-[10px]">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bloque 3: Dinámicas Satélite 2026 */}
                        <div className="p-3.5 rounded-xl bg-sky-500/[0.05] border border-sky-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <b className="text-sky-300 uppercase tracking-wider text-[11px]">3. Satélite Dinámico 2026 (Opción A)</b>
                            <span className="text-[10px] text-sky-200/80">GEE Sentinel-2 + Landsat</span>
                          </div>
                          <p className="text-[11px] text-[#c9b7aa]">
                            Conector Google Earth Engine (<code className="text-white">COPERNICUS/S2_SR_HARMONIZED</code>) y transferencia espectral acoplada al balance termo-hídrico 2026:
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(campana2026Data.estrategia_datos_2026?.variables_dinamicas_satelite_2026?.columnas || []).slice(0, 14).map((c: string) => (
                              <span key={c} className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-200 font-mono text-[10px]">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Panel Dual: Importancia SHAP Grupal 2026 + Inspector Individual 2026 */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Izquierda (6 cols): Ranking SHAP Grupal 2026 */}
                      <div className="lg:col-span-6 bg-[#1e1713] rounded-2xl border border-white/10 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-[#e2b957] font-bold block">
                              Importancia SHAP en la Campaña 2026 (mean |SHAP|)
                            </span>
                            <span className="text-[11px] text-[#c9b7aa]">
                              Variables que dominan la proyección 2026 en los {campana2026Data.total_parcelas} predios
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                          {(campana2026Data.shap_resumen_grupal_2026 || []).slice(0, 10).map((gv: ShapGroupVariableSummary, i: number) => {
                            const maxAbs = Math.max(
                              ...(campana2026Data.shap_resumen_grupal_2026 || []).map((x: any) => x.importancia_media_abs_kg_ha),
                              20
                            )
                            const pct = Math.min(100, Math.max(6, (gv.importancia_media_abs_kg_ha / maxAbs) * 100))
                            const pos = gv.impacto_neto_medio_kg_ha >= 0
                            return (
                              <div key={gv.variable + i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="truncate pr-2">
                                    <span className="font-mono font-bold text-[#e2b957] mr-1.5">#{i + 1}</span>
                                    <span className="font-mono font-bold text-white">{gv.variable}</span>
                                    <span className="text-[#c9b7aa] text-[11px]"> · {gv.etiqueta}</span>
                                  </div>
                                  <span className="font-mono font-bold text-white shrink-0">
                                    {gv.importancia_media_abs_kg_ha} kg/ha
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${pct}%` }}
                                      className={`h-full rounded-full ${pos ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                    />
                                  </div>
                                  <span className={`font-mono text-[10px] w-24 text-right ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    Neto: {pos ? '+' : ''}
                                    {gv.impacto_neto_medio_kg_ha} kg
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Derecha (6 cols): Inspector de Parcela 2026 (Fijas vs Dinámicas + SHAP) */}
                      <div className="lg:col-span-6 bg-[#1e1713] rounded-2xl border border-white/10 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-sky-400 font-bold block">
                              Inspector de Parcela Campaña 2026
                            </span>
                            <span className="text-[11px] text-[#c9b7aa]">
                              Haz clic en cualquier parcela de la tabla inferior para auditar sus datos 2026
                            </span>
                          </div>
                          {parcelaDetalle2026 && (
                            <button
                              type="button"
                              onClick={() => handleFocalizarParcelaEnMapa(parcelaDetalle2026.ID_POLIGONO)}
                              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-semibold cursor-pointer"
                            >
                              Ver en Mapa →
                            </button>
                          )}
                        </div>

                        {parcelaDetalle2026 ? (
                          <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-bold text-base text-white">
                                  {parcelaDetalle2026.ID_POLIGONO}
                                </span>
                                <span className="text-xs text-[#c9b7aa] ml-2">
                                  {parcelaDetalle2026.Estado} · {parcelaDetalle2026.Municipio} ({parcelaDetalle2026.AREA_HA} ha)
                                </span>
                                <span className="block text-[10px] text-sky-300 font-mono mt-0.5">
                                  Conjunto Reto: {parcelaDetalle2026.CONJUNTO_RETO} ·{' '}
                                  {parcelaDetalle2026.RENDIMIENTO_2025_REAL_T_HA !== null
                                    ? `Real 2025: ${parcelaDetalle2026.RENDIMIENTO_2025_REAL_T_HA} t/ha`
                                    : 'Real 2025: Oculto (Test Ciego)'}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-black text-[#e2b957]">
                                  {Number(parcelaDetalle2026.RENDIMIENTO_2026_PROYECTADO_T_HA).toFixed(3)}{' '}
                                  <span className="text-xs text-white">t/ha</span>
                                </div>
                                <div className="text-[10px] text-[#c9b7aa] font-mono">
                                  Mod 2025: {Number(parcelaDetalle2026.RENDIMIENTO_2025_MODELO_T_HA).toFixed(3)} (
                                  {parcelaDetalle2026.CAMBIO_2026_VS_2025_KG_HA >= 0 ? '+' : ''}
                                  {parcelaDetalle2026.CAMBIO_2026_VS_2025_KG_HA} kg/ha)
                                </div>
                              </div>
                            </div>

                            {/* Mini comparativa Fijas vs Dinámicas de la parcela seleccionada */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-[9px] text-[#e2b957] uppercase block">Fijo · Altitud / Pend</span>
                                <b className="text-white font-mono">
                                  {parcelaDetalle2026.elevacion_msnm_fija}m / {parcelaDetalle2026.pendiente_grados_fija}°
                                </b>
                              </div>
                              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-[9px] text-amber-300 uppercase block">2026 · ΔAbr / Tmean</span>
                                <b className="text-white font-mono">
                                  {parcelaDetalle2026.anom_tmin_abril_2026_c}° / {parcelaDetalle2026.tmean_pv_2026_c}°C
                                </b>
                              </div>
                              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-[9px] text-sky-300 uppercase block">2026 · S2 NDWI / Lluvia</span>
                                <b className="text-white font-mono">
                                  {parcelaDetalle2026.s2_ndwi_mean_2026} / {parcelaDetalle2026.lluvia_proyectada_pv_2026_mm}mm
                                </b>
                              </div>
                              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-[9px] text-emerald-300 uppercase block">2026 · NDVI / LAI</span>
                                <b className="text-white font-mono">
                                  {parcelaDetalle2026.planet_ndvi_mean_2026} / {parcelaDetalle2026.planet_lai_mean_2026}
                                </b>
                              </div>
                            </div>

                            {/* Barras SHAP 2026 de la parcela */}
                            <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                              {(parcelaDetalle2026.shap_variables || []).slice(0, 6).map((sv: ShapVariableContribution, idx: number) => (
                                <div
                                  key={sv.variable + idx}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                                >
                                  <div className="truncate pr-2">
                                    <span className="font-mono font-bold text-white text-[11px]">{sv.variable}</span>
                                    <span className="text-[10px] text-[#c9b7aa] ml-1.5">{sv.etiqueta}</span>
                                  </div>
                                  <span
                                    className={`font-mono font-bold shrink-0 ${
                                      sv.shap_kg_ha >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {sv.shap_kg_ha >= 0 ? '+' : ''}
                                    {sv.shap_kg_ha.toFixed(1)} kg/ha
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* 6. Tabla Completa de las 197 Parcelas (Campaña 2026) */}
                    <div className="bg-[#1e1713] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-[#e2b957]" />
                          <h4 className="font-bold text-white text-sm">
                            Matriz de Predicciones Campaña 2026 ({campana2026Data.total_parcelas} Parcelas · Datos Fijos INEGI + Dinámicos 2026 + SHAP)
                          </h4>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-xs text-[#c9b7aa]">
                          <thead className="bg-black/40 text-[10px] uppercase tracking-wider text-white/70 sticky top-0">
                            <tr>
                              <th className="py-2.5 px-3">ID Predio</th>
                              <th className="py-2.5 px-3">Estado · Municipio</th>
                              <th className="py-2.5 px-3">Conjunto Reto</th>
                              <th className="py-2.5 px-3">Fijo INEGI (Alt / Pend)</th>
                              <th className="py-2.5 px-3">Dinámico 2026 (Lluvia / NDWI)</th>
                              <th className="py-2.5 px-3">Real 2025</th>
                              <th className="py-2.5 px-3">Proyección 2026</th>
                              <th className="py-2.5 px-3">Δ 26 vs 25</th>
                              <th className="py-2.5 px-3">Top Impulsor SHAP 2026</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {(campana2026Data.predicciones_2026 || []).map((r: any, idx: number) => {
                              const isSel = parcelaDetalle2026?.ID_POLIGONO === r.ID_POLIGONO
                              const diffKg = Number(r.CAMBIO_2026_VS_2025_KG_HA || 0)
                              return (
                                <tr
                                  key={r.ID_POLIGONO + idx}
                                  onClick={() => setParcelaDetalle2026(r)}
                                  className={`transition cursor-pointer ${isSel ? 'bg-[#e2b957]/15' : 'hover:bg-white/5'}`}
                                >
                                  <td className="py-2.5 px-3 font-mono font-bold text-white">{r.ID_POLIGONO}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="text-white font-medium">{r.Estado}</span> · {r.Municipio}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        r.CONJUNTO_RETO === 'PREDICCION'
                                          ? 'bg-sky-500/20 text-sky-300'
                                          : 'bg-white/10 text-[#e2b957]'
                                      }`}
                                    >
                                      {r.CONJUNTO_RETO}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px]">
                                    {r.elevacion_msnm_fija}m · {r.pendiente_grados_fija}° ({r.AREA_HA} ha)
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-sky-300">
                                    {r.lluvia_proyectada_pv_2026_mm}mm · NDWI {r.s2_ndwi_mean_2026}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono">
                                    {r.RENDIMIENTO_2025_REAL_T_HA !== null && r.RENDIMIENTO_2025_REAL_T_HA !== undefined
                                      ? `${Number(r.RENDIMIENTO_2025_REAL_T_HA).toFixed(2)} t/ha`
                                      : 'Oculto (59)'}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-[#e2b957]">
                                    {Number(r.RENDIMIENTO_2026_PROYECTADO_T_HA).toFixed(3)} t/ha
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 font-mono font-bold ${
                                      diffKg >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {diffKg >= 0 ? '+' : ''}
                                    {diffKg} kg/ha
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-300 max-w-[200px] truncate">
                                    {r.top_impulsores_shap_2026}
                                  </td>
                                </tr>
                              )
                            })}
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
