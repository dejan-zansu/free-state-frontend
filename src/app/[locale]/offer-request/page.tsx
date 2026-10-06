import OfferRequestForm from '@/components/offer-request/OfferRequestForm'
import { Link } from '@/i18n/navigation'
import {
  buildExamples,
  chf,
  getCostFigures,
} from '@/lib/pricing/public-cost-figures'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ComponentProps } from 'react'

const CALCULATOR_HREF = '/calculator' as ComponentProps<typeof Link>['href']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  const figures = await getCostFigures()
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/offer-request',
    title: t('offerRequest.title') || '',
    description:
      t('offerRequest.description', {
        min: chf(figures.minChfPerKwp),
        max: chf(figures.maxChfPerKwp),
      }) || '',
  })
}

const OfferRequestPage = async () => {
  const t = await getTranslations('offerRequest.page')
  const figures = await getCostFigures()
  const ten = buildExamples(figures, [10])[0]

  return (
    <div className="bg-[#EAEDDF]">
      <section className="rounded-b-[40px] bg-[#062E25] px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-36 md:pb-20">
        <div className="mx-auto grid w-full max-w-[1120px] gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:items-start lg:gap-14">
          <div className="text-white lg:pt-4">
            <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl md:text-5xl">
              {t('title', {
                min: chf(figures.minChfPerKwp),
                max: chf(figures.maxChfPerKwp),
              })}
            </h1>
            <p className="mt-3 text-base text-white/75 md:mt-4 md:text-lg">
              {t('priceLabel')}
            </p>
            {ten && (
              <p className="mt-4 text-base text-white md:mt-6 md:text-lg">
                {t('example', {
                  tenNetMin: chf(ten.netMin),
                  tenNetMax: chf(ten.netMax),
                  tenSubsidy: chf(ten.subsidy),
                })}
              </p>
            )}
            <p className="mt-3 text-base text-white/75 md:text-lg">
              {t('note')}
            </p>
          </div>
          <OfferRequestForm placement="page" />
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-14">
        <p className="mx-auto w-full max-w-[1120px] text-base text-[#062E25] tracking-tight">
          {t('calculatorPrompt')}{' '}
          <Link
            href={CALCULATOR_HREF}
            className="font-medium underline underline-offset-2"
          >
            {t('calculatorLink')}
          </Link>
        </p>
      </section>
    </div>
  )
}

export default OfferRequestPage
