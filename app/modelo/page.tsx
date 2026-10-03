import type { Metadata } from 'next'
import { ModelSpecs } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Nuestro Modelo MoE · AgroRaíces',
  description:
    'Arquitectura de Mezcla de Expertos (Mixture of Experts - MoE) con topografía integrada, red de compuertas Softmax y subredes MLP especializadas para la estimación de rendimiento de cebada maltera.',
}

export default function ModeloPage() {
  return (
    <main>
      <ModelSpecs />
    </main>
  )
}
