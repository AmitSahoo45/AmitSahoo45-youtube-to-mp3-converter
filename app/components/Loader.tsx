'use client'

const Loader = () => {
    return (
        <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />
        </div>
    )
}

export default Loader