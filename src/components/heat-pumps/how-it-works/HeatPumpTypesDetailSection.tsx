import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

const cards = ['1', '2', '3'] as const

const HeatPumpTypesDetailSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  return (
    <section className="relative min-h-[790px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/heat-pumps/how-it-works/heat-pump-types-bg-4962ac.png')`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(0deg, rgba(74, 154, 153, 0) 0%, rgba(74, 154, 153, 1) 78%),
            linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 130%)
          `,
        }}
      />

      <div className="relative z-10 max-w-[571px] mx-auto px-4 sm:px-6 py-12 md:py-[50px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl md:text-[45px] font-medium text-center">
            {t('heatPumpTypesDetail.title')}
          </h2>

          <div className="flex flex-col items-center gap-5 w-full">
            {cards.map(key => (
              <div
                key={key}
                className={cn('w-fit rounded-[16px] p-10 backdrop-blur-[40px]', key === '2' && 'max-w-[490px]')}
                style={{
                  background: 'rgba(185, 205, 191, 0.2)',
                  border: '1px solid rgba(246, 246, 246, 0.4)',
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <p className="text-white text-lg md:text-[22px] font-semibold">
                    {t(`heatPumpTypesDetail.cards.${key}.title`)}
                  </p>
                  <p className="text-white/70 text-base md:text-lg font-medium">
                    {t(`heatPumpTypesDetail.cards.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeatPumpTypesDetailSection
