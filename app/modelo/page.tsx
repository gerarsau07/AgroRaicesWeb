import type { Metadata } from 'next'
import { ModelSpecs } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Nuestro Modelo · AgroRaíces',
  description:
    'Arquitectura de ensamble Stacking con ElasticNetCV, XGBoost y MLP para la estimación precisa del rendimiento de cebada maltera.',
}

export default function ModeloPage() {
  return (
    <main>
      <ModelSpecs />
    </main>
  )
}
