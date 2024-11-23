import React, { FC, useMemo } from 'react';
import Image from 'next/image';
import { MP4Type } from '@/helper/types';

interface DownloadSectionProps {
    mp4Details: MP4Type | null;
    downloadFile: (flag: boolean) => void;
    getNumber: () => number;
}

const DownloadSection: FC<DownloadSectionProps> = ({ mp4Details, downloadFile, getNumber }) => {
    const bestItags:Number[] = [134, 135, 136, 137];

    const filteredFormats = useMemo(() => {
        return mp4Details?.formats.filter(format => format.itag && bestItags.includes(format.itag)) || [];
    }, [mp4Details, bestItags]);

    const thumbnail = useMemo(() => {
        if (!mp4Details) return null;
        const index = getNumber();
        return mp4Details.thumbnail[index] || mp4Details.thumbnail[0];
    }, [mp4Details, getNumber]);

    if (!mp4Details || !thumbnail)
        return null;

    return (
        <section className='mb-2 flex justify-center items-center flex-col'>
            <p>
                Your MP4 file <span className='font-extrabold text-red-700'>{mp4Details.title}</span> is ready to download
            </p>
            <Image
                src={thumbnail.url}
                width={thumbnail.width}
                height={thumbnail.height}
                alt={mp4Details.title}
                className='rounded-lg mt-2'
            />
            <div className='mt-4 mb-1 w-full max-w-md flex flex-col-reverse items-center'>
                {filteredFormats.length > 0 ? (
                    filteredFormats.map(format => (
                        <div key={format.itag} className='flex items-center py-2'>
                            <a href={format.url} download>
                                <button
                                    className='bg-cyan-500 p-2 rounded-lg text-white font-light hover:bg-cyan-800 transition-colors cursor-pointer w-40'
                                    onClick={() => downloadFile(false)}
                                >
                                    View & Download
                                </button>
                            </a>
                            <p className='ml-3'>{format.qualityLabel}</p>
                        </div>
                    ))
                ) : (
                    <p className='text-gray-500'>No available formats to download.</p>
                )}
            </div>
        </section>
    );
};

export default DownloadSection;