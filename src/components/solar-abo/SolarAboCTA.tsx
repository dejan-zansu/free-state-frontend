import { LinkButton } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

export interface SolarAboCTAProps {
  translationNamespace: string
  commercial?: boolean
}

const SolarAboCTA = async ({
  translationNamespace,
  commercial = false,
}: SolarAboCTAProps) => {
  const t = await getTranslations(translationNamespace)

  return (
    <section
      className={cn(
        'relative w-full min-h-[543px] overflow-hidden pb-[60px]',
        commercial ? 'bg-[#191D1C]' : 'bg-[#062E25]'
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: commercial
            ? 'linear-gradient(144deg, rgba(25, 29, 28, 1) 0%, rgba(26, 30, 29, 1) 35%, rgba(61, 56, 88, 1) 100%)'
            : 'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
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
          background: commercial ? '#3D3858' : '#B7FE1A',
          filter: commercial ? 'blur(310px)' : 'blur(490px)',
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
          background: commercial ? '#3D3858' : '#B7FE1A',
          filter: commercial ? 'blur(160px)' : 'blur(170px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-[131px] pb-12">
        <div className="flex flex-col items-center gap-10 mx-auto">
          <div className="flex flex-col items-center gap-5 w-full">
            <div
              className="flex items-center justify-center px-4 py-[10.54px] rounded-[31.63px] border border-white"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(32.5px)',
                WebkitBackdropFilter: 'blur(32.5px)',
              }}
            >
              <span className="text-white text-base font-medium leading-[16px] text-center tracking-[-0.02em] whitespace-nowrap">
                {t('cta.topButton')}
              </span>
            </div>

            <h2 className="text-white text-4xl sm:text-5xl lg:text-[65px] font-medium leading-[103%] text-center capitalize max-w-[900px]">
              {t('cta.heading')}
            </h2>
          </div>

          <LinkButton
            variant={commercial ? 'secondary' : 'primary'}
            href={t('cta.ctaLink') as '/calculator'}
          >
            {t('cta.ctaText')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default SolarAboCTA
