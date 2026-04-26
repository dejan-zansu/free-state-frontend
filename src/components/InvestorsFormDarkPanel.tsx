import { useTranslations } from 'next-intl'

const InvestorsFormDarkPanel = () => {
  const t = useTranslations('investorsPage.formPanel')

  return (
    <div
      className="relative w-full h-full min-h-[400px] md:min-h-[889px] overflow-hidden"
      style={{
        background:
          'linear-gradient(7deg, rgba(7, 51, 42, 1) 0%, rgba(9, 63, 53, 1) 21%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div className="absolute top-[-153px] right-[110px] w-[374px] h-[374px] rounded-full bg-[#B7FE1A]/50 blur-[490px]" />
      <div className="absolute top-[-185px] right-[69px] w-[291px] h-[291px] rounded-full bg-[#B7FE1A]/50 blur-[170px]" />

      <div className="relative flex flex-col gap-[50px] px-8 lg:px-[169px] py-16 lg:pt-[282px] items-center text-center">
        <div className="flex flex-col gap-10 items-center">
          <div className="flex flex-col gap-5 items-center">
            <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] bg-white/20 backdrop-blur-[65px] text-white text-base font-light tracking-[-0.02em]">
              {t('eyebrow')}
            </span>
            <h2 className="text-[#FDFFF5] text-4xl lg:text-[70px] font-medium capitalize lg:max-w-[381px]">
              {t('title')}
            </h2>
          </div>

          <p className="text-[#FDFFF5]/80 text-lg lg:text-[22px] font-light tracking-[-0.02em] max-w-[379px]">
            {t('subtitle')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default InvestorsFormDarkPanel
