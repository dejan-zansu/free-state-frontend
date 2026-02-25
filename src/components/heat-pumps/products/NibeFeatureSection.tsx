import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const NibeFeatureSection = async () => {
  const t = await getTranslations('heatPumpsProducts.nibe')

  return (
    <section className="relative bg-[#FDFFF5] overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 aspect-[720/744]">
          <Image
            src="/images/heat-pumps/products/nibe-section-bg.png"
            alt={t('title')}
            fill
            className="object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0">
          <div className="max-w-[474px] flex flex-col gap-5">
            <span
              className="self-start px-4 py-2.5 text-[#062E25] text-base font-light tracking-[-0.02em] rounded-[20px] border border-[#062E25] backdrop-blur-[65px]"
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}
            >
              {t('eyebrow')}
            </span>

            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NibeFeatureSection
