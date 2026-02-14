import { LearnMoreLink } from '@/components/ui/learn-more-link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const cardKeys = [
  'financialSupport',
  'cost',
  'monitoringAndService',
  'amortization',
] as const

const cardHrefs: Record<(typeof cardKeys)[number], string> = {
  financialSupport: '/learn-more',
  cost: '/cost',
  monitoringAndService: '/learn-more',
  amortization: '/amortization',
}

const CostFurtherTopicsSection = async () => {
  const t = await getTranslations('cost')

  return (
    <section className="relative bg-[#EAEDDF] overflow-hidden">
      <div className="max-w-[1214px] mx-auto px-4 sm:px-6 py-12 md:pt-[50px] md:pb-[130px]">
        <div className="flex flex-col items-center gap-[60px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('furtherTopics.title')}
          </h2>

          <div className="flex flex-wrap gap-5 w-full">
            {cardKeys.map(key => (
              <div
                key={key}
                className="relative border border-[#809792] rounded-[20px] overflow-hidden h-[370px] w-[360px] bg-[#EEEFE5] shrink-0"
              >
                <div className="relative z-10 flex items-center justify-center pt-[30px] pb-[21px]">
                  <Image
                    src="/images/cost-card-icon.svg"
                    alt=""
                    width={142}
                    height={142}
                  />
                </div>

                <div className="relative z-10 h-[177px] bg-[#E5E6DE] border-t border-[#809792]">
                  <div className="px-[30px] py-5 flex flex-col gap-5">
                    <div className="flex flex-col gap-5">
                      <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold capitalize">
                        {t(`furtherTopics.cards.${key}.title`)}
                      </h3>
                      <p className="text-[#062E25]/80 text-sm md:text-base font-light">
                        {t(`furtherTopics.cards.${key}.description`)}
                      </p>
                    </div>

                    {/* @ts-expect-error - cardHrefs is a record of strings */}
                    <LearnMoreLink href={cardHrefs[key]}>
                      {t('furtherTopics.learnMore')}
                    </LearnMoreLink>
                  </div>
                </div>
              </div>
            ))}
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

export default CostFurtherTopicsSection
