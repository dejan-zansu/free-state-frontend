import { getTranslations } from 'next-intl/server'

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    viewBox="0 0 25 24"
    fill="none"
    className="shrink-0"
  >
    <circle cx={12.5} cy={12} r={11.5} stroke="#B7FE1A" strokeWidth={0.57} />
    <path
      d="M9.5 15L15.5 9M15.5 9H10.5M15.5 9V14"
      stroke="#B7FE1A"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const features = ['1', '2', '3', '4', '5', '6'] as const

const WhyFreeStateSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  return (
    <section className="relative min-h-[843px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center rounded-t-[40px]"
        style={{
          backgroundImage: `url('/images/heat-pumps/how-it-works/why-freestate-bg-5c8aae.png')`,
        }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{
          background: 'rgba(168, 200, 193, 0.4)',
        }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{
          background: 'linear-gradient(0deg, rgba(7, 51, 42, 0) 0%, rgba(7, 51, 42, 1) 86%)',
        }}
      />

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('whyFreeState.title')}
          </h2>

          <div className="flex flex-col gap-5 w-full max-w-[652px]">
            {features.map((key) => (
              <div
                key={key}
                className="relative rounded-[16px] overflow-hidden"
              >
                <div
                  className="absolute inset-0 backdrop-blur-[70px]"
                  style={{
                    background: 'rgba(123, 135, 126, 0.32)',
                    border: '1px solid rgba(246, 246, 246, 0.4)',
                    borderRadius: '16px',
                  }}
                />
                <div className="relative z-10 flex items-center justify-between gap-[50px] p-[30px]">
                  <span className="text-white/80 text-lg font-normal tracking-[-0.02em]">
                    {t(`whyFreeState.features.${key}`)}
                  </span>
                  <ArrowIcon />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyFreeStateSection
