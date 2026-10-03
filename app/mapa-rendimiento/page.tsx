import type { Metadata } from 'next'
import MapaView from '@/components/mapa-view'

export const metadata: Metadata = {
  title: 'Mapa de Rendimiento · AgroRaíces',
  description:
    'Visualización interactiva de parcelas georreferenciadas de cebada maltera en el Altiplano Central.',
}

export default function MapaRendimientoPage() {
  return (
    <main className="min-h-screen bg-[#10281f]">
      <MapaView />
    </main>
  )
}
