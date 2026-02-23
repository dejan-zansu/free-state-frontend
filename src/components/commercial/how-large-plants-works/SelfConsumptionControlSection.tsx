import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import LightBulbWithPointerWiteBg from '@/components/icons/LightBulbWithPointerWiteBg'

const SelfConsumptionControlSection = async () => {
  const t = await getTranslations('howLargePlantsWorks')

  return (
    <section className="relative min-h-[507px] flex flex-col items-center justify-center overflow-hidden">
      <Image
        src="/images/commercial/how-large-plants-works/self-consumption-control-bg-197cac.png"
        alt=""
        fill
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(24deg, rgba(61, 56, 88, 0) 0%, rgba(79, 74, 109, 1) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)',
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center mb-10 md:mb-16">
          {t('selfConsumptionControl.title')}
        </h2>

        <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-[90px]">
          <div className="flex items-center gap-[13px]">
            <LightBulbWithPointerWiteBg className="shrink-0" />
            <div
              className="rounded-[20px] px-8 py-6 max-w-[443px]"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(26.4px)',
              }}
            >
              <p className="text-[#062E25]/80 text-lg md:text-xl font-normal tracking-[-0.02em]">
                {t('selfConsumptionControl.tip')}
              </p>
            </div>
          </div>

          <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em] lg:max-w-[577px]">
            {t('selfConsumptionControl.description')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default SelfConsumptionControlSection
