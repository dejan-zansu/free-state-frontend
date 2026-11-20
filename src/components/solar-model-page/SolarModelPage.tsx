import RoofFaq from '@/components/roof-renovation/RoofFaq'
import { QuoteRequestForm } from '@/components/solar-abo'
import SolarModels from '@/components/SolarModels'
import { SOLAR_MODELS, type SolarModelKey } from '@/lib/solar-models'
import { getTranslations } from 'next-intl/server'
import {
  SolarModelCostsSection,
  SolarModelFactsSection,
  SolarModelFitSection,
  SolarModelHero,
  SolarModelIncludedSection,
  SolarModelStepsSection,
} from './SolarModelPageSections'

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6'] as const

const SolarModelPage = async ({
  model,
  locale,
}: {
  model: SolarModelKey
  locale: string
}) => {
  const definition = SOLAR_MODELS[model]
  const key = definition.messageKey
  const tForm = await getTranslations(`solarModelPage.${key}.form`)

  return (
    <div className="w-full overflow-x-clip">
      <SolarModelHero model={model} />
      <SolarModelFactsSection model={model} />
      <SolarModelStepsSection model={model} />
      <SolarModelCostsSection model={model} />
      <SolarModelIncludedSection model={model} />
      <SolarModelFitSection model={model} />
      <SolarModels current={model} flush />
      <RoofFaq namespace={`solarModelPage.${key}.faq`} keys={FAQ_KEYS} />
      <QuoteRequestForm
        id="anfrage"
        source={definition.quoteSource}
        locale={locale}
        eyebrow={tForm('eyebrow')}
        title={tForm('title')}
        subtitle={tForm('subtitle')}
      />
    </div>
  )
}

export default SolarModelPage
