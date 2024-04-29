import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YtToMP3/MP4: YouTube to MP3/MP4 Converter',
  description: 'Download your YouTube videos as MP3/MP4 (audio/video) files with the fastest and most powerful YouTube Converter. No app or software needed. Online Video Converter does not require any installation on your PC, and you can convert videos in just 3 simple clicks! ',
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
    'youtube to mp3 converter online',
    'youtube to mp4 converter online',
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
    'youtube mp4'
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <Analytics />
    </html>
  )
}
