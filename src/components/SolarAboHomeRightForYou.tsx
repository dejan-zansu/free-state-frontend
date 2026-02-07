import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import { CheckIcon, CloseIcon } from './icons'

interface SolarAboHomeRightForYouProps {
  commercial?: boolean
  translationKey?: string
}

const SolarAboHomeRightForYou = async ({
  commercial = false,
  translationKey = 'solarAboHome.rightForYou',
}: SolarAboHomeRightForYouProps) => {
  const t = await getTranslations(translationKey)

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
    <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col mb-12 sm:mb-16 lg:mb-16">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium text-left">
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-[1200px] mx-auto">
          <div
            className={cn(
              'rounded-2xl p-6 sm:p-8 lg:p-10',
              commercial ? 'bg-[#9F3E4F]' : 'bg-[#B7FE1A]'
            )}
          >
            <h3
              className={cn(
                'text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8',
                commercial ? 'text-white' : 'text-[#062E25]'
              )}
            >
              {t('idealForTitle')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {idealFor.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    commercial ? 'text-white' : 'text-[#295823]'
                  )}
                >
                  <CheckIcon className="shrink-0 mt-0.5" />
                  <p
                    className={cn(
                      'text-base sm:text-lg font-normal',
                      commercial ? 'text-white/80' : 'text-[#062E25]'
                    )}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              'border border-[#062E25] rounded-2xl p-6 sm:p-8 lg:p-10',
              commercial ? 'bg-[#F3F4EE]' : 'bg-white'
            )}
          >
            <h3 className="text-[#062E25] text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 line-through decoration-thickness-[0.5px] decoration-opacity-40">
              {t('notIdealForTitle')}
            </h3>
            <div className="flex flex-col gap-4 sm:gap-5 text-[#062E25]">
              {notIdealFor.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CloseIcon className="shrink-0 mt-0.5" />
                  <p className="text-[#062E25]/80 text-base sm:text-lg font-normal">
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
