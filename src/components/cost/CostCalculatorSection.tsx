import CalculatorSectionBody from '@/components/home/CalculatorSectionBody'
import { getTranslations } from 'next-intl/server'

const CostCalculatorSection = async () => {
  const t = await getTranslations('cost')

  return (
    <section
      id="rechner"
      className="relative w-full overflow-clip bg-[#F2F4E8] py-16 md:py-24 px-4 sm:px-6 scroll-mt-28"
    >
      <div
        className="pointer-events-none absolute -top-40 right-[-80px] w-[500px] h-[500px] rounded-full"
        style={{ background: 'rgba(183, 254, 26, 0.2)', filter: 'blur(170px)' }}
      />

      <div className="relative max-w-[1400px] mx-auto flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center rounded-full border border-[#062E25] px-4 py-2 text-[#062E25] text-base font-light">
            {t('calculator.eyebrow')}
          </span>
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1.05] max-w-[820px]">
            {t('calculator.title')}
          </h2>
          <p className="text-[#062E25]/80 text-lg md:text-[22px] tracking-[-0.02em] max-w-[760px]">
            {t('calculator.subtitle')}
          </p>
        </div>

        <CalculatorSectionBody />
      </div>
    </section>
  )
}

export default CostCalculatorSection
