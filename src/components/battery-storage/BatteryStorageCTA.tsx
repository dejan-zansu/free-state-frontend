import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'

const BatteryStorageCTA = async () => {
  const t = await getTranslations('batteryStorage')

  return (
    <section className="relative h-[659px] overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
        }}
      />

      {/* Decorative blur effects */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: 'rgba(183, 254, 26, 0.7)',
          filter: 'blur(245px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      {/* Image placeholder - left half */}
      <div className="absolute left-0 top-0 w-1/2 h-full bg-[#D9D9D9] flex items-center justify-center">
        <span className="text-[#062E25]/40 text-sm">Image placeholder</span>
      </div>

      {/* Content - right side */}
      <div className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-10 max-w-[431px] px-4">
          {/* Badge */}
          <div
            className="px-4 py-2.5 rounded-full border border-white bg-white/20"
            style={{ backdropFilter: 'blur(65px)' }}
          >
            <span className="text-white text-base font-medium tracking-tight">
              {t('cta.badge')}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white text-3xl md:text-4xl lg:text-[65px] font-medium leading-tight text-center capitalize">
            {t('cta.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-white/60 text-lg md:text-[22px] font-normal leading-relaxed tracking-tight text-center">
            {t('cta.subtitle')}
          </p>

          {/* CTA Button */}
          <LinkButton variant="primary" href="/calculator">
            {t('cta.button')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default BatteryStorageCTA
