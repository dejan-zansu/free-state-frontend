import { Reveal, RevealStagger } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'
import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { ComponentProps } from 'react'
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
  const calculatorHref = isCommercial ? '/commercial/calculator' : '/calculator'

  return (
    <section
      className="relative z-20 min-h-svh md:min-h-[690px] lg:min-h-[736px] flex flex-col md:flex-row md:justify-center rounded-b-[40px] overflow-hidden"
      style={{
        background: '#FDFFF5',
      }}
    >
      <div className="absolute inset-0 z-0">
        <video
          className="absolute inset-0 w-full h-full object-cover rounded-b-[40px]"
          src="https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev/videos/Landing-Safhauzen-Final.mp4"
          poster="/images/hero-fallback.webp"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 md:hidden bg-[linear-gradient(180deg,rgba(6,46,37,0.5)_0%,rgba(6,46,37,0.3)_30%,rgba(6,46,37,0.45)_65%,rgba(6,46,37,0.75)_100%)]" />
      </div>

      <div
        className={cn(
          'relative z-10 max-w-360 mx-auto px-5 sm:px-6 pt-28 pb-12 md:pt-[230px] lg:pt-[225px] w-full max-md:flex-1 max-md:flex max-md:flex-col max-md:justify-center',
          isCommercial ? 'md:pb-[150px]' : 'md:pb-0'
        )}
      >
        <HeroNav isCommercial={isCommercial} />

        <div className="flex flex-col items-start text-left md:items-center md:text-center">
          <RevealText
            as="h1"
            on="load"
            delay={0.15}
            className={cn(
              'text-white text-4xl md:text-5xl font-bold md:font-medium mb-5 md:mb-4 max-md:text-balance md:whitespace-pre-line md:px-2',
              isCommercial
                ? 'md:text-center lg:text-5xl xl:text-6xl max-w-[1100px]'
                : 'lg:text-6xl xl:text-7xl max-w-[900px]'
            )}
          >
            {heroTitle}
          </RevealText>

          <RevealStagger
            on="load"
            delay={0.55}
            as="div"
            className="flex flex-col items-start md:items-center w-full"
          >
            <p
              className={cn(
                'text-white/85 text-lg md:text-white/80 md:text-xl md:font-medium md:leading-[30px] mb-8 md:mb-12 md:whitespace-pre-line md:max-w-[750px] md:px-2'
              )}
            >
              {heroDescription}
            </p>

            <div>
              <Link
                href={calculatorHref as ComponentProps<typeof Link>['href']}
                className={cn(
                  'md:hidden inline-flex items-center gap-5 h-14 pl-7 pr-6 rounded-full text-lg font-semibold transition-colors',
                  isCommercial
                    ? 'bg-energy text-white hover:bg-energy/90'
                    : 'bg-solar text-solar-foreground hover:bg-solar/90'
                )}
              >
                {t('hero.cta.primary')}
                <ArrowRight className="size-6" strokeWidth={2} />
              </Link>
              <LinkButton
                variant={isCommercial ? 'secondary' : 'primary'}
                href={calculatorHref}
                className="max-md:hidden"
              >
                {t('hero.cta.primary')}
              </LinkButton>
            </div>
          </RevealStagger>
        </div>
      </div>

      <Reveal
        as="div"
        on="load"
        delay={0.3}
        className="relative z-10 md:hidden border-t border-white/15 bg-[#062E25]/55 backdrop-blur-xl"
      >
        <div className="grid grid-cols-2">
          {pillItems.map((item, index) => (
            <div
              key={item.title}
              className={cn(
                'flex flex-col items-center text-center gap-1 px-3 py-4',
                index % 2 === 1 && 'border-l border-white/15',
                index > 1 && 'border-t border-white/15'
              )}
            >
              <Image
                src={item.icon}
                alt=""
                width={24}
                height={24}
                className="shrink-0 size-5 mb-1"
              />
              <span className="text-white text-sm font-medium tracking-tight uppercase">
                {item.title}
              </span>
              <span className="text-white/75 text-sm tracking-tight">
                {item.subtitle}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal
        as="div"
        on="load"
        delay={0.3}
        className="max-md:hidden absolute left-1/2 bottom-4 md:bottom-10 -translate-x-1/2 z-20 w-[calc(100%-1.5rem)] max-w-[1022px] px-0"
      >
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
      </Reveal>
    </section>
  )
}

export default Hero
