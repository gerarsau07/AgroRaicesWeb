import type { Metadata } from 'next'
import { PredictionForm } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Inferencia en Vivo · AgroRaíces',
  description:
    'Calcula en tiempo real el rendimiento estimado de tu parcela de cebada con datos satelitales multiespectrales y descarga tu reporte.',
}

export default function InferenciaPage() {
  return (
    <main>
      <PredictionForm />
    </main>
  )
}
