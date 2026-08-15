import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'YtToMP3/MP4: YouTube to MP3/MP4 Converter - Free HD Download',
  description: 'Download your YouTube videos as MP3/MP4 (audio/video) files with the fastest and most powerful YouTube Converter. No app or software needed. Convert YouTube to MP3 or MP4 in high quality 1080p, 4K, 8K for free. Online Video Converter does not require any installation on your PC.',
  applicationName: 'YtToMP3/MP4: YouTube to MP3/MP4 Converter',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'youtube',
    'mp3',
    'mp4',
    'converter',
    'youtube to mp3',
    'youtube to mp4',
    'youtube to mp3 converter',
    'youtube to mp4 converter',
    'youtube to mp3 online',
    'youtube to mp4 online',
    'youtube to mp3 converter online',
    'youtube to mp4 converter online',
    'youtube to mp3 online converter',
    'youtube to mp4 online converter',
    'youtube converter',
    'youtube online converter',
    'youtube converter online',
    'youtube mp3 converter',
    'youtube mp4 converter',
    'youtube mp3 online converter',
    'youtube mp4 online converter',
    'youtube mp3 converter online',
    'youtube mp4 converter online',
    'youtube mp3 online',
    'youtube mp4 online',
    'youtube mp3',
    'youtube mp4',
    'free youtube downloader',
    'youtube downloader hd',
    'youtube to mp4 hd',
    'youtube 4k download',
    'youtube 1080p download',
    'convert youtube free',
    'youtube audio download',
    'youtube video download'
  ],
  authors: [{ name: 'YtToMP3' }],
  creator: 'YtToMP3',
  publisher: 'YtToMP3',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'YtToMP3/MP4: Free YouTube to MP3/MP4 Converter',
    description: 'Download YouTube videos as MP3 or MP4 for free. Fast, safe, and no registration required. Supports 4K, 1080p HD quality.',
    siteName: 'YtToMP3',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YtToMP3/MP4: Free YouTube to MP3/MP4 Converter',
    description: 'Download YouTube videos as MP3 or MP4 for free. Fast, safe, and no registration required.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  )
}