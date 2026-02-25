import { getTranslations } from 'next-intl/server'

const IndoorHeroSection = async () => {
  const t = await getTranslations('heatPumpsProducts')

  return (
    <section className="relative h-[400px] md:h-[618px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/heat-pumps/products/indoor-hero-bg.png)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(74, 154, 153, 0) 9%, rgba(74, 154, 153, 1) 100%), linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%), rgba(0, 0, 0, 0.2)',
        }}
      />

      <div className="relative z-10 flex items-start justify-center pt-[50px] px-4">
        <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center max-w-[571px]">
          {t('indoorHero.title')}
        </h2>
      </div>
    </section>
  )
}

export default IndoorHeroSection
