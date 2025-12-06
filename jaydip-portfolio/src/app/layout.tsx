import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jaydip Suthar - Portrait & Wedding Photographer | Thasra, Gujarat',
  description: 'Professional portrait & wedding photographer and filmmaker based in Thasra, Gujarat. 6+ years of experience capturing life\'s most precious moments.',
  keywords: 'photographer, wedding photographer, portrait photographer, videographer, filmmaker, Thasra, Gujarat, wedding photography, pre-wedding photography',
  authors: [{ name: 'Jaydip Suthar' }],
  openGraph: {
    title: 'Jaydip Suthar - Portrait & Wedding Photographer',
    description: 'Professional portrait & wedding photographer and filmmaker based in Thasra, Gujarat. 6+ years of experience.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Jaydip Suthar Photography',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jaydip Suthar - Portrait & Wedding Photographer',
    description: 'Professional portrait & wedding photographer and filmmaker based in Thasra, Gujarat.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

