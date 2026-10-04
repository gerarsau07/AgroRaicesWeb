import type { Metadata } from 'next'
import { PredictionForm } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Modelo de Estimación en Vivo · AgroRaíces',
  description:
    'En esta ventana podrás usar el modelo en tiempo real para estimar el rendimiento de tu parcela de cebada con datos satelitales y descargar tu reporte.',
}

export default function ModeloPage() {
  return (
    <main>
      <PredictionForm />
    </main>
  )
}
