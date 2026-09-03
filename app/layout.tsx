import './globals.css'
import type { Metadata } from 'next'
import { getLocale } from '@/lib/locale-server'
import { LanguageProvider } from './language-provider'

export const metadata: Metadata = {
  title: 'Clube Florarte',
  description: 'Templates, drops e recursos para criadoras de conteúdo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()}>
      <body><LanguageProvider locale={getLocale()}>{children}</LanguageProvider></body>
    </html>
  )
}
