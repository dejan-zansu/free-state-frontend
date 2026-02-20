'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const cards = [
  {
    key: 'photovoltaics',
    icon: '/images/repowering/repowering-icon-photovoltaics.svg',
    logo: '/images/repowering/repowering-logo-1.svg',
    logoWidth: 117,
  },
  {
    key: 'heatPump',
    icon: '/images/repowering/repowering-icon-heatpump.svg',
    logo: '/images/repowering/repowering-logo-2.svg',
    logoWidth: 97,
  },
  {
    key: 'chargingSolution',
    icon: '/images/repowering/repowering-icon-charging.svg',
    logo: '/images/repowering/repowering-logo-3.svg',
    logoWidth: 150,
  },
] as const

const RepoweringServicesSection = () => {
  const t = useTranslations('repowering.services')

  return (
    <section className="bg-[#EAEDDF] py-12 md:py-[50px] overflow-hidden">
      <div
        className="h-px w-full opacity-20 mb-12 md:mb-[50px]"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />

      <div className="max-w-[1316px] mx-auto px-4 sm:px-6 lg:px-[62px]">
        <div className="flex flex-col items-center gap-10 md:gap-[60px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <Carousel
            opts={{
              loop: true,
              align: 'start',
            }}
            className="w-full max-w-[1220px]"
          >
            <CarouselContent className="-ml-2.5">
              {cards.map(card => (
                <CarouselItem
                  key={card.key}
                  className="pl-2.5 basis-[85%] sm:basis-[45%] lg:basis-1/3"
                >
                  <div
                    className="relative w-full h-[370px] rounded-[20px] overflow-hidden bg-[#0D4841]"
                    style={{ border: '1px solid #809792' }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-[14px] scale-110"
                      style={{
                        backgroundImage: `url('/images/repowering/repowering-card-bg.png')`,
                      }}
                    />
                    <div className="absolute inset-0 bg-[#00281F]/51" />

                    <div className="relative z-10 flex items-center justify-center pt-[30px]">
                      <Image
                        src={card.icon}
                        alt=""
                        width={142}
                        height={142}
                      />
                    </div>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-[177px] backdrop-blur-[26px]"
                      style={{
                        background: '#E5E6DE',
                        borderTop: '1px solid #809792',
                      }}
                    >
                      <div className="flex flex-col gap-5 px-8 py-5">
                        <div className="flex flex-col gap-2.5">
                          <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold capitalize text-center">
                            {t(`cards.${card.key}.title`)}
                          </h3>
                          <p className="text-[#062E25]/80 text-sm md:text-base font-light tracking-[-0.02em] text-center">
                            {t(`cards.${card.key}.description`)}
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <Image
                            src={card.logo}
                            alt=""
                            width={card.logoWidth}
                            height={23}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 lg:-left-14 size-12 bg-[#FDFFF5] border-0 hover:bg-[#FDFFF5]/80" />
            <CarouselNext className="-right-4 lg:-right-14 size-12 bg-[#FDFFF5] border-0 hover:bg-[#FDFFF5]/80" />
          </Carousel>
        </div>
      </div>

      <div
        className="h-px w-full opacity-20 mt-12 md:mt-[50px]"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default RepoweringServicesSection
