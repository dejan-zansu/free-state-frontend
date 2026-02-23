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
  { key: 'stiebelEltron1' },
  { key: 'stiebelEltron2' },
  { key: 'stiebelEltron3' },
] as const

const ManufacturerSupportSection = () => {
  const t = useTranslations('heatPumpsService.manufacturerSupport')

  return (
    <section className="relative bg-[#EAEDDF] py-12 md:py-[50px] overflow-hidden">
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
                    className="relative w-full h-[370px] rounded-[20px] overflow-hidden"
                    style={{ border: '1px solid #809792' }}
                  >
                    <div className="relative z-10 flex items-center justify-center pt-[30px]">
                      <Image
                        src="/images/heat-pumps-service/icon-stiebel-eltron-f8f355.png"
                        alt=""
                        width={142}
                        height={142}
                        className="rounded-full border border-[#B7FE1A] bg-[#FDFFF5]"
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
                          <a
                            href={t(`cards.${card.key}.href`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5"
                          >
                            <span className="text-[#062E25] text-base font-medium tracking-[-0.02em] border-b border-[#062E25]">
                              {t(`cards.${card.key}.link`)}
                            </span>
                            <svg
                              width="11"
                              height="1"
                              viewBox="0 0 11 1"
                              fill="none"
                              className="transition-transform group-hover:translate-x-1"
                            >
                              <line
                                y1="0.5"
                                x2="11"
                                y2="0.5"
                                stroke="#062E25"
                              />
                            </svg>
                          </a>
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
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default ManufacturerSupportSection
