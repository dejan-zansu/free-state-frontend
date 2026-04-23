import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { LinkButton } from './ui/link-button'

type Feature = {
  title: string
  description: string
  image: string
}

const commercialImages = [
  '/images/why-freestate-commercial-planbar-42a5c6.png',
  '/images/why-freestate-commercial-effizienz-77eb23.png',
  '/images/why-freestate-commercial-service-19de44.png',
]

const WhyFreeState = async ({ isCommercial = false }: { isCommercial?: boolean }) => {
  const t = await getTranslations('home.whyFreeState')
  const rawFeatures = t.raw('features') as Feature[]
  const features = isCommercial
    ? rawFeatures.map((feature, index) => ({
        ...feature,
        image: commercialImages[index] ?? feature.image,
      }))
    : rawFeatures

  return (
    <section className="w-full bg-gradient-to-b from-[#FDFFF5] from-[65%] to-[#DCE9E6] py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-[1120px] mx-auto flex flex-col items-center gap-12 md:gap-16">
        <div className="flex flex-col items-center gap-10 max-w-[536px] text-center">
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-foreground text-3xl md:text-[45px] font-medium">
              {t('title')}
            </h2>
            <p className="text-foreground/80 text-lg md:text-[22px] font-light tracking-tight whitespace-pre-line">
              {t('subtitle')}
            </p>
          </div>
          <LinkButton
            href="/contact"
            variant={isCommercial ? 'outline-quaternary' : 'outline-primary'}
          >
            {t('cta')}
          </LinkButton>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col items-center text-center gap-10 md:px-10 md:items-start md:text-left ${
                index > 0 ? 'md:border-l md:border-foreground/30' : ''
              }`}
            >
              <div className="relative w-[108px] h-[109px] md:w-[131px] md:h-[132px]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center gap-5 max-w-[227px] md:items-start">
                <h3 className="text-[22px] font-bold text-foreground capitalize">
                  {feature.title}
                </h3>
                <p className="text-base font-light text-foreground/80 tracking-tight">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyFreeState
