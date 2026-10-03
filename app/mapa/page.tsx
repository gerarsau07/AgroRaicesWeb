import type { Metadata } from 'next'
import MapaView from '@/components/mapa-view'

export const metadata: Metadata = {
  title: 'Mapa Interactivo de Rendimiento · AgroRaíces',
  description:
    'Explora parcelas de cebada maltera en Puebla, Hidalgo y Tlaxcala georreferenciadas con Leaflet y métricas descriptivas de rendimiento y elevación.',
}

export default function MapaPage() {
  return (
    <main className="min-h-screen bg-[#10281f]">
      <MapaView />
    </main>
  )
}
