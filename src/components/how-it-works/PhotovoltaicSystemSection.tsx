import {
  AllInclusiveIcon,
  HouseWithSunIcon,
  SolarSystemIcon,
} from '@/components/icons'
import { LinkButton } from '@/components/ui/link-button'
import { getLocale, getTranslations } from 'next-intl/server'

const PhotovoltaicSystemSection = async () => {
  const locale = await getLocale()
  const t = await getTranslations('howItWorks')

  const features = [
    {
      icon: HouseWithSunIcon,
      title: t('photovoltaic.solarPanels.title'),
      description: t('photovoltaic.solarPanels.description'),
    },
    {
      icon: AllInclusiveIcon,
      title: t('photovoltaic.inverter.title'),
      description: t('photovoltaic.inverter.description'),
    },
    {
      icon: SolarSystemIcon,
      title: t('photovoltaic.electricityMeter.title'),
      description: t('photovoltaic.electricityMeter.description'),
    },
  ]

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-[#EAEDDF]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 max-w-[536px] mx-auto">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em] mb-8 sm:mb-10">
            {t('photovoltaic.title')}
          </h2>
          <LinkButton
            variant="outline-tertiary-dark"
            href="/solar-abo"
            locale={locale}
            className="bg-transparent"
          >
            {t('photovoltaic.learnMore')}
          </LinkButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="relative border border-[#809792] rounded-[16px] sm:rounded-[20px] pt-6 sm:pt-8 flex flex-col items-center text-center min-h-[300px] sm:min-h-[350px] md:min-h-[372px] overflow-hidden bg-[#EEEFE5]"
              >
                <div className="relative z-10 mb-6 sm:mb-8 flex items-center justify-center">
                  <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[142px] md:h-[142px] flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-solar bg-[#062E25]" />
                    <div className="relative z-10">
                      <Icon className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[83px] md:h-[83px] text-solar" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-end w-full bg-[#E5E6DE]">
                  <div className="relative px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10 pt-5">
                    <div className="relative z-10">
                      <h3 className="text-foreground text-lg sm:text-xl font-bold uppercase mb-3 sm:mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-foreground text-sm sm:text-base font-light leading-normal text-start">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PhotovoltaicSystemSection
