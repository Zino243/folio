import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL('https://portlify.online'),
  title: {
    default: 'Portlify - Create Your Professional Portfolio',
    template: '%s | Portlify',
  },
  description: 'Crea tu portafolio profesional online gratis. Constructor de portfolios para desarrolladores, diseñadores y freelancers. Publica tu sitio web personal en minutos.',
  keywords: [
    'portfolio maker',
    'crear portfolio',
    'portafolio digital',
    'portafolio online',
    'sitio web personal',
    'free portfolio builder',
    'developer portfolio',
    'personal website',
    'online resume',
    'cv online',
    'crear cv',
    'portafolio desarrollador',
    'portfolio web',
    'link in bio',
    'carrd alternative',
    'linktree alternative',
  ],
  authors: [{ name: 'Portlify' }],
  creator: 'Portlify',
  publisher: 'Portlify',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: 'en_US',
    url: 'https://portlify.online',
    siteName: 'Portlify',
    title: 'Portlify - Create Your Professional Portfolio',
    description: 'Crea tu portafolio profesional online gratis. Constructor de portfolios para desarrolladores, diseñadores y freelancers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Portlify - Crea tu portfolio profesional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portlify - Create Your Professional Portfolio',
    description: 'Crea tu portafolio profesional online gratis. Constructor de portfolios para desarrolladores.',
    creator: '@portlify',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Portlify',
    alternateName: ['Portlify - Creador de Portafolios', 'Portlify - Portfolio Maker'],
    description: 'Crea tu portafolio profesional online gratis. Constructor de portfolios para desarrolladores, diseñadores y freelancers.',
    url: 'https://portlify.online',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Portlify',
      url: 'https://portlify.online',
    },
    featureList: [
      'Creador de portafolios gratuito',
      'Free portfolio builder',
      'Sitios web personales',
      'Personal website builder',
      'CV online',
      'Online resume builder',
      'Portafolio para desarrolladores',
      'Developer portfolio template',
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
      <Analytics />
        {children}
      </body>
    </html>
  )
}
