import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar, Footer } from '@/components/agro-raices'

export const metadata: Metadata = {
  title: 'AgroRaíces · Estimación agrícola inteligente',
  description:
    'Plataforma de agricultura de precisión para estimar el rendimiento de cebada maltera con datos satelitales e inteligencia artificial.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16110d' },
    { media: '(prefers-color-scheme: dark)', color: '#16110d' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-[#16110d] text-foreground antialiased selection:bg-[#d87a52] selection:text-[#16110d]">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
