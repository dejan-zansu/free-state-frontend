import { LinkButton } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import HeroNav from './HeroNav'

type PillItem = {
  icon: string
  title: string
  subtitle: string
}

interface HeroProps {
  title?: string
  description?: string
  isCommercial?: boolean
}

const Hero = async ({
  title,
  description,
  isCommercial = false,
}: HeroProps = {}) => {
  const t = await getTranslations('home')
  const defaultTitle = isCommercial
    ? t('hero.commercialTitle')
    : t('hero.title')
  const defaultDescription = isCommercial
    ? t('hero.commercialSubtitle')
    : t('hero.subtitle')
  const heroTitle = title || defaultTitle
  const heroDescription = description || defaultDescription
  const pillItems = t.raw(
    isCommercial ? 'hero.pillCommercial' : 'hero.pill'
  ) as PillItem[]
  const pillBackground = isCommercial
    ? 'rgba(73, 57, 75, 0.5)'
    : 'rgba(49, 91, 94, 0.5)'
  const pillShadow = isCommercial
    ? '0px 25px 34px 0px rgba(159, 62, 79, 0.2)'
    : '0px 25px 34px 0px rgba(183, 254, 26, 0.1)'

  return (
    <section
      className="relative z-20 min-h-[640px] sm:min-h-[640px] md:min-h-[690px] lg:min-h-[736px] flex justify-center rounded-b-[40px] overflow-hidden"
      style={{
        background: '#FDFFF5',
      }}
    >
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center rounded-b-[40px]"
          style={{
            backgroundImage: `url('/images/solar-panels-hero.webp')`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-360 mx-auto px-4 sm:px-6 pt-[90px] sm:pt-[140px] md:pt-[230px] lg:pt-[225px] w-full">
        <HeroNav isCommercial={isCommercial} />

        <div className="flex flex-col items-center text-center">
          <h1
            className={cn(
              'text-white text-[32px] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium mb-3 sm:mb-4 whitespace-pre-line max-w-[860px] px-2',
              isCommercial && 'text-center'
            )}
          >
            {heroTitle}
          </h1>
          <p
            className={cn(
              'text-white/80 text-sm sm:text-lg md:text-xl font-medium leading-[22px] sm:leading-[28px] md:leading-[30px] mb-6 sm:mb-10 md:mb-12 whitespace-pre-line max-w-[320px] sm:max-w-[750px] px-2'
            )}
          >
            {heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4">
            <LinkButton
              variant="primary"
              href={isCommercial ? '/commercial/calculator' : '/calculator'}
              className="w-full sm:w-auto"
            >
              {t('hero.cta.primary')}
            </LinkButton>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 bottom-4 md:bottom-10 -translate-x-1/2 z-20 w-[calc(100%-1.5rem)] max-w-[1022px] px-0">
        <div
          className="w-full rounded-2xl md:rounded-[30px] border border-white/20"
          style={{
            background: pillBackground,
            backdropFilter: 'blur(29.4px)',
            WebkitBackdropFilter: 'blur(29.4px)',
            boxShadow: pillShadow,
          }}
        >
          <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-3 md:gap-0 px-4 md:px-10 py-3 md:py-2.5">
            {pillItems.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  'flex items-center gap-2.5 md:gap-3 md:flex-1',
                  index > 0 && 'md:pl-6 md:border-l md:border-white/20'
                )}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={24}
                  height={24}
                  className="shrink-0 w-5 h-5 md:w-7 md:h-7"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-white text-sm font-medium tracking-tight uppercase">
                    {item.title}
                  </span>
                  <span className="text-white/80 text-sm font-normal tracking-tight">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
