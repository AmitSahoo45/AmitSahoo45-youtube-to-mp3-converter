import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // seconds
}

/**
 * Rate limiter using Upstash Redis
 * @param identifier - Unique identifier (IP address or user ID)
 * @param limit - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export async function rateLimit(
    identifier: string,
    limit: number = 10,
    windowSeconds: number = 3600
): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;

    try {
        const pipeline = redis.pipeline();
        pipeline.incr(key);
        pipeline.ttl(key);

        const results = await pipeline.exec<[number, number]>();
        const current = results[0];
        const ttl = results[1];

        // Set expiry on first request
        if (ttl === -1) {
            await redis.expire(key, windowSeconds);
        }

        const remaining = Math.max(0, limit - current);
        const resetIn = ttl > 0 ? ttl : windowSeconds;

        return {
            success: current <= limit,
            remaining,
            resetIn,
        };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // Fail open - allow request if Redis is down
        return { success: true, remaining: limit, resetIn: windowSeconds };
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    return 'unknown';
}