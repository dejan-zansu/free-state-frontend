import HeatPumpsCTA from '@/components/heat-pumps/HeatPumpsCTA'
import HeatPumpsFeatures from '@/components/heat-pumps/HeatPumpsFeatures'
import HeatPumpsHero from '@/components/heat-pumps/HeatPumpsHero'
import HeatPumpsIntegratedSystems from '@/components/heat-pumps/HeatPumpsIntegratedSystems'
import HeatPumpsReliablePerformance from '@/components/heat-pumps/HeatPumpsReliablePerformance'
import HeatPumpsSolutions from '@/components/heat-pumps/HeatPumpsSolutions'
import HeatPumpsValueCreation from '@/components/heat-pumps/HeatPumpsValueCreation'

const HeatPumpsPage = () => {
  return (
    <div>
      <HeatPumpsHero />
      <HeatPumpsValueCreation />
      <HeatPumpsFeatures />
      <HeatPumpsIntegratedSystems />
      <HeatPumpsReliablePerformance />
      <HeatPumpsSolutions />
      <HeatPumpsCTA />
    </div>
  )
}

export default HeatPumpsPage
