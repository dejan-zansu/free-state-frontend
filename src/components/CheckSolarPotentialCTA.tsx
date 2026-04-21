import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

interface CheckSolarPotentialCTAProps {
  isCommercial?: boolean
}

const CheckSolarPotentialCTA = async ({
  isCommercial = false,
}: CheckSolarPotentialCTAProps = {}) => {
  const t = await getTranslations('checkSolarPotentialCta')

  const background = isCommercial
    ? 'linear-gradient(131deg, #191D1C 0%, #3D3858 100%)'
    : 'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)'
  const glowColor = isCommercial ? '#9F3E4F' : '#B7FE1A'
  const href = isCommercial ? '/commercial/calculator' : '/calculator'

  return (
    <section className="relative w-full overflow-hidden" style={{ background }}>
      {!isCommercial && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '374px',
            height: '374px',
            right: '-17px',
            top: '-224px',
            background: glowColor,
            filter: 'blur(490px)',
          }}
        />
      )}
      {!isCommercial && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '291px',
            height: '291px',
            right: '25px',
            top: '-256px',
            background: glowColor,
            filter: 'blur(170px)',
          }}
        />
      )}

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 py-20 md:py-[100px]">
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-5 w-full">
            <div
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-white/30"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-white text-base font-light text-center">
                {t('eyebrow')}
              </span>
            </div>

            <h2 className="text-white text-4xl sm:text-5xl lg:text-[65px] font-medium text-center capitalize whitespace-pre-line">
              {t('title')}
            </h2>
          </div>

          <LinkButton
            variant={isCommercial ? 'outline-quaternary' : 'primary'}
            href={href}
          >
            {t('cta')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default CheckSolarPotentialCTA
