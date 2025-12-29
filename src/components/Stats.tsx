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
    <section className='pb-8 relative'>
      <div className='max-w-327.5 mx-auto'>
        <div className='flex items-center justify-between'>
          {stats
            .flatMap((stat, index) => [
              <div key={`stat-${index}`} className='text-center'>
                <div className='font-medium leading-none mb-4 text-foreground'>
                  <p className='lg:text-[80px]'>
                    {stat.value}
                    {stat.suffix && <span>{stat.suffix}</span>}
                  </p>
                </div>
                <div className='text-foreground'>
                  {stat.sublabel && (
                    <p className='text-sm mb-1'>{stat.sublabel}</p>
                  )}
                  <p>{stat.label}</p>
                </div>
              </div>,
              index < stats.length - 1 && (
                <div
                  key={`separator-${index}`}
                  className='h-20 w-px bg-[linear-gradient(88.77deg,#062E25_79.4%,#036B53_158.2%)] opacity-10 shrink-0'
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
