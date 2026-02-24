import { getTranslations } from 'next-intl/server'
import LightBulbWithPointerIcon from '../icons/LightBulbWithPointer'

const CostSection = async () => {
  const t = await getTranslations('cost')

  return (
    <section className="relative min-h-[548px] overflow-hidden bg-[#EAEDDF]">
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-12 md:py-[50px]">
        <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em] text-center mb-12 md:mb-[50px]">
          {t('costSection.title')}
        </h2>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-[90px]">
          <div className="text-[#062E25]/80 text-base md:text-[22px] font-light leading-[1.36em] tracking-[-0.02em] text-justify max-w-[535px]">
            <p>{t('costSection.paragraph1')}</p>
            <br />
            <p>
              {t.rich('costSection.paragraph2', {
                subsidies: chunks => (
                  <span className="underline">{chunks}</span>
                ),
              })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-[13px]">
            <div className="shrink-0">
              <LightBulbWithPointerIcon />
            </div>

            <div className="max-w-[527px] px-6 py-5 rounded-[20px] backdrop-blur-[26px] bg-[#EAEDDF] border border-white/10">
              <p className="text-[#062E25]/80 text-base md:text-xl leading-[1.3em] tracking-[-0.02em]">
                {t('costSection.infoCard')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CostSection
