import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

import { Format, ThumbnailFormat } from '@/helper/types';

type Data = {
    success: boolean;
    link?: string;
    title?: string;
    error?: string;
    thumbnail?: ThumbnailFormat[];
    formats?: Format[];
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST')
        return res.status(405).json({ success: false });

    const { token, text, type } = req.body;

    if (!token || !text)
        return res.status(400).json({ success: false, error: 'Missing token or text' });

    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        if (!secretKey)
            return res.status(500).json({ success: false, error: 'Internal server error' });

        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

        const response = await axios.post(verificationUrl);
        const { success, score } = response.data;

        console.log('reCAPTCHA verification:', response.data);

        if (!success)
            return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });

        if (score < 0.5)
            return res.status(400).json({ success: false, error: 'Get outta here' });

        let fetchVideoUrl;

        switch (type) {
            case 'mp3':
                fetchVideoUrl = `${process.env.NEXT_PUBLIC_API_KEY}/api/fetchVideo`;
                break;
            case 'mp4':
                fetchVideoUrl = `${process.env.NEXT_PUBLIC_API_KEY}/api/convertToMp4`;
                break;

            default:
                return res.status(400).json({ success: false, error: 'Invalid type' });
        }
        const { data } = await axios.post(fetchVideoUrl, { text });

        if (type === 'mp4')
            return res.status(200).json({
                success: true,
                title: data.title,
                thumbnail: data.thumbnail,
                formats: data.adaptiveFormats,
            })

        return res.status(200).json({
            success: true,
            link: data.link,
            title: data.title,
        });
    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        return res.status(500).json({ success: false });
    }
}