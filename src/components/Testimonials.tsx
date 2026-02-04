'use client'

import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

interface Testimonial {
  id: number
  name: string
  role: string
  quote: string
  image: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Franz McLaren',
    role: 'verified owner',
    quote:
      '"Our mission is to strip away the financial and technical barriers to clean energy by taking on the entire investment and complexity ourselves"',
    image: '/images/portfolio/portfolio-1.png',
    avatar: '/images/portfolio/portfolio-1.png',
  },
  {
    id: 2,
    name: 'Franz McLaren',
    role: 'verified owner',
    quote:
      '"Our mission is to strip away the financial and technical barriers to clean energy by taking on the entire investment and complexity ourselves"',
    image: '/images/portfolio/portfolio-2.png',
    avatar: '/images/portfolio/portfolio-2.png',
  },
  {
    id: 3,
    name: 'Franz McLaren',
    role: 'verified owner',
    quote:
      '"Our mission is to strip away the financial and technical barriers to clean energy by taking on the entire investment and complexity ourselves"',
    image: '/images/portfolio/portfolio-3.png',
    avatar: '/images/portfolio/portfolio-3.png',
  },
  {
    id: 4,
    name: 'Franz McLaren',
    role: 'verified owner',
    quote:
      '"Our mission is to strip away the financial and technical barriers to clean energy by taking on the entire investment and complexity ourselves"',
    image: '/images/portfolio/portfolio-3.png',
    avatar: '/images/portfolio/portfolio-3.png',
  },
  {
    id: 5,
    name: 'Franz McLaren',
    role: 'verified owner',
    quote:
      '"Our mission is to strip away the financial and technical barriers to clean energy by taking on the entire investment and complexity ourselves"',
    image: '/images/portfolio/portfolio-3.png',
    avatar: '/images/portfolio/portfolio-3.png',
  },
  {
    id: 6,
    name: 'Franz McLaren',
    role: 'verified owner',
    quote:
      '"Our mission is to strip away the financial and technical barriers to clean energy by taking on the entire investment and complexity ourselves"',
    image: '/images/portfolio/portfolio-3.png',
    avatar: '/images/portfolio/portfolio-3.png',
  },
]

const StarIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="15"
    viewBox="0 0 16 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8 0L9.79611 5.52786H15.6085L10.9062 8.94427L12.7023 14.4721L8 11.0557L3.29772 14.4721L5.09383 8.94427L0.391548 5.52786H6.20389L8 0Z"
      fill="#B7FE1A"
    />
  </svg>
)

const VerifiedIcon = ({ className }: { className?: string }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="6.5" cy="6.5" r="6.5" fill="#B7FE1A" />
    <path
      d="M4 6.5L5.5 8L9 4.5"
      stroke="#062E25"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Testimonials = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: false,
    startIndex: 1,
  })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const handleSlideClick = useCallback(
    (index: number) => {
      if (!emblaApi) return
      emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  return (
    <section
      className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(253, 255, 245, 1) 2%, rgba(234, 237, 223, 1) 34%)',
      }}
    >
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-foreground text-3xl sm:text-4xl md:text-[45px] font-medium mb-4 px-8 sm:px-12 md:px-16">
          Real roofs. Real results.
        </h2>

        <div className="overflow-x-clip overflow-y-visible" ref={emblaRef}>
          <div className="flex touch-pan-y py-10">
            {testimonials.map((testimonial, index) => {
              const isSelected = index === selectedIndex

              return (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_80%] sm:flex-[0_0_60%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 md:pl-6"
                  style={{
                    paddingRight:
                      index === testimonials.length - 1 ? '16px' : '0',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSlideClick(index)}
                    className={cn(
                      'relative w-full rounded-[20px] overflow-hidden border border-[#F2F4E8] transition-all duration-500 ease-out text-left',
                      isSelected ? 'cursor-default' : 'cursor-pointer'
                    )}
                    style={{
                      aspectRatio: '393/636',
                      opacity: isSelected ? 1 : 0.6,
                      transform: isSelected ? 'scale(1)' : 'scale(0.9)',
                      boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.34)',
                    }}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={testimonial.image}
                        alt={`${testimonial.name}'s solar installation`}
                        fill
                        className="object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(17, 28, 26, 0) 62%, rgba(28, 39, 37, 1) 100%)',
                        }}
                      />

                      <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8">
                        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="relative w-12 h-12 sm:w-[67px] sm:h-[67px] rounded-full overflow-hidden shrink-0">
                            <Image
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-medium">
                              {testimonial.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-white/90 text-sm font-light">
                                {testimonial.role}
                              </span>
                              <VerifiedIcon className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <p className="text-white/80 text-xs sm:text-sm font-light leading-[1.3]">
                          {testimonial.quote}
                        </p>
                        <div className="flex gap-0.5 mt-2.5 sm:mt-3">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
