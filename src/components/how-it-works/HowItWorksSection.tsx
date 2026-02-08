import LeafIcon from '@/components/icons/LeafIcon'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const HowItWorksSection = async () => {
  const t = await getTranslations('howItWorks')

  const labels = [
    { key: 'smartEnergyControl', col: 1 },
    { key: 'evChargingStation', col: 1 },
    { key: 'batteryStorage', col: 2 },
    { key: 'heatPump', col: 2 },
  ]

  return (
    <section className="bg-[#FDFFF5] py-12">
      <div className="max-w-[942px] mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-5 mb-[50px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em]">
            {t('section.title')}
          </h2>
          <p className="text-[#062E25]/80 text-lg md:text-[22px] tracking-[-0.02em] max-w-[368px]">
            {t('section.subtitle')}
          </p>
        </div>

        <div className="flex flex-col items-center gap-[60px]">
          <p className="text-[#062E25]/80 text-base md:text-[22px] tracking-[-0.02em] text-center max-w-[716px]">
            {t('section.description')}
          </p>

          <div className="relative w-full max-w-[898px]">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(183, 254, 26, 1) 0%, rgba(183, 254, 26, 0) 60%)',
                borderTop: '1px solid transparent',
                borderRight: '1px solid transparent',
                borderLeft: '1px solid transparent',

                borderImage:
                  'linear-gradient(180deg, rgba(6, 46, 37, 1) 0%, rgba(19, 148, 119, 0) 72%) 1',
              }}
            />

            <div className="relative pt-[60px] px-4 md:px-[82px]">
              <p className="text-[#062E25]/80 text-base md:text-[22px] tracking-[-0.02em] text-center mb-[60px]">
                {t('section.imageCaption')}
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-[60px] mb-8">
                <div className="flex flex-col gap-[38px]">
                  {labels
                    .filter(l => l.col === 1)
                    .map(label => (
                      <div key={label.key} className="flex items-center gap-2">
                        <LeafIcon className="w-3.5 h-3.5 stroke-[#036B53]" />
                        <span className="text-[#062E25] text-base md:text-[22px] font-bold capitalize underline underline-offset-6">
                          {t(`section.labels.${label.key}`)}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="flex flex-col gap-[38px]">
                  {labels
                    .filter(l => l.col === 2)
                    .map(label => (
                      <div key={label.key} className="flex items-center gap-2">
                        <LeafIcon className="w-3.5 h-3.5 stroke-[#036B53]" />
                        <span className="text-[#062E25] text-base md:text-[22px] font-bold capitalize underline underline-offset-6">
                          {t(`section.labels.${label.key}`)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="relative w-full aspect-[942/463]">
                <Image
                  src="/images/how-with-solar-system.png"
                  alt={t('section.imageAlt')}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
