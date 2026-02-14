import { getTranslations } from 'next-intl/server'
import LightBulbWithPointerWiteBg from '../icons/LightBulbWithPointerWiteBg'

const BatteryStorageSection = async () => {
  const t = await getTranslations('howItWorks')

  return (
    <section className="relative min-h-[507px] bg-[#4A9A99] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/optional-battery-storage-bg.png')`,
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-12 md:py-[50px]">
        <h2 className="text-white text-3xl md:text-[45px] font-medium leading-[1em] text-center mb-12 md:mb-[50px]">
          {t('batteryStorage.title')}
        </h2>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-[90px]">
          <p className="text-white/80 text-base md:text-[22px] leading-[1.27em] tracking-[-0.02em] text-justify max-w-[535px] font-light">
            {t('batteryStorage.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-[13px]">
            <LightBulbWithPointerWiteBg className="flex-shrink-0" />

            <div
              className="max-w-[527px] px-6 py-5 rounded-[20px] backdrop-blur-[26px]"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className="text-[#062E25]/80 text-base md:text-xl leading-[1.3em] tracking-[-0.02em]">
                {t('batteryStorage.infoCard')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BatteryStorageSection
