import PageHero from '@/components/PageHero'
import CustomerBenefitsSection from '@/components/repowering/CustomerBenefitsSection'
import RepoweringCtaSection from '@/components/repowering/RepoweringCtaSection'
import RepoweringFAQSection from '@/components/repowering/RepoweringFAQSection'
import RepoweringQuoteFormSection from '@/components/repowering/RepoweringQuoteFormSection'
import RepoweringServicesSection from '@/components/repowering/RepoweringServicesSection'
import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/repowering',
    title: t('repowering.title') || '',
    description: t('repowering.description') || '',
  })
}

const RepoweringPage = async () => {
  const t = await getTranslations('repowering')

  return (
    <div>
      <PageHero
        backgroundImage="/images/repowering-hero-bg.png"
        title={t('hero.title')}
        description={t('hero.description')}
      >
        <div className="mt-8">
          <LinkButton variant="primary" href="/contact">
            {t('hero.cta')}
          </LinkButton>
        </div>
      </PageHero>

      <RepoweringCtaSection />
      <CustomerBenefitsSection />
      <RepoweringServicesSection />
      <RepoweringFAQSection />
      <RepoweringQuoteFormSection />
    </div>
  )
}

export default RepoweringPage
