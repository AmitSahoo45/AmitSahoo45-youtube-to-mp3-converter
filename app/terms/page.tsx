import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Use | YtToMP3',
    description: 'Terms for using the YtToMP3 converter.',
}

export default function TermsPage() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
            <div className="space-y-4 text-slate-200 leading-relaxed">
                <p>YtToMP3 is provided as-is for personal use. You are responsible for how you use downloaded files.</p>
                <p>Only convert content you have the right to download. Follow YouTube&apos;s Terms of Service and applicable copyright law.</p>
                <p>We may rate-limit or block requests (including via reCAPTCHA) to protect the service.</p>
                <p>MP4 options are 360p–1080p. Availability depends on the source video.</p>
            </div>
        </main>
    )
}
