import LeafIcon from '@/components/icons/LeafIcon'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const BatteryStorageGridServices = async () => {
  const t = await getTranslations('batteryStorage')

  const financialBenefits = [
    'gridServices.financialBenefits.item1',
    'gridServices.financialBenefits.item2',
    'gridServices.financialBenefits.item3',
  ]

  const automatedParticipation = [
    'gridServices.automatedParticipation.item1',
    'gridServices.automatedParticipation.item2',
    'gridServices.automatedParticipation.item3',
  ]

  return (
    <section className="relative bg-[#FDFFF5] py-10 md:py-12 lg:py-14">
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[#062E25] text-2xl sm:text-3xl md:text-4xl lg:text-[45px] font-medium leading-tight text-center mb-10 md:mb-12 lg:mb-16">
          {t('gridServices.title')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-stretch">
          <div className="relative min-h-[250px] lg:min-h-0 h-full w-full">
            <Image
              src="/images/battery-storage/battery-grid-services.png"
              alt={t('gridServices.title')}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover rounded-lg"
            />
          </div>

          <div className="w-full flex flex-col gap-6 lg:gap-8">
            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-normal leading-relaxed tracking-tight">
              {t('gridServices.description')}
            </p>

            <div className="flex flex-col gap-4">
              <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold leading-relaxed tracking-tight">
                {t('gridServices.financialBenefits.title')}
              </h3>
              <div className="flex flex-col gap-3 pl-8 md:pl-12">
                {financialBenefits.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <LeafIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#B7FE1A]" />
                    <span className="text-[#062E25]/80 text-sm md:text-base font-medium leading-relaxed tracking-tight italic">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold leading-relaxed tracking-tight">
                {t('gridServices.automatedParticipation.title')}
              </h3>
              <div className="flex flex-col gap-3 pl-8 md:pl-12">
                {automatedParticipation.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <LeafIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#B7FE1A]" />
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

export default BatteryStorageGridServices
