import { LinkButton } from '@/components/ui/link-button'
import { Mail, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const ServiceHotlineSection = async () => {
  const t = await getTranslations('service')

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(7deg, rgba(7, 51, 42, 1) 0%, rgba(9, 63, 53, 1) 21%, rgba(21, 139, 126, 1) 100%)',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: 'rgba(183, 254, 26, 0.5)',
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
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 pt-[100px] pb-[60px]">
        <div className="flex flex-col items-center gap-[60px]">
          <div className="flex flex-col items-center gap-[50px] w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="flex flex-col items-center gap-10 w-full">
                <div className="flex flex-col items-center gap-5 w-full">
                  <div
                    className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white/20"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(65px)',
                      WebkitBackdropFilter: 'blur(65px)',
                    }}
                  >
                    <span className="text-white text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
                      {t('hotline.eyebrow')}
                    </span>
                  </div>

                  <h2 className="text-white text-4xl sm:text-5xl lg:text-[65px] font-medium text-center capitalize w-full whitespace-pre-line">
                    {t('hotline.title')}
                  </h2>
                </div>
              </div>

              <p className="text-white/80 text-base md:text-[22px] font-light tracking-[-0.02em] text-center max-w-[604px] whitespace-pre-line">
                {t('hotline.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-10">
              <a
                href={`tel:${t('hotline.phone').replace(/\s/g, '')}`}
                className="flex items-center gap-2"
              >
                <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[15px] bg-[#B7FE1A]">
                  <Phone className="w-[15px] h-[15px] text-[#062E25]" />
                </div>
                <span className="text-white/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                  {t('hotline.phone')}
                </span>
              </a>
              <a
                href={`mailto:${t('hotline.email')}`}
                className="flex items-center gap-2"
              >
                <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[15px] bg-[#B7FE1A]">
                  <Mail className="w-[16px] h-[16px] text-[#062E25]" />
                </div>
                <span className="text-white/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                  {t('hotline.email')}
                </span>
              </a>
            </div>
          </div>

          <LinkButton
            variant="primary"
            href={t('hotline.ctaLink') as '/contact'}
          >
            {t('hotline.cta')}
          </LinkButton>
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

export default ServiceHotlineSection
