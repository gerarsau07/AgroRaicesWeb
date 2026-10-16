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
  Sparkles,
  Wheat,
  XCircle,
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
          {/* Badge de Nueva Arquitectura */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d87a52]/40 bg-[#271d17]/90 px-4 py-1.5 text-xs font-semibold text-[#f0ded3] shadow-lg">
            <Sparkles className="size-3.5 text-[#e2b957]" />
            <span>Arquitectura QBAF + DF-QuAD · Explicabilidad SHAP · IA Google Gemini</span>
          </div>

          {/* Gran Titular Editorial */}
          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Lee el campo
            <span className="block bg-gradient-to-r from-[#e2b957] via-[#d87a52] to-[#b85c38] bg-clip-text text-transparent">
              Anticipa la cosecha
            </span>
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[#dcd2c9] sm:text-lg">
            Predecimos y explicamos el rendimiento de cebada maltera en las <strong className="text-white font-medium">197 parcelas</strong> del Altiplano Central mediante un <strong className="text-white font-medium">Árbitro Neuro-Simbólico (QBAF + DF-QuAD)</strong>, valores de Shapley (<strong className="text-white font-medium">SHAP</strong>), proyecciones climáticas y satelitales 2026 (<strong className="text-white font-medium">INEGI CEM 4.0 + GEE</strong>) y asesoría en lenguaje natural con <strong className="text-white font-medium">Google Gemini</strong>.
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
              <span>Explorar 197 parcelas</span>
            </Link>
            <Link
              href="/nosotros"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-transparent px-5 text-sm font-medium text-[#c9b7aa] transition hover:text-white"
            >
              <span>Arquitectura QBAF + SHAP</span>
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
            <Layers className="size-4" /> La Tríada Tecnológica 2026
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Fisiografía fija, señales dinámicas e inteligencia explicable.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#c7b4a6]">
            AgroRaíces separa los atributos invariantes del terreno de las covariables climáticas y satelitales de cada ciclo agrícola, deliberando con un modelo neuro-simbólico transparente tanto para el analista como para el agricultor.
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
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Capa 01 · Covariables Dinámicas</span>
              <h3 className="mt-2 text-xl font-bold text-white">Satélite Tri-Sensor + GEE & Clima 2026</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Integramos 107,666 registros históricos (Sentinel-2, Landsat y PlanetScope 3m con filtro de nubosidad ≤ 30%) con pronósticos climáticos (OpenWeather / Open-Meteo) y conector Google Earth Engine para proyectar el ciclo Abril–Octubre 2026.
              </p>
              <div className="mt-6 space-y-2.5 border-t border-[#3a2c22] pt-6 text-xs text-[#dcd2c9]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">PlanetScope (3m):</span>
                  <b className="text-white font-medium">NDVI, MSAVI & Dinámica LAI</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Sentinel-2 (GEE):</span>
                  <b className="text-white font-medium">Humedad NDWI, DSWI2 & STI</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Landsat & Clima API:</span>
                  <b className="text-white font-medium">VI6T Térmico, GDD & VPD 2026</b>
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Monitoreo y proyección agroclimática 2026
            </div>
          </div>

          {/* Capa 2 */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-xl transition hover:border-[#e2b957]/70 hover:shadow-2xl">
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[#e2b957]/10 blur-2xl" />
            <div>
              <div className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-[#2e2017] text-[#e2b957] ring-1 ring-[#5a4130]">
                <Mountain className="size-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e2b957]">Capa 02 · Base Invariante</span>
              <h3 className="mt-2 text-xl font-bold text-white">Fisiografía Fija INEGI CEM 4.0</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Preservamos las variables físicas que no cambian entre ciclos agrícolas (altitud, pendiente, rugosidad y geometría WKT) desde el Continuo de Elevaciones Mexicano CEM 4.0, aplicando downscaling adiabático (Γ = -0.0065°C/m).
              </p>
              <div className="mt-6 space-y-2.5 border-t border-[#3a2c22] pt-6 text-xs text-[#dcd2c9]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Relieve Fijo CEM 4.0:</span>
                  <b className="text-white font-medium">Altitud msnm & Pendiente (°)</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Morfometría Predial:</span>
                  <b className="text-white font-medium">Rugosidad (m) & Elongación UTM</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Downscaling Térmico:</span>
                  <b className="text-white font-medium">Corrección adiabática por lote</b>
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Anclaje topográfico invariante en las 197 parcelas
            </div>
          </div>

          {/* Capa 3 */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-xl transition hover:border-[#b85c38]/70 hover:shadow-2xl">
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[#d87a52]/10 blur-2xl" />
            <div>
              <div className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52] ring-1 ring-[#5a4130]">
                <Cpu className="size-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Capa 03 · Neuro-Simbólica + IA</span>
              <h3 className="mt-2 text-xl font-bold text-white">QBAF + DF-QuAD + SHAP + Gemini</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Un Árbitro de Argumentación Bipolar Cuantitativa (DF-QuAD) pondera especialistas por estado. SHAP audita el aporte exacto de cada variable en kg/ha y Google Gemini lo traduce en consejos claros para el agricultor.
              </p>
              <div className="mt-6 space-y-2.5 border-t border-[#3a2c22] pt-6 text-xs text-[#dcd2c9]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Hidalgo (51 predios):</span>
                  <b className="text-white font-medium">GradientBoosting (0.75) + SVR (0.25)</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Puebla (100 predios):</span>
                  <b className="text-white font-medium">Debate SVR/Huber/GPR/PLS + Undercut</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9e8b7d]">Tlaxcala (46 predios):</span>
                  <b className="text-white font-medium">Ancla Modal (0.55) + SVC (0.45)</b>
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Explicabilidad SHAP (φ₀ + Σφᵢ = ŷ) + Google Gemini
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 3. LAS TRES CUENCAS DE LA CEBADA
// =========================================================================
export function CuencasSection() {
  return (
    <section className="relative bg-[#221913] py-20 border-t border-[#3d2e24] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">
            <Compass className="size-4" /> Deliberación Regional QBAF + DF-QuAD
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Las 3 cuencas cebaderas y sus 197 parcelas
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#c7b4a6] sm:text-base">
            138 parcelas de entrenamiento (cosecha 2025 verificada) y 59 parcelas de prueba ciega, todas proyectadas hacia la campaña Abril–Octubre 2026 con árbitros especializados por estado.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Puebla */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition hover:border-[#b85c38] hover:bg-[#251b15]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Cuenca 01 · Árbitro Puebla</span>
              <span className="rounded-full bg-[#2e2017] px-2.5 py-0.5 text-xs font-semibold text-[#e2b957]">
                100 parcelas (71 Train / 29 Test)
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-white">Puebla</h3>
            <p className="text-xs text-[#d87a52] font-semibold mt-0.5">Sierra Norte · Chignahuapan</p>

            <div className="my-5 rounded-2xl bg-[#251a14] p-4 text-center tabular-nums">
              <span className="text-xs text-[#9e8b7d]">Base regional φ₀ (SHAP) / Proy. 2026:</span>
              <div className="text-3xl font-extrabold text-[#e2b957] mt-1">4.53 → 4.55 t/ha</div>
              <span className="text-[11px] text-[#b8a293]">Undercutting Capa 0 cuando NDVI &gt; P75</span>
            </div>

            <p className="text-xs leading-relaxed text-[#c2aba0]">
              Suelos volcánicos de ladera húmeda. Cuando el verdor óptico se satura (NDVI &gt; 0.3577), el motor DF-QuAD aplica un ataque de <em>undercutting</em> al árbol ExtraTrees (σ = 0.001) y delega el veredicto en los nodos termo-hídricos SVR, Huber, GPR y PLS (k=2).
            </p>

            <div className="mt-6 pt-5 border-t border-[#3d2e24] text-xs text-[#9e8b7d] flex items-center justify-between">
              <span>Arquitectura:</span>
              <b className="text-white">SVR/Huber/GPR + PLS (k=2) + Undercut</b>
            </div>
          </div>

          {/* Hidalgo */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition hover:border-[#b85c38] hover:bg-[#251b15]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Cuenca 02 · Árbitro Hidalgo</span>
              <span className="rounded-full bg-[#2e2017] px-2.5 py-0.5 text-xs font-semibold text-[#e2b957]">
                51 parcelas (36 Train / 15 Test)
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-white">Hidalgo</h3>
            <p className="text-xs text-[#d87a52] font-semibold mt-0.5">Valle de Apan · Singuilucan · Almoloya</p>

            <div className="my-5 rounded-2xl bg-[#251a14] p-4 text-center tabular-nums">
              <span className="text-xs text-[#9e8b7d]">Base regional φ₀ (SHAP) / Proy. 2026:</span>
              <div className="text-3xl font-extrabold text-[#e2b957] mt-1">3.77 → 3.93 t/ha</div>
              <span className="text-[11px] text-[#b8a293]">Correlación OOF r = 0.903 · 6 municipios</span>
            </div>

            <p className="text-xs leading-relaxed text-[#c2aba0]">
              Contraste entre valles húmedos (Almoloya, Cuautepec) y laderas secas (Singuilucan). El Nodo 1 combina GradientBoosting (σ = 0.75) con Prior Bayesiano Municipal, anomalía térmica de abril y absorción red-edge MRA, respaldado por SVR RBF (σ = 0.25).
            </p>

            <div className="mt-6 pt-5 border-t border-[#3d2e24] text-xs text-[#9e8b7d] flex items-center justify-between">
              <span>Arquitectura:</span>
              <b className="text-white">GradientBoosting (0.75) + SVR Bayes (0.25)</b>
            </div>
          </div>

          {/* Tlaxcala */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition hover:border-[#b85c38] hover:bg-[#251b15]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Cuenca 03 · Árbitro Tlaxcala</span>
              <span className="rounded-full bg-[#2e2017] px-2.5 py-0.5 text-xs font-semibold text-[#e2b957]">
                46 parcelas (31 Train / 15 Test)
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-white">Tlaxcala</h3>
            <p className="text-xs text-[#d87a52] font-semibold mt-0.5">Meseta de Altura · Calpulalpan y Nanacamilpa</p>

            <div className="my-5 rounded-2xl bg-[#251a14] p-4 text-center tabular-nums">
              <span className="text-xs text-[#9e8b7d]">Base regional φ₀ (SHAP) / Proy. 2026:</span>
              <div className="text-3xl font-extrabold text-[#e2b957] mt-1">2.99 → 2.99 t/ha</div>
              <span className="text-[11px] text-[#b8a293]">Estabilidad modal en meseta &gt; 2,600 msnm</span>
            </div>

            <p className="text-xs leading-relaxed text-[#c2aba0]">
              Meseta de temporal con alta convergencia productiva en torno a 3.0 t/ha. El Nodo 5 combina un anclaje modal robusto (σ = 0.55) con un clasificador ordinal probabilístico SVC (σ = 0.45) alimentado por vigor ajustado al suelo (MSAVI) y heterogeneidad térmica.
            </p>

            <div className="mt-6 pt-5 border-t border-[#3d2e24] text-xs text-[#9e8b7d] flex items-center justify-between">
              <span>Arquitectura:</span>
              <b className="text-white">Ancla Modal (0.55) + SVC Ordinal (0.45)</b>
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
            ¿Por qué nuestra arquitectura supera a los modelos de caja negra?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c7b4a6]">
            Comparación directa entre la estimación convencional y la arquitectura neuro-simbólica explicable de AgroRaíces.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tradicional */}
          <div className="rounded-3xl border border-rose-900/40 bg-[#241716] p-7 sm:p-9">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <XCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>Modelos Convencionales o Caja Negra</span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">Regresión Global sin Explicabilidad ni Traducción</h3>
            <ul className="mt-6 space-y-4 text-xs text-[#e8c6c4]">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Fórmula única sin contexto regional:</strong> Ignora la diferencia entre laderas volcánicas húmedas y mesetas altas de temporal.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Saturación del NDVI en follaje denso:</strong> Sobreestima o subestima cosechas cuando el índice óptico se satura a mitad del ciclo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Predicciones sin explicación (Caja Negra):</strong> Entrega un número aislado sin detallar qué variables sumaron o restaron kilos.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Jerga técnica inaccesible para el productor:</strong> Muestra siglas de sensores satelitales que no orientan el manejo en campo.</span>
              </li>
            </ul>
          </div>

          {/* AgroRaíces */}
          <div className="rounded-3xl border border-[#d87a52]/60 bg-[#291e17] p-7 sm:p-9 shadow-xl ring-1 ring-[#d87a52]/20">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e2b957]">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              <span>Pipeline Oficial AgroRaíces (QBAF + DF-QuAD + SHAP + Gemini)</span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">Deliberación Neuro-Simbólica, SHAP y Asesoría con IA</h3>
            <ul className="mt-6 space-y-4 text-xs text-[#f0ded3]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" />
                <span><strong>Precisión OOF demostrada:</strong> Correlación global <b>r = 0.8584</b>, <b>R² = 73.62%</b> y error medio <b>MAE de solo 296.3 kg/ha</b>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" />
                <span><strong>Undercutting DF-QuAD en Capa 0:</strong> Inhibe automáticamente sensores ópticos saturados y prioriza humedad SWIR y emisión térmica.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" />
                <span><strong>Auditoría SHAP Individual, Grupal y Campaña 2026:</strong> Descompone cada predicción (φ₀ + Σφᵢ = ŷ) y proyecta las 197 parcelas para el próximo ciclo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" />
                <span><strong>Explicación para el Agricultor con Google Gemini:</strong> Convierte los pesos SHAP en diagnósticos claros, sin tecnicismos y con consejos prácticos.</span>
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
            Explora la Suite AgroRaíces 2026
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c7b4a6]">
            Doble experiencia adaptada: lenguaje claro impulsado por Google Gemini para el agricultor y laboratorio matemático SHAP + proyección 2026 para el analista.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Nosotros */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-md transition hover:border-[#b85c38] hover:shadow-xl">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52]">
                <Satellite className="size-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">01 · Arquitectura Neuro-Simbólica</span>
              <h3 className="mt-2 text-xl font-bold text-white">QBAF + DF-QuAD + SHAP</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Conoce la formulación matemática detrás del árbitro gradual DF-QuAD, la descomposición aditiva de Shapley, la ingesta climática 2026 y la traducción con Google Gemini.
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
              <span className="text-xs font-bold uppercase tracking-wider text-[#e2b957]">02 · Doble Perfil Interactivo</span>
              <h3 className="mt-2 text-xl font-bold text-white">Asistente Agricultor & Lab Analista</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#d4bead]">
                Si eres agricultor, recibe un diagnóstico validado por Google Gemini sin tecnicismos. Si eres analista, audita casos particulares, grupos de parcelas con SHAP y ejecuta la predicción completa 2026.
              </p>
            </div>
            <Link
              href="/mapa#asistente-modelo"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#e2b957] transition hover:text-white"
            >
              Abrir asistente y laboratorio <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Card 3: Mapa interactivo */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-md transition hover:border-[#b85c38] hover:shadow-xl">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52]">
                <MapPin className="size-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">03 · Georreferencia 2026</span>
              <h3 className="mt-2 text-xl font-bold text-white">Visor de 197 Parcelas e INEGI</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Explora los 197 polígonos (138 de entrenamiento y 59 de predicción) en mapa satelital Esri con fisiografía fija INEGI CEM 4.0 y proyecciones para la campaña 2026.
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
          La cebada del mañana se cultiva con precisión hoy.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#c7b4a6] sm:text-base">
          Consulta la explicación en lenguaje claro de tu parcela con Google Gemini o audita la proyección 2026 de las 197 parcelas con el motor QBAF + DF-QuAD + SHAP.
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
