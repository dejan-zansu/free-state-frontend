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
    <section className='bg-solar py-5'>
      <div className='max-w-[1310px] mx-auto px-6'>
        <div className='flex items-center justify-between'>
          {stats.map((stat, index) => (
            <div key={index} className='text-center'>
              <p className='text-foreground text-[56px] lg:text-[70px] font-medium leading-none mb-2'>
                {stat.value}
                {stat.suffix}
              </p>
              <p className='text-foreground text-base lg:text-lg'>
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
