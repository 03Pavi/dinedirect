import type { Metadata, Viewport } from 'next'
import StoreProvider from '@/app/providers/store-provider'
import AppThemeProvider from '@/app/providers/theme-provider'
import { Analytics } from "@vercel/analytics/next"
import './globals.scss'

const appUrl = process.env.NEXT_PUBLIC_APP_URL!

export const viewport: Viewport = {
  themeColor: '#E85D04',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'DineDirect | Smart Restaurant-First Dining & Ordering',
    template: '%s | DineDirect',
  },
  description:
    'Direct contactless table ordering, digital QR menus, and real-time kitchen tracking for modern restaurants without commission.',
  keywords: [
    'restaurant ordering',
    'QR code menu',
    'dine in app',
    'table ordering',
    'contactless dining',
    'restaurant menu',
    'kitchen display',
    'DineDirect',
  ],
  authors: [{ name: 'DineDirect Team' }],
  creator: 'DineDirect',
  publisher: 'DineDirect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: appUrl,
    title: 'DineDirect | Smart Restaurant-First Dining & Ordering',
    description:
      'Direct contactless table ordering, digital QR menus, and real-time kitchen tracking for modern restaurants without commission.',
    siteName: 'DineDirect',
    images: [
      {
        url: '/logo.svg',
        width: 512,
        height: 512,
        alt: 'DineDirect Logo',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineDirect | Smart Restaurant-First Dining & Ordering',
    description:
      'Direct contactless table ordering, digital QR menus, and real-time kitchen tracking for modern restaurants without commission.',
    images: ['/logo.svg'],
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
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <StoreProvider>
          <Analytics/>
          <AppThemeProvider>{children}</AppThemeProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
