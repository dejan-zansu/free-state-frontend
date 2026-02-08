'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface PartnerItem {
  title: string
  description: string
  bgImage: string
  bgImageCommercial: string
}

interface YourPartnerCarouselProps {
  items: PartnerItem[]
  learnMoreText: string
  isCommercial?: boolean
}

const YourPartnerCarousel = ({
  items,
  learnMoreText,
  isCommercial = false,
}: YourPartnerCarouselProps) => {
  return (
    <Carousel
      opts={{
        loop: true,
        align: 'start',
      }}
      className="max-w-[1000px] mx-auto"
    >
      <CarouselContent className="ml-0">
        {items.map((item, index) => (
          <CarouselItem key={index} className="pl-0">
            <div className="max-w-[820px] mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
              <div className="flex-1 order-2 md:order-1">
                <h3 className="text-foreground text-2xl font-bold mb-2.5">
                  {item.title}
                </h3>
                <p className="text-foreground text-base font-light mb-6 md:mb-8">
                  {item.description}
                </p>
                <Link
                  href="/learn-more"
                  className="inline-flex items-center gap-2 text-primary font-medium group/link transition-opacity duration-300 hover:opacity-80"
                >
                  <span className="inline-flex items-center gap-2 border-b border-primary pb-0.5">
                    <span>{learnMoreText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </span>
                </Link>
              </div>
              <div className="order-1 md:order-2 w-full max-w-[420px]">
                <div className="relative aspect-4/3 w-full">
                  <Image
                    src={isCommercial ? item.bgImageCommercial : item.bgImage}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 md:-left-4 lg:-left-12 size-12 bg-[#EBEDE1] border-0 hover:bg-[#EBEDE1]/80" />
      <CarouselNext className="right-0 md:-right-4 lg:-right-12 size-12 bg-[#EBEDE1] border-0 hover:bg-[#EBEDE1]/80" />
    </Carousel>
  )
}

export default YourPartnerCarousel
