import { useTranslations } from 'next-intl'

const milestones = [
  { key: 'founding', year: '2008' },
  { key: 'firstProjects', year: '2010' },
  { key: 'batteryStorage', year: '2014' },
  { key: 'techProgress', year: '2016–2019' },
  { key: 'newEra', year: '2020–2022' },
]

const Timeline = () => {
  const t = useTranslations('history.timeline')

  return (
    <section
      className="relative w-full py-12 lg:py-[50px]"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-16">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[562px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {milestones.map((m, i) => (
            <div
              key={m.key}
              className={`bg-[#D9D9D9] rounded-none h-[280px] sm:h-[363px] ${i % 2 !== 0 ? 'mt-6' : ''}`}
            />
          ))}
        </div>

        <div className="relative mt-8 mb-8">
          <div className="absolute top-[7px] left-0 right-0 h-px bg-[#ABB9AD]" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {milestones.map((m) => (
              <div key={m.key} className="flex flex-col items-center relative">
                <div className="w-3.5 h-3.5 rounded-full bg-foreground relative z-10" />
                <span className="mt-3 text-foreground text-[22px] font-bold text-center">
                  {m.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {milestones.map((m) => (
            <div key={m.key} className="flex flex-col">
              <h3 className="text-foreground text-[22px] font-bold capitalize">
                {t(`${m.key}.title`)}
              </h3>
              <p className="mt-5 text-foreground/80 text-base font-light">
                {t(`${m.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Timeline
