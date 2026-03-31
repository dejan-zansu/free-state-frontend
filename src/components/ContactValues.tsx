import {
  COMPANY_MAIN_PHONE_DISPLAY,
  COMPANY_MAIN_PHONE_TEL_HREF,
} from '@/lib/company-contact'
import { getTranslations } from 'next-intl/server'
import GreenWorldIcon from './icons/GreenWorldIcon'
import { LinkButton } from './ui/link-button'
import { Phone, Smartphone, Mail, ExternalLink } from 'lucide-react'

const ContactValues = async () => {
  const t = await getTranslations('contactValues')

  const values = [
    {
      image: '/images/value-consultation-2bcbed.png',
      title: t('items.0.title'),
      description: t('items.0.description'),
      contacts: [
        {
          icon: 'phone',
          text: COMPANY_MAIN_PHONE_DISPLAY,
          href: COMPANY_MAIN_PHONE_TEL_HREF,
        },
        { icon: 'mail', text: 'sales@helion.ch', href: 'mailto:sales@helion.ch' },
      ],
    },
    {
      image: '/images/value-invoice-27b310.png',
      title: t('items.1.title'),
      description: t('items.1.description'),
      contacts: [],
    },
    {
      image: '/images/value-service-61392e.png',
      title: t('items.2.title'),
      description: t('items.2.description'),
      contacts: [],
    },
    {
      image: '/images/value-disruptions-6ea22c.png',
      title: t('items.3.title'),
      description: t('items.3.description'),
      contacts: [
        {
          icon: 'smartphone',
          text: COMPANY_MAIN_PHONE_DISPLAY,
          href: COMPANY_MAIN_PHONE_TEL_HREF,
        },
      ],
    },
  ]

  const serviceItems = [
    t('serviceLinks.photovoltaik'),
    t('serviceLinks.heatPump'),
    t('serviceLinks.chargingStation'),
  ]

  return (
    <section
      className="w-full py-12 md:py-16 px-4 sm:px-6"
      style={{ background: 'linear-gradient(180deg, #F2F4E8 91%, #DCE9E6 100%)' }}
    >
      <div className="max-w-[1120px] mx-auto flex flex-col items-center gap-16">
        <div className="flex flex-col items-center gap-10 max-w-[536px] text-center">
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-foreground text-3xl md:text-[45px] font-medium">
              {t('title')}
            </h2>
            <p className="text-foreground/80 text-lg md:text-[22px] font-light tracking-tight">
              {t('subtitle')}
            </p>
          </div>
          <LinkButton href="/about-us" variant="outline-primary">
            {t('cta')}
          </LinkButton>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="flex flex-col gap-[30px] lg:border-r lg:last:border-r-0 border-foreground/30 lg:px-8 first:lg:pl-0 last:lg:pr-0"
            >
              <div
                role="img"
                aria-label={value.title}
                className="w-[135px] h-[113px] shrink-0 overflow-hidden rounded-lg"
                style={{
                  backgroundColor: '#F2F4E8',
                  backgroundImage: `url('${value.image}')`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundBlendMode: 'multiply',
                }}
              />
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[22px] font-bold text-foreground capitalize">
                  {value.title}
                </h3>
                <p className="text-base font-light text-foreground/80 tracking-tight">
                  {value.description}
                </p>
                {value.contacts.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    {value.contacts.map((contact) => (
                      <a
                        key={contact.text}
                        href={contact.href}
                        className="flex items-center gap-2.5 text-foreground/80 text-base font-light tracking-tight hover:text-foreground transition-colors"
                      >
                        {contact.icon === 'phone' && <Phone className="w-4 h-3.5 shrink-0 text-[#295823]" />}
                        {contact.icon === 'smartphone' && (
                          <Smartphone className="w-3.5 h-3.5 shrink-0 text-[#295823]" aria-hidden />
                        )}
                        {contact.icon === 'mail' && <Mail className="w-3.5 h-4 shrink-0 text-[#295823]" />}
                        {contact.icon === 'link' && <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#295823]" />}
                        {contact.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {index === 2 && (
                <div className="flex flex-col gap-1.5 lg:col-start-3 lg:row-start-2">
                  {serviceItems.map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 text-foreground/80 text-base font-light tracking-tight"
                    >
                      <GreenWorldIcon
                        className="shrink-0 w-3.5 h-3.5"
                        width={14}
                        height={14}
                        aria-hidden
                      />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ContactValues
