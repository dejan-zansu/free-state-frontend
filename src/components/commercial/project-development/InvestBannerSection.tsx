import { getTranslations } from 'next-intl/server'

const InvestBannerSection = async () => {
  const t = await getTranslations('projectDevelopment')

  return (
    <section
      className="relative flex items-center justify-center pt-16 md:pt-[90px] pb-[104px] md:pb-[130px] -mb-10"
      style={{
        background:
          'linear-gradient(93deg, #3D3858 61.98%, #8479BE 148.59%)',
      }}
    >
      <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center px-4">
        {t('investBanner.title')}
      </h2>
    </section>
  )
}

export default InvestBannerSection
