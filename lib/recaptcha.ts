interface RecaptchaResponse {
    success: boolean;
    score: number;
    action: string;
    challenge_ts: string;
    hostname: string;
    'error-codes'?: string[];
}

interface VerificationResult {
    success: boolean;
    score: number;
    error?: string;
}

/**
 * Verify reCAPTCHA v3 token with Google
 * @param token - The reCAPTCHA token from client
 * @param expectedAction - The expected action name
 * @param minScore - Minimum score to pass (0.0 - 1.0)
 */
export async function verifyRecaptcha(
    token: string,
    expectedAction: string = 'convert',
    minScore: number = 0.5
): Promise<VerificationResult> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY not configured');
        return { success: false, score: 0, error: 'Server configuration error' };
    }

    if (!token) {
        return { success: false, score: 0, error: 'Missing reCAPTCHA token' };
    }

    try {
        const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';

        const response = await fetch(verificationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
            }),
        });

        const data: RecaptchaResponse = await response.json();

        if (!data.success) {
            return {
                success: false,
                score: 0,
                error: `Verification failed: ${data['error-codes']?.join(', ') || 'Unknown error'}`,
            };
        }

        // Check action matches (prevents token reuse across different actions)
        if (data.action !== expectedAction) {
            return {
                success: false,
                score: data.score,
                error: 'Action mismatch',
            };
        }

        // Check score threshold
        if (data.score < minScore) {
            return {
                success: false,
                score: data.score,
                error: 'Score too low - suspected bot activity',
            };
        }

        return {
            success: true,
            score: data.score,
        };
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return {
            success: false,
            score: 0,
            error: 'Verification request failed',
        };
    }
}