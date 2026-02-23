import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'

const CheckmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 22 22"
    fill="none"
    className="shrink-0"
  >
    <path
      d="M21.2326 11C21.2326 5.34871 16.6513 0.767442 11 0.767442C5.34871 0.767442 0.767442 5.34871 0.767442 11C0.767442 16.6513 5.34871 21.2326 11 21.2326C16.6513 21.2326 21.2326 16.6513 21.2326 11Z"
      stroke="#B7FE1A"
      strokeWidth={1.5}
    />
    <path
      d="M6.90698 11.5116L9.46512 14.0698L15.093 7.93023"
      stroke="#B7FE1A"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const RepoweringCtaSection = async () => {
  const t = await getTranslations('repowering')

  const bullets = ['1', '2', '3'] as const

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
            className="w-full rounded-[16px] p-8 md:p-10 backdrop-blur-[40px] flex flex-col justify-center items-end gap-[30px]"
            style={{
              background: 'rgba(185, 205, 191, 0.3)',
              border: '1px solid rgba(246, 246, 246, 0.6)',
            }}
          >
            <div className="flex flex-col gap-5 w-full">
              {bullets.map((key) => (
                <div key={key} className="flex items-center gap-[11px]">
                  <CheckmarkIcon />
                  <p className="text-white/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
                    {t(`repoweringCta.bullets.${key}`)}
                  </p>
                </div>
              ))}
            </div>

            <LinkButton variant="primary" href="/contact">
              {t('repoweringCta.cta')}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RepoweringCtaSection
