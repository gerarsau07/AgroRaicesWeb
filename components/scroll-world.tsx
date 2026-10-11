'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { scrollWorldStations } from '@/data/agroraices'
import { Satellite, Mountain, UserCheck, ArrowDown } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function ScrollWorld() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activeStationIndex, setActiveStationIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Detect accessibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReducedMotion(mediaQuery.matches)
    }
  }, [])

  // iOS Safari unlock & metadata
  const handleLoadedMetadata = () => {
    setIsReady(true)
    const video = videoRef.current
    if (video) {
      video.play().then(() => video.pause()).catch(() => {})
    }
  }

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container) return

    // Interpolation object for buttery-smooth video scrubbing
    const scrubObj = { time: 0 }
    let animFrameId: number

    // Render loop using requestAnimationFrame
    const updateVideoFrame = () => {
      if (video && video.duration && !isNaN(video.duration) && !reducedMotion) {
        if (Math.abs(video.currentTime - scrubObj.time) > 0.015) {
          video.currentTime = scrubObj.time
        }
      }
      animFrameId = requestAnimationFrame(updateVideoFrame)
    }
    animFrameId = requestAnimationFrame(updateVideoFrame)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress

          if (video && video.duration && !isNaN(video.duration)) {
            // Full 100% video progression mapped directly to the scroll
            gsap.to(scrubObj, {
              time: progress * video.duration,
              duration: 0.15,
              ease: 'power1.out',
              overwrite: 'auto',
            })
          }

          // Active station calculation
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
      cancelAnimationFrame(animFrameId)
      ctx.revert()
    }
  }, [reducedMotion, isReady])

  const currentStation = scrollWorldStations[activeStationIndex] || scrollWorldStations[0]
  const stationIcons = [Satellite, Mountain, UserCheck]
  const ActiveIcon = stationIcons[activeStationIndex] || Satellite

  return (
    <div ref={containerRef} className="relative h-[320vh] w-full bg-[#1b1511]">
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Fullscreen Video (cebada.mp4) */}
        {!reducedMotion ? (
          <video
            ref={videoRef}
            src="/videos/cebada.mp4"
            preload="auto"
            muted
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            className="absolute inset-0 h-full w-full object-cover will-change-[contents]"
          />
        ) : (
          <Image
            src="/photos/satelite1.webp"
            alt="Monitoreo Agrícola AgroRaíces"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}

        {/* Cinematic Vignette & Ambient Shading */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#1b1511] via-[#1b1511]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#1b1511]/90 via-[#1b1511]/35 to-transparent sm:max-w-3xl" />

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
              <div key={station.id} className="group relative flex items-center">
                <div
                  className={`size-3 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'scale-125 bg-[#d87a52] ring-4 ring-[#b85c38]/40'
                      : 'bg-white/30 hover:bg-white/60'
                  }`}
                />
                <span className="absolute right-6 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#27201b]/90 px-3 py-1 text-xs text-[#dcd2c9] shadow-md backdrop-blur-md group-hover:block">
                  {station.title}
                </span>
              </div>
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
