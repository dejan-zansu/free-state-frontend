
import { getTranslations } from 'next-intl/server'
import { CheckIcon, CloseIcon } from './icons'

const SolarAboHomeRightForYou = async () => {
  const t = await getTranslations('solarAboHome.rightForYou')

  const idealFor = [
    t('idealFor.singleFamily'),
    t('idealFor.predictableCosts'),
    t('idealFor.noUpfront'),
    t('idealFor.noMaintenance'),
  ]

  const notIdealFor = [
    t('notIdealFor.batteryStorage'),
    t('notIdealFor.commercial'),
  ]

  return (
    <section className='relative w-full py-16 sm:py-20 lg:py-24 bg-white'>
      <div className='max-w-[1220px] mx-auto px-4 sm:px-6'>
        {/* Header */}
        <div className='flex flex-col mb-12 sm:mb-16 lg:mb-16'>
          <h2 className='text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium text-left'>
            {t('title')}
          </h2>
        </div>

        {/* Cards Container */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-[1200px] mx-auto'>
          {/* Ideal For Card */}
          <div className='bg-[#B7FE1A] rounded-2xl p-6 sm:p-8 lg:p-10'>
            <h3 className='text-[#062E25] text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8'>
              {t('idealForTitle')}
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
              {idealFor.map((item, index) => (
                <div key={index} className='flex items-start gap-3'>
                  <CheckIcon />
                  <p className='text-[#062E25] text-base sm:text-lg font-normal'>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Not Ideal For Card */}
          <div className='bg-white border border-[#062E25] rounded-2xl p-6 sm:p-8 lg:p-10'>
            <h3 className='text-[#062E25] text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 line-through decoration-thickness-[0.5px] decoration-opacity-40'>
              {t('notIdealForTitle')}
            </h3>
            <div className='flex flex-col gap-4 sm:gap-5'>
              {notIdealFor.map((item, index) => (
                <div key={index} className='flex items-start gap-3'>
                  <CloseIcon />
                  <p className='text-[#062E25] text-base sm:text-lg font-normal'>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarAboHomeRightForYou
