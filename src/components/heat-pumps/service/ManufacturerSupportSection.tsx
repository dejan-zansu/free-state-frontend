import { TopicCard } from '@/components/ui/topic-card'
import { getTranslations } from 'next-intl/server'

const cards = [
  { key: 'stiebelEltron1' },
  { key: 'stiebelEltron2' },
  { key: 'stiebelEltron3' },
] as const

const ManufacturerSupportSection = async () => {
  const t = await getTranslations('heatPumpsService.manufacturerSupport')

  return (
    <section className="relative bg-[#EAEDDF] py-12 md:py-[50px] overflow-hidden">
      <div className="max-w-[1316px] mx-auto px-4 sm:px-6 lg:px-[62px]">
        <div className="flex flex-col items-center gap-10 md:gap-[60px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="flex flex-wrap justify-center gap-5 w-full max-w-[1120px]">
            {cards.map((card) => (
              <TopicCard
                key={card.key}
                icon="/images/heat-pumps-service/icon-stiebel-eltron-f8f355.png"
                iconClassName="rounded-full border border-[#B7FE1A] bg-[#FDFFF5]"
                title={t(`cards.${card.key}.title`)}
                description={t(`cards.${card.key}.description`)}
                linkText={t(`cards.${card.key}.link`)}
                href={t(`cards.${card.key}.href`)}
                external
              />
            ))}
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

export default ManufacturerSupportSection
