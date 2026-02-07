import { getTranslations } from 'next-intl/server'
import LightBulb2Icon from '../icons/LightBulb2Icon'

const HowSolarPanelWorksSection = async () => {
  const t = await getTranslations('howItWorks')

  return (
    <section className="relative min-h-[507px] bg-[#4A9A99] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[14px] scale-105"
        style={{
          backgroundImage: `url('/images/how-solar-panel-works-bg.png')`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(74, 154, 153, 0) 9%, rgba(74, 154, 153, 1) 100%),
            linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)
          `,
          opacity: 0.5,
        }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-[#B9CF70]/20" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-12 md:py-[50px]">
        <h2 className="text-white text-3xl md:text-[45px] font-medium leading-[1em] text-center mb-12 md:mb-[50px]">
          {t('solarPanel.title')}
        </h2>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-[90px]">
          <p className="text-white/80 text-base md:text-[22px] leading-[1.36em] tracking-[-0.02em] text-justify max-w-[535px]">
            {t('solarPanel.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-[13px]">
            <div className="relative w-[100px] h-[100px] flex-shrink-0">
              <div className="absolute inset-0 bg-white rounded-[20px] flex items-center justify-center">
                <LightBulb2Icon />
              </div>
            </div>

            <div
              className="max-w-[527px] px-4 py-3 rounded-[20px] backdrop-blur-[26px]"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className="text-[#062E25]/80 text-base md:text-xl leading-[1.2em] tracking-[-0.02em] text-center">
                {t('solarPanel.infoCard')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowSolarPanelWorksSection
