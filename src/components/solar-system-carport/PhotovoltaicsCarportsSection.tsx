import { CheckIcon } from '@/components/icons'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const PhotovoltaicsCarportsSection = async () => {
  const t = await getTranslations('solarSystemCarport')

  const bullets = [
    t('photovoltaicsCarports.card.efficientEnergy'),
    t('photovoltaicsCarports.card.lowInvestment'),
    t('photovoltaicsCarports.card.easyAccess'),
  ]

  return (
    <section className="relative min-h-[609px] flex items-center justify-center overflow-hidden py-12 md:py-[50px] px-4 md:px-[164px]">
      <div className="absolute inset-0">
        <Image
          src="/images/photovoltaics-and-carports-bg.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(74, 154, 153, 0) 9%, rgba(74, 154, 153, 1) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-[30px] max-w-[1112px] w-full">
        <div className="flex flex-col items-center gap-5 w-full">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('photovoltaicsCarports.title')}
          </h2>

          <p className="text-white/80 text-lg md:text-[22px] font-light text-center max-w-[672px]">
            {t('photovoltaicsCarports.description')}
          </p>
        </div>

        <div className="bg-[rgba(185,205,191,0.2)] border border-[rgba(246,246,246,0.4)] backdrop-blur-[40px] rounded-2xl px-6 md:px-[57px] py-8 md:py-10 max-w-[675px] w-full">
          <div className="flex flex-col items-center gap-[30px]">
            <p className="text-white/80 text-xl md:text-[26px] font-bold text-center">
              {t('photovoltaicsCarports.card.title')}
            </p>

            <div className="flex flex-col gap-5">
              {bullets.map((item, index) => (
                <div key={index} className="flex items-center gap-[10px]">
                  <CheckIcon className="w-5 h-5 shrink-0 mt-0.5 text-[#B7FE1A]" />
                  <p className="text-white/80 text-lg md:text-[22px] font-medium">
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

export default PhotovoltaicsCarportsSection
