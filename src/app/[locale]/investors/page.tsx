import CustomerStories from '@/components/CustomerStories'
import InvestorsForm from '@/components/InvestorsForm'
import InvestorsFormDarkPanel from '@/components/InvestorsFormDarkPanel'
import InvestorsPartnerSection from '@/components/InvestorsPartnerSection'
import PageHero from '@/components/PageHero'
import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const InvestorsPage = async () => {
  const t = await getTranslations('investorsPage')

  return (
    <div>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/investors-page-hero.png"
          title={t('title')}
          description={t('subtitle')}
          contentClassName="items-start text-left"
          descriptionClassName="max-w-[600px]"
        >
          <div className="mt-8">
            <LinkButton
              href="/contact"
              variant="outline-secondary"
              className="bg-transparent"
            >
              {t('heroCta')}
            </LinkButton>
          </div>
        </PageHero>
      </div>

      <section
        className="relative w-full overflow-hidden -mt-[40px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row min-h-[859px]">
          <div className="w-full lg:w-1/2 lg:max-w-[720px]">
            <InvestorsPartnerSection />
          </div>
          <div
            className="w-full lg:w-1/2 lg:max-w-[720px] min-h-[400px] lg:min-h-[889px] bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/investors-partner-hero-6656e3.webp')",
            }}
          />
        </div>
      </section>

      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row min-h-[859px]">
          <div className="flex-1 flex items-start justify-center px-4 sm:px-6 lg:px-0 py-12 lg:py-[58px]">
            <div className="w-full max-w-[536px] lg:ml-auto lg:mr-[52px]">
              <InvestorsForm />
            </div>
          </div>
          <div className="w-full lg:w-1/2 lg:max-w-[720px]">
            <InvestorsFormDarkPanel />
          </div>
        </div>
      </section>

      <CustomerStories />
    </div>
  )
}

export default InvestorsPage
