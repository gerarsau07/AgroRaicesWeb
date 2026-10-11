import type { Metadata } from 'next'
import MapaView from '@/components/mapa-view'

export const metadata: Metadata = {
  title: 'Mapa Interactivo de Rendimiento · AgroRaíces',
  description:
    'Explora parcelas de cebada maltera en Puebla, Hidalgo y Tlaxcala georreferenciadas con Leaflet y métricas descriptivas de rendimiento y elevación.',
}

export default function MapaPage() {
  return (
    <main className="min-h-screen bg-[#1b1410] text-[#f0eae1] selection:bg-[#d87a52] selection:text-[#1b1410]">
      <MapaView />
    </main>
  )
}
