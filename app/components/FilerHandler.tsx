'use client'

import { useState } from 'react'
import axios from 'axios'
import getVideoId from 'get-video-id';
import { toast, Toaster } from 'react-hot-toast'

const FilerHandler = () => {
    const [text, setText] = useState('')
    const [videoTitle, setVideoTitle] = useState('')
    const [downloadableFile, setDownloadableFile] = useState(null)

    const downloadSong = async () => {
        if (text === '') {
            toast.error('Please enter the video ID')
            return
        }

        const { id } = getVideoId(text)
        toast.loading('Fetching video...', { duration: 1000 })

        try {
            const { data } = await axios.post(process.env.NEXT_PUBLIC_API_KEY as string, { text: id })

            if (!data.link)
                throw new Error(data.msg)

            setDownloadableFile(data.link)
            setVideoTitle(data.title)
            toast.success('Your song is ready to download')
        } catch (error: any) {
            console.log(error)
            toast.error(error.message, { duration: 3000 })
        }
    }

    const downloadFile = () => {
        if (downloadableFile) {
            toast.error('Downloading virus 😈', {
                duration: 1500,
                style: {
                    background: '#363636',
                    color: '#fff',
                },
            });

            setTimeout(() => {
                toast.success('Just kidding, your video being downloaded 😘', {
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                });
            }, 1500);
            setDownloadableFile(null);
        } else {
            toast.error('Failed to download')
        }
    };

    return (
        <>
            <main className='my-2 flex justify-center items-center flex-col'>
                <h1 className='my-4 text-xl'>YtToMP3: Youtube to MP3 Converter</h1>
                <h4>Please enter the URL of the video</h4>
            </main>
            <div className="flex items-center justify-center p-5">
                <div className="rounded-lg bg-gray-200 sm:p-5 sm:w-4/5 w-full p-1">
                    <div className="flex w-full">
                        <div className="flex w-10 items-center justify-center rounded-tl-lg rounded-bl-lg border-r border-gray-200 bg-white p-5">
                            <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none absolute w-5 fill-gray-500 transition">
                                <path d="M16.72 17.78a.75.75 0 1 0 1.06-1.06l-1.06 1.06ZM9 14.5A5.5 5.5 0 0 1 3.5 9H2a7 7 0 0 0 7 7v-1.5ZM3.5 9A5.5 5.5 0 0 1 9 3.5V2a7 7 0 0 0-7 7h1.5ZM9 3.5A5.5 5.5 0 0 1 14.5 9H16a7 7 0 0 0-7-7v1.5Zm3.89 10.45 3.83 3.83 1.06-1.06-3.83-3.83-1.06 1.06ZM14.5 9a5.48 5.48 0 0 1-1.61 3.89l1.06 1.06A6.98 6.98 0 0 0 16 9h-1.5Zm-1.61 3.89A5.48 5.48 0 0 1 9 14.5V16a6.98 6.98 0 0 0 4.95-2.05l-1.06-1.06Z"></path>
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="pl-2 text-base font-semibold outline-0 w-full bg-black"
                            placeholder=""
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button
                            type="button"
                            className="bg-blue-500 p-2 rounded-tr-lg rounded-br-lg text-white font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
                            onClick={downloadSong}
                        >
                            Download
                        </button>
                    </div>
                </div>
            </div>

            <section className='my-2 flex justify-center items-center flex-col'>
                {downloadableFile && (
                    <>
                        <h4 className='my-2'>Your video <span className='font-extrabold text-red-700'>{videoTitle}</span> is ready to download</h4>
                        <a href={downloadableFile} download>
                            <button
                                className='bg-blue-500 p-2 rounded-lg text-white font-semibold hover:bg-blue-800 transition-colors cursor-pointer'
                                onClick={downloadFile}
                            >
                                Download
                            </button>
                        </a>
                    </>
                )}
            </section>

            <main className='sm:w-4/5 container mx-auto mb-6'>
                <p className='my-3 text-sm'>YouTube.com is the largest video sharing platform on the Internet. Every day millions of new videos are added. You can find all kinds of videos but YouTube does not offer a FREE downloading service for these videos.</p>
                <p className='my-3 text-sm'>YTMP3 allows you to download your favorite YouTube videos as MP3 (audio) or MP4 (video) files in the most efficient way. You are able to use YTMP3 on any device – it is optimized to work on desktop, tablet and mobile devices. There is also no additional software or app needed.</p>
                <h2 className='my-4 text-slate-300 font-bold'>How to download a YouTube video?</h2>
                <p><span>1.</span> Open YouTube.com and search for the video you would like to download.</p>
                <p><span>2.</span> When you find the video, click on it and wait until it starts playing. Then, just copy the video URL from your browser address bar.</p>
                <p><span>3.</span> Open <a href="">YtToMP3</a> and paste the video URL in our converter. After that you will be able to choose the download format. You can choose between MP3 or MP4. If you do not choose any format the video will be converted by default into a MP3 file.</p>
                <p><span>4.</span> Then, simply click on the Convert button. The conversion will be initiated, and may take a few minutes. We will try to convert the video in the best available quality. But be aware that it is only possible to download videos that are up to 90 minutes long, to guarantee that the conversion will be done within a few minutes.</p>
                <p><span>5.</span> As soon as the conversion of the video is completed you will see a Download button. Just click on it, and the download shall start.</p>
            </main>

            <Toaster
                position='bottom-left'
                toastOptions={{
                    duration: 2000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 2000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    },
                    error: {
                        duration: 2000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    },
                }}
            />
        </>
    )
}

export default FilerHandler