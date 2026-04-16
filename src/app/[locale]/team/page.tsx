import PageHero from '@/components/PageHero'
import TeamGrid from '@/components/team/TeamGrid'
import TeamPartners from '@/components/team/TeamPartners'
import ValuesSection from '@/components/team/ValuesSection'
import { LinkButton } from '@/components/ui/link-button'
import { useTranslations } from 'next-intl'

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
