import type { Metadata } from 'next'
import { About, ModelSpecs } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Nosotros y Arquitectura Oficial · AgroRaíces',
  description:
    'Conoce la arquitectura del Pipeline Oficial de AgroRaíces: especialistas regionales, datos satelitales y topografía INEGI para la estimación de cebada.',
}

export default function NosotrosPage() {
  return (
    <main>
      <About />
      <ModelSpecs />
    </main>
  )
}
