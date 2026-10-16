import type { Metadata } from 'next'
import { About, ModelSpecs } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Nosotros y Arquitectura QBAF + SHAP + Gemini · AgroRaíces',
  description:
    'Conoce la arquitectura neuro-simbólica QBAF + DF-QuAD de AgroRaíces: explicabilidad SHAP, proyección 2026 con INEGI CEM 4.0 + GEE y traducción agronómica con Google Gemini.',
}

export default function NosotrosPage() {
  return (
    <main>
      <About />
      <ModelSpecs />
    </main>
  )
}
