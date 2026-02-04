'use client'

import { LinkButton } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

const SolarSystemsHero = () => {
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState('products')

  const tabs = [
    { id: 'commercial', label: 'Commercial properties', href: `/${locale}/commercial` },
    { id: 'solarabo', label: 'SolarAbo', href: `/${locale}/solar-abo` },
    { id: 'how', label: 'How it works', href: `/${locale}/how-it-works` },
    { id: 'portfolio', label: 'Portfolio', href: `/${locale}/portfolio` },
    { id: 'about', label: 'About us', href: `/${locale}/about-us` },
  ]

  return (
    <section
      className="relative min-h-[600px] md:min-h-[736px] flex justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(253, 255, 245, 1) 2%, rgba(234, 237, 223, 1) 100%)',
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://placehold.co/1440x736/062E25/FFFFFF?text=Solar+Panels+on+Roof')`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px] pt-[120px] sm:pt-[160px] md:pt-[200px] lg:pt-[225px] w-full">
        {/* Navigation Tabs */}
        <div className="absolute top-[60px] sm:top-[80px] md:top-[100px] left-1/2 -translate-x-1/2 w-full flex justify-center px-4">
          <div className="inline-flex flex-col gap-0 pl-4 sm:pl-6 md:pl-[30px] pr-2 sm:pr-4 md:pr-[9px] bg-white/20 backdrop-blur-[30px] rounded-2xl sm:rounded-[24px] md:rounded-[30px] border border-white/22 transition-all duration-500 overflow-hidden py-2 max-w-[calc(100vw-2rem)]">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-[30px]">
              {/* Tab Links */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
                <Link
                  href={`/${locale}/solar-systems`}
                  className="text-white font-medium text-sm sm:text-base underline hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  Products
                </Link>
                <Link
                  href="#references"
                  className="text-white font-medium text-sm sm:text-base hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  References
                </Link>
                <Link
                  href="#guide"
                  className="text-white font-medium text-sm sm:text-base hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  Guide
                </Link>
              </div>

              {/* Online Starter Button */}
              <div className="shrink-0 w-full sm:w-auto">
                <LinkButton
                  variant="primary"
                  href="/calculator"
                  locale={locale}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Online Starter
                </LinkButton>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-start text-left max-w-[614px]">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-medium leading-[1em] mb-4">
            Solar Systems
          </h1>
          <p className="text-white/80 text-base sm:text-lg md:text-xl lg:text-[22px] font-normal leading-[1.36em] tracking-[-0.02em]">
            Solar modules for efficient, long-term energy production
          </p>
        </div>
      </div>
    </section>
  )
}

export default SolarSystemsHero
