import Partners from '@/components/Partners'
import InvestorsFAQ from '@/components/InvestorsFAQ'
import InvestorsForm from '@/components/InvestorsForm'
import InvestorsHero from '@/components/InvestorsHero'
import InvestorsInvesting from '@/components/InvestorsInvesting'

const InvestorsPage = async () => {
  return (
    <main>
      <InvestorsHero />

      <InvestorsInvesting />

      <InvestorsForm />

      <InvestorsFAQ />

      <Partners />
    </main>
  )
}

export default InvestorsPage
