import { getTranslations } from 'next-intl/server'

const RepoweringCtaSection = async () => {
  const t = await getTranslations('repowering')

  return (
    <section className="relative min-h-[651px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/repowering-section-bg-28279a.png')`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(0deg, rgba(234, 237, 223, 0) 9%, rgba(234, 237, 223, 1) 100%),
            linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)
          `,
          opacity: 0.5,
        }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-[#B9CF70]/20" />

      <div className="relative z-10 max-w-[571px] mx-auto px-4 sm:px-6 py-12 md:py-[84px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('repoweringCta.title')}
          </h2>

          <div
            className="w-full rounded-[16px] p-8 md:p-10 min-h-[376px] backdrop-blur-[40px]"
            style={{
              background: 'rgba(185, 205, 191, 0.3)',
              border: '1px solid rgba(246, 246, 246, 0.6)',
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default RepoweringCtaSection
