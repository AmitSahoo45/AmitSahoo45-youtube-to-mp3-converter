import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/ratelimiter';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow longer for large audio files

// Maximum file size to proxy (100MB)
const MAX_CONTENT_LENGTH = 100 * 1024 * 1024;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json(
                { success: false, error: 'Missing audio URL' },
                { status: 400 }
            );
        }

        // Validate URL is from YouTube
        const urlObj = new URL(audioUrl);
        const allowedHosts = [
            'rr1---sn-',
            'rr2---sn-',
            'rr3---sn-',
            'rr4---sn-',
            'rr5---sn-',
            'googlevideo.com',
            'youtube.com',
            'ytimg.com',
        ];

        const isAllowedHost = allowedHosts.some(
            (host) => urlObj.hostname.includes(host) || urlObj.hostname.endsWith(host)
        );

        if (!isAllowedHost) {
            return NextResponse.json(
                { success: false, error: 'Invalid audio source' },
                { status: 403 }
            );
        }

        const clientParam = urlObj.searchParams.get('c');
        let userAgent: string;

        switch (clientParam) {
            case 'IOS':
                userAgent = 'com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)';
                break;
            case 'ANDROID':
                userAgent = 'com.google.android.youtube/19.29.37 (Linux; U; Android 14)';
                break;
            case 'WEB':
            default:
                userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
                break;
        }

        // Rate limiting - more restrictive for proxy endpoint (5 per hour)
        const clientIP = getClientIP(request);
        const rateLimitResult = await rateLimit(`proxy:${clientIP}`, 5, 3600);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.',
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.resetIn.toString(),
                    },
                }
            );
        }

        // Fetch the audio stream
        const response = await fetch(audioUrl, {
            headers: {
                'User-Agent': userAgent,
                'Accept': '*/*',
                'Accept-Encoding': 'identity',
                'Range': request.headers.get('range') || 'bytes=0-',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch audio: ${response.status}` },
                { status: response.status }
            );
        }

        // Check content length
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > MAX_CONTENT_LENGTH) {
            return NextResponse.json(
                { success: false, error: 'Audio file too large' },
                { status: 413 }
            );
        }

        // Stream the response
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('content-type') || 'audio/mp4');

        if (contentLength) {
            headers.set('Content-Length', contentLength);
        }

        // Handle range requests
        const contentRange = response.headers.get('content-range');
        if (contentRange) {
            headers.set('Content-Range', contentRange);
        }

        headers.set('Accept-Ranges', 'bytes');
        headers.set('Cache-Control', 'no-cache');
        headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());

        return new NextResponse(response.body, {
            status: response.status,
            headers,
        });
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to proxy audio stream' },
            { status: 500 }
        );
    }
}