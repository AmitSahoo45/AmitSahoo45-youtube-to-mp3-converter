'use client';

import dynamic from 'next/dynamic';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const FilerHandler = dynamic(() => import('@/app/components/FilerHandler'), { ssr: false });

export default function Home() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <FilerHandler />
    </GoogleReCaptchaProvider>
  );
}