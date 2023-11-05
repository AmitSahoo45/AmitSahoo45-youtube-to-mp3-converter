'use client'

import axios from 'axios'
import { useState } from 'react'
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

        toast.promise(
            axios.get(`https://youtube-mp36.p.rapidapi.com/dl?id=${text}`, {
                'headers': {
                    'x-rapidapi-key': process.env.NEXT_PUBLIC_API_KEY,
                    'x-rapidapi-host': process.env.NEXT_PUBLIC_API_HOST
                }
            }), {
            loading: 'Downloading...',
            success: ({ data }) => {
                console.log(data)
                if (!data.link)
                    throw new Error('Failed to convert')

                setDownloadableFile(data.link)
                setVideoTitle(data.title)
                return 'Your song is ready to download'
            },
            error: (err) => 'Failed to convert'
        })
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
                toast.success('Just kidding, your song is getting downloaded 😘', {
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
                <h1 className='my-4 text-xl'>Youtube to MP3 Converter</h1>
                <h4>Enter the Video ID you want to convert</h4>
                <div className="flex justify-center items-center flex-col">
                    <div className="demo_image">
                        <img src="/detail.jpg" alt="Demo Image" />
                    </div>
                    <h5 className='mt-2'>**This is the video ID</h5>
                </div>
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
                        <h4 className='my-2'>Your song is ready to download</h4>
                        <p className='my-3 mb-5'>{videoTitle}</p>
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