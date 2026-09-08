import CheckIcon from '@/components/icons/CheckIcon'
import { chf, type CostFigures } from '@/lib/pricing/public-cost-figures'
import { getTranslations } from 'next-intl/server'

const includedKeys = [
  'modules',
  'inverter',
  'battery',
  'mounting',
  'electrical',
  'commissioning',
  'registration',
  'monitoring',
] as const

const driverKeys = ['size', 'battery', 'brand', 'roof', 'access'] as const

interface CostIncludedSectionProps {
  figures: CostFigures
}

const CostIncludedSection = async ({ figures }: CostIncludedSectionProps) => {
  const t = await getTranslations('cost')

  return (
    <section className="relative bg-[#EAEDDF] overflow-hidden">
      <div className="max-w-[1214px] mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-20 items-start">
          <div className="flex flex-col gap-5 lg:sticky lg:top-28">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1.05]">
              {t('included.title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg md:text-[22px] leading-[1.3] tracking-[-0.02em]">
              {t('included.subtitle')}
            </p>
            <p className="text-[#062E25]/60 text-sm font-light leading-[1.4]">
              {t('included.note')}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {includedKeys.map(key => (
                <li key={key} className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 mt-1 text-[#036B53] shrink-0" />
                  <div>
                    <span className="block text-[#062E25] text-base md:text-lg font-medium">
                      {t(`included.items.${key}.title`)}
                    </span>
                    <span className="block text-[#062E25]/70 text-sm md:text-base font-light">
                      {t(`included.items.${key}.description`)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {figures.evChargerChf !== null && (
              <div className="rounded-[20px] border border-dashed border-[#062E25]/40 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[#062E25] text-base md:text-lg font-medium">
                  {t('included.optional.evCharger')}
                </span>
                <span className="text-[#062E25] text-base md:text-lg tabular-nums">
                  {t('included.optional.evChargerPrice', {
                    price: chf(figures.evChargerChf),
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <h3 className="text-[#062E25] text-2xl md:text-[32px] font-medium leading-[1.1] mb-8">
            {t('drivers.title')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {driverKeys.map((key, index) => (
              <div
                key={key}
                className="rounded-[20px] bg-[#F2F4E8] border border-[#809792]/60 p-6 flex flex-col gap-3"
              >
                <span className="text-[#036B53] text-sm font-medium tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[#062E25] text-lg font-semibold leading-[1.15]">
                  {t(`drivers.cards.${key}.title`)}
                </span>
                <span className="text-[#062E25]/70 text-sm md:text-base font-light leading-[1.35]">
                  {t(`drivers.cards.${key}.description`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CostIncludedSection
