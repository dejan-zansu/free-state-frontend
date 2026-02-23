import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const IntroSection = async () => {
  const t = await getTranslations('singleFamilyHome')

  return (
    <section className="relative bg-[#FDFFF5] py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-[120px]">
          <div className="flex flex-col gap-5 max-w-[385px]">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-full border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
                {t('intro.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('intro.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-justify">
              {t('intro.description')}
            </p>
          </div>

          <div className="shrink-0">
            <Image
              src="/images/charging-stations/single-family-home/charging-station-illustration.svg"
              alt={t('intro.title')}
              width={355}
              height={325}
            />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default IntroSection
