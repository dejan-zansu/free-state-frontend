import { getTranslations } from 'next-intl/server'
import { LinkButton } from './ui/link-button'
import Image from 'next/image'

const YourBenefits = async () => {
  const t = await getTranslations('home.yourBenefits')

  const benefits = [
    {
      image: '/images/benefit-solar-panels-11fa10.png',
      title: t('items.0.title'),
      description: t('items.0.description'),
    },
    {
      image: '/images/benefit-warranty-29ff36.png',
      title: t('items.1.title'),
      description: t('items.1.description'),
    },
    {
      image: '/images/benefit-maintenance-14f2d9.png',
      title: t('items.2.title'),
      description: t('items.2.description'),
    },
    {
      image: '/images/benefit-experience-df3bf4.png',
      title: t('items.3.title'),
      description: t('items.3.description'),
    },
  ]

  return (
    <section className="w-full bg-[#FDFFF5] py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-[1290px] mx-auto flex flex-col items-center gap-16">
        <div className="flex flex-col items-center gap-10 max-w-[536px] text-center">
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-foreground text-3xl md:text-[45px] font-medium">
              {t('title')}
            </h2>
            <p className="text-foreground/80 text-lg md:text-[22px] font-light tracking-tight">
              {t('subtitle')}
            </p>
          </div>
          <LinkButton href="/solar-free" variant="outline-primary">
            {t('cta')}
          </LinkButton>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {benefits.map(benefit => (
            <div
              key={benefit.title}
              className="flex flex-col gap-[50px] lg:border-r lg:last:border-r-0 border-foreground/30 lg:px-8 first:lg:pl-0 last:lg:pr-0"
            >
              <div className="w-[135px] h-[113px] relative">
                <Image
                  src={benefit.image}
                  alt={benefit.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-5">
                <h3 className="text-[22px] font-bold text-foreground capitalize">
                  {benefit.title}
                </h3>
                <p className="text-base font-light text-foreground/80 tracking-tight">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default YourBenefits
