import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'
import { Badge } from '@/components/ui/badge'
import CalculatorSectionBody from './CalculatorSectionBody'

const CalculatorSection = async () => {
  const t = await getTranslations('home.calculatorSection')

  return (
    <section
      id="calculator"
      className="relative w-full overflow-clip bg-[#FDFFF5] py-16 md:py-24 px-4 sm:px-6"
    >
      <div
        className="pointer-events-none absolute -top-40 right-[-80px] w-[500px] h-[500px] rounded-full"
        style={{
          background: 'rgba(183, 254, 26, 0.2)',
          filter: 'blur(170px)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col items-center gap-5 text-center">
          <Badge
            variant="outline"
            className="border-foreground text-foreground font-light text-base backdrop-blur-[65px]"
          >
            {t('eyebrow')}
          </Badge>
          <RevealText
            as="h2"
            className="text-foreground text-3xl md:text-[45px] font-medium whitespace-pre-line"
          >
            {t('title')}
          </RevealText>
          <Reveal
            as="p"
            delay={0.2}
            className="text-foreground/80 text-lg md:text-[22px] font-light tracking-tight max-w-[760px]"
          >
            {t('subtitle')}
          </Reveal>
        </div>

        <CalculatorSectionBody />
      </div>
    </section>
  )
}

export default CalculatorSection
