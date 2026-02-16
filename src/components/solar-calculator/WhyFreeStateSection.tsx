import { SolarSystemIcon, ShieldIcon, AllInclusiveIcon, MoneySignIcon } from '@/components/icons'
import { getTranslations } from 'next-intl/server'

const cards = [
  { key: 'experience', Icon: SolarSystemIcon },
  { key: 'localPresence', Icon: ShieldIcon },
  { key: 'comprehensiveService', Icon: AllInclusiveIcon },
  { key: 'exclusiveTariffs', Icon: MoneySignIcon },
] as const

const WhyFreeStateSection = async () => {
  const t = await getTranslations('solarCalculator.whyFreeState')

  return (
    <section className="relative w-full overflow-hidden bg-[#062E25] py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center mb-12 md:mb-16">
          {t('title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-[1100px] mx-auto">
          {cards.map(({ key, Icon }) => (
            <div
              key={key}
              className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-center w-16 h-16">
                <Icon className="w-12 h-12 text-[#B7FE1A]" />
              </div>
              <h3 className="text-white text-lg md:text-xl font-medium">
                {t(`cards.${key}.title`)}
              </h3>
              <p className="text-white/70 text-sm md:text-base font-light">
                {t(`cards.${key}.subtitle`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyFreeStateSection
