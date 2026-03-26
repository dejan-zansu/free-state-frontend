import Image from 'next/image'
import { useTranslations } from 'next-intl'

const solutions = [
  { image: '/images/about-us-solution-1-d14fce.png', key: 'solarAbo' },
  { image: '/images/about-us-solution-2-12d056.png', key: 'contracting' },
  { image: '/images/about-us-solution-3-626ae4.png', key: 'roofRental' },
  { image: '/images/about-us-solution-4-50b545.png', key: 'purchase' },
]

const SolutionsSection = () => {
  const t = useTranslations('aboutUs.solutions')

  return (
    <section className="relative w-full bg-[#FDFFF5] py-12 lg:py-[50px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-16">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[562px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {solutions.map((solution, index) => (
            <div key={solution.key} className="flex">
              <div className="flex flex-col flex-1">
                <div className="relative w-full aspect-[180/115] mb-5">
                  <Image
                    src={solution.image}
                    alt={t(`${solution.key}.title`)}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-foreground text-[22px] font-bold capitalize px-4">
                  {t(`${solution.key}.title`)}
                </h3>
                <p className="mt-5 text-foreground/80 text-base font-light whitespace-pre-line px-4">
                  {t(`${solution.key}.description`)}
                </p>
              </div>
              {index < solutions.length - 1 && (
                <div className="hidden lg:block w-px bg-foreground/30 ml-8 my-7 self-stretch" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolutionsSection
