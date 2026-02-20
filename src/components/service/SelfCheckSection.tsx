import CheckIcon from '@/components/icons/CheckIcon'
import { getTranslations } from 'next-intl/server'

const itemKeys = ['yield', 'panels'] as const

const SelfCheckSection = async () => {
  const t = await getTranslations('service')

  return (
    <section className="relative w-full min-h-[677px] overflow-hidden bg-[#4A9A99]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/service/service-self-check-bg-3654ad.png')" }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)',
          opacity: 0.2,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(0deg, rgba(74, 154, 153, 0) 9%, rgba(74, 154, 153, 1) 100%)',
        }}
      />

      <div className="relative z-10 max-w-[675px] mx-auto px-4 sm:px-6 pt-[100px] pb-[60px]">
        <div className="flex flex-col items-center gap-[30px]">
          <div className="flex flex-col items-center gap-5 max-w-[634px]">
            <h2 className="text-white text-3xl md:text-[45px] font-medium leading-[1em] text-center">
              {t('selfCheck.title')}
            </h2>
            <p className="text-white/80 text-base md:text-[22px] font-light tracking-[-0.02em] text-center">
              {t('selfCheck.description')}
            </p>
          </div>

          <div className="relative w-full">
            <div
              className="absolute inset-0 rounded-[16px]"
              style={{
                background: 'rgba(185, 205, 191, 0.2)',
                border: '1px solid rgba(246, 246, 246, 0.4)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-[30px] px-6 sm:px-10 py-10">
              <h3 className="text-white/80 text-xl md:text-[26px] font-bold tracking-[-0.02em] text-center">
                {t('selfCheck.yieldMonitoring')}
              </h3>

              <div className="flex flex-col gap-5 w-full">
                {itemKeys.map(key => (
                  <div key={key} className="flex gap-3 items-start">
                    <CheckIcon className="w-5 h-5 text-[#B7FE1A] shrink-0 mt-1" />
                    <span className="text-white/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                      {t(`selfCheck.items.${key}`)}
                    </span>
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

export default SelfCheckSection
