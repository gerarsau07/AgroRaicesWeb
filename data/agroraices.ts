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
    title: 'Teledetección Orbital y Clima 2026',
    subtitle: 'Sentinel-2 · Landsat · PlanetScope 3m · GEE & Clima API',
    badge: '01 · Satélites y Pronóstico Climático',
    description:
      'Desde la constelación orbital (Sentinel-2, PlanetScope 3m y Landsat) y conectores climáticos para el ciclo 2026, AgroRaíces captura humedad foliar, emisión térmica y vigor del dosel sobre las 197 parcelas del Altiplano Central.',
    range: [0, 0.35],
    metrics: [
      { label: 'Resolución', value: '3m – 10m + GEE' },
      { label: 'Cobertura', value: '197 Parcelas (2022–2026)' },
    ],
  },
  {
    id: 'multiespectral',
    title: 'Fisiografía Fija INEGI y Deliberación QBAF',
    subtitle: 'Topografía INEGI CEM 4.0 · DF-QuAD · Undercutting Capa 0',
    badge: '02 · Arquitectura Neuro-Simbólica',
    description:
      'Separamos la fisiografía invariante del terreno (altitud, pendiente y rugosidad INEGI CEM 4.0) de las señales dinámicas del ciclo agrícola, deliberando mediante un Árbitro Bipolar Cuantitativo (QBAF + DF-QuAD) especializado por estado.',
    range: [0.35, 0.72],
    metrics: [
      { label: 'Arquitectura', value: 'QBAF + DF-QuAD + SHAP' },
      { label: 'Precisión OOF', value: 'r = 0.8584 · R² = 73.6%' },
    ],
  },
  {
    id: 'surco',
    title: 'Explicabilidad SHAP e IA con Google Gemini',
    subtitle: 'A pie de parcela con el Agricultor y Laboratorio del Analista',
    badge: '03 · De SHAP al Lenguaje del Productor',
    description:
      'Descomponemos cada predicción en kilos por hectárea con valores de Shapley (SHAP) para el analista, mientras que Google Gemini (3.8 Flash) traduce esos pesos en explicaciones claras y sin tecnicismos para el agricultor.',
    range: [0.72, 1.0],
    metrics: [
      { label: 'Error Medio (MAE)', value: '± 296.3 kg/ha' },
      { label: 'Asesor IA', value: 'SHAP + Google Gemini' },
    ],
  },
]
