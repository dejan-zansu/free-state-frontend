import { getTranslations } from 'next-intl/server'

const Stats = async () => {
  const t = await getTranslations('home.stats')

  const stats = [
    { value: 'CHF 0', label: t('downPayment') },
    { value: '18', sublabel: 'Rp/kWh', label: t('solarPrice') },
    { value: '2008', label: t('experienceSince') },
    { value: '3', sublabel: 'Schaffhausen · Zürich · St. Gallen', label: t('locations') },
  ]

  return (
    <section className="py-8 relative">
      <div className="mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          {stats
            .flatMap((stat, index) => [
              <div
                key={`stat-${index}`}
                className="text-center flex-1 w-full sm:w-auto"
              >
                <div className="font-medium leading-none mb-3 sm:mb-4 text-foreground">
                  <p className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px]">
                    {stat.value}
                  </p>
                </div>
                <div className="text-foreground">
                  {stat.sublabel && (
                    <p className="text-sm sm:text-sm mb-1">{stat.sublabel}</p>
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
