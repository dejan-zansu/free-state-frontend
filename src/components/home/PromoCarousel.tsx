'use client'

import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Children, useRef, useState, type ReactNode } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'

type PromoCarouselProps = {
  label: string
  prevLabel: string
  nextLabel: string
  children: ReactNode
}

const arrowClassName =
  'absolute top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 backdrop-blur-[3px] transition-colors hover:bg-white/50 lg:size-12'

const PromoCarousel = ({
  label,
  prevLabel,
  nextLabel,
  children,
}: PromoCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const autoplay = useRef(
    Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      plugins={[autoplay.current]}
      aria-label={label}
      className="bg-[linear-gradient(180deg,#F2F4E8_78%,#DCE9E6_100%)]"
    >
      <CarouselContent className="ml-0">
        {Children.map(children, child => (
          <CarouselItem className="pl-0">{child}</CarouselItem>
        ))}
      </CarouselContent>
      <button
        type="button"
        onClick={() => api?.scrollPrev()}
        className={`${arrowClassName} left-3 lg:left-[30px]`}
      >
        <ChevronLeft className="size-6 text-white" strokeWidth={1.5} />
        <span className="sr-only">{prevLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => api?.scrollNext()}
        className={`${arrowClassName} right-3 lg:right-[30px]`}
      >
        <ChevronRight className="size-6 text-white" strokeWidth={1.5} />
        <span className="sr-only">{nextLabel}</span>
      </button>
    </Carousel>
  )
}

export default PromoCarousel
