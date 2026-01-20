import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import { rateLimit, getClientIP } from '@/lib/ratelimiter';
import { verifyRecaptcha } from '@/lib/recaptcha';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 second timeout

interface StreamFormat {
    itag: number;
    url: string;
    mimeType: string;
    qualityLabel?: string;
    bitrate?: number;
    audioBitrate?: number;
    contentLength?: string;
    hasAudio: boolean;
    hasVideo: boolean;
}

interface ExtractResponse {
    success: boolean;
    title?: string;
    duration?: number;
    thumbnail?: { url: string; width: number; height: number }[];
    audioFormats?: StreamFormat[];
    videoFormats?: StreamFormat[];
    error?: string;
    retryAfter?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<ExtractResponse>> {
    try {
        const body = await request.json();
        const { videoId, token, type = 'mp3' } = body;

        // Validate input
        if (!videoId || typeof videoId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Missing or invalid video ID' },
                { status: 400 }
            );
        }

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Missing reCAPTCHA token' },
                { status: 400 }
            );
        }

        // Verify reCAPTCHA
        const expectedAction = type === 'audio' ? 'convert_to_mp3' : 'convert_to_mp4';
        const recaptchaResult = await verifyRecaptcha(token, expectedAction, 0.5);

        if (!recaptchaResult.success) {
            return NextResponse.json(
                { success: false, error: recaptchaResult.error || 'reCAPTCHA verification failed' },
                { status: 403 }
            );
        }

        // Rate limiting
        const clientIP = getClientIP(request);
        const rateLimitResult = await rateLimit(clientIP, 10, 3600); // 10 requests per hour

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.',
                    retryAfter: rateLimitResult.resetIn,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.resetIn.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    },
                }
            );
        }

        // Validate video ID format
        const cleanVideoId = videoId.trim();
        if (!/^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid YouTube video ID format' },
                { status: 400 }
            );
        }

        const videoUrl = `https://www.youtube.com/watch?v=${cleanVideoId}`;

        // Validate URL is accessible
        if (!ytdl.validateURL(videoUrl)) {
            return NextResponse.json(
                { success: false, error: 'Invalid YouTube URL' },
                { status: 400 }
            );
        }

        // Fetch video info
        const info = await ytdl.getInfo(videoUrl);
        const { videoDetails, formats } = info;

        // Extract thumbnails
        const thumbnails = videoDetails.thumbnails.map((t) => ({
            url: t.url,
            width: t.width,
            height: t.height,
        }));

        // Filter and map formats
        const audioFormats: StreamFormat[] = formats
            .filter((f) => f.hasAudio && !f.hasVideo && f.audioBitrate && f.url) // Added f.url check
            .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))
            .slice(0, 5)
            .map((f) => ({
                itag: f.itag,
                url: f.url,
                mimeType: f.mimeType || 'audio/mp4',
                audioBitrate: f.audioBitrate,
                contentLength: f.contentLength,
                hasAudio: true,
                hasVideo: false,
            }));

        const videoFormats: StreamFormat[] = formats
            .filter((f) => f.hasVideo && f.hasAudio && f.qualityLabel && f.url)
            .sort((a, b) => {
                const qualityOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'];
                const aIndex = qualityOrder.indexOf(a.qualityLabel || '');
                const bIndex = qualityOrder.indexOf(b.qualityLabel || '');
                return aIndex - bIndex;
            })
            .slice(0, 6)
            .map((f) => ({
                itag: f.itag,
                url: f.url,
                mimeType: f.mimeType || 'video/mp4',
                qualityLabel: f.qualityLabel,
                bitrate: f.bitrate,
                contentLength: f.contentLength,
                hasAudio: f.hasAudio,
                hasVideo: f.hasVideo,
            }));

        return NextResponse.json(
            {
                success: true,
                title: videoDetails.title,
                duration: parseInt(videoDetails.lengthSeconds, 10),
                thumbnail: thumbnails,
                audioFormats,
                videoFormats,
            },
            {
                headers: {
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                },
            }
        );
    } catch (error: any) {
        console.error('Extract error:', error);

        // Handle specific ytdl-core errors
        if (error.message?.includes('Video unavailable')) {
            return NextResponse.json(
                { success: false, error: 'Video is unavailable or private' },
                { status: 404 }
            );
        }

        if (error.message?.includes('Sign in to confirm your age')) {
            return NextResponse.json(
                { success: false, error: 'Age-restricted videos are not supported' },
                { status: 403 }
            );
        }

        if (error.message?.includes('Could not extract')) {
            return NextResponse.json(
                { success: false, error: 'Failed to extract video info. YouTube may have updated their site.' },
                { status: 502 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to extract video information' },
            { status: 500 }
        );
    }
}