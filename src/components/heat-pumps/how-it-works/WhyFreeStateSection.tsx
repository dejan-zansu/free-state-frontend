import { getTranslations } from 'next-intl/server'
import WhyFreeStateFeatures from './WhyFreeStateFeatures'

const features = ['1', '2', '3', '4', '5', '6'] as const

const WhyFreeStateSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  const items = features.map((key) => ({
    question: t(`whyFreeState.features.${key}.title`),
    answer: t(`whyFreeState.features.${key}.description`),
  }))

  return (
    <section className="relative min-h-[843px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center rounded-t-[40px]"
        style={{
          backgroundImage: `url('/images/heat-pumps/how-it-works/why-freestate-bg-5c8aae.png')`,
        }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{
          background: 'rgba(168, 200, 193, 0.4)',
        }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{
          background: 'linear-gradient(0deg, rgba(7, 51, 42, 0) 0%, rgba(7, 51, 42, 1) 86%)',
        }}
      />

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('whyFreeState.title')}
          </h2>

          <WhyFreeStateFeatures items={items} />
        </div>
      </div>
    </section>
  )
}

export default WhyFreeStateSection
