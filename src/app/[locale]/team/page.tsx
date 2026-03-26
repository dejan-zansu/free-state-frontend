import PageHero from '@/components/PageHero'
import TeamGrid from '@/components/team/TeamGrid'
import TeamPartners from '@/components/team/TeamPartners'
import ValuesSection from '@/components/team/ValuesSection'

const TeamPage = () => {
  return (
    <main>
      <PageHero
        backgroundImage="/images/team-page-hero.png"
        title="Unternehmen"
        description="Team"
      />

      <TeamGrid />
      <ValuesSection />
      <TeamPartners />
    </main>
  )
}

export default TeamPage
