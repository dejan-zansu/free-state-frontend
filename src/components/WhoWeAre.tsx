'use client'

import Image from 'next/image'
import { Play, Pause } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

const WhoWeAre = () => {
  const t = useTranslations('home.whoWeAre')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }
  return (
    <section
      className="relative w-full py-12 md:py-16 lg:py-20"
      style={{
        background:
          'linear-gradient(180deg, rgba(253, 255, 245, 1) 2%, rgba(234, 237, 223, 1) 100%)',
      }}
    >
      <div className="max-w-[1292px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
          <div className="w-full lg:max-w-[508px] shrink-0">
            <div className="flex flex-col">
              <p className="text-foreground/80 text-2xl font-normal mb-5">
                {t('eyebrow')}
              </p>

              <h2 className="text-foreground text-5xl font-medium mb-7 whitespace-pre-line">
                {t('title')}
              </h2>

              <p className="text-foreground/80 text-base font-light leading-[1.5em] max-w-[487px]">
                &ldquo;{t('quote')}&rdquo;
              </p>

              <div className="flex items-start gap-3 flex-col mt-5">
                <div className="shrink-0">
                  <Image
                    src="/images/who-we-are-icon.svg"
                    alt="FreeState AG"
                    width={64}
                    height={61}
                    className="w-16 h-auto"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-foreground text-lg font-semibold leading-[1.33em]">
                    {t('author')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[618px] lg:shrink-0 relative">
            <div
              className="relative w-full aspect-[618/333] rounded-lg overflow-hidden bg-black group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <video
                ref={videoRef}
                src="/videos/intro-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0, 0, 0, 0) 9%, rgba(0, 0, 0, 0.6) 100%)',
                }}
              />

              <div
                className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ${
                  isPlaying && !isHovered ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <button
                  onClick={togglePlayPause}
                  className="relative w-[45.49px] h-[45.49px] rounded-full bg-foreground/80 backdrop-blur-sm flex items-center justify-center hover:bg-foreground/90 transition-colors cursor-pointer"
                  aria-label={isPlaying ? t('video.pause') : t('video.play')}
                >
                  {isPlaying ? (
                    <Pause
                      className="w-[13.49px] h-[14.83px] text-solar"
                      fill="#B7FE1A"
                      stroke="#B7FE1A"
                      strokeWidth={0.9}
                    />
                  ) : (
                    <Play
                      className="w-3 h-3.5 text-solar"
                      fill="#B7FE1A"
                      stroke="#B7FE1A"
                      strokeWidth={0.9}
                    />
                  )}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: '0px 0px 4px 0px rgba(183, 254, 26, 0.4)',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhoWeAre
