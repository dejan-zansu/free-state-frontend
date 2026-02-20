import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const WhySolarCarportSection = async () => {
  const t = await getTranslations('solarSystemCarport')

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div className="absolute -top-[224px] right-[-17px] w-[374px] h-[374px] rounded-full bg-[#B7FE1A] blur-[490px]" />
      <div className="absolute -top-[256px] right-[24px] w-[291px] h-[291px] rounded-full bg-[#B7FE1A] blur-[170px]" />

      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 h-[300px] sm:h-[400px] lg:h-[640px]">
          <Image
            src="/images/why-solar-system-on-carport.png"
            alt={t('whySolarCarport.title')}
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(0deg, rgba(255, 255, 255, 0) 62%, rgba(255, 255, 255, 1) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center w-full lg:w-1/2 py-12 lg:py-[103px] px-4 sm:px-8">
          <div className="flex flex-col items-center gap-5 max-w-[535px]">
            <span className="inline-flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white/30 bg-white/20 backdrop-blur-[65px] text-white text-base font-light">
              {t('whySolarCarport.eyebrow')}
            </span>
            <h2 className="text-white text-3xl sm:text-4xl md:text-[65px] font-medium text-center">
              {t('whySolarCarport.title')}
            </h2>
            <p className="text-white/80 text-lg md:text-[22px] font-light text-center lg:text-justify">
              {t('whySolarCarport.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/60" />
    </section>
  )
}

export default WhySolarCarportSection
