'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from './ui/carousel'
import { Badge } from './ui/badge'

type Review = {
  quote: string
  authorName: string
  authorRole?: string
}

const ReviewStarIcon = ({ color }: { color: string }) => (
  <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
    <path
      d="M9 1l2.14 4.34L16 6.03l-3.5 3.41.82 4.83L9 12l-4.32 2.27.82-4.83L2 6.03l4.86-.69L9 1Z"
      fill={color}
    />
  </svg>
)

const Reviews = ({ isCommercial = false }: { isCommercial?: boolean }) => {
  const t = useTranslations('home.reviews')
  const items = t.raw(isCommercial ? 'commercialItems' : 'items') as Review[]
  const eyebrow = t(isCommercial ? 'commercialEyebrow' : 'eyebrow')
  const title = t(isCommercial ? 'commercialTitle' : 'title')
  const subtitle = t(isCommercial ? 'commercialSubtitle' : 'subtitle')

  const backgroundImage = isCommercial
    ? 'linear-gradient(131deg, #191D1C 0%, #3D3858 100%)'
    : 'linear-gradient(110deg, #062E25 0%, #062E25 55%, #0B4A3C 80%, #158B7E 100%)'
  const glowColor = isCommercial
    ? 'rgba(61, 56, 88, 0.5)'
    : 'rgba(183, 254, 26, 0.5)'
  const starColor = isCommercial ? '#FFFFFF' : '#B7FE1A'

  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleSelect = (instance: CarouselApi | undefined) => {
    if (!instance) return
    setSelectedIndex(instance.selectedScrollSnap())
  }

  const onSetApi = (instance: CarouselApi) => {
    setApi(instance)
    if (!instance) return
    handleSelect(instance)
    instance.on('select', () => handleSelect(instance))
    instance.on('reInit', () => handleSelect(instance))
  }

  return (
    <section
      className="relative w-full overflow-hidden py-16 md:py-24 px-4 sm:px-6"
      style={{ backgroundImage }}
    >
      <div
        className="pointer-events-none absolute -top-56 right-[-80px] w-[374px] h-[374px] rounded-full"
        style={{
          background: glowColor,
          filter: 'blur(490px)',
        }}
      />
      <div
        className="pointer-events-none absolute -top-64 right-[-40px] w-[291px] h-[291px] rounded-full"
        style={{
          background: glowColor,
          filter: 'blur(170px)',
        }}
      />

      <div className="relative max-w-[1075px] mx-auto flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-5 max-w-[776px] text-center">
          <Badge
            variant="outline"
            className="border-white/20 bg-white/20 text-white font-light text-base backdrop-blur-[65px]"
          >
            {eyebrow}
          </Badge>
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-[65px] font-medium capitalize">
            {title}
          </h2>
          <p className="text-white/80 text-lg md:text-[22px] font-light tracking-tight">
            {subtitle}
          </p>
        </div>

        <Carousel
          setApi={onSetApi}
          opts={{ align: 'start', loop: true }}
          className="w-full"
        >
          <CarouselContent className="ml-0 items-stretch">
            {items.map((review, index) => (
              <CarouselItem key={index} className="pl-0 basis-full">
                <div className="mx-auto w-full max-w-[855px] rounded-[20px] border border-white/10 bg-[rgba(185,189,188,0.14)] backdrop-blur-[7.2px] p-8 md:px-[93px] md:py-[30px] flex flex-col items-center gap-5 min-h-[226px]">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <ReviewStarIcon key={i} color={starColor} />
                    ))}
                  </div>
                  <p className="text-white/80 text-base md:text-lg font-light tracking-tight text-center">
                    {`“ ${review.quote} ”`}
                  </p>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-white text-sm font-semibold">
                      {review.authorName}
                    </p>
                    {review.authorRole ? (
                      <p className="text-white/70 text-sm font-light tracking-tight">
                        {review.authorRole}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous review"
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-[15px]">
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to review ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'w-12 bg-[#F4F4F4]/80'
                    : 'w-1.5 bg-[#D9D9D9]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => api?.scrollNext()}
            aria-label="Next review"
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default Reviews
