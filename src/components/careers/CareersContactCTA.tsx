import { LinkButton } from '@/components/ui/link-button'
import { useTranslations } from 'next-intl'

const CareersContactCTA = () => {
  const t = useTranslations('careersPage.contactCta')

  return (
    <section className="relative w-full min-h-[458px] overflow-hidden bg-[#062E25]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
          zIndex: 1,
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: '#B7FE1A',
          filter: 'blur(490px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '291px',
          height: '291px',
          right: '40px',
          top: '-256px',
          background: '#B7FE1A',
          filter: 'blur(170px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-[50px]">
        <div className="flex flex-col items-center gap-[60px] max-w-[795px] mx-auto pb-16">
          <div className="flex flex-col items-center gap-[30px] w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <div
                className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(65px)',
                  WebkitBackdropFilter: 'blur(65px)',
                }}
              >
                <span className="text-white text-base font-light tracking-[-0.02em] whitespace-nowrap">
                  {t('eyebrow')}
                </span>
              </div>

              <h2 className="text-white text-4xl sm:text-5xl lg:text-[70px] font-medium text-center capitalize">
                {t('title')}
              </h2>
            </div>

            <p className="text-white/80 text-lg lg:text-[22px] font-light tracking-[-0.02em] text-center max-w-[795px]">
              {t('subtitle')}
            </p>
          </div>

          <LinkButton variant="primary" href="/contact">
            {t('buttonText')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default CareersContactCTA
