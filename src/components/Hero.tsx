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
    <section className='relative min-h-[736px] flex justify-center overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage: `url('/images/${isCommercial ? 'hero-solar-panels-2.webp' : 'hero-solar-panels.webp'}')`,
          }}
        />
      </div>

      <div className='relative z-10 max-w-360 mx-auto px-6 pt-[225px] w-full'>
        <HeroNav locale={locale} isCommercial={isCommercial} />

        <div className='flex flex-col items-center text-center'>
          <h1
            className={cn(
              'text-white text-7xl font-medium mb-4 whitespace-pre-line max-w-[800px]',
              isCommercial && 'text-center'
            )}
          >
            {heroTitle}
          </h1>
          <p
            className={cn(
              'text-white/80 text-xl font-medium leading-[30px] mb-12 whitespace-pre-line max-w-[375px]',
              isCommercial && 'max-w-[500px]'
            )}
          >
            {heroDescription}
          </p>

          {showCTAs && (
            <div className='flex items-center gap-4'>
              <LinkButton variant='primary' href='/solar-abo' locale={locale}>
                {t('hero.cta.primary')}
              </LinkButton>

              <LinkButton
                variant='outline-secondary'
                href='/calculator'
                locale={locale}
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
