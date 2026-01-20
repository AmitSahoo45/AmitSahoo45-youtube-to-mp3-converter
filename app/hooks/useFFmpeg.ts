'use client';

import { useState, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

// ============================================================================
// MODULE-LEVEL SINGLETON STATE
// These persist across component mounts/unmounts and React Strict Mode cycles
// ============================================================================
let globalFFmpeg: FFmpeg | null = null;
let globalLoadPromise: Promise<boolean> | null = null;
let isGlobalLoaded = false;
let hasAttemptedLoad = false;  // Prevents retry loops in Strict Mode
let lastLoadError: string | null = null;  // Cache the error message

interface UseFFmpegReturn {
    isLoaded: boolean;
    isLoading: boolean;
    isConverting: boolean;
    progress: number;
    error: string | null;
    sharedArrayBufferSupported: boolean;
    load: () => Promise<boolean>;
    convertToMp3: (audioUrl: string, filename: string) => Promise<Blob | null>;
}

/**
 * Check if SharedArrayBuffer is available (required for FFmpeg.wasm)
 */
function checkSharedArrayBufferSupport(): boolean {
    try {
        if (typeof SharedArrayBuffer === 'undefined') {
            return false;
        }
        new SharedArrayBuffer(1);
        return true;
    } catch {
        return false;
    }
}

/**
 * Extract a meaningful error message from any thrown value.
 * FFmpeg.wasm can throw various types: Error, string, Event, DOMException, etc.
 */
function extractErrorMessage(err: unknown): string {
    // Standard Error object
    if (err instanceof Error) {
        return err.message || err.toString();
    }

    // String thrown directly
    if (typeof err === 'string') {
        return err;
    }

    // DOMException (common with WebAssembly/Worker issues)
    if (err instanceof DOMException) {
        return `${err.name}: ${err.message}`;
    }

    // Event object (like ErrorEvent from Workers)
    if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;

        // ErrorEvent has a 'message' property
        if ('message' in e && typeof e.message === 'string') {
            return e.message;
        }

        // Some errors have 'error' property containing the actual error
        if ('error' in e && e.error instanceof Error) {
            return e.error.message;
        }

        // Try to stringify
        try {
            const str = JSON.stringify(err);
            if (str !== '{}') return str;
        } catch {
            // Can't stringify, continue
        }
    }

    return 'Unknown error occurred during FFmpeg initialization';
}

export function useFFmpeg(): UseFFmpegReturn {
    const [isLoaded, setIsLoaded] = useState(isGlobalLoaded);
    const [isLoading, setIsLoading] = useState(!!globalLoadPromise);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(lastLoadError);
    const [sharedArrayBufferSupported] = useState(() => checkSharedArrayBufferSupport());

    // Sync local state with global state on mount
    useEffect(() => {
        if (isGlobalLoaded && !isLoaded) {
            setIsLoaded(true);
            setIsLoading(false);
        }
        if (lastLoadError && !error) {
            setError(lastLoadError);
        }
    }, [isLoaded, error]);

    const load = useCallback(async (): Promise<boolean> => {
        // =========================================================================
        // GUARD 1: Already successfully loaded
        // =========================================================================
        if (isGlobalLoaded && globalFFmpeg) {
            console.log('[FFmpeg] Already loaded, reusing instance');
            setIsLoaded(true);
            setIsLoading(false);
            return true;
        }

        // =========================================================================
        // GUARD 2: Load already in progress - wait for it
        // =========================================================================
        if (globalLoadPromise) {
            console.log('[FFmpeg] Load in progress, waiting for existing promise...');
            setIsLoading(true);
            try {
                const result = await globalLoadPromise;
                setIsLoaded(result);
                setIsLoading(false);
                return result;
            } catch (err) {
                setIsLoading(false);
                setError(lastLoadError || extractErrorMessage(err));
                return false;
            }
        }

        // =========================================================================
        // GUARD 3: Already attempted and failed - don't auto-retry
        // This prevents the double-toast issue in React Strict Mode
        // =========================================================================
        if (hasAttemptedLoad && lastLoadError) {
            console.log('[FFmpeg] Previous load failed, not auto-retrying:', lastLoadError);
            setError(lastLoadError);
            return false;
        }

        // =========================================================================
        // GUARD 4: SharedArrayBuffer not available
        // =========================================================================
        if (!checkSharedArrayBufferSupport()) {
            const errorMsg = 'SharedArrayBuffer not available. Ensure COOP/COEP headers are set.';
            lastLoadError = errorMsg;
            setError(errorMsg);
            return false;
        }

        // =========================================================================
        // START LOADING
        // =========================================================================
        hasAttemptedLoad = true;
        setIsLoading(true);
        setError(null);

        console.log('[FFmpeg] Starting fresh load...');

        globalLoadPromise = (async (): Promise<boolean> => {
            try {
                console.log('[FFmpeg] Creating FFmpeg instance...');
                const ffmpeg = new FFmpeg();

                // Setup progress handler
                ffmpeg.on('progress', ({ progress: p }) => {
                    setProgress(Math.round(p * 100));
                });

                // Setup detailed logging
                ffmpeg.on('log', ({ message }) => {
                    console.log('[FFmpeg Log]', message);
                });

                // Fetch and create blob URLs for WASM files
                const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

                console.log('[FFmpeg] Fetching core files from CDN...');

                const coreURL = await toBlobURL(
                    `${baseURL}/ffmpeg-core.js`,
                    'text/javascript'
                );
                console.log('[FFmpeg] Core JS blob created');

                const wasmURL = await toBlobURL(
                    `${baseURL}/ffmpeg-core.wasm`,
                    'application/wasm'
                );

                // const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
                console.log('[FFmpeg] WASM blob created');

                // This is where it usually fails if there's an issue
                console.log('[FFmpeg] Calling ffmpeg.load()...');

                await ffmpeg.load({
                    coreURL,
                    wasmURL,
                    // workerURL,
                });

                console.log('[FFmpeg] ✓ Successfully loaded!');

                globalFFmpeg = ffmpeg;
                isGlobalLoaded = true;
                lastLoadError = null;

                return true;
            } catch (err: unknown) {
                // Capture detailed error info
                const errorMsg = extractErrorMessage(err);
                console.error('[FFmpeg] Load failed:', err);
                console.error('[FFmpeg] Error type:', typeof err);
                console.error('[FFmpeg] Error constructor:', err?.constructor?.name);
                console.error('[FFmpeg] Extracted message:', errorMsg);

                globalFFmpeg = null;
                isGlobalLoaded = false;
                lastLoadError = `Failed to load audio converter: ${errorMsg}`;

                throw new Error(lastLoadError);
            }
        })();

        try {
            const result = await globalLoadPromise;
            setIsLoaded(result);
            setIsLoading(false);
            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : extractErrorMessage(err);
            setError(errorMsg);
            setIsLoading(false);
            return false;
        } finally {
            // Clear the promise so future calls can retry if needed
            // But hasAttemptedLoad prevents auto-retry loops
            globalLoadPromise = null;
        }
    }, []);

    const convertToMp3 = useCallback(async (
        audioUrl: string,
        filename: string
    ): Promise<Blob | null> => {
        if (!globalFFmpeg || !isGlobalLoaded) {
            setError('FFmpeg not loaded');
            return null;
        }

        if (!audioUrl) {
            setError('No audio URL provided');
            return null;
        }

        setIsConverting(true);
        setProgress(0);
        setError(null);

        try {
            console.log('[FFmpeg] Starting conversion:', filename);

            // Fetch audio data
            console.log('[FFmpeg] Fetching audio from:', audioUrl);
            const audioData = await fetchFile(audioUrl);
            console.log('[FFmpeg] Audio fetched, size:', audioData.byteLength);

            if (audioData.byteLength === 0) {
                throw new Error('Failed to fetch audio data - empty response');
            }

            // Determine input format from the original URL (check the proxied url parameter)
            // Default to m4a as YouTube typically uses that for audio
            let inputExt = 'm4a';

            // Try to extract original URL from proxy URL
            try {
                const urlObj = new URL(audioUrl, window.location.origin);
                const originalUrl = urlObj.searchParams.get('url');
                if (originalUrl) {
                    if (originalUrl.includes('mime=audio%2Fwebm') || originalUrl.includes('mime=audio/webm')) {
                        inputExt = 'webm';
                    } else if (originalUrl.includes('mime=audio%2Fmp4') || originalUrl.includes('mime=audio/mp4')) {
                        inputExt = 'm4a';
                    }
                }
            } catch (e) {
                // URL parsing failed, stick with default
                console.log('[FFmpeg] Could not parse URL for format detection, using default:', inputExt);
            }

            const inputFile = `input.${inputExt}`;
            const outputFile = 'output.mp3';

            console.log('[FFmpeg] Using input format:', inputExt);

            // Write to virtual filesystem
            await globalFFmpeg.writeFile(inputFile, audioData);
            console.log('[FFmpeg] Input file written to virtual FS');

            // Run conversion
            console.log('[FFmpeg] Running FFmpeg conversion...');
            await globalFFmpeg.exec([
                '-i', inputFile,
                '-vn',                    // No video
                '-acodec', 'libmp3lame',  // MP3 encoder
                '-ab', '192k',            // 192kbps bitrate
                '-ar', '44100',           // 44.1kHz sample rate
                outputFile,
            ]);

            // Read output
            const data = await globalFFmpeg.readFile(outputFile);
            console.log('[FFmpeg] Output read, size:', (data as Uint8Array).byteLength);

            // Cleanup
            await globalFFmpeg.deleteFile(inputFile);
            await globalFFmpeg.deleteFile(outputFile);

            // Create blob (copy from SharedArrayBuffer to regular ArrayBuffer)
            const uint8Array = new Uint8Array(data as Uint8Array);
            const blob = new Blob([uint8Array], { type: 'audio/mpeg' });

            console.log('[FFmpeg] ✓ Conversion complete:', blob.size, 'bytes');
            setProgress(100);
            setIsConverting(false);
            return blob;
        } catch (err) {
            const errorMsg = extractErrorMessage(err);
            console.error('[FFmpeg] Conversion failed:', err);
            setError(`Conversion failed: ${errorMsg}`);
            setIsConverting(false);
            return null;
        }
    }, []);

    return {
        isLoaded,
        isLoading,
        isConverting,
        progress,
        error,
        sharedArrayBufferSupported,
        load,
        convertToMp3,
    };
}

export default useFFmpeg;