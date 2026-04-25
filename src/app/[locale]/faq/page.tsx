import PageHero from '@/components/PageHero'
import FAQAccordionSection from '@/components/faq/FAQAccordionSection'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildFAQPageJsonLd } from '@/lib/seo/structured-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/faq',
    title: t('faq.title') || '',
    description: t('faq.description') || '',
  })
}

const sectionKeys = [
  'gettingStarted',
  'installation',
  'howItWorks',
  'costsAndPayment',
  'maintenance',
  'battery',
  'environment',
] as const

const FAQPage = async () => {
  const t = await getTranslations('faqPage')

  const sections = sectionKeys.map(key => {
    const itemKeys = [
      ...Object.keys(
        (t.raw(`sections.${key}.items`) as Record<string, unknown>) ?? {}
      ),
    ]

    return {
      key,
      eyebrow: t(`sections.${key}.eyebrow`),
      title: t(`sections.${key}.title`),
      description: t(`sections.${key}.description`),
      items: itemKeys.map(itemKey => ({
        question: t(`sections.${key}.items.${itemKey}.question`),
        answer: t(`sections.${key}.items.${itemKey}.answer`),
      })),
    }
  })

  const allFaqItems = sections.flatMap(s => s.items)

  return (
    <>
      <JsonLd data={buildFAQPageJsonLd(allFaqItems)} />
      <div className="pb-[40px]">
        <PageHero title={t('hero.title')} />
        {sections.map(section => (
          <FAQAccordionSection
            key={section.key}
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
            items={section.items}
          />
        ))}
      </div>
    </>
  )
}

export default FAQPage
