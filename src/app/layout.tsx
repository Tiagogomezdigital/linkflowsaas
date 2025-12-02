import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LinkFlow - WhatsApp Manager',
  description: 'Distribuição inteligente de leads para WhatsApp com rotação de números e analytics',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}

