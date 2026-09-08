import { TopicCard } from '@/components/ui/topic-card'
import { getTranslations } from 'next-intl/server'

const cards = [
  { key: 'subsidies', href: '/foerderung' },
  { key: 'amortization', href: '/amortization' },
  { key: 'storage', href: '/energy-storage' },
] as const

const CostTopicsSection = async () => {
  const t = await getTranslations('cost')

  return (
    <section className="relative bg-[#EAEDDF] overflow-hidden">
      <div className="max-w-[1214px] mx-auto px-4 sm:px-6 py-16 md:pt-[70px] md:pb-[130px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('topics.title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5 w-full">
            {cards.map(card => (
              <TopicCard
                key={card.key}
                icon="/images/cost-card-icon.svg"
                title={t(`topics.cards.${card.key}.title`)}
                description={t(`topics.cards.${card.key}.description`)}
                linkText={t('topics.learnMore')}
                href={card.href}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CostTopicsSection
