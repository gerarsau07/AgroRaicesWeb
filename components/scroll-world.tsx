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
  const [activeStationIndex, setActiveStationIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress
          const stationIdx = scrollWorldStations.findIndex(
            (s) => progress >= s.range[0] && progress <= s.range[1]
          )
          if (stationIdx !== -1) {
            setActiveStationIndex(stationIdx)
          }
        },
      })
    }, container)

    return () => {
      ctx.revert()
    }
  }, [])

  const currentStation = scrollWorldStations[activeStationIndex] || scrollWorldStations[0]
  const stationIcons = [Satellite, Mountain, UserCheck]
  const ActiveIcon = stationIcons[activeStationIndex] || Satellite

  return (
    <div ref={containerRef} className="relative h-[240vh] w-full bg-[#1b1410]">
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Fullscreen Background Images with Crossfade (Zero Video Loading) */}
        {STATION_IMAGES.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === activeStationIndex ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={src}
              alt={currentStation.title}
              fill
              priority={idx === 0}
              className="object-cover transform scale-105 transition-transform duration-1000"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Cinematic Vignette & Ambient Earth Shading */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#1b1410] via-[#1b1410]/50 to-[#1b1410]/20" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#1b1410]/95 via-[#1b1410]/40 to-transparent sm:max-w-3xl" />

        {/* Narrative HUD & Station Card (Bottom Left) */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-12 sm:px-12 sm:pb-16 lg:px-20">
          <div className="max-w-2xl">
            {/* Station Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d87a52]/40 bg-[#27201b]/90 px-4 py-1.5 shadow-lg backdrop-blur-md">
              <ActiveIcon className="size-4 text-[#d87a52]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#f0ded3]">
                {currentStation.badge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {currentStation.title}
            </h2>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[#d87a52]">
              {currentStation.subtitle}
            </p>

            {/* Description */}
            <p className="mt-4 text-pretty text-sm leading-relaxed text-[#dcd2c9] sm:text-base">
              {currentStation.description}
            </p>

            {/* Metrics Pills */}
            <div className="mt-6 flex flex-wrap gap-3">
              {currentStation.metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#27201b]/80 px-4 py-2 shadow-sm backdrop-blur-md"
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
                onClick={() => setActiveStationIndex(idx)}
                className="group relative flex items-center cursor-pointer p-1"
                aria-label={station.title}
              >
                <div
                  className={`size-3 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'scale-125 bg-[#d87a52] ring-4 ring-[#b85c38]/40'
                      : 'bg-white/30 hover:bg-white/60'
                  }`}
                />
                <span className="absolute right-7 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#27201b]/95 px-3 py-1 text-xs text-[#dcd2c9] shadow-md backdrop-blur-md group-hover:block">
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
