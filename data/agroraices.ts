export interface WorldStation {
  id: string
  title: string
  subtitle: string
  badge: string
  description: string
}

export const scrollWorldStations: WorldStation[] = [
  {
    id: 'orbital',
    title: 'Observamos el desarrollo de cada cultivo',
    subtitle: 'Seguimiento continuo durante toda la temporada',
    badge: '01 · Vista desde el Cielo',
    description:
      'Acompañamos el crecimiento de la cebada desde la siembra hasta la cosecha mediante imágenes satelitales para conocer la humedad de la planta y el vigor del follaje en cada etapa.',
  },
  {
    id: 'territorio',
    title: 'Entendemos la tierra y el clima de tu región',
    subtitle: 'Puebla, Hidalgo y Tlaxcala',
    badge: '02 · Conocimiento del Terreno',
    description:
      'Tomamos en cuenta la altura, la inclinación natural de cada terreno y el pronóstico de lluvias y temperaturas de tu municipio para evaluar las condiciones reales de tu parcela.',
  },
  {
    id: 'surco',
    title: 'Explicaciones claras para decidir en el campo',
    subtitle: 'De los datos a la tranquilidad del productor',
    badge: '03 · A Pie de Parcela',
    description:
      'Convertimos toda la información del terreno y del clima en un diagnóstico sencillo que te dice cuánto puedes cosechar, qué favorece a tu cultivo y qué aspectos conviene cuidar.',
  },
]
