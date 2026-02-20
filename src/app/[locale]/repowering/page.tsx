import PageHero from '@/components/PageHero'
import CustomerBenefitsSection from '@/components/repowering/CustomerBenefitsSection'
import RepoweringCtaSection from '@/components/repowering/RepoweringCtaSection'
import RepoweringQuoteFormSection from '@/components/repowering/RepoweringQuoteFormSection'
import RepoweringServicesSection from '@/components/repowering/RepoweringServicesSection'
import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const RepoweringPage = async () => {
  const t = await getTranslations('repowering')

  return (
    <main>
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
      <RepoweringQuoteFormSection />
    </main>
  )
}

export default RepoweringPage
