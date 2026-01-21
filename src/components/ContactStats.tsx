import { getTranslations } from 'next-intl/server'

const ContactStats = async () => {
  const t = await getTranslations('contactStats')

  const stats = [
    { value: '50', suffix: '+', label: t('experience') },
    { value: '500', suffix: '+', label: t('customers') },
    { value: '1.000', suffix: '+', label: t('installations') },
    { value: '35', suffix: '+', label: t('savings') },
  ]

  return (
    <section className='bg-solar py-8 lg:py-5'>
      <div className='max-w-[1310px] mx-auto px-6'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:flex lg:items-center lg:justify-between'>
          {stats.map((stat, index) => (
            <div key={index} className='text-center'>
              <p className='text-foreground text-[40px] md:text-[56px] lg:text-[70px] font-medium leading-none mb-2'>
                {stat.value}
                {stat.suffix}
              </p>
              <p className='text-foreground text-sm md:text-base lg:text-lg'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ContactStats
