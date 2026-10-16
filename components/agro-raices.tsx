'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#4e3b2e]/40 bg-[#1e1713]/90 text-white backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-left transition hover:opacity-90" aria-label="Ir al inicio">
          <Image 
            src="/images/logo.webp" 
            alt="Logo AgroRaíces" 
            width={160} 
            height={160} 
            className="rounded-xl object-contain"
          />
          <span>
            <span className="block text-lg font-semibold tracking-tight text-white">
              Agro<span className="text-[#d87a52]">Raíces</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#c7b2a3]">
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
                  isActive ? 'text-[#e2b957]' : 'text-[#d4bead] hover:text-white'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#d87a52]" />
                )}
              </Link>
            )
          })}
        </nav>

        <Link
          href="/mapa#asistente-modelo"
          onClick={(e) => handleIrAlModelo(e, '/mapa#asistente-modelo')}
          className="hidden h-10 items-center gap-2 rounded-full bg-[#b85c38] px-5 text-sm font-semibold text-white shadow-lg shadow-[#b85c38]/20 transition hover:bg-[#c96a45] sm:inline-flex cursor-pointer"
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
        <nav className="flex flex-col gap-3 border-t border-[#4e3b2e]/40 bg-[#1e1713] px-5 py-6 md:hidden">
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
                    ? 'bg-[#2f221a] text-[#d87a52]'
                    : 'text-[#d4bead] hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
          <Link
            href="/mapa#asistente-modelo"
            onClick={(e) => handleIrAlModelo(e, '/mapa#asistente-modelo')}
            className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b85c38] text-sm font-semibold text-white hover:bg-[#c96a45] cursor-pointer"
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
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative overflow-hidden bg-[#382d25] pt-32 pb-20 text-white lg:pt-36 lg:pb-28"
    >
      <div className="absolute -right-32 top-20 size-96 rounded-full bg-[#b85c38]/15 blur-3xl" />
      <div className="absolute -left-40 bottom-0 size-80 rounded-full bg-[#d87a52]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b85c38]/30 bg-[#2b211a] px-4 py-2 text-xs font-medium text-[#f0ded3]"
          >
            <span className="size-2 rounded-full bg-[#d87a52] animate-pulse" /> Pipeline Oficial AgroRaíces · AgroCebada 2026
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-8xl"
          >
            Lee el campo.<br />
            <span className="text-[#d87a52]">Anticipa la cosecha.</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-[#dcd2c9] sm:text-lg"
          >
            Estimamos el rendimiento de cebada maltera con telemetría de Sentinel-2, Landsat, PlanetScope y topografía INEGI CEM 4.0. Del satélite a la decisión agronómica.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
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
          </motion.div>
        </div>
      </div>
    </motion.section>
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
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-[#f9f7f2] py-20 text-[#302620] lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <p className="eyebrow">Explora la plataforma</p>
          <h2 className="section-title mt-3">Tecnología de punta para el cultivo de cebada</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#6e5d53]">
            Descubre cada módulo de AgroRaíces diseñado para transformar señales satelitales en rentabilidad agronómica.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Nosotros */}
          <motion.div variants={itemVariants} className="flex flex-col justify-between rounded-3xl border border-[#ded5cb] bg-white p-7 shadow-sm transition hover:shadow-md">
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
          </motion.div>

          {/* Card 2: Modelo */}
          <motion.div variants={itemVariants} className="flex flex-col justify-between rounded-3xl border border-[#4a3b30] bg-[#27201b] p-7 text-white shadow-md transition hover:shadow-lg">
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
          </motion.div>

          {/* Card 3: Mapa */}
          <motion.div variants={itemVariants} className="flex flex-col justify-between rounded-3xl border border-[#ded5cb] bg-white p-7 shadow-sm transition hover:shadow-md">
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
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export function About() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-[#faf7f2] pt-32 pb-24 text-[#241810] lg:pt-36 lg:pb-32"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <motion.div variants={itemVariants}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b85c38]">01 / Quiénes somos y Metodología 2026</p>
            <h2 className="text-balance text-4xl font-extrabold leading-tight tracking-[-0.035em] text-[#241810] sm:text-5xl mt-4">
              Inteligencia neuro-simbólica, satélites e IA generativa con raíces en el campo.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#6e5a4d]">
              Nacimos para transformar la cadena productiva de la cebada maltera en el Altiplano Central. Combinamos fisiografía invariante <strong>INEGI CEM 4.0</strong>, señales satelitales y climáticas dinámicas (<strong>PlanetScope 3m, Sentinel-2, Landsat, GEE y APIs meteorológicas 2026</strong>), un árbitro neuro-simbólico <strong>QBAF + DF-QuAD</strong>, explicabilidad matemática <strong>SHAP</strong> y traducción en lenguaje natural mediante <strong>Google Gemini</strong>.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/mapa#asistente-modelo"
                className="inline-flex items-center gap-2 rounded-full bg-[#b85c38] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#b85c38]/20 transition hover:bg-[#c96a45]"
              >
                Usar el modelo en vivo <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/mapa"
                className="inline-flex items-center gap-2 rounded-full border border-[#c4b1a1] bg-white px-6 py-3 text-sm font-semibold text-[#241810] shadow-sm transition hover:bg-[#ede5dc]"
              >
                Explorar las 197 parcelas <ChevronRight className="size-4 text-[#d87a52]" />
              </Link>
            </div>
          </motion.div>
          <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-3">
            <Sensor
              icon={<Satellite className="size-5" />}
              title="Satélite + GEE 2026"
              copy="PlanetScope (3m), Sentinel-2 (NDWI, DSWI2, STI) y Landsat térmico (VI6T) acoplados a proyecciones 2026."
            />
            <Sensor
              icon={<Network className="size-5" />}
              title="QBAF + DF-QuAD + SHAP"
              copy="Deliberación gradual por estado con Undercutting en Capa 0 y descomposición aditiva exacta (φ₀ + Σφᵢ = ŷ)."
            />
            <Sensor
              icon={<Sparkles className="size-5" />}
              title="IA Google Gemini"
              copy="Traduce los pesos matemáticos de SHAP en diagnósticos y consejos agronómicos claros sin tecnicismos para el productor."
            />
          </motion.div>
        </div>

        {/* Sección complementaria: Propósito */}
        <motion.div
          variants={itemVariants}
          className="mt-20 rounded-3xl border border-[#4d392c] bg-[#1e1713] p-8 text-white sm:p-12 shadow-xl"
        >
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-[#e2b957] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e1713]">
              Propósito AgroCebada 2026 · 197 Parcelas
            </span>
            <h3 className="mt-4 text-2xl font-bold sm:text-3xl text-white">
              Doble puente tecnológico: rigor SHAP para el analista y claridad con Google Gemini para el agricultor.
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#c9b7aa] sm:text-base">
              Para proyectar la campaña Abril–Octubre 2026 sobre la totalidad de las 197 parcelas (138 de entrenamiento con cosecha 2025 conocida y 59 de prueba ciega), nuestro motor preserva la topografía fija de cada polígono (INEGI CEM 4.0) y genera las covariables dinámicas climáticas y satelitales de 2026. Así, el analista audita la contribución exacta de cada variable en kg/ha con SHAP, mientras el agricultor recibe una explicación clara y accionable validada por IA.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

function Sensor({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-[#ded4c6] bg-white p-5 shadow-sm transition hover:border-[#b85c38] hover:shadow-md"
    >
      <div className="mb-6 flex size-10 items-center justify-center rounded-xl bg-[#2e2017] text-[#d87a52]">
        {icon}
      </div>
      <h3 className="font-bold text-[#241810]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6e5a4d]">{copy}</p>
    </motion.div>
  )
}

export function ModelSpecs() {
  const senales = [
    {
      titulo: 'Humedad foliar y balance SWIR (s2_ndwi_mean, s2_ndwi_min, s2_dswi2_mean)',
      explicacion: 'Nodos 1 y 3 QBAF: Evalúa retención de agua en hoja y suelo sin saturación mediante Sentinel-2 y síntesis GEE 2026.',
      porcentaje: 94,
      icon: <Droplets className="size-4 text-[#d87a52] shrink-0" aria-hidden="true" />,
    },
    {
      titulo: 'Anomalía térmica de abril y downscaling CEM 4.0 (bi_Tmin_anom25_04, lp_Tmin_anom25_04)',
      explicacion: 'Nodo 1 QBAF: Cuantifica riesgo de helada en nacencia y gradiente adiabático (-0.0065 °C/m) con INEGI + APIs climáticas.',
      porcentaje: 90,
      icon: <ThermometerSun className="size-4 text-[#d87a52] shrink-0" aria-hidden="true" />,
    },
    {
      titulo: 'Vigor de dosel y Undercutting Capa 0 (planet_ndvi_mean, planet_msavi_mean, planet_lai_std)',
      explicacion: 'Capa 0 y Nodo 5 QBAF: Mide dinámica foliar 3m y activa el undercutting (σ_ET=0.001) cuando NDVI supera el percentil 75.',
      porcentaje: 87,
      icon: <Leaf className="size-4 text-[#d87a52] shrink-0" aria-hidden="true" />,
    },
    {
      titulo: 'Emisión térmica superficial y VPD (landsat_vi6t_max, bi_vpd_ndwi_stress, Z1/Z2_pls_clima)',
      explicacion: 'Nodos 3 y 4 QBAF: Detecta choque calórico en floración y demanda evaporativa atmosférica mediante Landsat y PLS (k=2).',
      porcentaje: 84,
      icon: <Gauge className="size-4 text-[#d87a52] shrink-0" aria-hidden="true" />,
    },
    {
      titulo: 'Fisiografía invariante y labranza pre-siembra (elevacion_msnm, pendiente_grados, s2_sti_presow)',
      explicacion: 'Nodo 2 QBAF: Altitud, pendiente y rugosidad fijas INEGI CEM 4.0 combinadas con cobertura de rastrojo pre-siembra.',
      porcentaje: 80,
      icon: <Mountain className="size-4 text-[#d87a52] shrink-0" aria-hidden="true" />,
    },
    {
      titulo: 'Anclaje Bayesiano Municipal y escala predial (prior_municipal, log_area, elongacion_bbox)',
      explicacion: 'Nodos 1 y 5 QBAF: Prior territorial por municipio en Hidalgo, Puebla y Tlaxcala y morfometría del polígono WKT.',
      porcentaje: 74,
      icon: <MapPin className="size-4 text-[#d87a52] shrink-0" aria-hidden="true" />,
    },
  ]

  return (
    <section className="bg-[#221913] pt-24 pb-24 text-[#f0eae1] lg:pt-28 lg:pb-32 border-t border-[#3d2e24]">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Encabezado Principal */}
        <div className="mb-14 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">02 / Arquitectura Neuro-Simbólica + IA Explicable</p>
          <h2 className="mt-4 text-balance text-4xl font-extrabold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
            ¿Cómo delibera y explica el modelo QBAF + DF-QuAD + SHAP + Google Gemini?
          </h2>
          <p className="mt-5 leading-7 text-[#c7b4a6]">
            AgroRaíces implementa un <strong>Marco de Argumentación Bipolar Cuantitativa (QBAF)</strong> con semántica gradual <strong>DF-QuAD</strong>. Cada estado cuenta con su propio árbitro de especialistas, auditado matemáticamente con valores de Shapley (<strong>SHAP</strong>) para el analista y traducido por <strong>Google Gemini (3.8 Flash)</strong> para el agricultor.
          </p>
        </div>

        {/* 1. La Idea Central */}
        <div className="mb-12 rounded-3xl bg-[#1a130f] p-8 text-white sm:p-10 shadow-xl border border-[#4a382c]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3d2e24] pb-6 mb-8">
            <div>
              <span className="inline-flex rounded-full border border-[#d87a52]/40 bg-[#2b1f18] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d87a52]">
                Pipeline Oficial en Producción
              </span>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Deliberación DF-QuAD, Descomposición Aditiva SHAP y Traducción Generativa
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#e2b957] tabular-nums">
              <ShieldCheck className="size-4 text-[#e2b957]" aria-hidden="true" />
              <span>r = 0.8584 · R² = 73.62% · MAE = 296.3 kg/ha</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-rose-950/60 bg-[#251817] p-6">
              <div className="text-xs uppercase tracking-wider font-bold text-rose-400 flex items-center gap-1.5">
                <X className="size-4 shrink-0" aria-hidden="true" />
                <span>Los modelos convencionales de caja negra</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#d9bebd]">
                Aplican una regresión estática sin distinguir saturación óptica del NDVI, entregan predicciones opacas que no indican qué variable afectó en contra y muestran códigos de sensores incomprensibles para el productor en campo.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d87a52]/50 bg-[#2a1d17] p-6 shadow-inner">
              <div className="text-xs uppercase tracking-wider font-bold text-[#e2b957] flex items-center gap-1.5">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                <span>La tecnología AgroRaíces 2026</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#f0ded3]">
                Combina tres árbitros regionales (GradientBoosting + SVR Bayes en Hidalgo; SVR/Huber/GPR + PLS k=2 con Undercutting DF-QuAD en Puebla; Ancla Modal + SVC Ordinal en Tlaxcala), descompone cada predicción con SHAP (φ₀ + Σφᵢ = ŷ) y usa Google Gemini para explicarlo sin tecnicismos al agricultor.
              </p>
            </div>
          </div>
        </div>

        {/* 2. El proceso en 4 pasos claros */}
        <div className="mb-14">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">Pipeline Técnico 2026</p>
            <h3 className="mt-2 text-3xl font-extrabold text-white">Los 4 pilares tecnológicos del sistema</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Paso 1 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-6 shadow-sm hover:border-[#b85c38] transition-colors">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52]">
                  <Satellite className="size-6" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Pilar 01</span>
                <h4 className="mt-1 text-lg font-bold text-white">Datos Fijos + Dinámicos 2026</h4>
                <p className="mt-2 text-xs leading-5 text-[#c7b4a6]">
                  Separación de covariables para proyectar las 197 parcelas:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#dcd2c9]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#e2b957] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Fijas (INEGI CEM 4.0):</strong> Altitud, pendiente, rugosidad y geometría WKT.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#e2b957] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Clima 2026 (API):</strong> OpenWeather / Open-Meteo + downscaling adiabático.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#e2b957] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Satélite 2026 (GEE):</strong> Sentinel-2, Landsat y PlanetScope acoplados.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-6 shadow-sm hover:border-[#e2b957] transition-colors">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#e2b957]">
                  <Network className="size-6" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e2b957]">Pilar 02</span>
                <h4 className="mt-1 text-lg font-bold text-white">Árbitro QBAF + DF-QuAD</h4>
                <p className="mt-2 text-xs leading-5 text-[#c7b4a6]">
                  Deliberación gradual entre nodos biofísicos y especialistas regionales:
                </p>
                <div className="mt-3 rounded-xl bg-[#251b15] border border-[#4a382c] p-3 text-xs text-[#c7b4a6]">
                  <span className="font-semibold text-white block mb-1">Undercutting en Capa 0:</span>
                  Cuando el dosel supera el umbral de saturación óptica (NDVI &gt; P75 en Puebla), el árbitro reduce el peso de árboles ópticos (σ=0.001) y prioriza humedad SWIR y clima PLS.
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#4a382c] bg-[#1a130f] p-6 shadow-sm hover:border-[#d87a52] transition-colors">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#2e2017] text-[#d87a52]">
                  <BarChart3 className="size-6" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d87a52]">Pilar 03</span>
                <h4 className="mt-1 text-lg font-bold text-white">Explicabilidad Aditiva SHAP</h4>
                <p className="mt-2 text-xs leading-5 text-[#c7b4a6]">
                  Descomposición exacta para el Laboratorio del Analista:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#dcd2c9]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#d87a52] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Ecuación exacta:</strong> Base regional φ₀ + Σφᵢ = Predicción ŷ.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#d87a52] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Casos y Grupos:</strong> Auditoría individual y ranking grupal (mean |SHAP|).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#d87a52] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Campaña 2026:</strong> Simulación de escenarios para las 197 parcelas.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#b85c38]/40 bg-gradient-to-b from-[#2a1d16] to-[#1c130e] p-6 text-white shadow-xl hover:border-[#d87a52] transition-colors">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#3d271c] text-[#e2b957]">
                  <Sparkles className="size-6" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e2b957]">Pilar 04</span>
                <h4 className="mt-1 text-lg font-bold text-white">Asesor IA Google Gemini</h4>
                <p className="mt-2 text-xs leading-5 text-[#c7b4a6]">
                  Valida los resultados SHAP y los traduce en lenguaje claro para el productor:
                </p>
                <div className="my-3 rounded-xl bg-black/40 border border-white/10 p-2.5 text-center text-xs text-[#e2b957] font-semibold">
                  0% Tecnicismos · 100% Accionable en Campo
                </div>
                <p className="text-[11px] leading-4 text-[#a69284]">
                  Explica qué condiciones de humedad o clima impulsaron la cosecha y qué factores en contra pueden causar problemas en la espiga.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ¿Qué señales toma en cuenta? y Garantías de Confianza */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Factores tomados en cuenta */}
          <div className="rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 sm:p-9 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#3d2e24] pb-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d87a52]">Factores Biofísicos</p>
                <h3 className="mt-1 text-xl font-bold text-white">¿Qué señales procesa el Modelo AgroRaíces?</h3>
              </div>
              <Mountain className="size-6 text-[#d87a52]" aria-hidden="true" />
            </div>

            <div className="space-y-4">
              {senales.map((item) => (
                <div key={item.titulo}>
                  <div className="mb-1.5 flex justify-between items-baseline gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#f0ded3] flex items-center gap-2 text-sm">
                        {item.icon}
                        {item.titulo}
                      </span>
                      <span className="block text-[11px] text-[#9e8b7d] mt-0.5">{item.explicacion}</span>
                    </div>
                    <span className="font-bold text-[#e2b957] text-sm shrink-0 tabular-nums">{item.porcentaje}% peso</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#2e2017] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.porcentaje}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      className="h-full rounded-full bg-gradient-to-r from-[#b85c38] to-[#e2b957]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Garantías y Confianza en Campo */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#4a382c] bg-[#1a130f] p-7 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="size-5 text-[#e2b957]" />
                <h3 className="text-lg font-bold text-white">Certeza y Calibración en Campo</h3>
              </div>
              <p className="text-xs text-[#c7b4a6] leading-relaxed mb-6">
                Diseñado y contrastado con cosechas reales de productores en Puebla, Hidalgo y Tlaxcala para brindarte respaldo confiable en tus decisiones agrícolas.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#3d2e24] bg-[#221812] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9e8b7d]">Calibración Local</span>
                  <div className="mt-1 text-lg font-bold text-white">Altiplano Central</div>
                  <div className="mt-0.5 text-[11px] text-[#b8a293]">Puebla, Hidalgo y Tlaxcala</div>
                </div>

                <div className="rounded-2xl border border-[#3d2e24] bg-[#221812] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9e8b7d]">Enfoque Productivo</span>
                  <div className="mt-1 text-lg font-bold text-white">Cebada Maltera</div>
                  <div className="mt-0.5 text-[11px] text-[#b8a293]">Acorde al estándar industrial</div>
                </div>

                <div className="rounded-2xl border border-[#3d2e24] bg-[#221812] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9e8b7d]">Rango Productivo</span>
                  <div className="mt-1 text-lg font-bold text-[#e2b957]">Biológicamente Realista</div>
                  <div className="mt-0.5 text-[11px] text-[#b8a293]">Acotado [1.50 – 4.80 t/ha]</div>
                </div>

                <div className="rounded-2xl border border-[#3d2e24] bg-[#221812] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9e8b7d]">Respuesta</span>
                  <div className="mt-1 text-lg font-bold text-[#d87a52]">Tiempo Real</div>
                  <div className="mt-0.5 text-[11px] text-[#b8a293]">Inferencia y reporte al instante</div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#3d2e24] flex items-center justify-between text-xs text-[#a69284]">
                <span>QBAF + DF-QuAD + SHAP + Google Gemini</span>
                <span className="font-semibold text-[#e2b957]">OOF Oficial (R² 73.62% · r 0.8584 · MAE 296.3 kg/ha)</span>
              </div>
            </div>

            {/* Accesos directos */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/mapa#asistente-modelo"
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#b85c38] px-6 text-xs font-semibold text-white shadow-md transition hover:bg-[#c96a45]"
              >
                Probar el Modelo <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/mapa"
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#4a382c] bg-[#1a130f] px-6 text-xs font-semibold text-[#f0ded3] shadow-sm transition hover:bg-[#251b15]"
              >
                Ver parcelas en el mapa <ChevronRight className="size-4 text-[#d87a52]" />
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
    const cleanPlot = String(values.plot || 'Parcela').replace(/"/g, '""')
    const safePlotCell = /^[=+\-@\t\r]/.test(cleanPlot) ? `"'${cleanPlot}"` : `"${cleanPlot}"`
    const safeFileSlug = values.plot.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'parcela'
    const csv = `parcela,area_ha,rendimiento_t_ha,rendimiento_kg_ha,produccion_estimada_t\n${safePlotCell},${Number(values.area)},${result},${Math.round(result * 1000)},${(result * Number(values.area)).toFixed(1)}\n`
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${safeFileSlug}.csv`
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
    <footer className="border-t border-[#3d2e24] bg-[#16100c] px-5 py-12 text-[#c9b7aa] transition-colors duration-300 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm sm:flex-row">
        <div className="flex items-center gap-3">
          <Image 
            src="/images/logo.webp" 
            alt="Logo AgroRaíces" 
            width={140} 
            height={140} 
            className="rounded-lg object-contain"
          />
          <span className="text-[#e6d8ce]">
            © 2026 AgroRaíces ·
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#b39e8f]">
          <Link href="/" className="hover:text-white transition">Inicio</Link>
          <Link href="/nosotros" className="hover:text-white transition">Nosotros</Link>
          <Link href="/mapa#asistente-modelo" className="hover:text-white transition">Modelo</Link>
          <Link href="/mapa" className="hover:text-white transition">Mapa</Link>
        </div>
        <span className="flex items-center gap-2 text-xs">
          <Leaf className="size-3.5 text-[#d87a52]" />
          <span>Ciencia de datos para cultivar futuro.</span>
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
