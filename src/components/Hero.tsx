import { LinkButton } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'
import { getLocale, getTranslations } from 'next-intl/server'
import HeroNav from './HeroNav'

interface HeroProps {
  title?: string
  description?: string
  showCTAs?: boolean
  isCommercial?: boolean
}

const Hero = async ({
  title,
  description,
  showCTAs = true,
  isCommercial = false,
}: HeroProps = {}) => {
  const t = await getTranslations('home')
  const locale = await getLocale()
  const heroTitle = title || t('hero.title')
  const heroDescription = description || t('hero.subtitle')

  return (
    <section className='relative min-h-[500px] md:min-h-[600px] lg:min-h-[736px] flex justify-center overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage: `url('/images/${isCommercial ? 'hero-solar-panels-2.webp' : 'hero-solar-panels.webp'}')`,
          }}
        />
      </div>

      <div className='relative z-10 max-w-360 mx-auto px-4 sm:px-6 pt-[120px] sm:pt-[160px] md:pt-[200px] lg:pt-[225px] w-full'>
        <HeroNav locale={locale} isCommercial={isCommercial} />

        <div className='flex flex-col items-center text-center'>
          <h1
            className={cn(
              'text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium mb-4 whitespace-pre-line max-w-[800px] px-2',
              isCommercial && 'text-center'
            )}
          >
            {heroTitle}
          </h1>
          <p
            className={cn(
              'text-white/80 text-base sm:text-lg md:text-xl font-medium leading-[24px] sm:leading-[28px] md:leading-[30px] mb-8 sm:mb-10 md:mb-12 whitespace-pre-line max-w-[375px] px-2',
              isCommercial && 'max-w-[500px]'
            )}
          >
            {heroDescription}
          </p>

          {showCTAs && (
            <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4'>
              <LinkButton variant='primary' href='/solar-abo' locale={locale} className='w-full sm:w-auto'>
                {t('hero.cta.primary')}
              </LinkButton>

              <LinkButton
                variant='outline-secondary'
                href='/calculator'
                locale={locale}
                className='w-full sm:w-auto'
              >
                {t('hero.cta.secondary')}
              </LinkButton>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Hero
