import { getTranslations } from 'next-intl/server'
import SolarAboCard from '../SolarAboCard'

export interface SolarAboIncludesProps {
  translationNamespace: string
  showBatteryStorage?: boolean
  showBillingPlatform?: boolean
  items: {
    image: string
    title: string
    subtitle: string
  }[]
}

const SolarAboIncludes = async ({
  translationNamespace,
  showBatteryStorage = false,
  showBillingPlatform = false,
  items,
}: SolarAboIncludesProps) => {
  const t = await getTranslations(translationNamespace)
  console.log(items)

  if (showBatteryStorage) {
    items.push({
      image: '/images/illustrations/battery-storage.png',
      title: t('includes.items.batteryStorage.title'),
      subtitle: t('includes.items.batteryStorage.subtitle'),
    })
  }

  if (showBillingPlatform) {
    items.push({
      image: '/images/illustrations/billing-platform.png',
      title: t('includes.items.billingPlatform.title'),
      subtitle: t('includes.items.billingPlatform.subtitle'),
    })
  }

  return (
    <section
      className="relative py-16 sm:pt-16 bg-[#E8EADD]"
      style={{ borderRadius: '70px 70px 0 0' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px]">
        <div className="mb-12 sm:mb-14">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1em] mb-5">
            {t('includes.title')}
          </h2>
          <p className="text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-[1.36em] tracking-[-0.02em] max-w-[320px]">
            {t('includes.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-5 justify-center">
          {items.map((item, index) => (
            <SolarAboCard
              key={index}
              image={item.image}
              imageAlt={item.title}
              title={item.title}
              subtitle={item.subtitle}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolarAboIncludes
