import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | YtToMP3',
    description: 'How YtToMP3 handles URLs, reCAPTCHA, and analytics.',
}

export default function PrivacyPage() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="space-y-4 text-slate-200 leading-relaxed">
                <p>We do not require an account. You submit a YouTube URL so we can convert it.</p>
                <p>The convert request is protected with Google reCAPTCHA v3. Google may collect device and interaction data under its own privacy policy.</p>
                <p>We use Vercel Analytics for anonymous traffic. We do not sell personal data.</p>
                <p>Converted files are fetched from our conversion backend. Do not submit personal information in the URL field.</p>
            </div>
        </main>
    )
}
