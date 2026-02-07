import { getLocale, getTranslations } from 'next-intl/server'
import HeroNav from './HeroNav'

const HowItWorksHero = async () => {
  const locale = await getLocale()
  const t = await getTranslations('howItWorks')

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex justify-center overflow-hidden rounded-b-[40px] bg-[#4A9A99]">
      <HeroNav locale={locale} />

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/how-solar-power-system-works.png')`,
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px] pt-[200px] sm:pt-[240px] md:pt-[280px] w-full">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-medium leading-[1em] capitalize whitespace-pre-line">
            {t('hero.title')}
          </h1>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksHero
