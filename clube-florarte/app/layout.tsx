import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clube Florarte',
  description: 'Templates, drops e recursos para criadoras de conteúdo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
