'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  Layers,
  MapPin,
  Mountain,
  Satellite,
  ShieldCheck,
  Wheat,
  Zap,
} from 'lucide-react'

// =========================================================================
// 1. HERO SECTION
// =========================================================================
export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
      {/* Luces y texturas ambientales en tonos tierra cálida */}
      <div className="pointer-events-none absolute -right-32 top-10 size-[520px] rounded-full bg-[#b85c38]/18 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 top-40 size-[480px] rounded-full bg-[#d87a52]/12 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-[400px] rounded-full bg-[#e2b957]/10 blur-[90px]" />

      {/* Textura sutil de curvas topográficas / surcos agrícolas */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#d87a52 1px, transparent 1px), radial-gradient(#e2b957 1px, #1b1410 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Gran Titular Editorial */}
          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            De la órbita satelital al{' '}
            <span className="bg-gradient-to-r from-[#e2b957] via-[#d87a52] to-[#b85c38] bg-clip-text text-transparent">
              surco de malta.
            </span>
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[#dcd2c9] sm:text-lg">
            Estimamos con rigor científico el rendimiento de cebada maltera en el Altiplano Central fusionando telemetría de <strong className="text-white font-medium">PlanetScope (3m)</strong>, <strong className="text-white font-medium">Sentinel-2</strong>, <strong className="text-white font-medium">Landsat</strong> y topografía <strong className="text-white font-medium">INEGI CEM 4.0</strong>. Del espacio a la tolva del productor.
          </p>

          {/* Acciones principales (CTAs) */}
          <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
            <Link
              href="/mapa#asistente-modelo"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#b85c38] to-[#c96a45] px-7 text-sm font-semibold text-white shadow-xl shadow-[#b85c38]/25 transition hover:scale-[1.02] hover:from-[#c96a45] hover:to-[#d87a52] active:scale-[0.99]"
            >
              <span>Probar el modelo en vivo</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/mapa"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#6b5343] bg-[#271d17]/80 px-7 text-sm font-semibold text-[#f0ded3] shadow-sm backdrop-blur-md transition hover:border-[#96745d] hover:bg-[#34271f] hover:text-white"
            >
              <Compass className="size-4 text-[#d87a52]" />
              <span>Explorar mapa de parcelas</span>
            </Link>
            <Link
              href="/nosotros"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-transparent px-5 text-sm font-medium text-[#c9b7aa] transition hover:text-white"
            >
              <span>Metodología científica</span>
              <ChevronRight className="size-4 text-[#d87a52]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 2. LA TRÍADA TECNOLÓGICA
// =========================================================================
export function TriadaSection() {
  return (
    <section className="relative bg-[#221913] py-20 border-y border-[#3d2e24] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">
            <Layers className="size-4" /> La Tríada Tecnológica
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Tres dimensiones de datos para entender cada hectárea.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#c7b4a6]">
            Una sola ecuación lineal no puede explicar la diversidad del Altiplano. AgroRaíces cruza la física satelital con la topografía de cuenca y algoritmos de Machine Learning especializados.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {/* Capa 1 */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-xl transition hover:border-[#b85c38]/70 hover:shadow-2xl">
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[#b85c38]/10 blur-2xl" />
            <div>
              <div className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52] ring-1 ring-[#5a4130]">
                <Satellite className="size-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Capa 01 · Orbital</span>
              <h3 className="mt-2 text-xl font-bold text-white">Constelación Satelital Tri-Sensor</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Monitoreo continuo de 107,666 registros satelitales (2022–2025). Filtramos al 30% de nubosidad para evitar falsas depresiones en el vigor y medimos la dinámica de floración.
              </p>
              <div className="mt-6 space-y-2.5 border-t border-[#3a2c22] pt-6 text-xs text-[#dcd2c9]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">PlanetScope (3m):</span>
                  <b className="text-white font-medium">Área foliar (LAI) & MSAVI</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Sentinel-2 (10m):</span>
                  <b className="text-white font-medium">Humedad NDWI & Clorofila MRA</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Landsat (30m):</span>
                  <b className="text-white font-medium">Banda Térmica VI6T</b>
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Captura del estrés hídrico y confort del cultivo
            </div>
          </div>

          {/* Capa 2 */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-xl transition hover:border-[#e2b957]/70 hover:shadow-2xl">
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[#e2b957]/10 blur-2xl" />
            <div>
              <div className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-[#2e2017] text-[#e2b957] ring-1 ring-[#5a4130]">
                <Mountain className="size-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e2b957]">Capa 02 · Fisiografía</span>
              <h3 className="mt-2 text-xl font-bold text-white">Topografía INEGI & CHIRTS-ERA5</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Descendemos a las microcuencas mediante el Continuo de Elevaciones Mexicano CEM 4.0. Aplicamos corrección adiabática térmica por altitud (Γ = -0.0065°C/m) para discriminar laderas frías de fondos de valle fértiles.
              </p>
              <div className="mt-6 space-y-2.5 border-t border-[#3a2c22] pt-6 text-xs text-[#dcd2c9]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Relieve CEM 4.0:</span>
                  <b className="text-white font-medium">Altitud msnm & Pendiente en grados</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">CHIRTS-ERA5:</span>
                  <b className="text-white font-medium">Cubo térmico de 96 GeoTIFFs</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Riesgo Helada:</span>
                  <b className="text-white font-medium">Diferencial dosel-aire en antesis</b>
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Microclima local y retención edáfica
            </div>
          </div>

          {/* Capa 3 */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-xl transition hover:border-[#b85c38]/70 hover:shadow-2xl">
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[#d87a52]/10 blur-2xl" />
            <div>
              <div className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52] ring-1 ring-[#5a4130]">
                <Cpu className="size-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Capa 03 · Inteligencia</span>
              <h3 className="mt-2 text-xl font-bold text-white">Especialistas Desacoplados</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Tres motores de Machine Learning calibrados de forma independiente para Puebla, Hidalgo y Tlaxcala. Cada estado procesa las covariables que verdaderamente determinan su cosecha.
              </p>
              <div className="mt-6 space-y-2.5 border-t border-[#3a2c22] pt-6 text-xs text-[#dcd2c9]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Hidalgo (r = 0.915):</span>
                  <b className="text-white font-medium">ExtraTrees 75% + SVR Bayes</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Puebla (r = 0.441):</span>
                  <b className="text-white font-medium">Dual Base + PLS (k=2)</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Tlaxcala (r = 0.382):</span>
                  <b className="text-white font-medium">SVC Ordinal + Mediana 3.0 t/ha</b>
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Inferencia adaptada al régimen regional
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 3. LAS TRES CUENCAS DE LA CEBADA MALTERA
// =========================================================================
export function CuencasSection() {
  return (
    <section className="relative bg-[#221913] py-20 border-t border-[#3d2e24] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">
            <Compass className="size-4" /> Geografía y Vocación Productiva
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Las 3 cuencas cebaderas del Altiplano Central
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#c7b4a6] sm:text-base">
            Cada estado presenta un comportamiento fisiológico único. Conoce cómo se adaptan nuestros modelos a la realidad edáfica y climática de cada territorio.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Puebla */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition hover:border-[#b85c38] hover:bg-[#251b15]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Cuenca 01</span>
              <span className="rounded-full bg-[#2e2017] px-2.5 py-0.5 text-xs font-semibold text-[#e2b957]">
                71 parcelas
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-white">Puebla</h3>
            <p className="text-xs text-[#d87a52] font-semibold mt-0.5">Sierra Norte · Chignahuapan</p>

            <div className="my-5 rounded-2xl bg-[#251a14] p-4 text-center">
              <span className="text-xs text-[#9e8b7d]">Rendimiento promedio real:</span>
              <div className="text-3xl font-extrabold text-[#e2b957] mt-1">4.48 t/ha</div>
              <span className="text-[11px] text-[#b8a293]">Altitud media: 2,260 msnm</span>
            </div>

            <p className="text-xs leading-relaxed text-[#c2aba0]">
              Suelos andosoles de ladera volcánica con excelente captación pluvial. La reflectancia del rastrojo en pre-siembra (STI) y la rugosidad topográfica son factores clave para estabilizar la inferencia contra la saturación foliar.
            </p>

            <div className="mt-6 pt-5 border-t border-[#3d2e24] text-xs text-[#9e8b7d] flex items-center justify-between">
              <span>Ensamble:</span>
              <b className="text-white">Dual Base + PLS (k=2)</b>
            </div>
          </div>

          {/* Hidalgo */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition hover:border-[#b85c38] hover:bg-[#251b15]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Cuenca 02</span>
              <span className="rounded-full bg-[#2e2017] px-2.5 py-0.5 text-xs font-semibold text-[#e2b957]">
                36 parcelas
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-white">Hidalgo</h3>
            <p className="text-xs text-[#d87a52] font-semibold mt-0.5">Cuna Histórica · Valle de Apan</p>

            <div className="my-5 rounded-2xl bg-[#251a14] p-4 text-center">
              <span className="text-xs text-[#9e8b7d]">Rendimiento promedio real:</span>
              <div className="text-3xl font-extrabold text-[#e2b957] mt-1">3.76 t/ha</div>
              <span className="text-[11px] text-[#b8a293]">Altitud media: 2,510 msnm</span>
            </div>

            <p className="text-xs leading-relaxed text-[#c2aba0]">
              Contraste marcado entre valles templados fértiles (Almoloya: 4.52 t/ha) y zonas de temporal seco (Singuilucan: 3.08 t/ha). El modelo integra prior bayesiano municipal y absorción de clorofila red-edge MRA para máxima precisión (r = 0.915).
            </p>

            <div className="mt-6 pt-5 border-t border-[#3d2e24] text-xs text-[#9e8b7d] flex items-center justify-between">
              <span>Ensamble:</span>
              <b className="text-white">ExtraTrees (75%) + SVR RBF (25%)</b>
            </div>
          </div>

          {/* Tlaxcala */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition hover:border-[#b85c38] hover:bg-[#251b15]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Cuenca 03</span>
              <span className="rounded-full bg-[#2e2017] px-2.5 py-0.5 text-xs font-semibold text-[#e2b957]">
                31 parcelas
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-white">Tlaxcala</h3>
            <p className="text-xs text-[#d87a52] font-semibold mt-0.5">Llanuras de Altura · Calpulalpan</p>

            <div className="my-5 rounded-2xl bg-[#251a14] p-4 text-center">
              <span className="text-xs text-[#9e8b7d]">Rendimiento promedio real:</span>
              <div className="text-3xl font-extrabold text-[#e2b957] mt-1">2.98 t/ha</div>
              <span className="text-[11px] text-[#b8a293]">Altitud media: 2,610 msnm</span>
            </div>

            <p className="text-xs leading-relaxed text-[#c2aba0]">
              Meseta agrícola con régimen de temporal expuesto a heladas reproductivas. El modelo emplea un clasificador ordinal probabilístico SVC ponderado con la mediana regional robusta de 3.00 t/ha para proteger la predicción de ruidos estacionales.
            </p>

            <div className="mt-6 pt-5 border-t border-[#3d2e24] text-xs text-[#9e8b7d] flex items-center justify-between">
              <span>Ensamble:</span>
              <b className="text-white">SVC Ordinal (45%) + Mediana (55%)</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 4. COMPARATIVA: MÉTODO TRADICIONAL VS AGRORAÍCES
// =========================================================================
export function ComparativaSection() {
  return (
    <section className="relative bg-[#1a130f] py-20 border-t border-[#3d2e24] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">
            <ShieldCheck className="size-4" /> Ventaja Tecnológica
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            ¿Por qué el método tradicional falla en cebada?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c7b4a6]">
            Comparación directa entre la estimación empírica convencional y la plataforma científica de AgroRaíces.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tradicional */}
          <div className="rounded-3xl border border-rose-900/40 bg-[#241716] p-7 sm:p-9">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <span>❌</span> Estimación Convencional
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">Regresión Lineal Simple o Muestreo Tardío</h3>
            <ul className="mt-6 space-y-4 text-xs text-[#e8c6c4]">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Fórmula única para todo el país:</strong> Ignora si el predio está en ladera volcánica o en valle aluvial.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Margen de error elevado:</strong> Desviaciones habituales superiores a ±1.2 t/ha, inutilizables para fijar contratos de acopio.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Ceguera ante heladas en floración:</strong> El NDVI satelital simple no detecta daño en grano cuando el follaje se mantiene verde.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Decisión tardía:</strong> Se conoce el tonelaje hasta la trilla, imposibilitando logística previa de fletes.</span>
              </li>
            </ul>
          </div>

          {/* AgroRaíces */}
          <div className="rounded-3xl border border-[#d87a52]/60 bg-[#291e17] p-7 sm:p-9 shadow-xl ring-1 ring-[#d87a52]/20">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e2b957]">
              <span>✅</span> Pipeline AgroRaíces 2026
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">Especialistas Desacoplados con Downscaling</h3>
            <ul className="mt-6 space-y-4 text-xs text-[#f0ded3]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" />
                <span><strong>Enfoque territorial por cuenca:</strong> Tres motores de Machine Learning calibrados específicamente para Puebla, Hidalgo y Tlaxcala.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" />
                <span><strong>Error acotado científicamente:</strong> MAE nacional de solo 307 kg/ha y R² de 72.8% en validación cruzada OOF estricta.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" />
                <span><strong>Diferencial dosel-aire CHIRTS-ERA5:</strong> Detecta riesgo de helada y estrés por calor en antesis aun con dosel verde.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" />
                <span><strong>Previsión semanas antes de cosecha:</strong> Planificación anticipada de tolvas, liquidaciones y contratos industriales.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 6. SUITE DE HERRAMIENTAS
// =========================================================================
export function SuiteSection() {
  return (
    <section className="relative bg-[#221913] py-20 border-t border-[#3d2e24] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">
            <Wheat className="size-4" /> Plataforma Integral
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Explora la Suite AgroRaíces
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c7b4a6]">
            Diseñada tanto para productores a pie de parcela como para analistas agrícolas e industria cervecera.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Nosotros */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-md transition hover:border-[#b85c38] hover:shadow-xl">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52]">
                <Satellite className="size-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">01 · Arquitectura</span>
              <h3 className="mt-2 text-xl font-bold text-white">Quiénes somos y Modelo</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Conoce la formulación matemática y agronómica detrás del pipeline: integración de bandas satelitales, lapse rate altimétrico y validación cruzada K=3 sin fuga.
              </p>
            </div>
            <Link
              href="/nosotros"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d87a52] transition hover:text-[#f09c78]"
            >
              Ver arquitectura técnica <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Card 2: Modelo en vivo */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#b85c38]/50 bg-gradient-to-b from-[#2a1d16] to-[#1c130e] p-8 text-white shadow-xl transition hover:border-[#d87a52] hover:shadow-2xl">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#3d271c] text-[#e2b957]">
                <Zap className="size-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e2b957]">02 · Inferencia en Vivo</span>
              <h3 className="mt-2 text-xl font-bold text-white">Asistente para Productores</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#d4bead]">
                Ingresa los datos de tu predio paso a paso sin requerir conocimientos en satélites. El sistema sintetiza las variables biofísicas de tu municipio y entrega tu reporte en segundos.
              </p>
            </div>
            <Link
              href="/mapa#asistente-modelo"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#e2b957] transition hover:text-white"
            >
              Usar el asistente <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Card 3: Mapa interactivo */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-md transition hover:border-[#b85c38] hover:shadow-xl">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52]">
                <MapPin className="size-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">03 · Georreferencia</span>
              <h3 className="mt-2 text-xl font-bold text-white">Mapa de Parcelas e INEGI</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Explora los 197 polígonos del reto georreferenciados con Leaflet en mapa satelital Esri. Filtra por estado, pendiente y altitud, y consulta la telemetría individual de cada lote.
              </p>
            </div>
            <Link
              href="/mapa"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d87a52] transition hover:text-[#f09c78]"
            >
              Explorar mapa interactivo <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 7. CIERRE & LLAMADO A LA ACCIÓN
// =========================================================================
export function CierreSection() {
  return (
    <section className="relative overflow-hidden bg-[#18110d] py-20 border-t border-[#3d2e24]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#b85c38]/15 via-transparent to-[#e2b957]/10" />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-6 lg:px-8">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#2e2017] text-[#e2b957] mb-6">
          <Wheat className="size-7" />
        </div>
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          La cebada maltera del mañana se cultiva con precisión hoy.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#c7b4a6] sm:text-base">
          Accede al visor de mapas interactivo, consulta la estimación de tu parcela o prueba los especialistas de Puebla, Hidalgo y Tlaxcala.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
          <Link
            href="/mapa"
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#b85c38] to-[#c96a45] px-8 text-sm font-semibold text-white shadow-xl shadow-[#b85c38]/25 transition hover:scale-[1.02] hover:from-[#c96a45] hover:to-[#d87a52]"
          >
            <span>Abrir Mapa Geoespacial</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/mapa#asistente-modelo"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#6b5343] bg-[#271d17] px-7 text-sm font-semibold text-[#f0ded3] transition hover:border-[#96745d] hover:bg-[#34271f]"
          >
            <Zap className="size-4 text-[#e2b957]" />
            <span>Usar Modelo Predictivo</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
