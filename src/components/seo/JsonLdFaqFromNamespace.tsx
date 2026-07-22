import { getTranslations } from 'next-intl/server'
import { JsonLdFaqPage } from './JsonLdFaqPage'

export async function JsonLdFaqFromNamespace({
  namespace,
}: {
  namespace: string
}) {
  const t = await getTranslations(namespace)
  const items = (t.raw('faq.items') as Record<string, unknown>) ?? {}
  const faqs = Object.keys(items).map(key => ({
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`),
  }))
  if (faqs.length === 0) return null
  return <JsonLdFaqPage faqs={faqs} />
}
