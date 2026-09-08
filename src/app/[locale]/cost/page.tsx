import CostCalculatorSection from '@/components/cost/CostCalculatorSection'
import CostExamplesSection from '@/components/cost/CostExamplesSection'
import CostFaqSection from '@/components/cost/CostFaqSection'
import CostHero from '@/components/cost/CostHero'
import CostIncludedSection from '@/components/cost/CostIncludedSection'
import CostModelsSection from '@/components/cost/CostModelsSection'
import CostSubsidySection from '@/components/cost/CostSubsidySection'
import CostTopicsSection from '@/components/cost/CostTopicsSection'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  buildExamples,
  chf,
  getCostFigures,
} from '@/lib/pricing/public-cost-figures'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

const EXAMPLE_SIZES_KWP = [6, 10, 15]

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
    pathname: '/cost',
    title: t('cost.title') || '',
    description:
      t('cost.description', {
        min: chf(figures.minChfPerKwp),
        max: chf(figures.maxChfPerKwp),
      }) || '',
  })
}

const CostPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  const t = await getTranslations('cost')
  const figures = await getCostFigures()
  const examples = buildExamples(figures, EXAMPLE_SIZES_KWP)
  const prefix = locale === 'de' ? '' : `/${locale}`

  return (
    <div>
      <JsonLd
        data={buildBreadcrumbsFromPath([
          { name: t('breadcrumb.home'), href: prefix || '/' },
          {
            name: t('breadcrumb.cost'),
            href: `${prefix}/${t('breadcrumb.slug')}`,
          },
        ])}
      />
      <CostHero figures={figures} />
      <CostExamplesSection figures={figures} examples={examples} />
      <CostIncludedSection figures={figures} />
      <CostSubsidySection figures={figures} />
      <CostModelsSection />
      <CostCalculatorSection />
      <CostFaqSection figures={figures} examples={examples} />
      <CostTopicsSection />
    </div>
  )
}

export default CostPage
