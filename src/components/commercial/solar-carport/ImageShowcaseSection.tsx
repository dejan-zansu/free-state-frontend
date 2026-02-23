import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const ImageShowcaseSection = async () => {
  const t = await getTranslations('solarCarport')

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 aspect-[720/586]">
          <Image
            src="/images/commercial/solar-carport/carport-typology-4e85f6.png"
            alt={t('imageShowcase.leftLabel')}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-5 left-5 z-10">
            <div
              className="rounded-full px-4 py-[10px]"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.31)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-white text-lg md:text-[22px] font-light tracking-[-0.02em]">
                {t('imageShowcase.leftLabel')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 aspect-[720/586]">
          <Image
            src="/images/commercial/solar-carport/carport-visualization-70063e.png"
            alt={t('imageShowcase.rightLabel')}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-5 left-5 z-10">
            <div
              className="rounded-full px-4 py-[10px]"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.31)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-white text-lg md:text-[22px] font-light tracking-[-0.02em]">
                {t('imageShowcase.rightLabel')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ImageShowcaseSection
