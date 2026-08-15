'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import getVideoId from 'get-video-id'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { toast, Toaster } from 'react-hot-toast'
import { MP4Type } from '@/helper/types'
import DownloadSection from './DownloadSection'

type ConvertFormat = 'mp3' | 'mp4'

const FilerHandler = () => {
    const [text, setText] = useState('')
    const [videoTitle, setVideoTitle] = useState('')
    const [downloadableFile, setDownloadableFile] = useState(null)
    const [isLoadingMp3, setIsLoadingMp3] = useState(false)
    const [isLoadingMp4, setIsLoadingMp4] = useState(false)
    const [mp4Details, setMp4Details] = useState<MP4Type | null>(null)
    const [lastFormat, setLastFormat] = useState<ConvertFormat | null>(null)
    const resultsRef = useRef<HTMLDivElement>(null)
    const converterRef = useRef<HTMLDivElement>(null)
    const [converterInView, setConverterInView] = useState(true)
    const { executeRecaptcha } = useGoogleReCaptcha()

    const parsedVideoId = useMemo(() => (text.trim() ? getVideoId(text).id : null), [text])
    const urlState = !text.trim() ? 'empty' : parsedVideoId ? 'valid' : 'invalid'
    const hasResult = Boolean(downloadableFile || mp4Details)

    const convertToMp3 = async () => {
        if (text === '') return toast.error('Please enter a YouTube URL')

        const { id } = getVideoId(text)
        if (!id) return toast.error('Invalid YouTube URL')

        setLastFormat('mp3')
        setMp4Details(null)
        setIsLoadingMp3(true)

        if (!executeRecaptcha) {
            setIsLoadingMp3(false)
            return toast.error('reCAPTCHA not available')
        }

        const token = await executeRecaptcha('convert_to_mp3')

        try {
            const response = await axios.post('/api/convert', { token, text: id, type: 'mp3' })

            if (response.data.success) {
                setDownloadableFile(response.data.link)
                setVideoTitle(response.data.title)
                toast.success('Audio ready for download!')
            } else {
                throw new Error(response.data.error || 'Conversion failed')
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.message || 'Conversion failed')
        } finally {
            setIsLoadingMp3(false)
        }
    }

    const convertToMp4 = async () => {
        if (text === '') return toast.error('Please enter a YouTube URL')

        const { id } = getVideoId(text)
        if (!id) return toast.error('Invalid YouTube URL')

        setLastFormat('mp4')
        setDownloadableFile(null)
        setVideoTitle('')
        setIsLoadingMp4(true)

        if (!executeRecaptcha) {
            setIsLoadingMp4(false)
            return toast.error('reCAPTCHA not available')
        }

        const token = await executeRecaptcha('convert_to_mp4')

        try {
            const response = await axios.post('/api/convert', { token, text: id, type: 'mp4' })

            if (response.data.success) {
                setMp4Details(response.data)
                toast.success('Video ready for download!')
            } else {
                throw new Error(response.data.error || 'Conversion failed')
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.message || 'Conversion failed')
        } finally {
            setIsLoadingMp4(false)
        }
    }

    const getNumber = (): number => {
        if (!mp4Details?.thumbnail) return 0
        if (mp4Details.thumbnail.length === 1) return 0
        return mp4Details.thumbnail.length - 2
    }

    const downloadFile = () => {
        if (downloadableFile || mp4Details) {
            toast('Your download has started!', {
                icon: '🎉',
                style: {
                    background: 'rgba(30, 30, 50, 0.95)',
                    color: '#fff',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                }
            })
        }
    }

    const pasteFromClipboard = async () => {
        try {
            const clip = (await navigator.clipboard.readText()).trim()
            if (!clip) return toast.error('Clipboard is empty')
            setText(clip)
        } catch {
            toast.error('Could not read clipboard')
        }
    }

    const fetchRegionDetails = async () => {
        try {
            await fetch('/api/getCountry')
        } catch (error: any) { /* empty */ }
    }

    useEffect(() => {
        fetchRegionDetails()
    }, [])

    useEffect(() => {
        const el = converterRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => setConverterInView(entry.isIntersecting),
            { threshold: 0.2, rootMargin: '-80px 0px 0px 0px' }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!hasResult) return
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [hasResult, downloadableFile, mp4Details])

    const isLoading = isLoadingMp3 || isLoadingMp4

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' || isLoading) return
        e.preventDefault()
        if (lastFormat === 'mp3') convertToMp3()
        else if (lastFormat === 'mp4') convertToMp4()
        else toast('Choose MP3 or MP4')
    }

    return (
        <>
            {/* Animated Background */}
            <div className="bg-mesh" />
            <div className="particles">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="particle" />
                ))}
            </div>

            {!converterInView && (
                <div className="fixed top-16 left-0 right-0 z-30 border-b border-white/10 bg-[#0f0f1a]/90 backdrop-blur-md px-4 py-3">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-2">
                        <label htmlFor="youtube-url-sticky" className="sr-only">YouTube URL</label>
                        <input
                            id="youtube-url-sticky"
                            type="url"
                            className="modern-input !py-2.5 !text-sm"
                            placeholder="Paste YouTube URL here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            aria-invalid={urlState === 'invalid'}
                        />
                        <div className="flex gap-2 shrink-0">
                            <button type="button" className="gradient-btn !py-2.5 !px-4" onClick={convertToMp4} disabled={isLoading}>
                                MP4
                            </button>
                            <button type="button" className="secondary-btn !py-2.5 !px-4" onClick={convertToMp3} disabled={isLoading}>
                                MP3
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className={`${hasResult ? 'pt-10 pb-8' : 'min-h-[80vh]'} flex flex-col items-center justify-center px-4 py-12`}>
                <div className="text-center max-w-4xl mx-auto">
                    <div className="fade-in-up mb-6">
                        <div className="inline-flex items-center gap-3 glass-card-sm px-5 py-2.5 mb-8">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm font-medium text-slate-200">Free • No Registration • Unlimited</span>
                        </div>
                    </div>

                    <h1 className="fade-in-up delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        Convert YouTube to{' '}
                        <span className="gradient-text">MP3 & MP4</span>
                    </h1>

                    <p className="fade-in-up delay-2 text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Download YouTube as MP3 or MP4. MP4 up to 1080p. No account required.
                    </p>

                    <div id="converter" ref={converterRef} className="fade-in-up delay-3 glass-card p-6 sm:p-8 md:p-10 max-w-2xl mx-auto scroll-mt-24">
                        <label htmlFor="youtube-url" className="block text-left text-sm font-medium text-slate-200 mb-2">
                            YouTube URL
                        </label>
                        <div className="relative mb-2">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <input
                                id="youtube-url"
                                type="url"
                                className="modern-input !pr-28"
                                placeholder="Paste YouTube URL here..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                aria-label="YouTube URL"
                                aria-invalid={urlState === 'invalid'}
                                aria-describedby="url-status"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1">
                                {text && (
                                    <button
                                        type="button"
                                        className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white rounded-md"
                                        onClick={() => setText('')}
                                        disabled={isLoading}
                                        aria-label="Clear URL"
                                    >
                                        ✕
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="px-2.5 py-1.5 text-xs font-semibold text-cyan-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50"
                                    onClick={pasteFromClipboard}
                                    disabled={isLoading}
                                >
                                    Paste
                                </button>
                            </div>
                        </div>
                        <p id="url-status" className={`mb-4 text-sm text-left min-h-[1.25rem] ${urlState === 'invalid' ? 'text-pink-400' : urlState === 'valid' ? 'text-green-400' : 'text-transparent'}`}>
                            {urlState === 'invalid' ? 'Invalid YouTube URL' : urlState === 'valid' ? 'Valid YouTube URL' : '.'}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                type="button"
                                className={`gradient-btn flex-1 pulse-glow ${isLoadingMp4 ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={convertToMp4}
                                disabled={isLoading}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isLoadingMp4 ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Download MP4
                                        </>
                                    )}
                                </span>
                            </button>
                            <button
                                type="button"
                                className={`secondary-btn flex-1 ${isLoadingMp3 ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={convertToMp3}
                                disabled={isLoading}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isLoadingMp3 ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                            Download MP3
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>

                        {/* Format Info */}
                        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-300">
                            <span className="quality-badge">1080p</span>
                            <span className="quality-badge">720p</span>
                            <span className="quality-badge">480p</span>
                            <span className="quality-badge">360p</span>
                        </div>
                        <p className="mt-3 text-xs text-slate-300">MP4: 360p–1080p · MP3: audio</p>

                        <div ref={resultsRef}>
                            {downloadableFile && (
                                <div className="download-card mt-8 pt-6 border-t border-white/10 text-center">
                                    <h3 className="text-xl font-semibold mb-2">Your MP3 is Ready!</h3>
                                    <p className="text-slate-300 mb-6 text-sm truncate max-w-full px-4">
                                        {videoTitle}
                                    </p>
                                    <a href={downloadableFile} download>
                                        <button
                                            type="button"
                                            className="gradient-btn w-full sm:w-auto"
                                            onClick={downloadFile}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download MP3
                                            </span>
                                        </button>
                                    </a>
                                </div>
                            )}

                            {mp4Details && (
                                <DownloadSection
                                    mp4Details={mp4Details}
                                    downloadFile={downloadFile}
                                    getNumber={getNumber}
                                    embedded
                                />
                            )}
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="fade-in-up delay-4 mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            100% Secure
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Lightning Fast
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                            No Registration
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-to" className="px-4 py-16 sm:py-20 scroll-mt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            How to <span className="gradient-text">Download</span>
                        </h2>
                        <p className="text-slate-300">Three steps</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="relative text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-bold">
                                1
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Copy URL</h3>
                            <p className="text-slate-300 text-sm">Copy the YouTube video link</p>
                            <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                        </div>

                        <div className="relative text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl font-bold">
                                2
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Paste & Convert</h3>
                            <p className="text-slate-300 text-sm">Paste it above and choose MP4 or MP3</p>
                            <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xl font-bold">
                                3
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Download</h3>
                            <p className="text-slate-300 text-sm">Pick a quality and save the file</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="faq" className="px-4 py-16 pb-24 scroll-mt-24">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
                        <span className="gradient-text">FAQ</span>
                    </h2>
                    <div className="space-y-4">
                        <details className="glass-card-sm p-5 text-left">
                            <summary className="font-semibold cursor-pointer">Is it free?</summary>
                            <p className="mt-3 text-sm text-slate-300">Yes. No account is required.</p>
                        </details>
                        <details className="glass-card-sm p-5 text-left">
                            <summary className="font-semibold cursor-pointer">What qualities are available?</summary>
                            <p className="mt-3 text-sm text-slate-300">MP4: 360p, 480p, 720p, and 1080p when the video has those formats. MP3 is audio only.</p>
                        </details>
                        <details className="glass-card-sm p-5 text-left">
                            <summary className="font-semibold cursor-pointer">Can I download any video?</summary>
                            <p className="mt-3 text-sm text-slate-300">Only convert content you have the right to download. Follow YouTube&apos;s terms and copyright law.</p>
                        </details>
                    </div>
                </div>
            </section>

            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'rgba(30, 30, 50, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#00d4ff',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#f472b6',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    )
}

export default FilerHandler