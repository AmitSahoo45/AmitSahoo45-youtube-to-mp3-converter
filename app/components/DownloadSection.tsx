import React, { FC, useMemo } from 'react'
import Image from 'next/image'
import { MP4Type } from '@/helper/types'

interface DownloadSectionProps {
    mp4Details: MP4Type | null
    downloadFile: () => void
    getNumber: () => number
    embedded?: boolean
}

const DownloadSection: FC<DownloadSectionProps> = ({ mp4Details, downloadFile, getNumber, embedded = false }) => {
    const filteredFormats = useMemo(() => {
        const bestItags: Number[] = [134, 135, 136, 137]
        return mp4Details?.formats.filter(format => format.itag && bestItags.includes(format.itag)) || []
    }, [mp4Details])

    const thumbnail = useMemo(() => {
        if (!mp4Details) return null
        const index = getNumber()
        return mp4Details.thumbnail[index] || mp4Details.thumbnail[0]
    }, [mp4Details, getNumber])

    if (!mp4Details || !thumbnail) return null

    const getQualityIcon = (quality: string) => {
        if (quality.includes('1080') || quality.includes('720')) {
            return (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-cyan-500 to-blue-600 rounded text-white">
                    HD
                </span>
            )
        }
        if (quality.includes('2160') || quality.includes('4K')) {
            return (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-600 rounded text-white">
                    4K
                </span>
            )
        }
        return null
    }

    const shellClass = embedded
        ? 'download-card mt-8 pt-6 border-t border-white/10'
        : 'download-card glass-card max-w-2xl mx-auto p-6 sm:p-8'

    return (
        <section className={embedded ? '' : 'px-4 pb-12'}>
            <div className={shellClass}>
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-4">
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-400">Ready to Download</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 line-clamp-2">
                        {mp4Details.title}
                    </h3>
                </div>

                {/* Thumbnail */}
                <div className="relative rounded-xl overflow-hidden mb-6 group">
                    <div className="aspect-video relative">
                        <Image
                            src={thumbnail.url}
                            fill
                            alt={mp4Details.title}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quality Options */}
                <div className="space-y-3">
                    <p className="text-sm text-gray-400 mb-4 text-center">Select your preferred quality:</p>

                    {filteredFormats.length > 0 ? (
                        <div className="grid gap-3">
                            {filteredFormats.map((format, index) => (
                                <a
                                    key={format.itag}
                                    href={format.url}
                                    download
                                    className="block"
                                    onClick={downloadFile}
                                >
                                    <div className={`glass-card-sm p-4 flex items-center justify-between transition-all hover:border-cyan-500/30 hover:bg-white/5 cursor-pointer group ${index === 0 ? 'border-cyan-500/30 bg-cyan-500/5' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-white/10'}`}>
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">{format.qualityLabel}</span>
                                                    {getQualityIcon(format.qualityLabel)}
                                                </div>
                                                <span className="text-xs text-gray-500">MP4 Video</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {index === 0 && (
                                                <span className="hidden sm:inline-block text-xs text-cyan-400 font-medium">Recommended</span>
                                            )}
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500">No formats available for download.</p>
                            <p className="text-sm text-gray-600 mt-1">This video may have download restrictions.</p>
                        </div>
                    )}
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-600 text-center mt-6">
                    By downloading, you agree to use this content in accordance with YouTube&apos;s Terms of Service.
                </p>
            </div>
        </section>
    )
}

export default DownloadSection