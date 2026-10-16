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
  XCircle,
  Zap,
} from 'lucide-react'

// =========================================================================
// 1. HERO SECTION
// =========================================================================
export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
      <div className="pointer-events-none absolute -right-32 top-10 size-[520px] rounded-full bg-[#b85c38]/18 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 top-40 size-[480px] rounded-full bg-[#d87a52]/12 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-[400px] rounded-full bg-[#e2b957]/10 blur-[90px]" />

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
          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Lee el campo
            <span className="block bg-gradient-to-r from-[#e2b957] via-[#d87a52] to-[#b85c38] bg-clip-text text-transparent">
              Anticipa la cosecha
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[#dcd2c9] sm:text-lg">
            Estimamos la cosecha de cebada en el Altiplano Central combinando imágenes satelitales, el relieve natural de cada terreno y el pronóstico del clima, explicándote en lenguaje claro el potencial de tu parcela.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
            <Link
              href="/mapa#asistente-modelo"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#b85c38] to-[#c96a45] px-7 text-sm font-semibold text-white shadow-xl shadow-[#b85c38]/25 transition-transform hover:scale-[1.02] hover:from-[#c96a45] hover:to-[#d87a52] active:scale-[0.99]"
            >
              <span>Probar el modelo en vivo</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/mapa"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#6b5343] bg-[#271d17]/80 px-7 text-sm font-semibold text-[#f0ded3] shadow-sm backdrop-blur-md transition-colors hover:border-[#96745d] hover:bg-[#34271f] hover:text-white"
            >
              <Compass className="size-4 text-[#d87a52]" aria-hidden="true" />
              <span>Explorar mapa de parcelas</span>
            </Link>
            <Link
              href="/nosotros"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-transparent px-5 text-sm font-medium text-[#c9b7aa] transition-colors hover:text-white"
            >
              <span>Conocer cómo funciona</span>
              <ChevronRight className="size-4 text-[#d87a52]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 2. LA TRÍADA TECNOLÓGICA (EXPLICACIÓN SENCILLA SIN MÉTRICAS)
// =========================================================================
export function TriadaSection() {
  return (
    <section className="relative bg-[#221913] py-20 border-y border-[#3d2e24] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">
            <Layers className="size-4" aria-hidden="true" /> Cómo funciona AgroRaíces
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Tres elementos clave para conocer tu cosecha.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#c7b4a6]">
            Cada parcela tiene su propia historia. Por eso reunimos las señales del cielo, las características de tu terreno y un sistema de análisis que traduce todo a palabras claras.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {/* Capa 1 */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-xl transition-colors hover:border-[#b85c38]/70">
            <div>
              <div className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52] ring-1 ring-[#5a4130]">
                <Satellite className="size-7" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">01 · Clima y Cultivo</span>
              <h3 className="mt-2 text-xl font-bold text-white">Seguimiento del Follaje y la Humedad</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Observamos el verdor de la planta, la humedad retenida en sus hojas y el pronóstico de lluvias y temperaturas de la temporada para saber cómo se desarrolla el cultivo.
              </p>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Vigor de la planta y humedad disponible
            </div>
          </div>

          {/* Capa 2 */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-xl transition-colors hover:border-[#e2b957]/70">
            <div>
              <div className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-[#2e2017] text-[#e2b957] ring-1 ring-[#5a4130]">
                <Mountain className="size-7" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e2b957]">02 · Suelo y Terreno</span>
              <h3 className="mt-2 text-xl font-bold text-white">Condiciones Fijas de tu Parcela</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Tomamos en cuenta las características de tu terreno que no cambian año con año, como la altura sobre el nivel del mar, la inclinación del suelo y la superficie sembrada.
              </p>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Altura, pendiente y retención de agua
            </div>
          </div>

          {/* Capa 3 */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-xl transition-colors hover:border-[#b85c38]/70">
            <div>
              <div className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52] ring-1 ring-[#5a4130]">
                <Cpu className="size-7" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">03 · Diagnóstico Claro</span>
              <h3 className="mt-2 text-xl font-bold text-white">Estimación y Asesoría Sencilla</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Nuestro modelo calcula el rendimiento esperado según tu región y te explica sin tecnicismos qué factores impulsan tu cosecha y cuáles requieren atención en el campo.
              </p>
            </div>
            <div className="mt-8 rounded-xl bg-[#2a1e17] p-3 text-center text-xs font-semibold text-[#e2b957]">
              Resultados claros para el productor y el analista
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 3. LAS TRES REGIONES DE LA CEBADA (SIN MÉTRICAS TÉCNICAS)
// =========================================================================
export function CuencasSection() {
  return (
    <section className="relative bg-[#221913] py-20 border-t border-[#3d2e24] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">
            <Compass className="size-4" aria-hidden="true" /> Regiones Productoras
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Las 3 regiones cebaderas del Altiplano Central
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#c7b4a6] sm:text-base">
            Cada estado tiene un tipo de suelo, lluvias y clima distintos. Por eso analizamos cada región de acuerdo con las condiciones reales de sus parcelas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Puebla */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition-colors hover:border-[#b85c38] hover:bg-[#251b15]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Región 01</span>
            <h3 className="mt-2 text-2xl font-bold text-white">Puebla</h3>
            <p className="text-xs text-[#e2b957] font-semibold mt-0.5">Sierra Norte · Chignahuapan</p>
            <p className="mt-4 text-sm leading-relaxed text-[#c2aba0]">
              Tierras volcánicas con buen régimen de lluvias de verano. En esta zona es clave conservar una buena cobertura de rastrojo antes de sembrar y vigilar la humedad del suelo en laderas.
            </p>
          </div>

          {/* Hidalgo */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition-colors hover:border-[#b85c38] hover:bg-[#251b15]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Región 02</span>
            <h3 className="mt-2 text-2xl font-bold text-white">Hidalgo</h3>
            <p className="text-xs text-[#e2b957] font-semibold mt-0.5">Valle de Apan · Singuilucan · Almoloya</p>
            <p className="mt-4 text-sm leading-relaxed text-[#c2aba0]">
              Cuna tradicional de la cebada en México. Combina valles planos muy fértiles con zonas más altas donde es importante cuidar el cultivo de las mañanas frías al inicio de la siembra.
            </p>
          </div>

          {/* Tlaxcala */}
          <div className="group rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 transition-colors hover:border-[#b85c38] hover:bg-[#251b15]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Región 03</span>
            <h3 className="mt-2 text-2xl font-bold text-white">Tlaxcala</h3>
            <p className="text-xs text-[#e2b957] font-semibold mt-0.5">Llanuras de Altura · Calpulalpan y Nanacamilpa</p>
            <p className="mt-4 text-sm leading-relaxed text-[#c2aba0]">
              Meseta alta de temporal con clima fresco. Aquí el desarrollo parejo del follaje desde etapas tempranas y el aprovechamiento de cada lluvia son esenciales para asegurar el llenado de grano.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// 4. COMPARATIVA SENCILLA
// =========================================================================
export function ComparativaSection() {
  return (
    <section className="relative bg-[#1a130f] py-20 border-t border-[#3d2e24] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">
            <ShieldCheck className="size-4" aria-hidden="true" /> Beneficios en el Campo
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            ¿Por qué estimar tu cosecha con AgroRaíces?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c7b4a6]">
            Una herramienta pensada para darte claridad antes de la cosecha sin complicarte con datos técnicos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tradicional */}
          <div className="rounded-3xl border border-rose-900/40 bg-[#241716] p-7 sm:p-9">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <XCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>Estimación Tradicional</span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">Sin considerar las diferencias de cada parcela</h3>
            <ul className="mt-6 space-y-4 text-xs text-[#e8c6c4]">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Misma regla para todos:</strong> No distingue si el terreno está en valle plano o en ladera con pendiente.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Sin explicación del porqué:</strong> Da un cálculo general sin indicar si faltó humedad o si afectó el clima.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span><strong>Información hasta el final:</strong> Se conoce el resultado hasta el día de la trilla, sin margen para planear antes.</span>
              </li>
            </ul>
          </div>

          {/* AgroRaíces */}
          <div className="rounded-3xl border border-[#d87a52]/60 bg-[#291e17] p-7 sm:p-9 shadow-xl ring-1 ring-[#d87a52]/20">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e2b957]">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              <span>Con AgroRaíces</span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">Análisis por región y explicación en palabras claras</h3>
            <ul className="mt-6 space-y-4 text-xs text-[#f0ded3]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Adaptado a tu municipio:</strong> Evalúa las condiciones propias de Puebla, Hidalgo y Tlaxcala.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Explicación sencilla:</strong> Te dice claramente qué ayudó a tu cultivo y qué factores jugaron en contra.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#e2b957] shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Planeación anticipada:</strong> Te permite estimar toneladas y costales esperados para organizar tu cosecha.</span>
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
            <Wheat className="size-4" aria-hidden="true" /> Plataforma Integral
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Explora la Plataforma AgroRaíces
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c7b4a6]">
            Diseñada con una vista sencilla paso a paso para el agricultor y una vista completa para el análisis de parcelas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Nosotros */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-md transition-colors hover:border-[#b85c38]">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52]">
                <Satellite className="size-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">01 · Nosotros</span>
              <h3 className="mt-2 text-xl font-bold text-white">Quiénes somos y cómo funciona</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Conoce de manera sencilla cómo combinamos la información del terreno, el clima y las imágenes satelitales para apoyar al campo.
              </p>
            </div>
            <Link
              href="/nosotros"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d87a52] transition-colors hover:text-[#f09c78]"
            >
              Conocer más <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Card 2: Modelo en vivo */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#b85c38]/50 bg-gradient-to-b from-[#2a1d16] to-[#1c130e] p-8 text-white shadow-xl transition-colors hover:border-[#d87a52]">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#3d271c] text-[#e2b957]">
                <Zap className="size-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e2b957]">02 · Estimación en Vivo</span>
              <h3 className="mt-2 text-xl font-bold text-white">Asistente para el Agricultor</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#d4bead]">
                Ubica tu parcela en el mapa o ingresa tus hectáreas y recibe al instante tu estimación de cosecha con recomendaciones claras.
              </p>
            </div>
            <Link
              href="/mapa#asistente-modelo"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#e2b957] transition-colors hover:text-white"
            >
              Usar el asistente <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Card 3: Mapa interactivo */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-8 shadow-md transition-colors hover:border-[#b85c38]">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52]">
                <MapPin className="size-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">03 · Mapa Satelital</span>
              <h3 className="mt-2 text-xl font-bold text-white">Visor de Parcelas</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c2aba0]">
                Explora las parcelas monitoreadas en Puebla, Hidalgo y Tlaxcala sobre fotografía satelital y consulta el potencial de cada zona.
              </p>
            </div>
            <Link
              href="/mapa"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d87a52] transition-colors hover:text-[#f09c78]"
            >
              Explorar mapa interactivo <ChevronRight className="size-4" aria-hidden="true" />
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
          <Wheat className="size-7" aria-hidden="true" />
        </div>
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          La cebada del mañana se cultiva con precisión hoy.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#c7b4a6] sm:text-base">
          Accede al mapa interactivo, toca tu parcela y conoce el rendimiento estimado de tu cultivo con una explicación clara y pensada para el campo.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
          <Link
            href="/mapa"
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#b85c38] to-[#c96a45] px-8 text-sm font-semibold text-white shadow-xl shadow-[#b85c38]/25 transition-transform hover:scale-[1.02] hover:from-[#c96a45] hover:to-[#d87a52]"
          >
            <span>Abrir Mapa Geoespacial</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/mapa#asistente-modelo"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#6b5343] bg-[#271d17] px-7 text-sm font-semibold text-[#f0ded3] transition-colors hover:border-[#96745d] hover:bg-[#34271f]"
          >
            <Zap className="size-4 text-[#e2b957]" aria-hidden="true" />
            <span>Usar Modelo Predictivo</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
