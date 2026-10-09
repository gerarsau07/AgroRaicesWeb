'use client'

import dynamic from 'next/dynamic'

const MapaParcelas = dynamic(() => import('@/components/mapa-parcelas'), {
  ssr: false,
  loading: () => (
    <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-12 h-12 border-3 border-[#d87a52] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[#dcd2c9] text-sm font-medium">Iniciando visor geoespacial y mapas...</p>
    </div>
  ),
})

export default function MapaView() {
  return <MapaParcelas />
}
