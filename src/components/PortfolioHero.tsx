import { getTranslations } from 'next-intl/server'
import HeroNav from './HeroNav'
import Stats from './Stats'

const PortfolioHero = async () => {
  const t = await getTranslations('portfolioPage')

  return (
    <section className="relative min-h-[879px] flex justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/solar-farm-roofs.png')",
          }}
        />
      </div>

      <div className="relative z-10 max-w-360 mx-auto px-4 sm:px-6 pt-[120px] sm:pt-[160px] md:pt-[230px] pb-16 w-full">
        <HeroNav />
        <div className="flex flex-col items-center text-center">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-medium leading-[1em] mb-4 whitespace-pre-line">
            {t('hero.title')}
          </h1>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div
          className="w-full min-h-[189px] flex items-center"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(32.5px)',
          }}
        >
          <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6">
            <div className='[&_*]:!text-white [&_.text-foreground]:!text-white [&_section]:!pb-0 [&_div[class*="bg-"]]:!bg-white/20'>
              <Stats />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PortfolioHero
