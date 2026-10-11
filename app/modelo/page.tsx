import type { Metadata } from 'next'
import ModeloView from '@/components/modelo-view'

export const metadata: Metadata = {
  title: 'Laboratorio Predictivo · AgroRaíces',
  description:
    'Estima el rendimiento de cebada maltera con el Pipeline Oficial AgroRaíces: especialistas regionales, datos satelitales y topografía INEGI.',
}

export default function ModeloPage() {
  return (
    <main>
      <ModeloView />
    </main>
  )
}
