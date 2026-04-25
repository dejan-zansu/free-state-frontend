import PageHero from '@/components/PageHero'
import TeamGrid from '@/components/team/TeamGrid'
import TeamPartners from '@/components/team/TeamPartners'
import ValuesSection from '@/components/team/ValuesSection'
import { LinkButton } from '@/components/ui/link-button'
import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
    pathname: '/team',
    title: t('team.title') || '',
    description: t('team.description') || '',
  })
}

const TeamPage = () => {
  const t = useTranslations('team')
  return (
    <div>
      <PageHero
        backgroundImage="/images/team-hero-bg.png"
        title={t('hero.title')}
        description={t('hero.description')}
      >
        <div className="mt-8">
          <LinkButton variant="primary" href="/contact">
            {t('hero.cta')}
          </LinkButton>
        </div>
      </PageHero>

      <TeamGrid />
      <ValuesSection />
      <TeamPartners />
    </div>
  )
}
export default TeamPage
