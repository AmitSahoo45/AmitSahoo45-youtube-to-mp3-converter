import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type Data = {
    success: boolean;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false });
    }

    const { token } = req.body;

    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

        const response = await axios.post(verificationUrl);
        const data = response.data;

        if (data.success && data.score > 0.5) {
            // Process the form submission (e.g., save to database)
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false });
        }
    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        return res.status(500).json({ success: false });
    }
}