import ContactCTA from '@/components/ContactCTA'
import ContactFormSection from '@/components/ContactFormSection'
import ContactValues from '@/components/ContactValues'
import ContactMap from '@/components/ContactMap'
import PageHero from '@/components/PageHero'
import { LinkButton } from '@/components/ui/link-button'
import { COMPANY_MAIN_PHONE_TEL_HREF } from '@/lib/company-contact'
import { getTranslations } from 'next-intl/server'

const ContactPage = async () => {
  const t = await getTranslations('contactHero')

  return (
    <div className="relative bg-background">
      <PageHero
        title={t('title')}
        description={t('subtitle')}
        titleClassName="normal-case max-w-[920px]"
        descriptionClassName="max-w-[720px] text-balance"
        backgroundImage="/images/contact-hero-bg.png"
      >
        <div className="mt-8">
          <LinkButton
            href={COMPANY_MAIN_PHONE_TEL_HREF}
            variant="outline-secondary"
            className="bg-transparent"
          >
            {t('cta')}
          </LinkButton>
        </div>
      </PageHero>
      <ContactCTA />
      <ContactValues />
      <ContactFormSection />
      <div className="-mt-[40px]">
        <ContactMap />
      </div>
    </div>
  )
}

export default ContactPage
