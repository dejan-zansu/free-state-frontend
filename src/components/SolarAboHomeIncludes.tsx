import { getTranslations } from 'next-intl/server'
import SolarAboCard from './SolarAboCard'

interface SolarAboHomeIncludesProps {
  showBatteryStorage?: boolean
}

const SolarAboHomeIncludes = async ({ showBatteryStorage = false }: SolarAboHomeIncludesProps = {}) => {
  const t = await getTranslations('solarAboHome.includes')

  const items = [
    {
      image: '/images/illustrations/solar-modules.png',
      title: t('items.solarModules.title'),
      subtitle: t('items.solarModules.subtitle'),
    },
    {
      image: '/images/illustrations/inverter.png',
      title: t('items.inverter.title'),
      subtitle: t('items.inverter.subtitle'),
    },
    {
      image: '/images/illustrations/monitoring-app.png',
      title: t('items.monitoringApp.title'),
      subtitle: t('items.monitoringApp.subtitle'),
    },
    {
      image: '/images/illustrations/installation.png',
      title: t('items.installation.title'),
      subtitle: t('items.installation.subtitle'),
    },
    {
      image: '/images/illustrations/service-insurance.png',
      title: t('items.serviceInsurance.title'),
      subtitle: t('items.serviceInsurance.subtitle'),
    },
  ]

  if (showBatteryStorage) {
    items.push({
      image: '/images/illustrations/battery-storage.png',
      title: t('items.batteryStorage.title'),
      subtitle: t('items.batteryStorage.subtitle'),
    })
  }

  return (
    <section
      className='relative py-16 sm:pt-16 bg-[#E8EADD]'
      style={{ borderRadius: '70px 70px 0 0' }}
    >
      <div className='max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px]'>
      
        <div className='mb-12 sm:mb-14 max-w-[320px]'>
          <h2 className='text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1em] mb-5'>
            {t('title')}
          </h2>
          <p className='text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-[1.36em] tracking-[-0.02em]'>
            {t('subtitle')}
          </p>
        </div>

      
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 justify-items-center'>
          {items.map((item, index) => (
            <SolarAboCard
              key={index}
              image={item.image}
              imageAlt={item.title}
              title={item.title}
              subtitle={item.subtitle}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolarAboHomeIncludes
