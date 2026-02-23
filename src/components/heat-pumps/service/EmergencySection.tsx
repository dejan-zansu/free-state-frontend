import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const EmergencySection = async () => {
  const t = await getTranslations('heatPumpsService')

  const items = [
    'coldInHouse',
    'problemWithPump',
    'controlNotWorking',
    'pumpNotWorking',
    'tooColdOrWarm',
    'strangeNoises',
  ]

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div
          className="relative w-full lg:w-1/2 py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[261px] mx-auto lg:ml-auto lg:mr-[100px]">
            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium mb-5">
              {t('emergency.title')}
            </h2>

            <div className="flex flex-col gap-2.5">
              {items.map((key, index) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-[18px] h-[18px] rounded-[9px] border-[1.5px] border-[#036B53] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#062E25] text-[9px] font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                    {t(`emergency.items.${key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-20"
            style={{
              background:
                'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
            }}
          />
        </div>

        <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[488px]">
          <Image
            src="/images/heat-pumps-service/emergency-image-749664.png"
            alt={t('emergency.title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default EmergencySection
