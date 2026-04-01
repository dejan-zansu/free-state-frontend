import { getTranslations } from 'next-intl/server'
import { LinkButton } from './ui/link-button'

const PortfolioCTA = async () => {
  const t = await getTranslations('portfolioPage.cta')

  return (
    <section
      className="relative w-full overflow-hidden -mb-[40px] pb-[80px]"
      style={{
        background:
          'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div className="absolute top-[-224px] right-[1083px] lg:right-auto lg:left-[1083px] w-[374px] h-[374px] rounded-full bg-solar blur-[490px]" />
      <div className="absolute top-[-256px] right-[1125px] lg:right-auto lg:left-[1125px] w-[291px] h-[291px] rounded-full bg-solar blur-[170px]" />

      <div className="relative z-10 max-w-[608px] mx-auto px-4 sm:px-6 py-[50px] lg:py-[50px] flex flex-col items-center gap-[60px]">
        <div className="flex flex-col items-center gap-[30px] w-full">
          <div className="flex flex-col items-center gap-5 w-full">
            <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-white backdrop-blur-[65px] text-white text-base font-light tracking-tight">
              {t('eyebrow')}
            </span>
            <h2 className="text-white text-4xl sm:text-5xl lg:text-[70px] font-medium capitalize text-center">
              {t('title')}
            </h2>
          </div>
          <p className="text-white/80 text-lg lg:text-[22px] font-light tracking-tight text-center">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <LinkButton href="/contact" variant="primary">
            {t('contactBtn')}
          </LinkButton>
          {/* <LinkButton href="/solar-calculator" variant="outline-secondary">
            {t('calculatorBtn')}
          </LinkButton> */}
        </div>
      </div>
    </section>
  )
}

export default PortfolioCTA
