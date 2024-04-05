import dynamic from "next/dynamic";
const FilerHandler = dynamic(() => import('@/app/components/FilerHandler'), { ssr: true })

export default function Home() {
  return (
    <>
      <FilerHandler />
    </>
  )
}
