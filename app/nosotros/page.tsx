import type { Metadata } from 'next'
import { About } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Nosotros · AgroRaíces',
  description:
    'Conoce al equipo y la tecnología satelital detrás de AgroRaíces. PlanetScope, Sentinel-2 y Landsat para la optimización de la cebada maltera.',
}

export default function NosotrosPage() {
  return (
    <main>
      <About />
    </main>
  )
}
