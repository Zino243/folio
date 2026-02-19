import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Folio - Build Beautiful Portfolios',
  description: 'Create stunning developer portfolios in minutes. Showcase your projects with a professional, modern design.',
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
      <Analytics />
      {children}</body>
    </html>
  )
}
