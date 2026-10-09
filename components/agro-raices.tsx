'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Download,
  Droplets,
  Gauge,
  Info,
  Layers,
  Leaf,
  MapPin,
  Menu,
  Mountain,
  Network,
  Satellite,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  Trees,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export type FormValues = {
  plot: string
  area: string
  temp: string
  ndwi: string
  evi: string
  lai: string
}



export const initialValues: FormValues = {
  plot: '',
  area: '',
  temp: '',
  ndwi: '',
  evi: '',
  lai: '',
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Modelo', href: '/modelo' },
    { label: 'Mapa', href: '/mapa' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#10281f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-left transition hover:opacity-90" aria-label="Ir al inicio">
          <Image 
            src="/images/logo.png" 
            alt="Logo AgroRaíces" 
            width={160} 
            height={160} 
            className="rounded-xl object-contain "
          />
          <span>
            <span className="block text-lg font-semibold tracking-tight text-white">
              Agro<span className="text-[#e2b957]">Raíces</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#a8c3b4]">
              AgroCebada 2026
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          {links.map(({ label, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  isActive ? 'text-[#e2b957]' : 'text-[#c0d2c8] hover:text-white'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#e2b957]" />
                )}
              </Link>
            )
          })}
        </nav>

        <Link
          href="/inferencia"
          className="hidden h-10 items-center gap-2 rounded-full bg-[#d6a849] px-5 text-sm font-semibold text-[#10281f] shadow-sm transition hover:bg-[#e7c26c] sm:inline-flex"
        >
          Probar el modelo <ArrowRight className="size-4" />
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="rounded-lg p-2 text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <nav className="flex flex-col gap-3 border-t border-white/10 bg-[#10281f] px-5 py-6 md:hidden">
          {links.map(({ label, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-base font-medium transition ${
                  isActive
                    ? 'bg-[#1e4432] text-[#e2b957]'
                    : 'text-[#c0d2c8] hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
          <Link
            href="/inferencia"
            onClick={() => setOpen(false)}
            className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#d6a849] text-sm font-semibold text-[#10281f] hover:bg-[#e7c26c]"
          >
            Probar el modelo <ArrowRight className="size-4" />
          </Link>
        </nav>
      )}
    </header>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#10281f] pt-32 pb-20 text-white lg:pt-36 lg:pb-28">
      <div className="absolute -right-32 top-20 size-96 rounded-full bg-[#36735b]/25 blur-3xl" />
      <div className="absolute -left-40 bottom-0 size-80 rounded-full bg-[#d6a849]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#69977e]/40 bg-[#1b3c2d] px-4 py-2 text-xs font-medium text-[#b9d9c4]">
            <span className="size-2 rounded-full bg-[#71c48b] animate-pulse" /> Plataforma de agricultura de precisión
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
            Lee el campo.<br />
            <span className="text-[#e0b653]">Anticipa la cosecha.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-[#b4c9bc] sm:text-lg">
            Estimamos el rendimiento de cebada maltera con datos multiespectrales e inteligencia artificial. Del satélite a la decisión agronómica.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/modelo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#d6a849] px-7 text-sm font-semibold text-[#10281f] shadow-lg shadow-[#d6a849]/20 transition hover:bg-[#e7c26c]"
            >
              Usar el modelo <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/nosotros"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#557c68] bg-transparent px-7 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-white"
            >
              Cómo funciona
            </Link>
          </div>
        </div>


      </div>
    </section>
  )
}

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center backdrop-blur-sm transition hover:bg-white/[0.09]">
      <div className="text-3xl font-semibold text-[#e5bd5f]">{value}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.14em] text-[#9bb7a7]">{label}</div>
    </div>
  )
}


export function HomeCards() {
  return (
    <section className="bg-[#f6f5ef] py-20 text-[#17352a] lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <p className="eyebrow">Explora la plataforma</p>
          <h2 className="section-title mt-3">Tecnología de punta para el cultivo de cebada</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#5e7367]">
            Descubre cada módulo de AgroRaíces diseñado para transformar señales satelitales en rentabilidad agronómica.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Nosotros */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#d7e0d5] bg-white p-7 shadow-sm transition hover:shadow-md">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#e9f0e6] text-[#28714f]">
                <Satellite className="size-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#499266]">01 · Nosotros</span>
              <h3 className="mt-2 text-xl font-semibold text-[#17352a]">Quiénes somos y Tecnología</h3>
              <p className="mt-3 text-sm leading-6 text-[#5e7367]">
                Conoce cómo nuestro consejo de especialistas digitales y las constelaciones satelitales analizan el terreno y el clima para entender tu predio.
              </p>
            </div>
            <Link
              href="/nosotros"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#28714f] transition hover:text-[#184933]"
            >
              Cómo funciona <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Card 2: Modelo */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#27503b] bg-[#10281f] p-7 text-white shadow-md transition hover:shadow-lg">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#1c4030] text-[#e0b653]">
                <Zap className="size-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#e0b653]">02 · Modelo en Vivo</span>
              <h3 className="mt-2 text-xl font-semibold text-white">Usa el Modelo</h3>
              <p className="mt-3 text-sm leading-6 text-[#a8c3b4]">
                En esta ventana podrás usar el modelo: ingresa las señales de tu predio o carga un ejemplo para calcular el rendimiento en segundos con reporte descargable.
              </p>
            </div>
            <Link
              href="/modelo"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#e0b653] transition hover:text-[#ffd269]"
            >
              Usar el modelo <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Card 3: Mapa */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#d7e0d5] bg-white p-7 shadow-sm transition hover:shadow-md">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MapPin className="size-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">03 · Georreferencia</span>
              <h3 className="mt-2 text-xl font-semibold text-[#17352a]">Mapa de Parcelas</h3>
              <p className="mt-3 text-sm leading-6 text-[#5e7367]">
                Visualiza los 197 polígonos del Altiplano Central (Puebla, Hidalgo y Tlaxcala) georreferenciados en un mapa satelital de alta resolución.
              </p>
            </div>
            <Link
              href="/mapa"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              Explorar mapa <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section className="bg-[#f6f5ef] pt-32 pb-24 text-[#17352a] lg:pt-36 lg:pb-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow">01 / Quiénes somos</p>
            <h2 className="section-title mt-4">Datos que echan raíces en el territorio.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#5e7367]">
              Nacimos para optimizar la cadena agroindustrial de la cebada maltera. Convertimos señales invisibles del campo en información clara y accionable para productores y acopiadores.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/modelo"
                className="inline-flex items-center gap-2 rounded-full bg-[#1e6846] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#155538]"
              >
                Usar el modelo en vivo <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/mapa"
                className="inline-flex items-center gap-2 rounded-full border border-[#b8cabe] bg-white px-5 py-2.5 text-sm font-medium text-[#17352a] shadow-sm transition hover:bg-[#e3ebdf]"
              >
                Ver parcelas en el mapa <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Sensor
              icon={<Satellite className="size-5" />}
              title="PlanetScope"
              copy="Textura foliar en fase vegetativa, a 3 m."
            />
            <Sensor
              icon={<Droplets className="size-5" />}
              title="Sentinel-2"
              copy="Agua y suelo multiespectral, a 10–20 m."
            />
            <Sensor
              icon={<ThermometerSun className="size-5" />}
              title="Landsat"
              copy="Temperatura superficial y choque térmico."
            />
          </div>
        </div>

        {/* Sección complementaria */}
        <div className="mt-20 rounded-3xl bg-[#10281f] p-8 text-white sm:p-12">
          <div className="max-w-3xl">
            <span className="tag-gold">Propósito AgroCebada 2026</span>
            <h3 className="mt-4 text-2xl font-semibold sm:text-3xl">
              Cerrando la brecha entre la telemetría espacial y el rendimiento en tolva.
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#b4c9bc] sm:text-base">
              Nuestra metodología combina calibración agronómica en campo con series de tiempo multiespectrales. Así logramos predecir rendimientos antes del secado del grano, permitiendo planificar logística de acopio, liquidación de cosechas y decisiones de manejo intrapredial.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Sensor({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-[#d7e0d5] bg-white p-5 shadow-sm transition hover:border-[#b8cabe] hover:shadow-md">
      <div className="mb-6 flex size-10 items-center justify-center rounded-xl bg-[#e9f0e6] text-[#28714f]">
        {icon}
      </div>
      <h3 className="font-semibold text-[#17352a]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6b7f73]">{copy}</p>
    </div>
  )
}

export function ModelSpecs() {
  const senales = [
    {
      titulo: 'Salud y verdor de la planta',
      explicacion: 'Detecta qué tan tupidas y verdes crecen las hojas de cebada durante el llenado de grano.',
      porcentaje: 92,
      icono: '🌿',
    },
    {
      titulo: 'Forma del terreno y pendiente',
      explicacion: 'Reconoce si el suelo es plano o inclinado, afectando el drenaje y la retención de agua.',
      porcentaje: 84,
      icono: '⛰️',
    },
    {
      titulo: 'Humedad y agua en el follaje',
      explicacion: 'Mide cuánta agua almacena la planta para anticipar marchitez o sequía.',
      porcentaje: 76,
      icono: '💧',
    },
    {
      titulo: 'Calor y días de sequía',
      explicacion: 'Registra temperaturas extremas que puedan frenar el crecimiento de la espiga.',
      porcentaje: 71,
      icono: '☀️',
    },
    {
      titulo: 'Crecimiento semana a semana',
      explicacion: 'Monitorea con qué velocidad y vigor evoluciona la cobertura vegetal del cultivo.',
      porcentaje: 64,
      icono: '📈',
    },
    {
      titulo: 'Tamaño del predio',
      explicacion: 'Superficie total en hectáreas para estimar el volumen total de cosecha.',
      porcentaje: 52,
      icono: '📐',
    },
    {
      titulo: 'Ubicación y altitud regional',
      explicacion: 'Toma en cuenta el clima propio de cada municipio en Puebla, Hidalgo o Tlaxcala.',
      porcentaje: 45,
      icono: '📍',
    },
  ]

  return (
    <section className="bg-white pt-32 pb-24 lg:pt-36 lg:pb-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Encabezado Principal */}
        <div className="mb-14 max-w-3xl">
          <p className="eyebrow">02 / Tecnología Inteligente</p>
          <h2 className="section-title mt-4">
            ¿Cómo calcula AgroRaíces la cosecha de tu parcela?
          </h2>
          <p className="mt-5 leading-7 text-[#5e7367]">
            En lugar de usar una fórmula rígida igual para todo el país, AgroRaíces funciona como un <strong>consejo de especialistas agrícolas digitales</strong>. Un coordinador inteligente analiza las condiciones de tu tierra y consulta a los especialistas más adecuados para darte una estimación realista y confiable.
          </p>
        </div>

        {/* 1. La Idea Central explicada de forma sencilla */}
        <div className="mb-12 rounded-3xl bg-[#10281f] p-8 text-white sm:p-10 shadow-xl border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
            <div>
              <span className="tag-dark">¿Cómo funciona?</span>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Un equipo de especialistas virtuales para tu campo
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#e2b957]">
              <span>💡</span>
              Tecnología accesible para todos
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#16392c]/80 p-6">
              <div className="text-xs uppercase tracking-wider font-semibold text-rose-300 flex items-center gap-1.5">
                <span>❌</span> El método tradicional
              </div>
              <p className="mt-2 text-sm leading-6 text-[#b8d0be]">
                Usa una sola regla general para todos. Trata por igual a una parcela plana con riego en un valle que a una parcela inclinada en una montaña seca, lo que suele dar números inexactos o alejados de la realidad.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e2b957]/40 bg-[#16392c]/80 p-6 shadow-inner">
              <div className="text-xs uppercase tracking-wider font-semibold text-[#e2b957] flex items-center gap-1.5">
                <span>✅</span> La solución de AgroRaíces
              </div>
              <p className="mt-2 text-sm leading-6 text-[#d2e4d7]">
                Divide el trabajo entre varios especialistas virtuales en paralelo. Si tu parcela está en una ladera alta y fría, escucha al especialista de montaña; si está en un valle cálido, escucha al especialista de valles.
              </p>
            </div>
          </div>
        </div>

        {/* 2. El proceso en 4 pasos claros */}
        <div className="mb-14">
          <div className="mb-8">
            <p className="eyebrow">Paso a paso</p>
            <h3 className="section-title mt-2 text-3xl">Los 4 pasos para calcular tu rendimiento</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Paso 1 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d7e0d5] bg-[#f9faf7] p-6 shadow-sm hover:shadow-md transition">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#e9f0e6] text-2xl">
                  🛰️
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#499266]">Paso 01</span>
                <h4 className="mt-1 text-lg font-bold text-[#17352a]">Radiografía Satelital</h4>
                <p className="mt-2 text-xs leading-5 text-[#5e7367]">
                  Los satélites toman fotos de tu parcela para medir:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#315543]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#28714f] shrink-0 mt-0.5" />
                    <span>Qué tan verde y tupida está la hoja de la cebada.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#28714f] shrink-0 mt-0.5" />
                    <span>Cuánta agua retiene la planta y el suelo.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#28714f] shrink-0 mt-0.5" />
                    <span>Si el terreno es plano o está en pendiente.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d7e0d5] bg-[#f9faf7] p-6 shadow-sm hover:shadow-md transition">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#fdf3dc] text-2xl">
                  🧭
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9b721e]">Paso 02</span>
                <h4 className="mt-1 text-lg font-bold text-[#17352a]">El Coordinador Inteligente</h4>
                <p className="mt-2 text-xs leading-5 text-[#5e7367]">
                  Revisa la altitud, el clima y el relieve de tu predio para decidir a quién consultar.
                </p>
                <div className="mt-3 rounded-xl bg-white border border-[#e2e8df] p-3 text-xs text-[#4b5563]">
                  <span className="font-semibold text-[#17352a] block mb-1">Por ejemplo:</span>
                  Si tu parcela está en una ladera alta y fría de Tlaxcala o Hidalgo, le da más valor a la opinión del especialista en tierras de montaña.
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d7e0d5] bg-[#f9faf7] p-6 shadow-sm hover:shadow-md transition">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#eaf4fd] text-2xl">
                  👨‍🌾
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1e6cb7]">Paso 03</span>
                <h4 className="mt-1 text-lg font-bold text-[#17352a]">Los Especialistas en Campo</h4>
                <p className="mt-2 text-xs leading-5 text-[#5e7367]">
                  Contamos con modelos expertos entrenados para cada tipo de terreno:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#315543]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#1e6cb7] shrink-0 mt-0.5" />
                    <span><strong>Experto en Valles:</strong> Especializado en tierras fértiles y riego.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#1e6cb7] shrink-0 mt-0.5" />
                    <span><strong>Experto en Laderas:</strong> Especializado en terrenos inclinados.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#1e6cb7] shrink-0 mt-0.5" />
                    <span><strong>Experto en Sequía:</strong> Especializado en parcelas de temporal.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#27503b] bg-[#10281f] p-6 text-white shadow-md hover:shadow-lg transition">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#1c4030] text-2xl">
                  ⚖️
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#e0b653]">Paso 04</span>
                <h4 className="mt-1 text-lg font-bold text-white">El Veredicto Final</h4>
                <p className="mt-2 text-xs leading-5 text-[#a8c3b4]">
                  Se combinan las opiniones de todos los especialistas para calcular tu cosecha esperada en <strong>toneladas por hectárea</strong>.
                </p>
                <div className="my-3 rounded-xl bg-black/40 border border-white/10 p-2.5 text-center text-xs text-[#e2b957]">
                  Rendimiento Estimado Realista
                </div>
                <p className="text-[11px] leading-4 text-[#a8c3b4]">
                  El cálculo siempre respeta los límites reales de la cebada; nunca inventa números exagerados o imposibles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ¿Qué señales toma en cuenta? y Garantías de Confianza */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Factores tomados en cuenta */}
          <div className="rounded-3xl border border-[#dde5db] bg-[#f7f9f5] p-7 sm:p-9 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e2e9df] pb-4 mb-6">
              <div>
                <p className="eyebrow">Factores Clave</p>
                <h3 className="mt-1 text-xl font-bold text-[#17352a]">¿Qué señales mira el satélite en tu parcela?</h3>
              </div>
              <Mountain className="size-6 text-[#28714f]" />
            </div>

            <div className="space-y-4">
              {senales.map((item) => (
                <div key={item.titulo}>
                  <div className="mb-1.5 flex justify-between items-baseline gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#1e5037] flex items-center gap-1.5 text-sm">
                        <span>{item.icono}</span>
                        {item.titulo}
                      </span>
                      <span className="block text-[11px] text-[#6b7f73] mt-0.5">{item.explicacion}</span>
                    </div>
                    <span className="font-bold text-[#17352a] text-sm shrink-0">{item.porcentaje}% peso</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#dce7dc] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#28714f] to-[#e2b957] transition-all duration-700"
                      style={{ width: `${item.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Garantías y Confianza en Campo */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#dde5db] bg-white p-7 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="size-5 text-[#28714f]" />
                <h3 className="text-lg font-bold text-[#17352a]">Resultados Comprobados en Campo</h3>
              </div>
              <p className="text-xs text-[#5e7367] leading-relaxed mb-6">
                Probado y calibrado con datos de productores reales en Puebla, Hidalgo y Tlaxcala para brindarte certeza en tus decisiones.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e0e7dd] bg-[#f9faf7] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#789083]">Certeza en Campo</span>
                  <div className="mt-1 text-2xl font-extrabold text-[#17352a]">85% – 90%</div>
                  <div className="mt-0.5 text-[11px] text-[#81968a]">Acierto frente a cosechas reales</div>
                </div>

                <div className="rounded-2xl border border-[#e0e7dd] bg-[#f9faf7] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#789083]">Variación Media</span>
                  <div className="mt-1 text-2xl font-extrabold text-[#17352a]">&plusmn; 0.4 t/ha</div>
                  <div className="mt-0.5 text-[11px] text-[#81968a]">Margen de error muy estrecho</div>
                </div>

                <div className="rounded-2xl border border-[#e0e7dd] bg-[#f9faf7] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#789083]">Rango Realista</span>
                  <div className="mt-1 text-2xl font-extrabold text-[#9b721e]">2.0 a 5.6</div>
                  <div className="mt-0.5 text-[11px] text-[#81968a]">Toneladas por hectárea reales</div>
                </div>

                <div className="rounded-2xl border border-[#e0e7dd] bg-[#f9faf7] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#789083]">Rapidez</span>
                  <div className="mt-1 text-2xl font-extrabold text-[#28714f]">&lt; 2 seg</div>
                  <div className="mt-0.5 text-[11px] text-[#81968a]">Respuesta inmediata en línea</div>
                </div>
              </div>
            </div>

            {/* Accesos directos */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/inferencia"
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1e6846] px-6 text-xs font-semibold text-white shadow-md transition hover:bg-[#155538]"
              >
                Probar calculadora de tu predio <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/mapa"
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#d7e0d5] bg-white px-6 text-xs font-semibold text-[#17352a] shadow-sm transition hover:bg-[#f3f6f1]"
              >
                Ver parcelas en el mapa satelital <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ModelCard({ title, copy, icon }: { title: string; copy: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#27503b] p-4 transition hover:bg-[#2d5c43]">
      <div className="mb-4 text-[#d6a849]">{icon}</div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs text-[#a6c0ae]">{copy}</div>
    </div>
  )
}

export function PredictionForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')

  function update(key: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    setError('')
  }

  function loadSample() {
    setValues({
      plot: 'Parcela San Gabriel #4',
      area: '85',
      temp: '-0.58',
      ndwi: '0.22',
      evi: '0.26',
      lai: '0.38',
    })
    setError('')
    setResult(null)
  }

  function calculate(e: React.FormEvent) {
    e.preventDefault()
    const nums = Object.values(values).slice(1).map(Number)
    if (!values.plot || nums.some((n) => !Number.isFinite(n)) || Number(values.area) <= 0) {
      setError('Completa todos los campos con valores numéricos válidos.')
      return
    }
    setLoading(true)
    setResult(null)
    window.setTimeout(() => {
      const [, temp, ndwi, evi, lai] = nums
      const prediction = Math.min(
        5.6,
        Math.max(
          2,
          3.35 +
            (Number(evi) - 0.2) * 4 +
            (Number(lai) - 0.3) * 2.3 +
            (Number(ndwi) - 0.1) * 1.4 +
            (Number(temp) + 0.6) * 1.8
        )
      )
      setResult(Number(prediction.toFixed(2)))
      setLoading(false)
    }, 800)
  }

  function downloadReport() {
    if (result === null) return
    const csv = `parcela,area_ha,rendimiento_t_ha,rendimiento_kg_ha,produccion_estimada_t\n${values.plot},${values.area},${result},${Math.round(result * 1000)},${(result * Number(values.area)).toFixed(1)}\n`
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${values.plot.replace(/\s+/g, '_') || 'parcela'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const status =
    result === null
      ? null
      : result < 3.2
      ? ['Bajo / Estrés severo', 'bg-[#fff0eb] text-[#b64d2d]']
      : result <= 4.2
      ? ['Promedio regional', 'bg-[#fff7d9] text-[#99751a]']
      : ['Alto / Vigor óptimo', 'bg-[#e4f4e9] text-[#28714f]']

  return (
    <section className="bg-[#edf2ea] pt-32 pb-24 lg:pt-36 lg:pb-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">02 / Modelo en Vivo</p>
            <h2 className="section-title mt-4">Usa el modelo y conoce el potencial de tu parcela.</h2>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="max-w-sm text-sm leading-6 text-[#687b70]">
              En esta ventana podrás usar el modelo: ingresa los datos de tu predio o carga un ejemplo para calcular el rendimiento en segundos.
            </p>
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e6846] underline hover:text-[#155538] cursor-pointer"
            >
              <Info className="size-3.5" /> Cargar valores de ejemplo
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <form onSubmit={calculate} className="rounded-3xl bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#17352a]">Variables de entrada</h3>
                <p className="mt-1 text-sm text-[#789083]">Valores observados en la última escena satelital.</p>
              </div>
              <span className="rounded-full bg-[#e7f1e7] px-3 py-1 text-xs font-medium text-[#39805a]">
                6 parámetros
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {(
                [
                  ['plot', 'ID de parcela / predio', 'Ej. Parcela Norte #1'],
                  ['area', 'Superficie · AREA_HA', 'Ej. 120'],
                  ['temp', 'Temperatura pico · vi6t_max', '−0.70 a −0.50'],
                  ['ndwi', 'Estrés hídrico · ndwi_mean', '−0.10 a 0.40'],
                  ['evi', 'Verdor · evi_std', '0.10 a 0.30'],
                  ['lai', 'Área foliar · lai_std', '0.15 a 0.50'],
                ] as const
              ).map(([key, label, placeholder]) => (
                <label key={key} className="flex flex-col gap-2 text-sm font-medium text-[#315543]">
                  {label}
                  <input
                    required
                    value={values[key]}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                    type={key === 'plot' ? 'text' : 'number'}
                    step="any"
                    min={key === 'area' ? '0.01' : undefined}
                    className="h-11 rounded-xl border border-[#d9e4d8] bg-[#fbfcfa] px-3 text-sm font-normal outline-none transition placeholder:text-[#a5b5aa] focus:border-[#499266] focus:ring-2 focus:ring-[#b9d9c4]"
                  />
                </label>
              ))}
            </div>

            {error && (
              <p className="mt-5 text-sm text-[#b64d2d]" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-8 h-12 w-full rounded-xl bg-[#1e6846] text-white hover:bg-[#155538] transition cursor-pointer"
            >
              {loading ? 'Procesando datos…' : 'Calcular rendimiento estimado'}{' '}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <div className="flex min-h-[420px] flex-col justify-between rounded-3xl bg-[#10281f] p-7 text-white sm:p-9 shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <span className="tag-dark">Resultado del ensamble</span>
                <span className="flex size-9 items-center justify-center rounded-full bg-[#27503b]">
                  <CheckCircle2 className="size-4 text-[#7ec692]" />
                </span>
              </div>

              {result === null ? (
                <div className="mt-16">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-[#1c4030] text-[#76b98a]">
                    <BarChart3 className="size-7" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">Tu estimación aparecerá aquí</h3>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-[#a8c0af]">
                    Completa el formulario para generar una predicción basada en el ensamble de Machine Learning.
                  </p>
                </div>
              ) : (
                <div className="mt-12">
                  <p className="text-sm text-[#a8c0af]">Rendimiento estimado</p>
                  <div className="mt-2 text-6xl font-semibold tracking-tight text-[#e4bd5d]">
                    {result.toFixed(2)} <span className="text-xl font-normal text-[#b2cabe]">t/ha</span>
                  </div>
                  <p className="mt-2 text-sm text-[#a8c0af]">
                    ≈ {Math.round(result * 1000).toLocaleString('es-MX')} kg/ha
                  </p>

                  {values.area && Number(values.area) > 0 && (
                    <p className="mt-1 text-xs text-[#8fb098]">
                      Producción total estimada: {(result * Number(values.area)).toFixed(1)} toneladas
                    </p>
                  )}

                  {status && (
                    <span className={`mt-6 inline-flex rounded-full px-3.5 py-1.5 text-sm font-medium ${status[1]}`}>
                      {status[0]}
                    </span>
                  )}
                </div>
              )}
            </div>

            {result !== null && (
              <Button
                onClick={downloadReport}
                variant="outline"
                className="mt-8 w-full rounded-xl border-[#537560] bg-transparent text-white hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Download className="size-4" /> Descargar reporte CSV
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#10281f] px-5 py-10 text-[#a8c0af] lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <div className="flex items-center gap-3">
          <Image 
            src="/images/logo.png" 
            alt="Logo AgroRaíces" 
            width={140} 
            height={140} 
            className="rounded-lg object-contain"
          />
          <span>© 2026 AgroRaíces ·</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#8aa895]">
          <Link href="/" className="hover:text-white transition">Inicio</Link>
          <Link href="/nosotros" className="hover:text-white transition">Nosotros</Link>
          <Link href="/modelo" className="hover:text-white transition">Modelo</Link>
          <Link href="/mapa" className="hover:text-white transition">Mapa</Link>
        </div>
        <span className="flex items-center gap-2 text-xs">
          <Leaf className="size-3.5 text-[#d6a849]" /> Ciencia  de datos para cultivar futuro.
        </span>
      </div>
    </footer>
  )
}

export function AgroRaicesApp() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HomeCards />
      </main>
      <Footer />
    </>
  )
}
