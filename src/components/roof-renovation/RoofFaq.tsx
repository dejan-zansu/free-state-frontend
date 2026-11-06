import FAQAccordionSection from '@/components/faq/FAQAccordionSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildFAQPageJsonLd } from '@/lib/seo/structured-data'
import { getTranslations } from 'next-intl/server'

const RoofFaq = async ({
  namespace,
  keys,
}: {
  namespace: string
  keys: readonly string[]
}) => {
  const t = await getTranslations(namespace)
  const items = keys.map(key => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }))
  return (
    <div className="bg-[#FDFFF5]">
      <JsonLd data={buildFAQPageJsonLd(items)} />
      <FAQAccordionSection
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        items={items}
      />
    </div>
  )
}

export default RoofFaq
