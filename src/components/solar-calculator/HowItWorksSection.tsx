import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const HowItWorksSection = async () => {
  const t = await getTranslations('solarCalculator.howItWorks')

  const steps = [
    { key: 'step1', position: 'top' as const },
    { key: 'step2', position: 'bottom' as const },
    { key: 'step3', position: 'top' as const },
    { key: 'step4', position: 'bottom' as const },
  ]

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        background:
          'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col items-center text-center gap-5 mb-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
            {t('title')}
          </h2>
          <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] max-w-[646px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="hidden lg:flex justify-center">
          <div className="relative w-[812px] h-[204px]">
            <div className="absolute left-0 top-[1px] flex flex-col items-center gap-5 w-[77px]">
              <div className="w-[51px] h-[50px] rounded-full bg-[#B7FE1A] flex items-center justify-center">
                <span className="text-[#062E25]/80 text-[21px] tracking-[-0.02em] uppercase text-center">
                  {t('steps.step1.number')}
                </span>
              </div>
              <p className="text-[#062E25]/80 text-[18px] tracking-[-0.02em] text-center">
                {t('steps.step1.title')}
              </p>
            </div>

            <Image
              src="/images/solar-calculator/connector-1.svg"
              alt=""
              width={153}
              height={160}
              className="absolute left-[84px] top-[26px]"
            />

            <div className="absolute left-[184px] top-[74px] flex flex-col items-center gap-5 w-[190px]">
              <p className="text-[#062E25]/80 text-[18px] tracking-[-0.02em] text-center">
                {t('steps.step2.title')}
              </p>
              <div className="w-[50px] h-[50px] rounded-full bg-[#B7FE1A] flex items-center justify-center">
                <span className="text-[#062E25]/80 text-[21px] tracking-[-0.02em] uppercase text-center">
                  {t('steps.step2.number')}
                </span>
              </div>
            </div>

            <Image
              src="/images/solar-calculator/connector-2.svg"
              alt=""
              width={153}
              height={160}
              className="absolute left-[324px] top-[26px]"
            />

            <div className="absolute left-[407px] top-0 flex flex-col items-center gap-5 w-[226px]">
              <div className="w-[51px] h-[50px] rounded-full bg-[#B7FE1A] flex items-center justify-center">
                <span className="text-[#062E25]/80 text-[21px] tracking-[-0.02em] uppercase text-center">
                  {t('steps.step3.number')}
                </span>
              </div>
              <p className="text-[#062E25]/80 text-[18px] tracking-[-0.02em] text-center">
                {t('steps.step3.title')}
              </p>
            </div>

            <Image
              src="/images/solar-calculator/connector-3.svg"
              alt=""
              width={153}
              height={160}
              className="absolute left-[566px] top-[26px]"
            />

            <div className="absolute left-[712px] top-[94px] flex flex-col items-center gap-5 w-[100px]">
              <p className="text-[#062E25]/80 text-[18px] tracking-[-0.02em] text-center">
                {t('steps.step4.title')}
              </p>
              <div className="w-[51px] h-[50px] rounded-full bg-[#B7FE1A] flex items-center justify-center">
                <span className="text-[#062E25]/80 text-[21px] tracking-[-0.02em] uppercase text-center">
                  {t('steps.step4.number')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden grid grid-cols-2 gap-8">
          {steps.map(({ key }) => (
            <div key={key} className="flex flex-col items-center text-center gap-4">
              <div className="w-[51px] h-[50px] rounded-full bg-[#B7FE1A] flex items-center justify-center">
                <span className="text-[#062E25]/80 text-[21px] tracking-[-0.02em] uppercase">
                  {t(`steps.${key}.number`)}
                </span>
              </div>
              <p className="text-[#062E25]/80 text-[18px] tracking-[-0.02em] text-center">
                {t(`steps.${key}.title`)}
              </p>
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
    </section>
  )
}

export default HowItWorksSection
