'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import getVideoId from 'get-video-id'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { toast, Toaster } from 'react-hot-toast'
import { MP4Type } from '@/helper/types'
import DownloadSection from './DownloadSection'

const FilerHandler = () => {
    const [text, setText] = useState('')
    const [videoTitle, setVideoTitle] = useState('')
    const [downloadableFile, setDownloadableFile] = useState(null)
    const [isLoadingMp3, setIsLoadingMp3] = useState(false)
    const [isLoadingMp4, setIsLoadingMp4] = useState(false)
    const [mp4Details, setMp4Details] = useState<MP4Type | null>(null)
    const { executeRecaptcha } = useGoogleReCaptcha()

    const convertToMp3 = async () => {
        if (text === '') return toast.error('Please enter a YouTube URL')

        const { id } = getVideoId(text)
        if (!id) return toast.error('Invalid YouTube URL')

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

    const downloadFile = (isMp3: boolean) => {
        if (downloadableFile || mp4Details) {
            toast('Your download has started!', {
                icon: '🎉',
                style: {
                    background: 'rgba(30, 30, 50, 0.95)',
                    color: '#fff',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                }
            })

            if (isMp3) {
                setDownloadableFile(null)
            } else {
                setMp4Details(null)
            }
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

    const isLoading = isLoadingMp3 || isLoadingMp4

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            convertToMp4()
        }
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

            {/* Hero Section */}
            <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-12">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Logo/Brand */}
                    <div className="fade-in-up mb-6">
                        <div className="inline-flex items-center gap-3 glass-card-sm px-5 py-2.5 mb-8">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm font-medium text-gray-300">Free • No Registration • Unlimited</span>
                        </div>
                    </div>

                    <h1 className="fade-in-up delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        Convert YouTube to{' '}
                        <span className="gradient-text">MP3 & MP4</span>
                    </h1>

                    <p className="fade-in-up delay-2 text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        The fastest, safest way to download your favorite YouTube videos.
                        No ads, no malware, just pure quality downloads.
                    </p>

                    {/* Main Converter Card */}
                    <div className="fade-in-up delay-3 glass-card p-6 sm:p-8 md:p-10 max-w-2xl mx-auto">
                        {/* Input Section */}
                        <div className="relative mb-6">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="modern-input"
                                placeholder="Paste YouTube URL here..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                            />
                        </div>

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
                        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                            <span className="quality-badge">4K / 2160p</span>
                            <span className="quality-badge">1080p HD</span>
                            <span className="quality-badge">720p HD</span>
                            <span className="quality-badge">320kbps MP3</span>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="fade-in-up delay-4 mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
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

            {/* Download Results */}
            {downloadableFile && (
                <section className="px-4 pb-12">
                    <div className="download-card glass-card max-w-xl mx-auto p-6 sm:p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Your MP3 is Ready!</h3>
                        <p className="text-gray-400 mb-6 text-sm truncate max-w-full px-4">
                            {videoTitle}
                        </p>
                        <a href={downloadableFile} download>
                            <button
                                className="gradient-btn w-full sm:w-auto"
                                onClick={() => downloadFile(true)}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download MP3
                                </span>
                            </button>
                        </a>
                    </div>
                </section>
            )}

            {mp4Details && (
                <DownloadSection
                    mp4Details={mp4Details}
                    downloadFile={downloadFile}
                    getNumber={getNumber}
                />
            )}

            {/* Features Section */}
            <section className="px-4 py-16 sm:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Why Choose <span className="gradient-text">YtToMP3</span>?
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Built by developers, for everyone. Experience the difference with our premium converter.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <div className="feature-card glass-card-sm p-6 text-center">
                            <div className="feature-icon w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">100% Safe & Secure</h3>
                            <p className="text-gray-400 text-sm">No malware, no phishing. Security is our top priority. Clean downloads guaranteed.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="feature-card glass-card-sm p-6 text-center">
                            <div className="feature-icon w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
                            <p className="text-gray-400 text-sm">Convert and download in seconds. Our optimized servers ensure rapid processing.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="feature-card glass-card-sm p-6 text-center">
                            <div className="feature-icon w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">All Devices</h3>
                            <p className="text-gray-400 text-sm">Works on desktop, tablet, and mobile. No app installation required.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="feature-card glass-card-sm p-6 text-center">
                            <div className="feature-icon w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Unlimited & Free</h3>
                            <p className="text-gray-400 text-sm">No limits, no registration, completely free. Convert as many videos as you want.</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="section-divider max-w-4xl mx-auto" />

            {/* How to Use Section */}
            <section className="px-4 py-16 sm:py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            How to <span className="gradient-text">Download</span>
                        </h2>
                        <p className="text-gray-400">Three simple steps to get your favorite videos</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-bold">
                                1
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Copy URL</h3>
                            <p className="text-gray-400 text-sm">Find your video on YouTube and copy the URL from the address bar</p>
                            {/* Connector line (hidden on mobile) */}
                            <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl font-bold">
                                2
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Paste & Convert</h3>
                            <p className="text-gray-400 text-sm">Paste the URL above and click the MP4 or MP3 button</p>
                            <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xl font-bold">
                                3
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Download</h3>
                            <p className="text-gray-400 text-sm">Choose your preferred quality and click download. That&apos;s it!</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="section-divider max-w-4xl mx-auto" />

            {/* SEO Content Section */}
            <section className="px-4 py-16 sm:py-20">
                <div className="max-w-4xl mx-auto">
                    <article className="glass-card-sm p-6 sm:p-10">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">
                            YouTube to MP3/MP4 Converter - Best Free Online Tool
                        </h2>

                        <div className="prose prose-invert prose-sm sm:prose-base max-w-none space-y-6 text-gray-300">
                            <p>
                                YouTube.com is the largest video sharing platform on the Internet. Every day millions of new videos are added.
                                You can find all kinds of videos but YouTube does not offer a FREE downloading service for these videos.
                            </p>

                            <p>
                                <strong className="text-white">YtToMP3</strong> allows you to download your favorite YouTube videos as MP3 (audio) or MP4 (video) files
                                in the most efficient way. You are able to use YtToMP3 on any device – it is optimized to work on desktop,
                                tablet and mobile devices. There is also no additional software or app needed.
                            </p>

                            <h3 className="text-xl font-semibold text-white mt-8 mb-4">How to download a YouTube video?</h3>

                            <ol className="list-decimal list-inside space-y-3 ml-2">
                                <li>Open YouTube.com and search for the video you would like to download.</li>
                                <li>When you find the video, click on it and wait until it starts playing. Then, just copy the video URL from your browser address bar.</li>
                                <li>Open YtToMP3 and paste the video URL in our converter. After that you will be able to choose the download format. You can choose between MP3 or MP4.</li>
                                <li>Then, simply click on the Convert button. The conversion will be initiated, and may take a few minutes. We will try to convert the video in the best available quality.</li>
                                <li>As soon as the conversion of the video is completed you will see a Download button. Just click on it, and the download shall start.</li>
                            </ol>

                            <div className="section-divider !my-8" />

                            <h3 className="text-xl font-semibold text-white mb-4">YouTube to MP4 - High Quality Video Downloads</h3>
                            <p>
                                Convert YouTube to MP4 with high quality in 1080p, 2160p, 2K, 4K, 8K for free. Download YouTube video in MP4 format,
                                no need to install software. Our online video converter does not require any installation on your PC,
                                and you can convert videos in just 3 simple clicks!
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                <div className="glass-card-sm p-5">
                                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Features
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-400">
                                        <li>• Free Convert and download YouTube to MP4</li>
                                        <li>• Unlimited Video Download from YouTube</li>
                                        <li>• Simple and Fast YouTube to MP4 Converter</li>
                                        <li>• Supports converter video YouTube to MP3 and other formats</li>
                                    </ul>
                                </div>

                                <div className="glass-card-sm p-5">
                                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Instructions
                                    </h4>
                                    <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
                                        <li>Copy URL of the YouTube video</li>
                                        <li>Paste URL into the Search box and press Start</li>
                                        <li>Choose the video format you want</li>
                                        <li>Click Download button after conversion</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            {/* FAQ / More Info */}
            <section className="px-4 py-16 pb-24">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">
                        What Makes Us <span className="gradient-text">Different</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="glass-card-sm p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-2">100% Safe and Secure</h3>
                                    <p className="text-sm text-gray-400">Security is our first priority. Our website provides safe and clean YouTube files with no malware or viruses.</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card-sm p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-2">Easy and Quick Download</h3>
                                    <p className="text-sm text-gray-400">Simple interface for fast downloads. Just copy, paste, and download. No registration accounts needed.</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card-sm p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-2">Without Restriction</h3>
                                    <p className="text-sm text-gray-400">Convert and download YouTube MP3 and MP4 as much as you want without limitation and always free of cost.</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card-sm p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-2">Full Platform Support</h3>
                                    <p className="text-sm text-gray-400">Compatible with Windows, Mac, Linux, Android, and iPhone. Totally mobile-friendly website.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 px-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <span className="font-bold gradient-text text-lg">YtToMP3/MP4</span>
                        <p className="text-sm text-gray-500 mt-1">The safest YouTube converter, made by developers.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} YtToMP3. All rights reserved.
                    </div>
                </div>
            </footer>

            <Toaster
                position="bottom-center"
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