import { TopicCard } from '@/components/ui/topic-card'
import { useTranslations } from 'next-intl'

const cards = [
  {
    key: 'photovoltaics',
    icon: '/images/repowering/repowering-icon-photovoltaics.svg',
    href: '/solar-free' as const,
  },
  {
    key: 'heatPump',
    icon: '/images/repowering/repowering-icon-heatpump.svg',
    href: '/heat-pumps' as const,
  },
  {
    key: 'chargingSolution',
    icon: '/images/repowering/repowering-icon-charging.svg',
    href: '/charging-stations' as const,
  },
] as const

const EnergySolutionsSection = () => {
  const t = useTranslations('heatPumpsCost.energySolutions')

  return (
    <section className="relative bg-[#EAEDDF] py-12 md:py-[50px] overflow-hidden">
      <div className="max-w-[1316px] mx-auto px-4 sm:px-6 lg:px-[62px]">
        <div className="flex flex-col items-center gap-10 md:gap-[60px] pb-[40px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="flex flex-wrap justify-center gap-2.5 w-full max-w-[1220px]">
            {cards.map((card) => (
              <TopicCard
                key={card.key}
                icon={card.icon}
                title={t(`cards.${card.key}.title`)}
                description={t(`cards.${card.key}.description`)}
                linkText={t(`cards.${card.key}.link`)}
                href={card.href}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EnergySolutionsSection
