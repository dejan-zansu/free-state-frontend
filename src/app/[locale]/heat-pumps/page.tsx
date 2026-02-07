import HeatPumpsHero from '@/components/heat-pumps/HeatPumpsHero'
import HeatPumpsValueCreation from '@/components/heat-pumps/HeatPumpsValueCreation'
import HeatPumpsFeatures from '@/components/heat-pumps/HeatPumpsFeatures'
import HeatPumpsIntegratedSystems from '@/components/heat-pumps/HeatPumpsIntegratedSystems'
import HeatPumpsReliablePerformance from '@/components/heat-pumps/HeatPumpsReliablePerformance'

const HeatPumpsPage = () => {
  return (
    <div>
      <HeatPumpsHero />
      <HeatPumpsValueCreation />
      <HeatPumpsFeatures />
      <HeatPumpsIntegratedSystems />
      <HeatPumpsReliablePerformance />
    </div>
  )
}

export default HeatPumpsPage
