import LeafIcon from '@/components/icons/LeafIcon'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const HeatPumpsReliablePerformance = async () => {
  const t = await getTranslations('heatPumps')

  const operationalReliability = [
    'reliablePerformance.operationalReliability.item1',
    'reliablePerformance.operationalReliability.item2',
    'reliablePerformance.operationalReliability.item3',
  ]

  const keyDesignFactors = [
    'reliablePerformance.keyDesignFactors.item1',
    'reliablePerformance.keyDesignFactors.item2',
    'reliablePerformance.keyDesignFactors.item3',
  ]

  return (
    <section className="relative bg-[#EAEDDF] py-10 md:py-12 lg:py-14">
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[#062E25] text-2xl sm:text-3xl md:text-4xl lg:text-[45px] font-medium leading-tight text-center mb-10 md:mb-12 lg:mb-16">
          {t('reliablePerformance.title')}
        </h2>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-start">
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-[630/485] w-full rounded-[10px] overflow-hidden">
              <Image
                src="/images/heat-pumps/heat-pump-with-solar-panel.png"
                alt={t('reliablePerformance.title')}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6 lg:gap-8">
            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-normal leading-relaxed tracking-tight">
              {t('reliablePerformance.description')}
            </p>

            <div className="flex flex-col gap-4">
              <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold leading-relaxed tracking-tight">
                {t('reliablePerformance.operationalReliability.title')}
              </h3>
              <div className="flex flex-col gap-3 pl-8 md:pl-12">
                {operationalReliability.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <LeafIcon
                      className="w-3.5 h-3.5 flex-shrink-0"
                      stroke="#062E25"
                    />
                    <span className="text-[#062E25]/80 text-sm md:text-base font-medium leading-relaxed tracking-tight italic">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold leading-relaxed tracking-tight">
                {t('reliablePerformance.keyDesignFactors.title')}
              </h3>
              <div className="flex flex-col gap-3 pl-8 md:pl-12">
                {keyDesignFactors.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <LeafIcon
                      className="w-3.5 h-3.5 flex-shrink-0"
                      stroke="#062E25"
                    />
                    <span className="text-[#062E25]/80 text-sm md:text-base font-medium leading-relaxed tracking-tight italic">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
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

export default HeatPumpsReliablePerformance
