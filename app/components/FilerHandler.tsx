'use client'

import { useState } from 'react'

import axios from 'axios'
import getVideoId from 'get-video-id'
import { toast, Toaster } from 'react-hot-toast'

import { MP4Type } from '@/types/types'
import Image from 'next/image'
import Loader from './Loader'

const FilerHandler = () => {
    const [text, setText] = useState('')
    const [videoTitle, setVideoTitle] = useState('')
    const [downloadableFile, setDownloadableFile] = useState(null)

    const [mp4Details, setMp4Details] = useState<MP4Type | null>(null)

    const convertToMp3 = async () => {
        if (text === '') {
            toast.error('Please enter the video ID')
            return
        }

        const { id } = getVideoId(text)
        toast.loading('Fetching video...', { duration: 1000 })

        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_KEY}api/fetchVideo` as string, { text: id })

            if (!data.link)
                throw new Error(data.msg)

            setDownloadableFile(data.link)
            setVideoTitle(data.title)
            toast.success('Converted successfully!')
        } catch (error: any) {
            console.log(error)
            toast.error(error.message, { duration: 3000 })
        }
    }

    const convertToMp4 = async () => {
        if (text === '') {
            toast.error('Please enter the video ID')
            return
        }

        const { id } = getVideoId(text)
        toast.loading('Fetching video...', { duration: 1000 })

        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_KEY}api/convertToMp4` as string, { text: id })
            setMp4Details(data);
            toast.success('Converted successfully!')
        } catch (error: any) {
            toast.error(error.message, { duration: 3000 })
        }
    }

    const getNumber = (): number => {
        if (!mp4Details?.thumbnail) return 0;

        if (mp4Details.thumbnail.length === 1) return Number(mp4Details.thumbnail[0]) || 0;

        const secondLastIndex = mp4Details.thumbnail.length - 2;
        const secondLastValue = mp4Details.thumbnail[secondLastIndex];

        return Number(secondLastValue) || 0;
    };


    const downloadFile = (isMp3: boolean) => {
        if (downloadableFile) {
            toast.error('Downloading virus 😈', {
                duration: 1500,
                style: {
                    background: '#363636',
                    color: '#fff'
                }
            });

            setTimeout(() => {
                toast.success('Just kidding, your video being downloaded 😘', {
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff'
                    }
                });
            }, 1500);

            isMp3 ?
                setDownloadableFile(null) :
                setMp4Details(null);
        } else toast.error('Failed to download')
    };

    return (
        <>
            <main className='my-2 flex justify-center items-center flex-col'>
                <h1 className='my-4 text-xl'>YtToMP3/MP4: Youtube to MP3/MP4 Converter</h1>

                <div className='sm:w-1/2 w-full text-center'>
                    <p className='text-xs'>
                        The safest and most reliable Youtube to MP3 or MP4 converter.
                        No need to worry about phishing links and stuff.
                        Made by a Developer 😘
                        Just paste the URL and download your favorite videos/audios in the best quality.
                    </p>

                    <p className='my-3'>
                        Drop me a follow on &nbsp;
                        <a
                            className='text-purple-300 hover:text-purple-500 font-bold'
                            href='https://github.com/AmitSahoo45'
                        >
                            GitHub
                        </a>
                    </p>
                </div>
                <h4>Please enter the URL of the video</h4>
            </main>
            <div className="flex items-center justify-center p-5 flex-col">
                <div className="rounded-lg bg-gray-200 sm:p-3 sm:w-4/5 w-full p-1">
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
                    </div>
                </div>

                <div className='mt-4'>
                    <button
                        type="button"
                        className="bg-cyan-500 p-2 rounded-tl-lg rounded-bl-lg text-white font-semibold hover:bg-cyan-800 transition-colors cursor-pointer"
                        onClick={() => convertToMp4()}
                    >
                        Convert to MP4
                    </button>
                    <button
                        type="button"
                        className="bg-blue-500 p-2 rounded-tr-lg rounded-br-lg text-white font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
                        onClick={convertToMp3}
                    >
                        Convert to MP3
                    </button>
                </div>
            </div>

            {downloadableFile && (
                <section className='my-2 flex justify-center items-center flex-col'>
                    <h4 className='my-2'>Your MP3 <span className='font-extrabold text-red-700'>{videoTitle}</span> is ready to download</h4>
                    <a href={downloadableFile} download>
                        <button
                            className='bg-blue-500 p-2 rounded-lg text-white font-semibold hover:bg-blue-800 transition-colors cursor-pointer'
                            onClick={() => downloadFile(true)}
                        >
                            Download
                        </button>
                    </a>
                </section>
            )}


            {mp4Details
                && (
                    <section className='mb-2 flex justify-center items-center flex-col'>
                        <p>Your MP4 file <span className='font-extrabold text-red-700'>{mp4Details.title}</span> is ready to download</p>
                        <Image
                            src={mp4Details.thumbnail[getNumber()].url}
                            width={mp4Details.thumbnail[getNumber()].width}
                            height={mp4Details.thumbnail[getNumber()].height}
                            alt={mp4Details.title}
                            className='rounded-lg mt-2'
                        />
                        <div className='mt-4 mb-1'>
                            {mp4Details.formats.map((format, index) => (
                                <div key={index} className='sm:w-1/2 w-full flex items-center py-2'>
                                    <p className='mr-3'>{format.qualityLabel}</p>
                                    <a
                                        href={format.url}
                                        download
                                    >
                                        <button
                                            className='bg-cyan-500 p-2 rounded-lg text-white font-light hover:bg-cyan-800 transition-colors cursor-pointer w-40'
                                            onClick={() => downloadFile(false)}
                                        >
                                            View & Download
                                        </button>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            <main className='sm:w-4/5 container mx-auto px-6 mb-6'>
                <div>
                    <p className='my-3 text-sm'>YouTube.com is the largest video sharing platform on the Internet. Every day millions of new videos are added. You can find all kinds of videos but YouTube does not offer a FREE downloading service for these videos.</p>
                    <p className='my-3 text-sm'>YTMP3 allows you to download your favorite YouTube videos as MP3 (audio) or MP4 (video) files in the most efficient way. You are able to use YTMP3 on any device – it is optimized to work on desktop, tablet and mobile devices. There is also no additional software or app needed.</p>
                    <h2 className='my-4 text-slate-300 font-bold'>How to download a YouTube video?</h2>
                    <p><span>1.</span> Open YouTube.com and search for the video you would like to download.</p>
                    <p><span>2.</span> When you find the video, click on it and wait until it starts playing. Then, just copy the video URL from your browser address bar.</p>
                    <p><span>3.</span> Open <a href="">YtToMP3</a> and paste the video URL in our converter. After that you will be able to choose the download format. You can choose between MP3 or MP4. If you do not choose any format the video will be converted by default into a MP3 file.</p>
                    <p><span>4.</span> Then, simply click on the Convert button. The conversion will be initiated, and may take a few minutes. We will try to convert the video in the best available quality. But be aware that it is only possible to download videos that are up to 90 minutes long, to guarantee that the conversion will be done within a few minutes.</p>
                    <p><span>5.</span> As soon as the conversion of the video is completed you will see a Download button. Just click on it, and the download shall start.</p>
                </div>

                <div>
                    <p>Youtube to MP4</p>
                    <p>Convert Youtube to mp4 with high quality in 1080p, 2160p, 2k, 4k, 8k for free. Download Youtube video in mp4 format, no need to install software.</p>
                    <div className="y2mate-in-ad col-sm-6 col-6">
                        <h5><strong>Features</strong></h5>
                        <ul>
                            <li>Free Convert and download Youtube to MP4</li>
                            <li>Unlimited Video Download from Youtube</li>
                            <li>Simple and Fast youtube to mp4 Converter</li>
                            <li>Supports converter video YouTube to Mp3 and other formats</li>
                        </ul>
                    </div>

                    <div className="y2mate-in-ad col-sm-6 col-6">
                        <h5><strong>Instructions:</strong></h5>
                        <ol>
                            <li>Open YouTube website and copy URL of the Youtube video to MP4 that you want to convert and download</li>
                            <li>Paste this URL into the Search box and press the Start button</li>
                            <li>Choose the video format you would like to download from youtube</li>
                            <li>After successful conversion click on Download button</li>
                        </ol>
                    </div>
                </div>
            </main>

            <Toaster
                position='bottom-left'
                toastOptions={{
                    duration: 2000,
                    style: {
                        background: '#363636',
                        color: '#fff'
                    },
                    success: {
                        duration: 2000,
                        style: {
                            background: '#363636',
                            color: '#fff'
                        }
                    },
                    error: {
                        duration: 2000,
                        style: {
                            background: '#363636',
                            color: '#fff'
                        }
                    }
                }}
            />
        </>
    )
}

export default FilerHandler