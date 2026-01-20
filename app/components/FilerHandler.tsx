'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import getVideoId from 'get-video-id';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';

import { MP4Type } from '@/helper/types';
import DownloadSection from './DownloadSection';
import FFmpegDiagnostics from './Ffmpegdiagnostics';
import { useFFmpeg } from '@/app/hooks/useFFmpeg';

const FilerHandler = () => {
    const [text, setText] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [downloadableFile, setDownloadableFile] = useState<string | null>(null);
    const [mp4Details, setMp4Details] = useState<MP4Type | null>(null);

    const { executeRecaptcha } = useGoogleReCaptcha();

    const {
        isLoaded: ffmpegLoaded,
        isLoading: ffmpegLoading,
        isConverting,
        progress,
        error: ffmpegError,
        sharedArrayBufferSupported,
        load: loadFFmpeg,
        convertToMp3,
    } = useFFmpeg();

    // Track whether we have shown the error toast to avoid duplicates
    // Using a ref because we don't want changes to trigger re-renders
    const errorShownRef = useRef<string | null>(null);

    // Track if initial load has been triggered
    const initialLoadTriggered = useRef(false);

    useEffect(() => {
        if (initialLoadTriggered.current || ffmpegLoaded) {
            return;
        }

        if (!sharedArrayBufferSupported) {
            console.warn('[FilerHandler] SharedArrayBuffer not supported, skipping auto-load');
            return;
        }

        initialLoadTriggered.current = true;

        loadFFmpeg().then((success) => {
            if (success) {
                console.log('[FilerHandler] FFmpeg loaded successfully');
            } else {
                console.error('[FilerHandler] FFmpeg failed to load');
            }
        });
    }, [loadFFmpeg, sharedArrayBufferSupported, ffmpegLoaded]);

    useEffect(() => {
        if (ffmpegError && ffmpegError !== errorShownRef.current) {
            errorShownRef.current = ffmpegError;
            toast.error(ffmpegError, { duration: 5000 });
        }
    }, [ffmpegError]);

    const convertToMp3Handler = async () => {
        if (text === '')
            return toast.error('Please enter the video URL');


        const { id } = getVideoId(text);

        if (!id)
            return toast.error('Invalid YouTube URL');

        if (!executeRecaptcha)
            return toast.error('reCAPTCHA not available');

        // Check FFmpeg status
        if (!ffmpegLoaded) {
            if (ffmpegLoading)
                return toast.error('Audio converter still loading, please wait...');

            if (!sharedArrayBufferSupported)
                return toast.error(
                    'MP3 conversion not supported in this browser. Try Opera GX or Firefox.',
                    { duration: 5000 }
                );

            const loadingToast = toast.loading('Loading audio converter...');
            const loaded = await loadFFmpeg();
            toast.dismiss(loadingToast);

            if (!loaded) {
                return;
            }
        }

        const toastId = toast.loading('Fetching video info...');

        try {
            const token = await executeRecaptcha('convert_to_mp3');

            const response = await axios.post('/api/extract', {
                token,
                videoId: id,
                type: 'audio'
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to extract video');
            }

            const { title, audioFormats } = response.data;
            setVideoTitle(title);

            // Get the best audio format URL (first one is highest bitrate)
            if (!audioFormats || audioFormats.length === 0) {
                throw new Error('No audio formats available for this video');
            }

            const bestFormat = audioFormats.find((f: { url?: string }) => f.url);
            if (!bestFormat?.url) {
                throw new Error('No downloadable audio format found - video may be protected');
            }

            const audioUrl = bestFormat.url;

            if (!audioUrl) {
                throw new Error('Audio URL not available');
            }

            // Proxy the audio through our server to avoid CORS issues
            const proxiedUrl = `/api/proxy?url=${encodeURIComponent(audioUrl)}`;

            toast.loading('Converting to MP3...', { id: toastId });

            const mp3Blob = await convertToMp3(proxiedUrl, title);

            if (!mp3Blob) {
                throw new Error('Conversion failed');
            }

            const downloadUrl = URL.createObjectURL(mp3Blob);
            setDownloadableFile(downloadUrl);

            toast.success('Converted successfully!', { id: toastId });
        } catch (error: any) {
            console.error('[convertToMp3]', error);
            toast.error(
                error.response?.data?.error || error.message || 'Conversion failed',
                { id: toastId, duration: 3000 }
            );
        }
    };

    const convertToMp4Handler = async () => {
        if (text === '') {
            return toast.error('Please enter the video URL');
        }

        const { id } = getVideoId(text);

        if (!id) {
            return toast.error('Invalid YouTube URL');
        }

        if (!executeRecaptcha) {
            return toast.error('reCAPTCHA not available');
        }

        const toastId = toast.loading('Fetching video...');

        try {
            const token = await executeRecaptcha('convert_to_mp4');

            const response = await axios.post('/api/extract', {
                token,
                videoId: id,
                type: 'video'
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to extract video');
            }

            // Transform response to match MP4Type interface
            const { title, thumbnail, videoFormats } = response.data;
            setMp4Details({
                title,
                thumbnail,
                formats: videoFormats || []
            });
            toast.success('Video ready!', { id: toastId });
        } catch (error: any) {
            console.error('[convertToMp4]', error);
            toast.error(
                error.response?.data?.error || error.message || 'Failed to get video',
                { id: toastId, duration: 3000 }
            );
        }
    };

    const getNumber = (): number => {
        if (!mp4Details?.thumbnail) return 0;
        if (mp4Details.thumbnail.length === 1) return 0;
        return mp4Details.thumbnail.length - 2;
    };

    const downloadFile = (isMp3: boolean) => {
        if (downloadableFile || mp4Details) {
            toast.error('Downloading virus 😈', {
                duration: 1500,
                style: { background: '#363636', color: '#fff' },
            });

            setTimeout(() => {
                toast.success('Just kidding, your file is downloading 😘', {
                    duration: 3000,
                    style: { background: '#363636', color: '#fff' },
                });
            }, 1500);

            if (isMp3) {
                setDownloadableFile(null);
            } else {
                setMp4Details(null);
            }
        } else {
            toast.error('Failed to download');
        }
    };

    useEffect(() => {
        return () => {
            if (downloadableFile) {
                URL.revokeObjectURL(downloadableFile);
            }
        };
    }, [downloadableFile]);

    const renderFFmpegStatus = () => {
        if (ffmpegLoading) {
            return (
                <p className="text-sm text-yellow-500 mt-2 flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    Loading audio converter...
                </p>
            );
        }

        if (!sharedArrayBufferSupported) {
            return (
                <p className="text-sm text-red-500 mt-2">
                    ⚠️ MP3 conversion not available in this browser.
                    <span className="block text-xs text-gray-400">
                        Try a different browser or ensure you're using HTTPS.
                    </span>
                </p>
            );
        }

        if (ffmpegError) {
            return (
                <p className="text-sm text-red-500 mt-2">
                    ⚠️ Audio converter failed to load
                    <button
                        onClick={() => {
                            errorShownRef.current = null;  // Reset so error can show again
                            loadFFmpeg();
                        }}
                        className="ml-2 text-blue-400 underline hover:text-blue-300"
                    >
                        Retry
                    </button>
                </p>
            );
        }

        if (ffmpegLoaded) {
            return (
                <p className="text-sm text-green-500 mt-2">✓ Audio converter ready</p>
            );
        }

        return null;
    };

    return (
        <>
            {/* Diagnostic overlay - only shows in development */}
            <FFmpegDiagnostics />

            <main className="my-2 text-center">
                <header className="my-4 text-3xl flex justify-center items-center flex-col">
                    <h1 className="my-4 text-xl">YtToMP3/MP4: Youtube to MP3/MP4 Converter</h1>

                    <div className="sm:w-1/2 w-full text-center">
                        <p className="text-xs">
                            The safest and most reliable Youtube to MP3 or MP4 converter.
                            No need to worry about phishing links and stuff.
                            Made by a Developer.
                            Just paste the URL and download your favorite videos/audios in the best quality.
                        </p>
                    </div>
                </header>

                <h4>Please enter the URL of the video</h4>

                {/* FFmpeg loading status */}
                {renderFFmpegStatus()}
            </main>

            <div className="flex items-center justify-center p-5 flex-col">
                <div className="rounded-lg bg-gray-200 sm:p-3 sm:w-4/5 w-full p-1">
                    <div className="flex w-full">
                        <div className="flex w-10 items-center justify-center rounded-tl-lg rounded-bl-lg border-r border-gray-200 bg-white p-5">
                            <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none absolute w-5 fill-gray-500 transition">
                                <path d="M16.72 17.78a.75.75 0 1 0 1.06-1.06l-1.06 1.06ZM9 14.5A5.5 5.5 0 0 1 3.5 9H2a7 7 0 0 0 7 7v-1.5ZM3.5 9A5.5 5.5 0 0 1 9 3.5V2a7 7 0 0 0-7 7h1.5ZM9 3.5A5.5 5.5 0 0 1 14.5 9H16a7 7 0 0 0-7-7v1.5Zm3.89 10.45 3.83 3.83 1.06-1.06-3.83-3.83-1.06 1.06ZM14.5 9a5.48 5.48 0 0 1-1.61 3.89l1.06 1.06A6.98 6.98 0 0 0 16 9h-1.5Zm-1.61 3.89A5.48 5.48 0 0 1 9 14.5V16a6.98 6.98 0 0 0 4.95-2.05l-1.06-1.06Z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="pl-2 text-base font-semibold outline-0 w-full bg-black"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        className="bg-cyan-500 p-2 rounded-tl-lg rounded-bl-lg text-white font-semibold hover:bg-cyan-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={convertToMp4Handler}
                    >
                        Convert to MP4
                    </button>
                    <button
                        type="button"
                        className="bg-blue-500 p-2 rounded-tr-lg rounded-br-lg text-white font-semibold hover:bg-blue-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={convertToMp3Handler}
                        disabled={isConverting}
                    >
                        {isConverting ? `Converting... ${progress}%` : 'Convert to MP3'}
                    </button>
                </div>
            </div>

            {downloadableFile && (
                <section className="my-2 flex justify-center items-center flex-col">
                    <h4 className="my-2">
                        Your MP3 <span className="font-extrabold text-red-700">{videoTitle}</span> is ready to download
                    </h4>
                    <a href={downloadableFile} download={`${videoTitle || 'audio'}.mp3`}>
                        <button
                            className="bg-blue-500 p-2 rounded-lg text-white font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
                            onClick={() => downloadFile(true)}
                        >
                            Download MP3
                        </button>
                    </a>
                </section>
            )}

            {mp4Details && (
                <DownloadSection
                    mp4Details={mp4Details}
                    downloadFile={downloadFile}
                    getNumber={getNumber}
                />
            )}

            <main className="sm:w-4/5 container mx-auto px-6 mb-6">
                <div>
                    <p className="my-3 text-sm">
                        YouTube.com is the largest video sharing platform on the Internet. Every day millions of new videos are added.
                        You can find all kinds of videos but YouTube does not offer a FREE downloading service for these videos.
                    </p>
                    <p className="my-3 text-sm">
                        YTMP3 allows you to download your favorite YouTube videos as MP3 (audio) or MP4 (video) files in the most efficient way.
                        You are able to use YTMP3 on any device – it is optimized to work on desktop, tablet and mobile devices.
                        There is also no additional software or app needed.
                    </p>
                </div>
            </main>

            <Toaster
                position="bottom-left"
                toastOptions={{
                    duration: 2000,
                    style: { background: '#363636', color: '#fff' },
                }}
            />
        </>
    );
};

export default FilerHandler;