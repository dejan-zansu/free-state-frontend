import PageHero from '@/components/PageHero'
import FAQAccordionSection from '@/components/faq/FAQAccordionSection'
import { getTranslations } from 'next-intl/server'

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

  const sections = sectionKeys.map((key) => {
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
      items: itemKeys.map((itemKey) => ({
        question: t(`sections.${key}.items.${itemKey}.question`),
        answer: t(`sections.${key}.items.${itemKey}.answer`),
      })),
    }
  })

  return (
    <main>
      <PageHero title={t('hero.title')} />
      {sections.map((section) => (
        <FAQAccordionSection
          key={section.key}
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          items={section.items}
        />
      ))}
    </main>
  )
}

export default FAQPage
