import { getTranslations } from 'next-intl/server'

const InvestBannerSection = async () => {
  const t = await getTranslations('projectDevelopment')

  return (
    <section
      className="flex items-center justify-center py-16 md:py-[90px]"
      style={{
        background:
          'linear-gradient(123deg, rgba(61, 56, 88, 1) 0%, rgba(132, 121, 190, 1) 100%)',
      }}
    >
      <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center px-4">
        {t('investBanner.title')}
      </h2>
    </section>
  )
}

export default InvestBannerSection
