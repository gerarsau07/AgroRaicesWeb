'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { scrollWorldStations } from '@/data/agroraices'
import { Satellite, Mountain, UserCheck, ArrowDown } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATION_IMAGES = [
  '/photos/satelite1.webp',
  '/photos/satelite2.webp',
  '/photos/person.webp',
]

export function ScrollWorld() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeStationIndex, setActiveStationIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      // Main Scrubbing Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2, // Smooth butter momentum
          onUpdate: (self) => {
            const progress = self.progress
            const stationIdx = scrollWorldStations.findIndex(
              (s) => progress >= s.range[0] && progress <= s.range[1]
            )
            if (stationIdx !== -1 && stationIdx !== activeStationIndex) {
              setActiveStationIndex(stationIdx)
            }
          },
        },
      })

      // Animate image crossfades and continuous Ken Burns zoom/pan on scroll
      imageRefs.current.forEach((imgEl, idx) => {
        if (!imgEl) return
        if (idx === 0) {
          tl.to(imgEl, { opacity: 1, scale: 1.15, y: '0%', ease: 'none' }, 0)
            .to(imgEl, { opacity: 0, scale: 1.0, y: '-5%', ease: 'none' }, 0.35)
        } else if (idx === 1) {
          tl.fromTo(imgEl, { opacity: 0, scale: 1.0, y: '5%' }, { opacity: 1, scale: 1.12, y: '0%', ease: 'none' }, 0.3)
            .to(imgEl, { opacity: 0, scale: 1.05, y: '-5%', ease: 'none' }, 0.75)
        } else if (idx === 2) {
          tl.fromTo(imgEl, { opacity: 0, scale: 1.0, y: '5%' }, { opacity: 1, scale: 1.18, y: '0%', ease: 'none' }, 0.7)
        }
      })
    }, container)

    return () => {
      ctx.revert()
    }
  }, [activeStationIndex])

  const currentStation = scrollWorldStations[activeStationIndex] || scrollWorldStations[0]
  const stationIcons = [Satellite, Mountain, UserCheck]
  const ActiveIcon = stationIcons[activeStationIndex] || Satellite

  return (
    <div ref={containerRef} className="relative h-[320vh] w-full bg-[#1b1410]">
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Fullscreen Background Images with Scrubbing & Ken Burns */}
        {STATION_IMAGES.map((src, idx) => (
          <div
            key={src}
            ref={(el) => { imageRefs.current[idx] = el }}
            className="absolute inset-0 z-0 opacity-0 will-change-transform will-change-opacity"
            style={{ opacity: idx === 0 ? 1 : 0 }}
          >
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={src}
                alt={currentStation.title}
                fill
                priority={idx === 0}
                className="object-cover transform"
                sizes="100vw"
              />
            </div>
          </div>
        ))}

        {/* Cinematic Vignette, Grain & Ambient Earth Shading */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#1b1410] via-[#1b1410]/50 to-[#1b1410]/20" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#1b1410]/95 via-[#1b1410]/40 to-transparent sm:max-w-4xl" />
        <div className="pointer-events-none absolute inset-0 z-10 opacity-20 mix-blend-overlay bg-[radial-gradient(#d87a52_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Narrative HUD & Station Card (Bottom Left) */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-12 sm:px-12 sm:pb-16 lg:px-20">
          <div key={activeStationIndex} className="max-w-2xl transition-all duration-500 transform translate-y-0 opacity-100">
            {/* Station Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d87a52]/40 bg-[#27201b]/90 px-4 py-1.5 shadow-lg backdrop-blur-md">
              <ActiveIcon className="size-4 text-[#d87a52]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#f0ded3]">
                {currentStation.badge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">
              {currentStation.title}
            </h2>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[#d87a52]">
              {currentStation.subtitle}
            </p>

            {/* Description */}
            <p className="mt-4 text-pretty text-sm leading-relaxed text-[#dcd2c9] sm:text-base drop-shadow">
              {currentStation.description}
            </p>

            {/* Metrics Pills */}
            <div className="mt-6 flex flex-wrap gap-3">
              {currentStation.metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#27201b]/80 px-4 py-2 shadow-sm backdrop-blur-md transition hover:border-[#d87a52]/50"
                >
                  <span className="text-xs text-[#d4bead]">{m.label}:</span>
                  <span className="text-xs font-bold text-[#d87a52]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Timeline Progress HUD (Right Side) */}
        <div className="absolute right-6 top-1/2 z-20 -translate-y-1/2 flex flex-col items-center gap-4 sm:right-10">
          {scrollWorldStations.map((station, idx) => {
            const isActive = idx === activeStationIndex
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => {
                  const targetScroll = containerRef.current
                    ? containerRef.current.offsetTop + (containerRef.current.offsetHeight - window.innerHeight) * station.range[0]
                    : 0
                  window.scrollTo({ top: targetScroll, behavior: 'smooth' })
                }}
                className="group relative flex items-center cursor-pointer p-1"
                aria-label={station.title}
              >
                <div
                  className={`size-3.5 rounded-full transition-all duration-500 ${
                    isActive
                      ? 'scale-125 bg-[#d87a52] ring-4 ring-[#b85c38]/40 shadow-lg'
                      : 'bg-white/30 hover:bg-white/60'
                  }`}
                />
                <span className="absolute right-8 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#27201b]/95 px-3 py-1 text-xs text-[#dcd2c9] shadow-md backdrop-blur-md group-hover:block">
                  {station.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Interactive Scroll Indicator */}
        <div className="pointer-events-none absolute bottom-5 right-6 z-20 flex items-center gap-2 text-xs font-medium text-[#d4bead]/80 sm:right-12">
          <span>Desplaza para explorar</span>
          <ArrowDown className="size-3.5 animate-bounce text-[#d87a52]" />
        </div>
      </div>
    </div>
  )
}

export default ScrollWorld
