import { getTranslations } from 'next-intl/server'
import LightBulbWithPointerIcon from '../icons/LightBulbWithPointer'

const PaybackSection = async () => {
  const t = await getTranslations('amortization')

  return (
    <section className="relative bg-[#FDFFF5] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-20 py-[50px]">
        <div className="flex flex-col gap-[35px]">
          <div className="flex flex-col items-center gap-[50px]">
            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em] text-center">
              {t('payback.title')}
            </h2>

            <InfoRow
              infoCard={t('payback.block1.infoCard')}
              description={t('payback.block1.description')}
            />
          </div>

          <InfoRow
            infoCard={t('payback.block2.infoCard')}
            description={t('payback.block2.description')}
          />
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

const InfoRow = ({
  infoCard,
  description,
}: {
  infoCard: string
  description: string
}) => (
  <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10 w-full">
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-[13px] shrink-0">
      <LightBulbWithPointerIcon className="shrink-0" />

      <div className="max-w-[559px] px-6 py-5 rounded-[20px] backdrop-blur-[26px] bg-[#EAEDDF] border border-white/10">
        <p className="text-[#062E25]/80 text-base md:text-xl leading-[1.3em] tracking-[-0.02em]">
          {infoCard}
        </p>
      </div>
    </div>

    <div
      className="hidden lg:block w-px h-[58px] opacity-20 shrink-0"
      style={{
        background:
          'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
      }}
    />

    <p className="text-[#062E25]/80 text-base md:text-[22px] font-light leading-[1.27em] tracking-[-0.02em] text-justify max-w-[535px]">
      {description}
    </p>
  </div>
)

export default PaybackSection
