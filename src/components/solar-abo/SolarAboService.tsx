import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

export interface SolarAboServiceProps {
  translationNamespace: string
}

interface ServiceCardProps {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
}

const ServiceCard = ({
  imageSrc,
  imageAlt,
  title,
  description,
}: ServiceCardProps) => (
  <div className="flex flex-col gap-10 w-full sm:w-[207px] items-start">
    <div className="relative w-[131px] h-[132px] shrink-0">
      <Image src={imageSrc} alt={imageAlt} fill className="object-contain" />
    </div>
    <div className="flex flex-col gap-5 w-full sm:w-[207px]">
      <h3 className="text-[#062E25] text-xl sm:text-[22px] font-bold tracking-tight whitespace-pre-line">
        {title}
      </h3>
      <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em] whitespace-pre-line">
        {description}
      </p>
    </div>
  </div>
)

const SolarAboService = async ({
  translationNamespace,
}: SolarAboServiceProps) => {
  const t = await getTranslations(translationNamespace)

  const cards = [
    {
      imageSrc: '/images/solar-free/service-warranty-42a5c6.webp',
      titleKey: 'service.warranty.title',
      descriptionKey: 'service.warranty.description',
    },
    {
      imageSrc: '/images/solar-free/service-installation-77eb23.webp',
      titleKey: 'service.installation.title',
      descriptionKey: 'service.installation.description',
    },
    {
      imageSrc: '/images/solar-free/service-support-685ca8.webp',
      titleKey: 'service.support.title',
      descriptionKey: 'service.support.description',
    },
  ]

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(253, 255, 245, 1) 65%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-24 lg:py-[100px]">
        <div className="flex flex-col items-center gap-10 max-w-[499px] mx-auto text-center">
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-5xl lg:text-[45px] font-medium tracking-tight">
              {t('service.title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-light tracking-[-0.02em]">
              {t('service.subtitle')}
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-[60px] flex flex-col sm:flex-row items-center sm:items-start justify-center gap-10 sm:gap-[50px] lg:gap-[70px] max-w-[928px] mx-auto">
          {cards.map((card, index) => (
            <div
              key={card.titleKey}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-10 sm:gap-[50px] lg:gap-[70px]"
            >
              {index > 0 && (
                <div
                  className="hidden sm:block shrink-0 self-stretch w-px"
                  style={{ background: 'rgba(6, 46, 37, 0.3)' }}
                />
              )}
              <ServiceCard
                imageSrc={card.imageSrc}
                imageAlt={t(card.titleKey)}
                title={t(card.titleKey)}
                description={t(card.descriptionKey)}
              />
            </div>
          ))}
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

export default SolarAboService
