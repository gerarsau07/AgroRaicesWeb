export interface WorldStation {
  id: string
  title: string
  subtitle: string
  badge: string
  description: string
  range: [number, number]
  metrics: { label: string; value: string }[]
}

export const scrollWorldStations: WorldStation[] = [
  {
    id: 'orbital',
    title: 'Monitoreo Orbital y Teledetección',
    subtitle: 'Órbita Terrestre & Sensores Satelitales',
    badge: '01 · Satélites en Órbita',
    description:
      'Desde la constelación orbital (Sentinel-2, PlanetScope y Landsat), AgroRaíces captura índices de vigor foliar (NDVI, EVI) y variaciones de humedad (NDWI) sobre el Altiplano Central.',
    range: [0, 0.35],
    metrics: [
      { label: 'Resolución', value: '3m – 10m' },
      { label: 'Constelaciones', value: 'Sentinel · Landsat · Planet' }
    ]
  },
  {
    id: 'multiespectral',
    title: 'Visión Multiespectral y Relieve',
    subtitle: 'Topografía INEGI CEM 4.0 & Microclima',
    badge: '02 · Descenso al Territorio',
    description:
      'La inteligencia artificial desciende a las parcelas, cruzando la reflectancia satelital con pendientes, altitudes y drenaje de suelo de Puebla, Hidalgo y Tlaxcala para segmentar cada lote agrícola.',
    range: [0.35, 0.72],
    metrics: [
      { label: 'Topografía', value: 'INEGI CEM 4.0' },
      { label: 'Parcelas', value: '197 Polígonos' }
    ]
  },
  {
    id: 'surco',
    title: 'AgroRaíces: Inteligencia en el Surco',
    subtitle: 'A pie de parcela con el Agricultor',
    badge: '03 · Cosecha y Certeza',
    description:
      'Llegamos al terreno junto al productor. El ensamble predictivo V6 estima el rendimiento en tolva antes del secado, brindando certeza comercial y decisiones agronómicas oportunas.',
    range: [0.72, 1.0],
    metrics: [
      { label: 'Certeza en Campo', value: '85% – 90%' },
      { label: 'Margen de Error', value: '± 0.4 t/ha' }
    ]
  }
]
