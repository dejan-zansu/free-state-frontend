import FAQAccordionSection from '@/components/faq/FAQAccordionSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildFAQPageJsonLd } from '@/lib/seo/structured-data'
import {
  chf,
  type CostExample,
  type CostFigures,
} from '@/lib/pricing/public-cost-figures'
import { getTranslations } from 'next-intl/server'

const faqKeys = ['1', '2', '3', '4', '5', '6'] as const

interface CostFaqSectionProps {
  figures: CostFigures
  examples: CostExample[]
}

const CostFaqSection = async ({ figures, examples }: CostFaqSectionProps) => {
  const t = await getTranslations('cost')
  const ten = examples.find(e => e.kwp === 10) ?? examples[0]

  const values = {
    min: chf(figures.minChfPerKwp),
    max: chf(figures.maxChfPerKwp),
    rate: chf(figures.subsidy.tier1ChfPerKwp),
    tier1: figures.subsidy.tier1MaxKwp,
    feedIn: figures.feedInRpPerKwh,
    tenNetMin: chf(ten.netMin),
    tenNetMax: chf(ten.netMax),
    tenSubsidy: chf(ten.subsidy),
  }

  const items = faqKeys.map(key => ({
    question: t(`faq.items.${key}.question`, values),
    answer: t(`faq.items.${key}.answer`, values),
  }))

  return (
    <div className="bg-[#FDFFF5]">
      <JsonLd data={buildFAQPageJsonLd(items)} />
      <FAQAccordionSection
        eyebrow={t('faq.eyebrow')}
        title={t('faq.title')}
        description={t('faq.description')}
        items={items}
      />
    </div>
  )
}

export default CostFaqSection
