const MAX_URL_LENGTH = 8192

const YOUTUBE_THUMBNAIL_HOST_SUFFIXES = [
    'ytimg.com',
]

const DEFAULT_DOWNLOAD_HOST_SUFFIXES = [
    'googlevideo.com',
    'gvt1.com',
    'rapidapi.com',
    'oceansaver.in',
    'yttomp3backend.vercel.app',
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

function isLocalHostname(hostname: string): boolean {
    const host = hostname.toLowerCase().replace(/\.$/, '')
    return host === 'localhost' || host === '127.0.0.1'
}

function parseDownloadUrl(value: unknown): URL | null {
    if (typeof value !== 'string' || value.length === 0 || value.length > MAX_URL_LENGTH)
        return null

    let url: URL
    try {
        url = new URL(value)
    } catch {
        return null
    }

    if (url.username || url.password)
        return null

    if (isLocalHostname(url.hostname)) {
        if (url.protocol !== 'http:' && url.protocol !== 'https:')
            return null
        return url
    }

    if (url.protocol !== 'https:')
        return null

    const host = url.hostname.toLowerCase().replace(/\.$/, '')
    if (!host || isIpLiteral(host) || !host.includes('.'))
        return null

    return url
}

function backendOrigin(): string | null {
    const raw = process.env.NEXT_PUBLIC_API_KEY
    if (!raw)
        return null

    try {
        return new URL(raw).origin
    } catch {
        return null
    }
}

function extraDownloadHostSuffixes(): string[] {
    const raw = process.env.NEXT_PUBLIC_ALLOWED_DOWNLOAD_HOST_SUFFIXES || ''
    return raw
        .split(',')
        .map((suffix) => suffix.trim().toLowerCase())
        .filter((suffix) => /^[a-z0-9.-]+\.[a-z0-9.-]+$/.test(suffix))
}

function isSelfDownloadUrl(value: unknown): boolean {
    const url = parseDownloadUrl(value)
    if (!url || url.pathname !== '/api/download')
        return false

    if (isLocalHostname(url.hostname))
        return true

    const origin = backendOrigin()
    return Boolean(origin && url.origin === origin)
}

export function isAllowedThumbnailUrl(value: unknown): value is string {
    const url = parseDownloadUrl(value)
    return Boolean(
        url
        && url.protocol === 'https:'
        && isAllowedHost(url.hostname, YOUTUBE_THUMBNAIL_HOST_SUFFIXES)
    )
}

export function isAllowedDownloadUrl(value: unknown): value is string {
    if (isSelfDownloadUrl(value))
        return true

    const url = parseDownloadUrl(value)
    if (!url || url.protocol !== 'https:')
        return false

    return true
}
