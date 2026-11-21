import SolarModels from '@/components/SolarModels'
import type { CommercialSegmentKey } from '@/lib/commercial-solar-free'
import {
  CommercialBenefits,
  CommercialClosing,
  CommercialCommunitiesLink,
  CommercialCosts,
  CommercialFacts,
  CommercialFaq,
  CommercialFit,
  CommercialHero,
  CommercialIncluded,
  CommercialSegmentGrid,
  CommercialSteps,
} from './CommercialSolarFreeSections'

const CommercialSolarFreePage = ({
  segment,
}: {
  segment?: CommercialSegmentKey
}) => (
  <div className="w-full overflow-x-clip">
    <CommercialHero segment={segment} />
    {segment ? (
      <>
        <CommercialFacts segment={segment} />
        <CommercialBenefits segment={segment} />
      </>
    ) : (
      <>
        <CommercialSegmentGrid />
        <CommercialFacts />
      </>
    )}
    <CommercialSteps />
    <CommercialCosts />
    <CommercialIncluded segment={segment} />
    <CommercialFit segment={segment} />
    {segment === 'multiFamily' && <CommercialCommunitiesLink />}
    {!segment && <SolarModels isCommercial current="solar-free" flush />}
    <CommercialFaq segment={segment} />
    <CommercialClosing />
  </div>
)

export default CommercialSolarFreePage
