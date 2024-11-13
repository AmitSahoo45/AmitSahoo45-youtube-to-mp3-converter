'use client';

import dynamic from "next/dynamic";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const FilerHandler = dynamic(() => import('@/app/components/FilerHandler'), { ssr: true })

export default function Home() {
  return (
    <>
      <GoogleReCaptchaProvider reCaptchaKey="6LeJxH0qAAAAAC5BWWCtkePuCdWwIyVPHgLM8Efl">
        <FilerHandler />
      </GoogleReCaptchaProvider>
    </>
  )
}
