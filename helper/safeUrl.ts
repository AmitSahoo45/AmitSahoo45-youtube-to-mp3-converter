const MAX_URL_LENGTH = 8192

const YOUTUBE_VIDEO_HOST_SUFFIXES = [
    'googlevideo.com',
    'gvt1.com',
]

const DEFAULT_DOWNLOAD_HOST_SUFFIXES = [
    'googlevideo.com',
    'gvt1.com',
    'rapidapi.com',
    'oceansaver.in',
]

const YOUTUBE_THUMBNAIL_HOST_SUFFIXES = [
    'ytimg.com',
]

function isIpLiteral(hostname: string): boolean {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname))
        return true

    return hostname.includes(':')
}

function isAllowedHost(hostname: string, suffixes: readonly string[]): boolean {
    const host = hostname.toLowerCase().replace(/\.$/, '')

    if (!host)
        return false

    return suffixes.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))
}

function isPublicHostname(hostname: string): boolean {
    const host = hostname.toLowerCase().replace(/\.$/, '')

    if (!host || host === 'localhost' || host.endsWith('.localhost'))
        return false

    if (isIpLiteral(host))
        return false

    return host.includes('.')
}

function parseSafeHttpsUrl(value: unknown): URL | null {
    if (typeof value !== 'string' || value.length === 0 || value.length > MAX_URL_LENGTH)
        return null

    let url: URL
    try {
        url = new URL(value)
    } catch {
        return null
    }

    if (url.protocol !== 'https:')
        return null

    if (url.username || url.password)
        return null

    if (!isPublicHostname(url.hostname))
        return null

    return url
}

export function isAllowedThumbnailUrl(value: unknown): value is string {
    const url = parseSafeHttpsUrl(value)
    return Boolean(url && isAllowedHost(url.hostname, YOUTUBE_THUMBNAIL_HOST_SUFFIXES))
}

export function isAllowedVideoUrl(value: unknown): value is string {
    const url = parseSafeHttpsUrl(value)
    return Boolean(url && isAllowedHost(url.hostname, YOUTUBE_VIDEO_HOST_SUFFIXES))
}

function extraDownloadHostSuffixes(): string[] {
    const raw = process.env.NEXT_PUBLIC_ALLOWED_DOWNLOAD_HOST_SUFFIXES || ''
    return raw
        .split(',')
        .map((suffix) => suffix.trim().toLowerCase())
        .filter((suffix) => /^[a-z0-9.-]+\.[a-z0-9.-]+$/.test(suffix))
}

export function isAllowedDownloadUrl(value: unknown): value is string {
    const url = parseSafeHttpsUrl(value)
    if (!url)
        return false

    return isAllowedHost(url.hostname, [
        ...DEFAULT_DOWNLOAD_HOST_SUFFIXES,
        ...extraDownloadHostSuffixes(),
    ])
}
