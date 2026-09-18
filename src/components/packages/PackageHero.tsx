import { Check } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import HeroNavLight from '@/components/HeroNavLight'
import { EyebrowPill } from '@/components/ui/eyebrow-pill'
import { LinkButton } from '@/components/ui/link-button'
import type { CalculatorPackage } from '@/services/residential-calculator.service'

interface Props {
  pkg: CalculatorPackage
  brand: 'HUAWEI' | 'SIGENERGY' | 'SOFAR' | null
  specs: { minKwp: number; maxKwp: number; minKwh: number; maxKwh: number }
  fromPrice: number | null
  models: ('solar-free' | 'solar-direct' | 'solar-abo')[]
  locale: string
}

const fmt1 = (n: number, locale: string) =>
  n.toLocaleString(locale === 'en' ? 'de-CH' : `${locale}-CH`, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmt0 = (n: number, locale: string) => n.toLocaleString(locale === 'en' ? 'de-CH' : `${locale}-CH`)

export default async function PackageHero({ pkg, brand, specs, fromPrice, models, locale }: Props) {
  const t = await getTranslations('packagePage.hero')
  const tCard = await getTranslations('packageCatalog.card')
  const isFree = models.includes('solar-free')
  const kwp = specs.minKwp === specs.maxKwp ? fmt1(specs.minKwp, locale) : `${fmt1(specs.minKwp, locale)}–${fmt1(specs.maxKwp, locale)}`
  const kwh = specs.minKwh === specs.maxKwh ? fmt0(specs.minKwh, locale) : `${fmt0(specs.minKwh, locale)}–${fmt0(specs.maxKwh, locale)}`
  const prefix = locale === 'de' ? '' : `/${locale}`

  return (
    <section className="relative overflow-hidden bg-[#EBEDDF]">
      <HeroNavLight />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 sm:pt-44 lg:px-8 lg:pb-20 lg:pt-56">
        <div
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full"
          style={{ backgroundColor: 'rgba(183, 254, 26, 0.55)', filter: 'blur(140px)' }}
        />
        <nav aria-label={t('breadcrumb')} className="mb-6 text-sm uppercase tracking-[0.08em] text-pine/60 sm:text-base">
          freestate.ch / {t('breadcrumb')} / {pkg.name}
        </nav>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div className="max-w-2xl">
            <EyebrowPill>
              {pkg.highlightedFeature ?? t('eyebrow')}
              {brand && <span className="ml-2 text-pine/70">{brand === 'HUAWEI' ? 'Huawei' : brand === 'SIGENERGY' ? 'Sigenergy' : 'SOFAR'}</span>}
            </EyebrowPill>
            <h1 className="mt-5 text-4xl font-medium leading-[1.05] tracking-tight text-[#17302A] sm:text-5xl lg:text-6xl">{pkg.name}</h1>
            {pkg.description && <p className="mt-5 max-w-xl text-base leading-relaxed text-[#17302A]/80 sm:text-xl">{pkg.description}</p>}
            {pkg.features.length > 0 && (
              <ul className="mt-6 flex flex-col gap-2">
                {pkg.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-base text-pine/85">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-teal-deep" strokeWidth={2.5} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside className="rounded-[24px] border border-pine/10 bg-white/70 p-6 backdrop-blur sm:p-7">
            <dl className="grid grid-cols-2 gap-4">
              {specs.minKwp > 0 && (
                <>
                  <div>
                    <dt className="text-base text-pine/65">{tCard('capacity')}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-pine tabular-nums">
                      {kwp} <span className="text-base font-medium">{tCard('kwpUnit')}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-base text-pine/65">{tCard('annualProduction')}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-pine tabular-nums">
                      ~{kwh} <span className="text-base font-medium">{tCard('kwhPerYearUnit')}</span>
                    </dd>
                  </div>
                </>
              )}
              {isFree ? (
                <div className="col-span-2 rounded-[16px] bg-lime/35 px-4 py-3">
                  <dt className="text-base text-pine/70">{t('freeLabel')}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-pine">
                    0 CHF <span className="text-base font-medium">{t('freeSuffix')}</span>
                  </dd>
                  {fromPrice != null && (
                    <p className="mt-1 text-base text-pine/70">{t('orBuy', { price: fmt0(fromPrice, locale) })}</p>
                  )}
                </div>
              ) : fromPrice != null ? (
                <div className="col-span-2 rounded-[16px] bg-sage px-4 py-3">
                  <dt className="text-base text-pine/70">{tCard('priceLabels.from')}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-pine tabular-nums">
                    {fmt0(fromPrice, locale)} CHF <span className="text-base font-medium">{tCard('priceLabels.exclVat')}</span>
                  </dd>
                </div>
              ) : null}
              {pkg.installerWarrantyYears != null && (
                <div className="col-span-2 text-base text-pine/75">{t('installerWarranty', { years: pkg.installerWarrantyYears })}</div>
              )}
            </dl>
            <div className="mt-6 flex flex-col gap-3">
              {models.map((m) => (
                <LinkButton key={m} href={`${prefix}/calculator?model=${m}`} variant={m === models[0] ? 'tertiary' : 'outline-primary'} className="w-full justify-between">
                  {t(`order.${m}`)}
                </LinkButton>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{ background: 'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)' }}
      />
    </section>
  )
}
