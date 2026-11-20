import { Reveal, RevealStagger } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'
import { PV_SERVICE_PRICE_ROWS } from '@/components/pv-service/pv-service-api'
import { formatChf } from '@/components/roof-renovation/roof-renovation-api'
import { Link } from '@/i18n/navigation'
import { getSolarDirectFromPriceChf } from '@/lib/pricing/solar-direct-from-price'
import { pvServiceVisible } from '@/lib/pv-service-gate'
import {
  SOLAR_MODELS,
  SOLAR_MODEL_KEYS,
  SOLAR_MODEL_ROWS,
  calculatorHref,
  type SolarModelKey,
} from '@/lib/solar-models'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Badge } from './ui/badge'
import { LinkButton } from './ui/link-button'

interface SolarModelsProps {
  isCommercial?: boolean
  current?: SolarModelKey
  flush?: boolean
}

const SolarModels = async ({
  isCommercial = false,
  current,
  flush = false,
}: SolarModelsProps = {}) => {
  const t = await getTranslations('solarModels')
  const directFromPrice = isCommercial
    ? null
    : await getSolarDirectFromPriceChf()
  const servicePrice = PV_SERVICE_PRICE_ROWS[0].annualChf?.monitoring ?? null

  const title = current
    ? t('titleCurrent', { model: t(`${SOLAR_MODELS[current].messageKey}.name`) })
    : isCommercial
      ? t('business.title')
      : t('title')
  const subtitle = current
    ? t('subtitleCurrent')
    : isCommercial
      ? t('business.subtitle')
      : t('subtitle')

  return (
    <section
      id="modelle"
      className={cn(
        'relative w-full scroll-mt-28 overflow-hidden px-4 py-16 sm:px-6 md:py-24',
        !flush && '-mt-[40px]'
      )}
      style={{
        backgroundImage: 'linear-gradient(180deg, #F2F4E8 0%, #DCE9E6 79%)',
      }}
    >
      <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-12 md:gap-14">
        <div className="flex flex-col items-center gap-5 text-center">
          <Badge
            variant="outline"
            className="border-foreground text-base font-light text-foreground"
          >
            {t('eyebrow')}
          </Badge>
          <RevealText
            as="h2"
            className="text-3xl font-medium text-foreground md:text-[45px]"
          >
            {title}
          </RevealText>
          <Reveal
            as="p"
            delay={0.2}
            className="max-w-[820px] text-lg tracking-tight text-foreground/80 md:text-[22px]"
          >
            {subtitle}
          </Reveal>
        </div>

        <RevealStagger
          as="div"
          className="grid gap-8 lg:grid-cols-[1.12fr_1fr_1fr] lg:gap-x-6 lg:gap-y-0"
        >
          {SOLAR_MODEL_KEYS.map(model => {
            const definition = SOLAR_MODELS[model]
            const key = definition.messageKey
            const featured = definition.featured
            const isCurrent = current === model
            const name = t(`${key}.name`)

            const investment =
              model === 'solar-direct'
                ? directFromPrice != null
                  ? t('direct.values.investment', {
                      price: formatChf(directFromPrice),
                    })
                  : t('direct.values.investmentNoPrice')
                : t(`${key}.values.investment`)

            const ctaHref = isCommercial
              ? '/commercial/calculator'
              : calculatorHref(model)
            const ctaLabel = isCommercial ? t('business.cta') : t(`${key}.cta`)

            const learnMore = isCommercial
              ? model === 'solar-free'
                ? {
                    href: '/commercial/solar-free' as const,
                    label: t('business.learnMore'),
                  }
                : null
              : isCurrent
                ? null
                : {
                    href: definition.href,
                    label: t('learnMore', { model: name }),
                  }

            return (
              <article
                key={model}
                className={cn(
                  'relative flex flex-col rounded-[24px] border px-6 pb-6 pt-9 md:px-8 md:pb-8 lg:row-span-7 lg:grid lg:grid-rows-subgrid',
                  featured
                    ? 'border-transparent bg-[linear-gradient(200deg,#0C5443_0%,#062E25_55%)] text-white shadow-[0_24px_60px_-24px_rgba(6,46,37,0.55)]'
                    : 'border-[#546963]/40 bg-[#FDFEFA] text-[#062E25]',
                  isCurrent && !featured && 'ring-2 ring-[#062E25]',
                  isCurrent && featured && 'ring-2 ring-solar'
                )}
              >
                {(featured || isCurrent) && (
                  <div className="absolute left-6 top-0 flex -translate-y-1/2 gap-2 md:left-8">
                    {featured && (
                      <span
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-medium',
                          isCommercial
                            ? 'bg-[#9F3E4F] text-white'
                            : 'bg-solar text-[#062E25]'
                        )}
                      >
                        {t('recommended')}
                      </span>
                    )}
                    {isCurrent && (
                      <span
                        className={cn(
                          'rounded-full border px-4 py-1.5 text-sm font-medium',
                          featured
                            ? 'border-white/40 bg-[#062E25] text-white'
                            : 'border-[#062E25] bg-white text-[#062E25]'
                        )}
                      >
                        {t('current')}
                      </span>
                    )}
                  </div>
                )}

                <header className="pb-6">
                  <h3 className="text-[28px] font-medium tracking-tight">
                    {name}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 text-base',
                      featured ? 'text-white/80' : 'text-[#062E25]/80'
                    )}
                  >
                    {t(isCommercial ? `${key}.taglineBusiness` : `${key}.tagline`)}
                  </p>
                </header>

                <dl className="flex flex-col lg:row-span-5 lg:grid lg:grid-rows-subgrid">
                  {SOLAR_MODEL_ROWS.map(row => (
                    <div
                      key={row}
                      className={cn(
                        'border-t py-4',
                        featured ? 'border-white/15' : 'border-[#062E25]/12'
                      )}
                    >
                      <dt
                        className={cn(
                          'text-sm',
                          featured ? 'text-white/65' : 'text-[#062E25]/60'
                        )}
                      >
                        {t(`rows.${row}`)}
                      </dt>
                      <dd
                        className={cn(
                          'mt-1 font-medium',
                          row === 'investment'
                            ? 'text-2xl tracking-tight md:text-[28px]'
                            : 'text-base',
                          row === 'investment' && featured && 'text-solar'
                        )}
                      >
                        {row === 'investment'
                          ? investment
                          : t(`${key}.values.${row}`)}
                      </dd>
                      {row === 'service' &&
                        !definition.serviceIncluded &&
                        pvServiceVisible &&
                        servicePrice != null && (
                          <Link
                            href="/service"
                            className="mt-1 inline-block text-sm underline underline-offset-4 hover:opacity-80"
                          >
                            {t('serviceLink', {
                              price: formatChf(servicePrice),
                            })}
                          </Link>
                        )}
                    </div>
                  ))}
                </dl>

                <footer
                  className={cn(
                    'flex flex-col gap-4 border-t pt-6',
                    featured ? 'border-white/15' : 'border-[#062E25]/12'
                  )}
                >
                  <LinkButton
                    href={ctaHref}
                    variant={featured ? 'primary' : 'outline-primary'}
                    className="w-full"
                  >
                    {ctaLabel}
                  </LinkButton>
                  {learnMore && (
                    <Link
                      href={learnMore.href}
                      className="group/learn inline-flex items-center gap-1.5 self-start text-base font-medium underline underline-offset-4 hover:opacity-80"
                    >
                      {learnMore.label}
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform duration-300 group-hover/learn:translate-x-0.5"
                      />
                    </Link>
                  )}
                </footer>
              </article>
            )
          })}
        </RevealStagger>
      </div>
    </section>
  )
}

export default SolarModels
