import { getTranslations } from 'next-intl/server'

const Stats = async () => {
  const t = await getTranslations('home.stats')

  const stats = [
    { value: '50+', label: t('experience') },
    { value: '500+', label: t('customers') },
    { value: '1.000+', label: t('installations') },
    { value: '35+', label: t('savings') },
  ]

  return (
    <section className='py-8 relative'>
      <div className='absolute inset-x-0 top-0 h-px bg-[linear-gradient(88.77deg,#062E25_79.4%,#036B53_158.2%)] opacity-20' />
      <div className='max-w-327.5 mx-auto'>
        <div className='flex items-center justify-between'>
          {stats
            .flatMap((stat, index) => [
              <div key={`stat-${index}`} className='text-center'>
                <div className='font-medium leading-none mb-4 text-foreground'>
                  <p className='lg:text-[80px]'>{stat.value}</p>
                </div>
                <div className='text-foreground'>
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
