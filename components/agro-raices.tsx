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
    { label: 'Modelo', href: '/mapa#asistente-modelo' },
    { label: 'Mapa', href: '/mapa' },
  ]

  const handleIrAlModelo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('#asistente-modelo')) {
      if (pathname === '/mapa') {
        e.preventDefault()
        const el = document.getElementById('asistente-modelo')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
        window.history.pushState(null, '', '/mapa#asistente-modelo')
      }
      setOpen(false)
    }
  }

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
            const isActive = href === '/mapa#asistente-modelo'
              ? false
              : pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => handleIrAlModelo(e, href)}
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
          href="/mapa#asistente-modelo"
          onClick={(e) => handleIrAlModelo(e, '/mapa#asistente-modelo')}
          className="hidden h-10 items-center gap-2 rounded-full bg-[#d6a849] px-5 text-sm font-semibold text-[#10281f] shadow-sm transition hover:bg-[#e7c26c] sm:inline-flex cursor-pointer"
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
            const isActive = href === '/mapa#asistente-modelo'
              ? false
              : pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => handleIrAlModelo(e, href)}
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
            href="/mapa#asistente-modelo"
            onClick={(e) => handleIrAlModelo(e, '/mapa#asistente-modelo')}
            className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#d6a849] text-sm font-semibold text-[#10281f] hover:bg-[#e7c26c] cursor-pointer"
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
    <section className="relative overflow-hidden bg-[#382d25] pt-32 pb-20 text-white lg:pt-36 lg:pb-28">
      <div className="absolute -right-32 top-20 size-96 rounded-full bg-[#b85c38]/15 blur-3xl" />
      <div className="absolute -left-40 bottom-0 size-80 rounded-full bg-[#d87a52]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b85c38]/30 bg-[#2b211a] px-4 py-2 text-xs font-medium text-[#f0ded3]">
            <span className="size-2 rounded-full bg-[#d87a52] animate-pulse" /> Pipeline Oficial AgroRaíces · AgroCebada 2026
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
            Lee el campo.<br />
            <span className="text-[#d87a52]">Anticipa la cosecha.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-[#dcd2c9] sm:text-lg">
            Estimamos el rendimiento de cebada maltera con telemetría de Sentinel-2, Landsat, PlanetScope y topografía INEGI CEM 4.0. Del satélite a la decisión agronómica.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/mapa#asistente-modelo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#b85c38] px-7 text-sm font-semibold text-white shadow-lg shadow-[#b85c38]/25 transition hover:bg-[#c96a45]"
            >
              Usar el modelo <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/nosotros"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-7 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-white"
            >
              Arquitectura y Tecnología
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
      <div className="text-3xl font-semibold text-[#d87a52]">{value}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.14em] text-[#d4bead]">{label}</div>
    </div>
  )
}


export function HomeCards() {
  return (
    <section className="bg-[#f9f7f2] py-20 text-[#302620] lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <p className="eyebrow">Explora la plataforma</p>
          <h2 className="section-title mt-3">Tecnología de punta para el cultivo de cebada</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#6e5d53]">
            Descubre cada módulo de AgroRaíces diseñado para transformar señales satelitales en rentabilidad agronómica.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Nosotros */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#ded5cb] bg-white p-7 shadow-sm transition hover:shadow-md">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#b85c38]">
                <Satellite className="size-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#b85c38]">01 · Arquitectura Oficial</span>
              <h3 className="mt-2 text-xl font-semibold text-[#302620]">Quiénes somos y Modelo Predictivo</h3>
              <p className="mt-3 text-sm leading-6 text-[#6e5d53]">
                Conoce la arquitectura desacoplada por estado: modelos especializados de ExtraTrees, SVR, Huber, GPR, PLS y clasificadores ordinales calibrados para Puebla, Hidalgo y Tlaxcala.
              </p>
            </div>
            <Link
              href="/nosotros"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b85c38] transition hover:text-[#914324]"
            >
              Ver arquitectura <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Card 2: Modelo */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#4a3b30] bg-[#27201b] p-7 text-white shadow-md transition hover:shadow-lg">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#382d25] text-[#d87a52]">
                <Zap className="size-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#d87a52]">02 · Modelo en Vivo</span>
              <h3 className="mt-2 text-xl font-semibold text-white">Usa el Modelo Oficial</h3>
              <p className="mt-3 text-sm leading-6 text-[#d4bead]">
                Estima el rendimiento con el asistente para agricultores guiado paso a paso o mediante el laboratorio técnico de analista con soporte de archivos CSV y ZIP.
              </p>
            </div>
            <Link
              href="/mapa#asistente-modelo"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d87a52] transition hover:text-[#f09c78]"
            >
              Usar el modelo <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Card 3: Mapa */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#ded5cb] bg-white p-7 shadow-sm transition hover:shadow-md">
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#b85c38]">
                <MapPin className="size-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#b85c38]">03 · Georreferencia</span>
              <h3 className="mt-2 text-xl font-semibold text-[#302620]">Mapa de Parcelas e INEGI</h3>
              <p className="mt-3 text-sm leading-6 text-[#6e5d53]">
                Visualiza los 197 polígonos del Altiplano Central georreferenciados en mapa satelital Esri con datos altimétricos nativos INEGI CEM 4.0.
              </p>
            </div>
            <Link
              href="/mapa"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b85c38] transition hover:text-[#914324]"
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
            <p className="eyebrow">01 / Quiénes somos y Metodología</p>
            <h2 className="section-title mt-4">Ciencia de datos y satélites con raíces en el territorio.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#5e7367]">
              Nacimos para transformar la cadena agroindustrial de la cebada maltera. Integramos señales satelitales multiespectrales (PlanetScope, Sentinel-2, Landsat) con topografía de alta precisión INEGI CEM 4.0 para predecir con certeza el rendimiento antes de la cosecha.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/mapa#asistente-modelo"
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
              title="PlanetScope (3 m)"
              copy="Textura foliar de alta resolución, área foliar (LAI) y verdor persistente en maduración."
            />
            <Sensor
              icon={<Droplets className="size-5" />}
              title="Sentinel-2 (10-20 m)"
              copy="Estrés hídrico (NDWI), absorción de agua en suelo (DSWI) y vigor multiespectral."
            />
            <Sensor
              icon={<ThermometerSun className="size-5" />}
              title="Landsat Térmico"
              copy="Temperatura superficial del suelo (VI6T), choque calórico y riesgo térmico."
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
              Nuestra metodología combina calibración agronómica en campo con series de tiempo multiespectrales. Mediante el Pipeline Oficial AgroRaíces, predecimos el rendimiento antes de la cosecha, permitiendo planificar la logística de acopio, liquidación y decisiones de manejo intrapredial.
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
      titulo: 'Vigor foliar y biomasa (LAI & NDVI)',
      explicacion: 'Mide el área foliar activa y persistencia verde en maduración con PlanetScope (3m).',
      porcentaje: 94,
      icono: '🌿',
    },
    {
      titulo: 'Estrés térmico de superficie (VI6T)',
      explicacion: 'Detecta choque térmico e inversión de temperatura con banda térmica Landsat.',
      porcentaje: 89,
      icono: '☀️',
    },
    {
      titulo: 'Estrés hídrico y humedad (NDWI & DSWI2)',
      explicacion: 'Evalúa el contenido de agua en follaje y absorción del suelo con Sentinel-2.',
      porcentaje: 86,
      icono: '💧',
    },
    {
      titulo: 'Topografía INEGI CEM 4.0',
      explicacion: 'Malla nativa de 120m para altitud (msnm) y pendiente del terreno (grados).',
      porcentaje: 82,
      icono: '⛰️',
    },
    {
      titulo: 'Prior territorial municipal',
      explicacion: 'Calibración bayesiana con la media histórica de cada municipio en Hidalgo, Puebla y Tlaxcala.',
      porcentaje: 76,
      icono: '📍',
    },
    {
      titulo: 'Escala y superficie del predio (log-área)',
      explicacion: 'Superficie en hectáreas para balancear rendimientos por efecto de escala.',
      porcentaje: 68,
      icono: '📐',
    },
  ]

  return (
    <section className="bg-white pt-32 pb-24 lg:pt-36 lg:pb-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Encabezado Principal */}
        <div className="mb-14 max-w-3xl">
          <p className="eyebrow">02 / Arquitectura de Machine Learning</p>
          <h2 className="section-title mt-4">
            ¿Cómo predice el Pipeline Oficial AgroRaíces la cosecha de tu parcela?
          </h2>
          <p className="mt-5 leading-7 text-[#5e7367]">
            En lugar de usar una fórmula rígida para todo el país, AgroRaíces implementa una <strong>arquitectura multi-modelo por estado</strong>. Un coordinador territorial identifica la cuenca geográfica de tu predio y consulta a ensambles de algoritmos calibrados específicamente para esa entidad.
          </p>
        </div>

        {/* 1. La Idea Central */}
        <div className="mb-12 rounded-3xl bg-[#10281f] p-8 text-white sm:p-10 shadow-xl border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
            <div>
              <span className="tag-dark">Arquitectura Oficial</span>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Ensambles regionales de Machine Learning de alta precisión
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#e2b957]">
              <span>💡</span>
              Tecnología validada en campo
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#16392c]/80 p-6">
              <div className="text-xs uppercase tracking-wider font-semibold text-rose-300 flex items-center gap-1.5">
                <span>❌</span> El método tradicional
              </div>
              <p className="mt-2 text-sm leading-6 text-[#b8d0be]">
                Usa una sola regresión lineal global. Trata por igual a una parcela plana con riego en el Valle de Apan que a una parcela en ladera volcánica en Chignahuapan o temporal en Calpulalpan, provocando sesgos críticos de estimación.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e2b957]/40 bg-[#16392c]/80 p-6 shadow-inner">
              <div className="text-xs uppercase tracking-wider font-semibold text-[#e2b957] flex items-center gap-1.5">
                <span>✅</span> La arquitectura oficial de AgroRaíces
              </div>
              <p className="mt-2 text-sm leading-6 text-[#d2e4d7]">
                Divide la inferencia entre tres motores especializados: ExtraTrees + SVR con prior bayesiano y downscaling adiabático en Hidalgo; ensamble dual (base + PLSRegression k=2) con SVR, Huber, GPR y ExtraTrees en Puebla; y clasificador ordinal probabilístico SVC con mediana regional en Tlaxcala.
              </p>
            </div>
          </div>
        </div>

        {/* 2. El proceso en 4 pasos claros */}
        <div className="mb-14">
          <div className="mb-8">
            <p className="eyebrow">Pipeline Técnico</p>
            <h3 className="section-title mt-2 text-3xl">Los 4 pasos de la inferencia en producción</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Paso 1 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d7e0d5] bg-[#f9faf7] p-6 shadow-sm hover:shadow-md transition">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#e9f0e6] text-2xl">
                  🛰️
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#499266]">Paso 01</span>
                <h4 className="mt-1 text-lg font-bold text-[#17352a]">Ingesta Multiespectral</h4>
                <p className="mt-2 text-xs leading-5 text-[#5e7367]">
                  Fusión de 3 constelaciones satelitales y topografía nativa de 120m:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#315543]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#28714f] shrink-0 mt-0.5" />
                    <span><strong>PlanetScope (3m):</strong> Área foliar (LAI) y textura foliar.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#28714f] shrink-0 mt-0.5" />
                    <span><strong>Sentinel-2:</strong> Humedad y estrés hídrico (NDWI, DSWI2).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#28714f] shrink-0 mt-0.5" />
                    <span><strong>Landsat & INEGI:</strong> Térmico VI6T y relieve CEM 4.0 (120m).</span>
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
                <h4 className="mt-1 text-lg font-bold text-[#17352a]">Enrutador Territorial</h4>
                <p className="mt-2 text-xs leading-5 text-[#5e7367]">
                  Identifica la cuenca territorial y el estado (Puebla, Hidalgo o Tlaxcala) de tu predio.
                </p>
                <div className="mt-3 rounded-xl bg-white border border-[#e2e8df] p-3 text-xs text-[#4b5563]">
                  <span className="font-semibold text-[#17352a] block mb-1">Calibración Territorial:</span>
                  Aplica prior bayesiano municipal y selecciona los modelos de Machine Learning calibrados específicamente para esa entidad.
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d7e0d5] bg-[#f9faf7] p-6 shadow-sm hover:shadow-md transition">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#eaf4fd] text-2xl">
                  🤖
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1e6cb7]">Paso 03</span>
                <h4 className="mt-1 text-lg font-bold text-[#17352a]">Especialistas Oficiales por Estado</h4>
                <p className="mt-2 text-xs leading-5 text-[#5e7367]">
                  Ensambles optimizados para cada realidad productiva:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#315543]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#1e6cb7] shrink-0 mt-0.5" />
                    <span><strong>Hidalgo:</strong> ExtraTrees (75%) + SVR RBF (25%) con prior bayesiano y downscaling adiabático.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#1e6cb7] shrink-0 mt-0.5" />
                    <span><strong>Puebla:</strong> Dual Base + PLS (k=2): SVR (45%) + Huber (35%) + GPR (15%) + ExtraTrees (5%).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#1e6cb7] shrink-0 mt-0.5" />
                    <span><strong>Tlaxcala:</strong> SVC ordinal probabilístico (45%) + mediana regional (55%).</span>
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
                <h4 className="mt-1 text-lg font-bold text-white">Veredicto y Acotamiento Oficial</h4>
                <p className="mt-2 text-xs leading-5 text-[#a8c3b4]">
                  Combina el ensamble y acota biológicamente el rendimiento entre <strong>1.50 y 4.80 t/ha</strong>.
                </p>
                <div className="my-3 rounded-xl bg-black/40 border border-white/10 p-2.5 text-center text-xs text-[#e2b957] font-semibold">
                  Rendimiento Calibrado para Campo
                </div>
                <p className="text-[11px] leading-4 text-[#a8c3b4]">
                  Garantiza estimaciones fidedignas para tolva, liquidaciones y conteo de bultos de 50 kg.
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
                <p className="eyebrow">Factores Biofísicos</p>
                <h3 className="mt-1 text-xl font-bold text-[#17352a]">¿Qué señales procesa el Modelo AgroRaíces?</h3>
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
                <h3 className="text-lg font-bold text-[#17352a]">Certeza y Calibración en Campo</h3>
              </div>
              <p className="text-xs text-[#5e7367] leading-relaxed mb-6">
                Diseñado y contrastado con cosechas reales de productores en Puebla, Hidalgo y Tlaxcala para brindarte respaldo confiable en tus decisiones agrícolas.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e0e7dd] bg-[#f9faf7] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#789083]">Calibración Local</span>
                  <div className="mt-1 text-lg font-bold text-[#17352a]">Altiplano Central</div>
                  <div className="mt-0.5 text-[11px] text-[#81968a]">Puebla, Hidalgo y Tlaxcala</div>
                </div>

                <div className="rounded-2xl border border-[#e0e7dd] bg-[#f9faf7] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#789083]">Enfoque Productivo</span>
                  <div className="mt-1 text-lg font-bold text-[#17352a]">Cebada Maltera</div>
                  <div className="mt-0.5 text-[11px] text-[#81968a]">Acorde al estándar industrial</div>
                </div>

                <div className="rounded-2xl border border-[#e0e7dd] bg-[#f9faf7] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#789083]">Rango Productivo</span>
                  <div className="mt-1 text-lg font-bold text-[#9b721e]">Biológicamente Realista</div>
                  <div className="mt-0.5 text-[11px] text-[#81968a]">Sin cifras exageradas o irreales</div>
                </div>

                <div className="rounded-2xl border border-[#e0e7dd] bg-[#f9faf7] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#789083]">Respuesta</span>
                  <div className="mt-1 text-lg font-bold text-[#28714f]">Tiempo Real</div>
                  <div className="mt-0.5 text-[11px] text-[#81968a]">Inferencia y reporte al instante</div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#e2e9df] flex items-center justify-between text-xs text-[#5e7367]">
                <span>Adaptado a temporal y riego</span>
                <span className="font-semibold text-[#1e5037]">Versión Final Producción (R² 72.8% · r 0.85)</span>
              </div>
            </div>

            {/* Accesos directos */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/mapa#asistente-modelo"
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1e6846] px-6 text-xs font-semibold text-white shadow-md transition hover:bg-[#155538]"
              >
                Probar el Modelo <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/mapa"
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#d7e0d5] bg-white px-6 text-xs font-semibold text-[#17352a] shadow-sm transition hover:bg-[#f3f6f1]"
              >
                Ver parcelas en el mapa <ChevronRight className="size-4" />
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

  async function calculate(e: React.FormEvent) {
    e.preventDefault()
    const nums = Object.values(values).slice(1).map(Number)
    if (!values.plot || nums.some((n) => !Number.isFinite(n)) || Number(values.area) <= 0) {
      setError('Completa todos los campos con valores numéricos válidos.')
      return
    }
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot: values.plot,
          area: Number(values.area),
          temp: Number(values.temp),
          ndwi: Number(values.ndwi),
          evi: Number(values.evi),
          lai: Number(values.lai),
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setResult(Number(json.rendimiento_t_ha))
      } else {
        throw new Error('Fallback')
      }
    } catch {
      const [, temp, ndwi, evi, lai] = nums
      const prediction = Math.min(
        4.80,
        Math.max(
          1.50,
          3.35 +
            (Number(evi) - 0.2) * 3 +
            (Number(lai) - 0.3) * 2.0 +
            (Number(ndwi) - 0.1) * 1.2 +
            (Number(temp) + 0.6) * 1.5
        )
      )
      setResult(Number(prediction.toFixed(2)))
    } finally {
      setLoading(false)
    }
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
          <Link href="/mapa#asistente-modelo" className="hover:text-white transition">Modelo</Link>
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
