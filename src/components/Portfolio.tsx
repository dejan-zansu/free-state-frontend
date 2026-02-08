'use client'

import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { LinkButton } from './ui/link-button'

interface PortfolioItem {
  number: string
  title: string
  description: string
  image: string
  link: string
}

interface PortfolioProps {
  isCommercial?: boolean
  translations: {
    title: string
    learnMore: string
    items: {
      number: string
      title: string
      description: string
    }[]
  }
}

const Portfolio = ({
  isCommercial = false,
  translations,
}: PortfolioProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentSlide, setCurrentSlide] = useState(0)

  const portfolioItems: PortfolioItem[] = translations.items.map(item => ({
    number: item.number,
    title: item.title,
    description: item.description,
    image: '/images/portfolio-example.png',
    link: '/portfolio',
  }))

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentSlide(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const goToPrevious = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const goToNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const currentItem = portfolioItems[currentSlide]

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-[#EBEDE1]">
      <div className="text-center mb-8 sm:mb-10 max-w-[530px] mx-auto">
        <h2 className="text-foreground text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-4">
          Portfolio
        </h2>
        <p className="text-foreground/80 text-base sm:text-lg md:text-xl font-light max-w-2xl mx-auto px-2">
          Sustainable energy, long-term cost savings, and full transparency –
          with no investment risk on your side.
        </p>
      </div>
      <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] overflow-hidden rounded-3xl mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <div ref={emblaRef} className="h-full overflow-hidden">
            <div className="flex h-full">
              {portfolioItems.map((item, index) => (
                <div
                  key={index}
                  className="relative flex-[0_0_100%] min-w-0 h-full"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={goToPrevious}
            className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-6 z-20 size-12 rounded-full bg-[#EBEDE1] flex items-center justify-center transition-all duration-300 hover:bg-[#EBEDE1]/80"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>

          <button
            onClick={goToNext}
            className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 z-20 size-12 rounded-full bg-[#EBEDE1] flex items-center justify-center transition-all duration-300 hover:bg-[#EBEDE1]/80"
            aria-label="Next slide"
          >
            <ArrowRight className="w-5 h-5 text-gray-800" />
          </button>

          <div className="absolute top-1/2 -translate-y-1/2 left-16 sm:left-20 md:left-24 lg:left-28 z-10">
            <div
              className={cn(
                'p-6 sm:p-8 rounded-2xl backdrop-blur-sm w-[220px] sm:w-[260px] md:w-[280px]',
                isCommercial
                  ? 'bg-linear-to-br from-[#191D1C]/90 to-[#191D1C]/70'
                  : 'bg-linear-to-br from-[#062E25]/90 to-[#062E25]/70'
              )}
            >
              <div className="mb-4">
                <span
                  className={cn(
                    'text-6xl sm:text-7xl font-bold tracking-tight',
                    isCommercial ? 'text-energy' : 'text-[#9EE028]'
                  )}
                >
                  {currentItem.number}
                </span>
              </div>

              <h3 className="text-white text-lg sm:text-xl md:text-2xl font-semibold mb-2">
                {currentItem.title}
              </h3>

              <p className="text-white/70 text-sm sm:text-base font-light mb-7 whitespace-pre-line leading-relaxed">
                {currentItem.description}
              </p>

              <LinkButton
                href={currentItem.link as '/portfolio'}
                variant={isCommercial ? 'secondary' : 'primary'}
              >
                {translations.learnMore}
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Portfolio
