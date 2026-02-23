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
            linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-[#B9CF70]/20" />

      <div className="relative z-10 max-w-[571px] mx-auto px-4 sm:px-6 py-12 md:py-[50px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl md:text-[45px] font-medium text-center">
            {t('heatPumpTypesDetail.title')}
          </h2>

          <div className="flex flex-col items-center gap-5 w-full">
            {cards.map((key) => (
              <div
                key={key}
                className="w-full rounded-[16px] p-10 backdrop-blur-[40px]"
                style={{
                  background: 'rgba(185, 205, 191, 0.2)',
                  border: '1px solid rgba(246, 246, 246, 0.4)',
                }}
              >
                <p className="text-white/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
                  {t(`heatPumpTypesDetail.cards.${key}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeatPumpTypesDetailSection
