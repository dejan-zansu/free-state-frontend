import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const VideoShowcaseSection = async () => {
  const t = await getTranslations('solarCarport')

  return (
    <section className="bg-[#FDFFF5] py-12 md:py-16">
      <div className="max-w-[1204px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[20px] overflow-hidden aspect-[1204/477]">
          <Image
            src="/images/commercial/solar-carport/video-thumbnail.png"
            alt={t('videoShowcase.alt')}
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 1) 100%)',
            }}
          />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-white text-base font-medium tracking-[-0.02em]">
              {t('videoShowcase.play')}
            </span>
            <div className="w-[50px] h-px bg-white" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default VideoShowcaseSection
