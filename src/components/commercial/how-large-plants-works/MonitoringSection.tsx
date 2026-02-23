import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const MonitoringSection = async () => {
  const t = await getTranslations('howLargePlantsWorks')

  return (
    <section
      className="relative py-12 md:py-16 lg:py-20"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
          <div className="relative w-[137px] shrink-0">
            <Image
              src="/images/commercial/how-large-plants-works/monitoring-illustration.png"
              alt={t('monitoring.title')}
              width={282}
              height={570}
              className="w-full h-auto"
            />
          </div>

          <div className="flex flex-col gap-5 max-w-[561px]">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-full border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
                {t('monitoring.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('monitoring.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('monitoring.description')}
            </p>
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

export default MonitoringSection
