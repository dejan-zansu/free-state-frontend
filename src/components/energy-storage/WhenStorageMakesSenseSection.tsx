import LightBulbWithPointerIcon from '@/components/icons/LightBulbWithPointer'
import { getTranslations } from 'next-intl/server'

const WhenStorageMakesSenseSection = async () => {
  const t = await getTranslations('energyStorage')

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-20 py-12 md:py-[50px]">
        <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center mb-12 md:mb-[50px]">
          {t('whenMakesSense.title')}
        </h2>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-[90px]">
          <p className="text-[#062E25]/80 text-base md:text-[22px] font-light leading-[1.27em] tracking-[-0.02em] text-justify max-w-[535px]">
            {t('whenMakesSense.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-[13px]">
            <div className="shrink-0">
              <LightBulbWithPointerIcon />
            </div>

            <div
              className="max-w-[360px] px-[30px] py-[22px] rounded-[20px] backdrop-blur-[26px]"
              style={{
                background: '#E1E9DE',
                border: '1px solid rgba(255, 255, 255, 0.7)',
              }}
            >
              <p className="text-[#062E25]/80 text-base md:text-xl leading-[1.3em] tracking-[-0.02em]">
                {t('whenMakesSense.infoCard')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default WhenStorageMakesSenseSection
