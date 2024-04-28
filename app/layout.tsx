import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YtToMP3/MP4: YouTube to MP3/MP4 Converter',
  description: 'Download your YouTube videos as MP3/MP4 (audio/video) files with the fastest and most powerful YouTube Converter. No app or software needed.'
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
