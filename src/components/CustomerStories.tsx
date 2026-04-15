'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from './ui/carousel'
import { Badge } from './ui/badge'

type Story = {
  quote: string
  savings: string
  installTime: string
  capacity: string
  authorName: string
  authorRole?: string
  image: string
}

const StarIcon = () => (
  <svg width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path
      d="M8.5 1l2.02 4.09L15 5.77l-3.25 3.17.77 4.49L8.5 11.3l-4.02 2.12.77-4.49L2 5.77l4.48-.68L8.5 1Z"
      fill="#036B53"
    />
  </svg>
)

const StatIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Image src={src} alt={alt} width={22} height={22} className="shrink-0" />
)

const VerifiedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path
      d="M6.5 0L7.94 1.82L10.27 1.27L10.17 3.66L12.35 4.78L10.89 6.5L12.35 8.22L10.17 9.34L10.27 11.73L7.94 11.18L6.5 13L5.06 11.18L2.73 11.73L2.83 9.34L0.65 8.22L2.11 6.5L0.65 4.78L2.83 3.66L2.73 1.27L5.06 1.82L6.5 0Z"
      fill="#062E25"
    />
    <path
      d="M4.5 6.5L5.75 7.75L8.5 5"
      stroke="#FDFFF5"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CustomerStories = ({
  isCommercial = false,
}: {
  isCommercial?: boolean
}) => {
  const t = useTranslations('home.customerStories')
  const stories = t.raw(
    isCommercial ? 'commercialStories' : 'stories'
  ) as Story[]

  const [api, setApi] = useState<CarouselApi>()

  return (
    <section
      className="relative w-full overflow-x-hidden py-16 md:py-24 px-4 sm:px-6"
      style={{
        backgroundImage: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)',
      }}
    >
      <div className="max-w-[1229px] mx-auto flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-5 max-w-[536px] text-center">
          <Badge
            variant="outline"
            className="border-foreground/30 bg-white/20 text-foreground font-light text-base backdrop-blur-[65px]"
          >
            {t('eyebrow')}
          </Badge>
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-foreground text-3xl md:text-[45px] font-medium">
              {t('title')}
            </h2>
            <p className="text-foreground/80 text-lg md:text-[22px] font-light tracking-tight max-w-[412px]">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="w-full relative">
          <div className="relative z-10 flex items-stretch gap-6 md:gap-12 lg:gap-16">
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              aria-label="Previous story"
              className="hidden md:flex shrink-0 self-center w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-foreground/15 items-center justify-center text-foreground transition-opacity hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <Carousel
              setApi={setApi}
              opts={{ align: 'start', loop: true }}
              className="flex-1 min-w-0"
            >
              <CarouselContent className="-ml-4 items-stretch">
                {stories.map((story, index) => (
                  <CarouselItem key={index} className="pl-4 basis-full">
                    <div
                      className="relative grid grid-cols-1 md:grid-cols-2 rounded-[20px] overflow-hidden border border-foreground/15 h-full min-h-[473px]"
                      style={{
                        backgroundImage:
                          'linear-gradient(180deg, #F2F4E8 39%, #DCE9E6 100%)',
                      }}
                    >
                      <div className="flex flex-col justify-center gap-[30px] p-8 md:p-[60px] md:pl-[88px]">
                        <div className="flex flex-col gap-5">
                          <div className="flex items-center gap-1">
                            {[0, 1, 2, 3, 4].map(i => (
                              <StarIcon key={i} />
                            ))}
                          </div>
                          <p className="text-foreground/80 text-lg md:text-[22px] font-light tracking-tight max-w-[322px]">
                            {`„${story.quote}“`}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center gap-2">
                            <StatIcon
                              src="/images/customer-stat-savings.svg"
                              alt=""
                            />
                            <span className="text-foreground/80 text-sm font-medium tracking-tight">
                              {story.savings} {t('stats.savings')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatIcon
                              src="/images/customer-stat-time.svg"
                              alt=""
                            />
                            <span className="text-foreground/80 text-sm font-medium tracking-tight">
                              {story.installTime} {t('stats.installTime')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatIcon
                              src="/images/customer-stat-capacity.svg"
                              alt=""
                            />
                            <span className="text-foreground/80 text-sm font-medium tracking-tight">
                              {story.capacity} {t('stats.capacity')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-foreground text-sm font-medium">
                            {story.authorName}
                          </span>
                          {story.authorRole ? (
                            <span className="text-foreground/80 text-sm font-light tracking-tight">
                              {story.authorRole}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-foreground/90 text-sm font-light">
                              {t('verifiedOwner')}
                              <VerifiedIcon />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative min-h-[300px] md:min-h-full">
                        <Image
                          src={story.image}
                          alt={story.authorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <button
              type="button"
              onClick={() => api?.scrollNext()}
              aria-label="Next story"
              className="hidden md:flex shrink-0 self-center w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-foreground/15 items-center justify-center text-foreground transition-opacity hover:bg-white"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div
            className="pointer-events-none absolute -inset-x-10 -bottom-5 top-[80%]"
            style={{
              background:
                'radial-gradient(ellipse 90% 60% at 50% 100%, rgba(183,254,26,0.32) 0%, transparent 70%)',
              filter: 'blur(25px)',
            }}
          />
        </div>

        <div className="flex md:hidden justify-center gap-3 w-full">
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous story"
            className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-foreground/15 flex items-center justify-center text-foreground transition-opacity hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            aria-label="Next story"
            className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-foreground/15 flex items-center justify-center text-foreground transition-opacity hover:bg-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default CustomerStories
