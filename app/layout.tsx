import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://fnhvalue.com'),
  title: {
    default: 'FNH Value | FNH and Five Nights: Hunted Values',
    template: '%s | FNH Value',
  },
  description:
    'Explore FNH and Five Nights: Hunted item values, compare tiers, and use the trade calculator to estimate the worth of your inventory.',
  keywords: ['FNH value', 'FNH', 'Five Nights: Hunted values', 'item values', 'trade calculator', 'FNH value list'],
  applicationName: 'FNH Value',
  authors: [{ name: 'FNH Value' }],
  category: 'gaming',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FNH Value | FNH and Five Nights: Hunted Values',
    description:
      'Explore FNH and Five Nights: Hunted item values, compare tiers, and use the trade calculator to estimate the worth of your inventory.',
    url: 'https://fnhvalue.com',
    siteName: 'FNH Value',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FNH Value | FNH and Five Nights: Hunted Values',
    description:
      'Explore FNH and Five Nights: Hunted item values, compare tiers, and use the trade calculator to estimate the worth of your inventory.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
