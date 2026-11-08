import { RevealStagger } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'
import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

import { cn } from '@/lib/utils'

const POINTS = ['offer', 'fixedPrice', 'onePartner'] as const

const RoofRenovationHomePanel = async ({
  isCommercial = false,
}: {
  isCommercial?: boolean
}) => {
  const t = await getTranslations('home.roofRenovation')
  const tPoints = await getTranslations('roofRenovation.hero.points')
  const tEstimator = await getTranslations('roofRenovation.estimatorSection')
  const tPrice = await getTranslations('roofRenovation.cost.ownPrice')

  return (
    <section
      className="w-full"
      style={{
        background: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)',
      }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col">
          <div className="relative min-h-[300px] flex-1 lg:min-h-0">
            <Image
              src="/images/roof-renovation/hero-bern-roofs.webp"
              alt={t('imageAlt')}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[75%_80%]"
            />
          </div>
          <Link
            href={{ pathname: '/roof-renovation', hash: 'rechner' }}
            className={cn(
              'group flex items-center justify-between gap-4 px-6 py-4 text-base font-medium sm:px-8 md:text-lg',
              isCommercial
                ? 'bg-[#3D3858] text-white'
                : 'bg-solar text-[#062E25]'
            )}
          >
            {tEstimator('title')}
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1',
                isCommercial ? 'bg-white' : 'bg-[#062E25]'
              )}
            >
              <ArrowRight
                aria-hidden
                className={cn(
                  'size-5',
                  isCommercial ? 'text-[#3D3858]' : 'text-white'
                )}
              />
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 py-14 sm:px-12 lg:px-0">
          <div className="flex max-w-[400px] flex-col gap-5">
            <RevealText
              as="h2"
              className="text-3xl font-medium text-foreground md:text-[45px]"
            >
              {t('title')}
            </RevealText>
            <RevealStagger as="div" className="flex flex-col gap-[30px]">
              <div className="flex flex-col gap-5">
                <p className="text-lg tracking-tight text-foreground/80">
                  {isCommercial ? t('subtitleCommercial') : t('subtitle')}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {POINTS.map(point => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-base font-medium tracking-tight text-foreground/80"
                    >
                      <CircleCheck
                        aria-hidden
                        className={cn(
                          'size-5 shrink-0',
                          isCommercial ? 'text-[#3D3858]' : 'text-[#036B53]'
                        )}
                      />
                      {tPoints(point)}
                    </li>
                  ))}
                </ul>
                {isCommercial && (
                  <div className="rounded-[20px] bg-white p-5">
                    <p className="text-base font-medium">{tPrice('heading')}</p>
                    <p className="mt-3 text-[32px] font-medium tracking-[-0.03em] tabular-nums">
                      {tPrice('value')}
                    </p>
                    <p className="text-base">{tPrice('unit')}</p>
                    <p className="mt-3 text-base text-foreground/80">
                      {tPrice('scope')}
                    </p>
                    <p className="mt-3 text-base text-foreground/70">
                      {tPrice('onTop')}
                    </p>
                  </div>
                )}
              </div>
              <LinkButton
                href="/roof-renovation"
                variant={isCommercial ? 'quaternary' : 'primary'}
                className="w-fit"
              >
                {t('cta')}
              </LinkButton>
            </RevealStagger>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RoofRenovationHomePanel
