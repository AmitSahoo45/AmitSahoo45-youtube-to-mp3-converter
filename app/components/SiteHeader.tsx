const SiteHeader = () => {
    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f0f1a]/85 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <a href="/" className="font-bold gradient-text text-lg">
                    YtToMP3/MP4
                </a>
                <nav className="flex items-center gap-5 text-sm text-slate-200">
                    <a href="/#converter" className="footer-link">Convert</a>
                    <a href="/#how-to" className="footer-link">How to</a>
                    <a href="/#faq" className="footer-link">FAQ</a>
                </nav>
            </div>
        </header>
    )
}

export default SiteHeader
