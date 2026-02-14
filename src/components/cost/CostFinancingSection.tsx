import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import CheckIcon from '../icons/CheckIcon'
import LightBulbWithPointerIcon from '../icons/LightBulbWithPointer'

const bulletKeys = ['monthlyPayments', 'installmentPlan', 'maintenance'] as const

const CostFinancingSection = async () => {
  const t = await getTranslations('cost')

  return (
    <section className="relative bg-[#FDFFF5] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[113px] py-[50px]">
        <div className="flex flex-col gap-[60px]">
          <div className="flex flex-col gap-5 max-w-[561px]">
            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em]">
              {t('financing.title')}
            </h2>
            <p className="text-[#062E25]/80 text-base md:text-[22px] font-light leading-[1.27em] tracking-[-0.02em]">
              {t('financing.subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border border-[#062E25] shrink-0">
              <Image
                src="/images/cost-financing-avatar.png"
                alt=""
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-5">
              {bulletKeys.map(key => (
                <div key={key} className="flex items-center gap-[10px]">
                  <CheckIcon className="w-5 h-5 text-[#295823] shrink-0" />
                  <span className="text-[#062E25]/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                    {t(`financing.bullets.${key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="my-[50px] h-px opacity-20"
          style={{
            background:
              'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
          }}
        />

        <div className="flex flex-col gap-[50px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em]">
            {t('financing.idealTime.title')}
          </h2>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-[50px]">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-[13px] shrink-0">
              <LightBulbWithPointerIcon className="shrink-0" />

              <div className="max-w-[527px] px-12 py-5 rounded-[20px] backdrop-blur-[26px] bg-[#EAEDDF] border border-white/10">
                <p className="text-[#062E25]/80 text-base md:text-xl leading-[1.2em] tracking-[-0.02em] text-center">
                  {t('financing.idealTime.infoCard')}
                </p>
              </div>
            </div>

            <p className="text-[#062E25]/80 text-base md:text-[22px] leading-[1.36em] tracking-[-0.02em] text-justify max-w-[535px] whitespace-pre-line">
              {t('financing.idealTime.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CostFinancingSection
