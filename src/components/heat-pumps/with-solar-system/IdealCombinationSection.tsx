import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const IdealCombinationSection = async () => {
  const t = await getTranslations('heatPumpsWithSolarSystem')

  return (
    <section
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          left: '-112px',
          top: '-92px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(245px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        <div className="w-full lg:w-auto flex justify-center lg:justify-start flex-shrink-0">
          <Image
            src="/images/heat-pumps/heat-pump-photovoltaics.png"
            alt={t('idealCombination.title')}
            width={329}
            height={356}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div
            className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(65px)',
              WebkitBackdropFilter: 'blur(65px)',
            }}
          >
            <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
              {t('idealCombination.eyebrow')}
            </span>
          </div>

          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
            {t('idealCombination.title')}
          </h2>

          <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
            {t('idealCombination.description')}
          </p>
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

export default IdealCombinationSection
