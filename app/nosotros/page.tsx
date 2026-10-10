import type { Metadata } from 'next'
import { About, ModelSpecs } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Nosotros y Arquitectura V6 · AgroRaíces',
  description:
    'Conoce la arquitectura del Modelo Maestro V6 de AgroRaíces: especialistas regionales, datos satelitales y topografía INEGI para la estimación de cebada.',
}

export default function NosotrosPage() {
  return (
    <main>
      <About />
      <ModelSpecs />
    </main>
  )
}
