import { getTranslations } from 'next-intl/server'

const Stats = async () => {
  const t = await getTranslations('home.stats')

  const stats = [
    { value: '59', label: t('projects'), suffix: '+' },
    { value: '16', label: t('experience') },
    { value: '13', label: t('savings'), sublabel: '-0.13 Rappen / kWh' },
    { value: '20', label: t('employees') },
  ]

  return (
    <section className="py-8 relative">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          {stats
            .flatMap((stat, index) => [
              <div
                key={`stat-${index}`}
                className="text-center flex-1 w-full sm:w-auto"
              >
                <div className="font-medium leading-none mb-3 sm:mb-4 text-foreground">
                  <p className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px]">
                    {stat.value}
                    {stat.suffix && <span>{stat.suffix}</span>}
                  </p>
                </div>
                <div className="text-foreground">
                  {stat.sublabel && (
                    <p className="text-xs sm:text-sm mb-1">{stat.sublabel}</p>
                  )}
                  <p className="text-sm sm:text-base">{stat.label}</p>
                </div>
              </div>,
              index < stats.length - 1 && (
                <div
                  key={`separator-${index}`}
                  className="hidden sm:block h-20 w-px bg-[linear-gradient(88.77deg,#062E25_79.4%,#036B53_158.2%)] opacity-10 shrink-0"
                />
              ),
            ])
            .filter(Boolean)}
        </div>
      </div>
    </section>
  )
}

export default Stats
