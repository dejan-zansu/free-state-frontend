import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const SolarBenefitsSection = async () => {
  const t = await getTranslations('heatPumpsWithSolarSystem')

  return (
    <section
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      style={{
        background:
          'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '-50px',
          top: '-238px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '291px',
          height: '291px',
          right: '0px',
          top: '-238px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-[90px]">
          <div className="w-full lg:w-1/3 flex flex-col gap-5">
            <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('solarBenefits.selfConsumption.title')}
            </h2>
            <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('solarBenefits.selfConsumption.description')}
            </p>
          </div>

          <div className="hidden lg:flex flex-shrink-0 items-center justify-center">
            <Image
              src="/images/heat-pumps-with-solar-system/solar-self-consumption-icon.png"
              alt=""
              width={257}
              height={285}
            />
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-5">
            <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('solarBenefits.heatWithSolar.title')}
            </h2>
            <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('solarBenefits.heatWithSolar.description')}
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

export default SolarBenefitsSection
