import SolarAboCard from '@/components/SolarAboCard'
import { getTranslations } from 'next-intl/server'

const cards = [
  { key: 'investment', image: '/images/solar-abo-card-1.png' },
  { key: 'control', image: '/images/solar-abo-card-2.png' },
  { key: 'yield', image: '/images/solar-abo-card-3.png' },
  { key: 'monitoring', image: '/images/solar-abo-card-4.png' },
] as const

const SolarAboCardsSection = async () => {
  const t = await getTranslations('solarCalculator.cards')

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        background:
          'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-wrap justify-center gap-6">
          {cards.map(({ key, image }) => (
            <SolarAboCard
              key={key}
              image={image}
              imageAlt={t(`${key}.title`)}
              title={t(`${key}.title`)}
              subtitle={t(`${key}.subtitle`)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolarAboCardsSection
