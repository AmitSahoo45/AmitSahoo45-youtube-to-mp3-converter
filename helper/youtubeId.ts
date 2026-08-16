const YT_ID = /^[a-zA-Z0-9_-]{11}$/;

export function isYouTubeId(value: unknown): value is string {
    return typeof value === 'string' && YT_ID.test(value);
}
