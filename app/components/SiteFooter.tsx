const SiteFooter = () => {
    return (
        <footer className="border-t border-white/10 py-8 px-4">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <a href="/" className="font-bold gradient-text text-lg">YtToMP3/MP4</a>
                    <p className="text-sm text-slate-300 mt-1">YouTube to MP3/MP4 converter.</p>
                </div>
                <div className="flex items-center gap-5 text-sm text-slate-200">
                    <a href="/privacy" className="footer-link">Privacy</a>
                    <a href="/terms" className="footer-link">Terms</a>
                    <span>© {new Date().getFullYear()} YtToMP3</span>
                </div>
            </div>
        </footer>
    )
}

export default SiteFooter
