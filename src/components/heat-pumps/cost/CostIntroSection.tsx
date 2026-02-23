import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const CostIntroSection = async () => {
  const t = await getTranslations('heatPumpsCost')

  return (
    <section className="relative bg-[#EAEDDF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[60px]">
          <div className="flex flex-col gap-5 max-w-[581px]">
            <div
              className="flex items-center justify-center px-4 py-2.5 rounded-full border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-sm md:text-base font-light tracking-[-0.02em]">
                {t('intro.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium">
              {t('intro.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('intro.description')}
            </p>
          </div>

          <div className="w-full lg:w-[410px] flex-shrink-0">
            <Image
              src="/images/heat-pumps-cost/cost-intro-illustration.svg"
              alt={t('intro.title')}
              width={410}
              height={325}
              className="w-full h-auto"
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

export default CostIntroSection
