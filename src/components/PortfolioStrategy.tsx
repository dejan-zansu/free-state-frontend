import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const cards = [
  {
    titleKey: 'card1Title',
    descKey: 'card1Desc',
    image: '/images/portfolio-strategy-1-147c2a.png',
  },
  {
    titleKey: 'card2Title',
    descKey: 'card2Desc',
    image: '/images/portfolio-strategy-2-13e961.png',
  },
  {
    titleKey: 'card3Title',
    descKey: 'card3Desc',
    image: '/images/portfolio-strategy-3-771069.png',
  },
] as const

const PortfolioStrategy = async () => {
  const t = await getTranslations('portfolioPage.investmentStrategy')

  return (
    <section className="relative w-full bg-[#FDFFF5]">
      <div
        className="w-full h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-0 py-[50px]">
        <div className="flex flex-col items-center gap-5 mb-10 lg:mb-[50px]">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-[#062E25]  text-[#062E25] text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>
          <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium text-center">
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(card => (
            <div
              key={card.titleKey}
              className="relative h-[319px] rounded-lg overflow-hidden bg-[#154138]"
            >
              <div className="absolute inset-0">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover blur-[5px] scale-110"
                />
              </div>
              <div className="absolute bottom-[30px] left-[30px] z-10">
                <h3 className="text-solar text-[22px] font-bold capitalize opacity-80">
                  {t(card.titleKey)}
                </h3>
                <p className="text-white text-base font-light tracking-tight opacity-80 mt-2.5">
                  {t(card.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PortfolioStrategy
