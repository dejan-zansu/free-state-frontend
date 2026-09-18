import { BadgeCheck, Check, Smartphone, Wrench } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import HeroNavLight from '@/components/HeroNavLight'
import { LinkButton } from '@/components/ui/link-button'
import { COMPANY_CALENDLY_URL } from '@/lib/company-contact'
import type { CalculatorPackage } from '@/services/residential-calculator.service'

import PackageGallery from './PackageGallery'
import type { PackageComponentView } from './types'

interface Props {
  pkg: CalculatorPackage
  brand: string | null
  specs: { minKwp: number; maxKwp: number; minKwh: number; maxKwh: number }
  fromPrice: number | null
  models: ('solar-free' | 'solar-direct' | 'solar-abo')[]
  locale: string
  components: PackageComponentView[]
}

const numberLocale = (locale: string) => (locale === 'en' ? 'de-CH' : `${locale}-CH`)
const fmt1 = (n: number, locale: string) => n.toLocaleString(numberLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmt0 = (n: number, locale: string) => n.toLocaleString(numberLocale(locale))

/** Top of the package page: component gallery with the 3D viewer on the left, the package itself on the right. */
export default async function PackageOverview({ pkg, brand, specs, fromPrice, models, locale, components }: Props) {
  const t = await getTranslations('packagePage.hero')
  const tCard = await getTranslations('packageCatalog.card')
  const tIncluded = await getTranslations('packagePage.included')
  const isFree = models.includes('solar-free')
  const kwp = specs.minKwp === specs.maxKwp ? fmt1(specs.minKwp, locale) : `${fmt1(specs.minKwp, locale)}–${fmt1(specs.maxKwp, locale)}`
  const kwh = specs.minKwh === specs.maxKwh ? fmt0(specs.minKwh, locale) : `${fmt0(specs.minKwh, locale)}–${fmt0(specs.maxKwh, locale)}`
  const prefix = locale === 'de' ? '' : `/${locale}`

  return (
    <section className="relative bg-white">
      <div className="relative bg-[#EBEDDF] pb-6 pt-28 sm:pt-40 lg:pt-52">
        <HeroNavLight />
      </div>
      <div className="container mx-auto max-w-[1290px] px-4 pb-14 pt-8 sm:pb-20 sm:pt-10">
        <nav aria-label={t('breadcrumb')} className="mb-4 text-sm uppercase tracking-[0.08em] text-pine/60 sm:text-base">
          freestate.ch / {t('breadcrumb')} / {pkg.name}
        </nav>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h1 className="text-3xl font-medium leading-tight tracking-tight text-pine sm:text-[44px]">{pkg.name}</h1>
          <p className="text-base text-pine/70">
            {pkg.highlightedFeature ?? t('eyebrow')}
            {brand && <span> · {brand}</span>}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <PackageGallery components={components} />
            <ul className="mt-6 grid grid-cols-1 gap-3 border-t border-pine/10 pt-5 text-base text-pine/80 sm:grid-cols-3 lg:pl-[104px]">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-teal-deep" aria-hidden />
                {tIncluded('quality.title')}
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 shrink-0 text-teal-deep" aria-hidden />
                {tIncluded('app.title')}
              </li>
              <li className="flex items-center gap-2">
                <Wrench className="h-5 w-5 shrink-0 text-teal-deep" aria-hidden />
                {tIncluded('service.title')}
              </li>
            </ul>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            {pkg.description && <p className="text-base leading-relaxed text-pine/80 sm:text-xl">{pkg.description}</p>}
            {pkg.features.length > 0 && (
              <ul className="mt-5 flex flex-col gap-2">
                {pkg.features.slice(0, 6).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-base text-pine/85">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-teal-deep" strokeWidth={2.5} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3">
              {specs.minKwp > 0 && (
                <>
                  <div className="rounded-[16px] border border-pine/10 p-4">
                    <dt className="text-base text-pine/65">{tCard('capacity')}</dt>
                    <dd className="mt-1 text-xl font-semibold text-pine tabular-nums">
                      {kwp} <span className="text-base font-medium">{tCard('kwpUnit')}</span>
                    </dd>
                  </div>
                  <div className="rounded-[16px] border border-pine/10 p-4">
                    <dt className="text-base text-pine/65">{tCard('annualProduction')}</dt>
                    <dd className="mt-1 text-xl font-semibold text-pine tabular-nums">
                      ~{kwh} <span className="text-base font-medium">{tCard('kwhPerYearUnit')}</span>
                    </dd>
                  </div>
                </>
              )}
              {isFree ? (
                <div className="col-span-2 rounded-[16px] bg-lime/35 p-4">
                  <dt className="text-base text-pine/70">{t('freeLabel')}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-pine">
                    0 CHF <span className="text-base font-medium">{t('freeSuffix')}</span>
                  </dd>
                  {fromPrice != null && <p className="mt-1 text-base text-pine/70">{t('orBuy', { price: fmt0(fromPrice, locale) })}</p>}
                </div>
              ) : fromPrice != null ? (
                <div className="col-span-2 rounded-[16px] bg-sage p-4">
                  <dt className="text-base text-pine/70">{tCard('priceLabels.from')}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-pine tabular-nums">
                    {fmt0(fromPrice, locale)} CHF <span className="text-base font-medium">{tCard('priceLabels.exclVat')}</span>
                  </dd>
                </div>
              ) : null}
            </dl>
            {pkg.installerWarrantyYears != null && (
              <p className="mt-3 text-base text-pine/75">{t('installerWarranty', { years: pkg.installerWarrantyYears })}</p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {models.map((m) => (
                <LinkButton key={m} href={`${prefix}/calculator?model=${m}`} variant={m === models[0] ? 'tertiary' : 'outline-primary'} className="w-full justify-between">
                  {t(`order.${m}`)}
                </LinkButton>
              ))}
              <a href={COMPANY_CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="text-center text-base font-medium text-pine underline-offset-4 hover:underline">
                {t('consultation')}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
