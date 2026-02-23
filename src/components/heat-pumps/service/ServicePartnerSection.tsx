import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const ServicePartnerSection = async () => {
  const t = await getTranslations('heatPumpsService')

  const contactItems = ['phone', 'email', 'website']

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div
          className="relative w-full lg:w-1/2 py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[340px] mx-auto lg:ml-auto lg:mr-[80px]">
            <div className="flex flex-col gap-5 mb-5">
              <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium">
                {t('servicePartner.title')}
              </h2>
              <p className="text-[#062E25]/80 text-[22px] font-bold tracking-[-0.02em]">
                {t('servicePartner.company')}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-5">
              {contactItems.map(key => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-[13px] h-[13px] rounded-[5px_0px_5px_0px] border-[1.5px] border-[#036B53] flex-shrink-0" />
                  <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                    {t(`servicePartner.contact.${key}`)}
                  </span>
                </div>
              ))}
            </div>

            <LinkButton variant="tertiary" href="/contact">
              {t('servicePartner.cta')}
            </LinkButton>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-20"
            style={{
              background:
                'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
            }}
          />
        </div>

        <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[488px]">
          <Image
            src="/images/heat-pumps-service/emergency-image-749664.png"
            alt={t('servicePartner.title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default ServicePartnerSection
