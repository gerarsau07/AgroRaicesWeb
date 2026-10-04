import type { Metadata } from 'next'
import { About, ModelSpecs } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'Nosotros y Nuestra Tecnología · AgroRaíces',
  description:
    'Conoce a AgroRaíces y cómo funciona nuestro consejo de especialistas digitales para la estimación de cosechas de cebada.',
}

export default function NosotrosPage() {
  return (
    <main>
      <About />
      <ModelSpecs />
    </main>
  )
}
