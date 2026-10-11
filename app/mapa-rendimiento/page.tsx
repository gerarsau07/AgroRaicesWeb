import type { Metadata } from 'next'
import MapaView from '@/components/mapa-view'

export const metadata: Metadata = {
  title: 'Mapa de Rendimiento · AgroRaíces',
  description:
    'Visualización interactiva de parcelas georreferenciadas de cebada maltera en el Altiplano Central.',
}

export default function MapaRendimientoPage() {
  return (
    <main className="min-h-screen bg-[#1b1410] text-[#f0eae1] selection:bg-[#d87a52] selection:text-[#1b1410]">
      <MapaView />
    </main>
  )
}
