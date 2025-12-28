import { getTranslations } from 'next-intl/server'

const ForBusinesses = async () => {
  const t = await getTranslations('home.forBusinesses')

  const items = [
    {
      title: t('item1.title'),
      description: t('item1.description'),
    },
    {
      title: t('item2.title'),
      description: t('item2.description'),
    },
  ]

  return (
    <section className='relative pt-24'>
      <h2 className='text-foreground text-5xl font-semibold mb-14 text-center'>
        {t('title')}
      </h2>
      <div className='relative min-h-[600px] flex flex-col items-center justify-center overflow-hidden py-24'>
        <div className='absolute inset-0 z-0'>
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{
              backgroundImage: "url('/images/solar-farm.png')",
            }}
          />
        </div>

        <div className='relative z-10 max-w-[580px] mx-auto px-6 w-full'>
          <div className='relative'>
            <div
              className='absolute inset-0 rounded-[20px]'
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(13.2px)',
                WebkitBackdropFilter: 'blur(13.2px)',
              }}
            />
            <div className='relative z-10 px-8 py-10'>
              <div className='mb-8'>
                <h2 className='text-white text-4xl font-semibold mb-4'>
                  {t('contentTitle')}
                </h2>
                <p className='text-white/80 text-xl font-light max-w-2xl mx-auto'>
                  {t('description')}
                </p>
              </div>

              <div className='flex flex-row gap-6'>
                {items.map((item, index) => (
                  <div key={index} className='flex-1'>
                    <h3 className='text-white text-2xl font-semibold mb-3'>
                      {item.title}
                    </h3>
                    <p className='text-white/80 text-lg font-light italic'>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForBusinesses
