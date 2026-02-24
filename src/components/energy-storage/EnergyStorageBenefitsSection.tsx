import CheckIcon from '@/components/icons/CheckIcon'
import { getTranslations } from 'next-intl/server'

const benefitKeys = [
  'independentPower',
  'risingPrices',
  'emissionFree',
  'dayAndNight',
] as const

const EnergyStorageBenefitsSection = async () => {
  const t = await getTranslations('energyStorage')

  return (
    <section className="relative min-h-[455px] bg-[#4A9A99] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: `url('/images/energy-storage-benefits-bg.png')`,
        }}
      />

      <div className="relative z-10 mx-auto px-4 sm:px-6 py-12 md:py-[50px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl md:text-[45px] font-medium text-center">
            {t('benefits.title')}
          </h2>

          <div
            className="w-full rounded-[16px] p-8 md:p-10 backdrop-blur-[40px] max-w-[571px]"
            style={{
              background: 'rgba(185, 205, 191, 0.2)',
              border: '1px solid rgba(246, 246, 246, 0.4)',
            }}
          >
            <div className="flex flex-col gap-5">
              {benefitKeys.map(key => (
                <div key={key} className="flex items-center gap-[11px]">
                  <CheckIcon className="w-5 h-5 text-[#B7FE1A] shrink-0" />
                  <span className="text-white/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                    {t(`benefits.items.${key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EnergyStorageBenefitsSection
