'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { scrollWorldStations } from '@/data/agroraices'
import { Satellite, Mountain, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react'

const STATION_IMAGES = [
  '/photos/satelite1.webp',
  '/photos/satelite2.webp',
  '/photos/person.webp',
]

export function ScrollWorld() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const totalSlides = scrollWorldStations.length

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [isPaused, nextSlide])

  const currentStation = scrollWorldStations[activeIndex] || scrollWorldStations[0]
  const stationIcons = [Satellite, Mountain, UserCheck]
  const ActiveIcon = stationIcons[activeIndex] || Satellite

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Carrusel de funcionamiento de AgroRaíces"
    >
      <div className="relative h-[520px] sm:h-[640px] lg:h-[720px] w-full overflow-hidden border-y border-[#3d2e24] bg-[#1b1410]">
        {/* Diapositivas de imágenes a ancho completo */}
        {STATION_IMAGES.map((src, idx) => {
          const isActive = idx === activeIndex
          return (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={src}
                alt={scrollWorldStations[idx]?.title || 'Imagen AgroRaíces'}
                fill
                priority={idx === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )
        })}

        {/* Degradados oscuros para lectura clara */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#1b1410] via-[#1b1410]/55 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-[#1b1410]/90 via-[#1b1410]/35 to-transparent" />

        {/* Contenido explicativo sencillo alineado al contenedor principal */}
        <div className="absolute inset-x-0 bottom-0 z-30">
          <div className="mx-auto max-w-7xl px-6 pb-10 sm:px-10 sm:pb-14 lg:px-14 lg:pb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d87a52]/40 bg-[#27201b]/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#f0ded3] backdrop-blur-md">
                <ActiveIcon className="size-3.5 text-[#d87a52]" aria-hidden="true" />
                <span>{currentStation.badge}</span>
              </div>

              <h2 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {currentStation.title}
              </h2>
              <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#e2b957]">
                {currentStation.subtitle}
              </p>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-[#dcd2c9] sm:text-base">
                {currentStation.description}
              </p>
            </div>

            {/* Controles del Carrusel (Anterior / Siguiente + Indicadores) */}
            <div className="flex items-center gap-3 self-start sm:self-end shrink-0">
              <div className="flex items-center gap-2 mr-2">
                {scrollWorldStations.map((st, idx) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Ir a diapositiva ${idx + 1}: ${st.title}`}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === activeIndex
                        ? 'w-8 bg-[#e2b957]'
                        : 'w-2.5 bg-white/35 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={prevSlide}
                aria-label="Foto anterior"
                className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-[#27201b]/85 text-white backdrop-blur-md transition-colors hover:border-[#e2b957] hover:bg-[#382d25] cursor-pointer"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Siguiente foto"
                className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-[#27201b]/85 text-white backdrop-blur-md transition-colors hover:border-[#e2b957] hover:bg-[#382d25] cursor-pointer"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScrollWorld
