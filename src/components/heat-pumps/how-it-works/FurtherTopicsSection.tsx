import { TopicCard } from '@/components/ui/topic-card'
import { getTranslations } from 'next-intl/server'

const cards = [
  {
    key: 'financing',
    icon: '/images/heat-pumps/financing-heat-pump.png',
    href: '/heat-pumps/cost' as const,
  },
  {
    key: 'cost',
    icon: '/images/heat-pumps/cost-heat-pump.png',
    href: '/heat-pumps/cost' as const,
  },
  {
    key: 'systemComparison',
    icon: '/images/heat-pumps/comparison-heat-pump.png',
    href: '/heat-pumps' as const,
  },
] as const

const FurtherTopicsSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks.furtherTopics')

  return (
    <section className="relative bg-[#EAEDDF] py-12 md:py-[50px] overflow-hidden">
      <div className="max-w-[1316px] mx-auto px-4 sm:px-6 lg:px-[62px]">
        <div className="flex flex-col items-center gap-10 md:gap-[60px] pb-[40px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="flex flex-wrap justify-center gap-5 w-full max-w-[1120px]">
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

export default FurtherTopicsSection
