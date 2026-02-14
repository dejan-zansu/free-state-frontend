import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const costItems = [
  'costs',
  'oneOffPayment',
  'taxSavings',
  'localSubsidies',
] as const

const CalculatorExampleSection = async () => {
  const t = await getTranslations('amortization')

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/amortization-calculator-example.png"
          alt=""
          fill
          className="object-cover object-top"
        />
      </div>

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-6 pt-[91px] pb-[51px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl md:text-[45px] font-medium text-center">
            {t('calculator.title')}
          </h2>

          <div
            className="w-full max-w-[383px] rounded-[16px] border border-[#F6F6F6]/40 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="px-5 py-[30px]">
              <p className="text-white/80 text-lg font-semibold tracking-[-0.02em]">
                {t('calculator.costCard.header')}
              </p>
            </div>

            <div className="bg-[#07332A]/80 px-7 py-[30px]">
              <div className="flex flex-col gap-5">
                {costItems.map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <div
                      className="w-[13px] h-[13px] shrink-0 border-[1.5px] border-[#036B53]"
                      style={{ borderRadius: '5px 0px 5px 0px' }}
                    />
                    <span className="text-white/80 text-lg tracking-[-0.02em]">
                      {t(`calculator.costCard.items.${item}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#B7FE1A] px-10 py-[30px] flex flex-col items-center gap-[10px]">
              <div className="flex items-center gap-[10px]">
                <span className="text-[#062E25]/80 text-lg tracking-[-0.02em]">
                  {t('calculator.costCard.investmentLabel')}
                </span>
                <span className="text-[#062E25] text-[40px] font-semibold tracking-[-0.02em]">
                  {t('calculator.costCard.investmentAmount')}
                </span>
              </div>
              <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em] text-center">
                {t('calculator.costCard.yieldNote')}
              </p>
            </div>
          </div>

          <div
            className="w-full rounded-[16px] border border-[#F6F6F6] overflow-hidden flex flex-col lg:flex-row"
            style={{
              background: 'rgba(128, 168, 140, 0.2)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-5 lg:w-[181px] shrink-0">
              <div className="flex flex-col gap-[10px]">
                <p className="text-white/80 text-lg font-semibold tracking-[-0.02em] whitespace-pre-line">
                  {t('calculator.yieldCard.selfConsumption')}
                </p>
                <p className="text-white/80 text-base font-light tracking-[-0.02em] whitespace-pre-line">
                  {t('calculator.yieldCard.annualYield')}
                </p>
              </div>
            </div>

            <div className="bg-[#07332A]/80 flex-1 px-5 py-7">
              <p className="text-white/80 text-lg tracking-[-0.02em]">
                {t('calculator.yieldCard.feedIn')}
              </p>

              <div className="my-5 h-px bg-white/20" />

              <p className="text-white/80 text-lg tracking-[-0.02em] whitespace-pre-line">
                {t('calculator.yieldCard.onSite')}
              </p>
            </div>

            <div className="bg-[#B7FE1A] lg:w-[184px] shrink-0 flex flex-col items-center justify-center gap-[5px] p-5">
              <span className="text-[#062E25]/80 text-lg tracking-[-0.02em] text-center">
                {t('calculator.yieldCard.paybackLabel')}
              </span>
              <span className="text-[#062E25] text-[40px] font-semibold tracking-[-0.02em]">
                {t('calculator.yieldCard.paybackYears')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CalculatorExampleSection
