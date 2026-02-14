'use client'
import { cn } from '@/lib/utils'
import { Link, usePathname } from '@/i18n/navigation'
import { Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import LogoDark from './icons/LogoDark'
import LogoLight from './icons/LogoLight'
import { ArrowButton } from './ui/arrow-button'
import { LinkButton } from './ui/link-button'

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.058-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
  </svg>
)

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const Footer = () => {
  const t = useTranslations('footer')
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const isCommercial = pathname?.includes('/commercial')
  const isLight =
    pathname?.includes('/solar-systems') ||
    pathname?.includes('/heat-pumps') ||
    pathname?.includes('/solar-abo') ||
    pathname?.includes('/battery-storage') ||
    pathname?.includes('/how-it-works') ||
    pathname?.includes('/cost') ||
    pathname?.includes('/amortization')

  const solarAboLinks = [
    {
      label: t('solarAbo.singleFamily'),
      href: '/solar-abo/single-family' as const,
    },
    {
      label: t('solarAbo.multiFamily'),
      href: '/solar-abo/multi-family' as const,
    },
    {
      label: t('solarAbo.businesses'),
      href: '/solar-abo/businesses' as const,
    },
    {
      label: t('solarAbo.agriculture'),
      href: '/solar-abo/agriculture' as const,
    },
    {
      label: t('solarAbo.publicBuildings'),
      href: '/solar-abo/public-buildings' as const,
    },
  ]

  const productLinks = [
    {
      label: t('products.solarSystems'),
      href: '/solar-systems' as const,
    },
    {
      label: t('products.batteryStorage'),
      href: '/battery-storage' as const,
    },
    { label: t('products.heatPumps'), href: '/heat-pumps' as const },
    {
      label: t('products.chargingStations'),
      href: '/charging-stations' as const,
    },
    {
      label: t('products.energyManagement'),
      href: '/energy-management' as const,
    },
  ]

  const companyLinks = [
    { label: t('company.aboutUs'), href: '/about-us' as const },
    { label: t('company.history'), href: '/history' as const },
    { label: t('company.mission'), href: '/mission' as const },
    { label: t('company.team'), href: '/team' as const },
    { label: t('company.investors'), href: '/investors' as const },
    { label: t('company.careers'), href: '/careers' as const },
  ]

  const knowledgeMediaLinks = [
    { label: t('knowledgeMedia.faq'), href: '/faq' as const },
    { label: t('knowledgeMedia.mediaPress'), href: '/media' as const },
  ]

  const legalLinks = [
    { label: t('legal.legalNotice'), href: '/impressum' as const },
    { label: t('legal.privacyPolicy'), href: '/privacy-policy' as const },
    { label: t('legal.agb'), href: '/agb' as const },
  ]

  const contactLinks = [
    { label: t('contact.kontakt'), href: '/contact' as const },
  ]

  const socialLinks = [
    {
      icon: FacebookIcon,
      href: 'https://facebook.com/freestateag',
      label: 'Facebook',
    },
    {
      icon: InstagramIcon,
      href: 'https://www.instagram.com/free_state_ag',
      label: 'Instagram',
    },
    {
      icon: YouTubeIcon,
      href: 'https://youtube.com/@freestateag',
      label: 'YouTube',
    },
    {
      icon: LinkedInIcon,
      href: 'https://www.linkedin.com/company/agribusiness-training-institute-of-free-state/',
      label: 'LinkedIn',
    },
  ]

  const LinkColumn = ({
    title,
    links,
    titleClassName,
  }: {
    title: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    links: { label: string; href: any }[]
    titleClassName?: string
  }) => (
    <div>
      <h3
        className={cn(
          'font-semibold mb-4 text-sm',
          titleClassName ||
            (isLight
              ? 'text-primary'
              : isCommercial
                ? 'text-energy'
                : 'text-solar')
        )}
      >
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'text-sm font-normal transition-colors',
                isLight
                  ? 'text-[#062E2580] hover:text-[#062E25]'
                  : 'text-muted-text-light hover:text-white'
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <footer
      className={cn(
        'bg-solar relative',
        isLight
          ? 'bg-transparent -mt-[40px]'
          : isCommercial
            ? 'bg-[#3D3858]'
            : 'bg-solar'
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-t-[40px]',
          isLight ? 'text-foreground bg-[#F3F4EE]' : 'text-white bg-[#011F19]'
        )}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            width: '100%',
            height: '961px',
            left: '0px',
            top: '-46px',
            background: isLight
              ? 'linear-gradient(333.03deg, #F3F4EE 41.26%, #D3D8BF 85.88%)'
              : isCommercial
                ? 'linear-gradient(106.37deg, #191D1C 52.8%, #3D3858 155.13%)'
                : 'linear-gradient(107.86deg, #062E25 24.4%, #139477 221.35%)',
            filter: isLight ? 'blur(0px)' : 'blur(5.5px)',
            zIndex: 1,
          }}
        />

        {!isLight && (
          <>
            {isCommercial ? (
              <>
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: '374px',
                    height: '374px',
                    right: '30px',
                    top: '-260px',
                    background: 'rgba(159, 62, 79, 0.4)',
                    filter: 'blur(245px)',
                    borderRadius: '50%',
                    zIndex: 2,
                  }}
                />

                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: '291px',
                    height: '291px',
                    right: '0px',
                    top: '-292px',
                    background: 'rgba(159, 62, 79, 0.4)',
                    filter: 'blur(85px)',
                    borderRadius: '50%',
                    zIndex: 2,
                  }}
                />
              </>
            ) : (
              <div
                className="absolute pointer-events-none"
                style={{
                  width: '374px',
                  height: '374px',
                  right: '0px',
                  top: '-260px',
                  background: 'rgba(183, 254, 26, 0.7)',
                  filter: 'blur(245px)',
                  borderRadius: '50%',
                  zIndex: 2,
                }}
              />
            )}
          </>
        )}

        <div className="relative z-20 max-w-[1380px] mx-auto px-6 pt-12 pb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <div className="flex flex-col gap-2.5">
              <span
                className={cn(
                  'text-base font-medium tracking-tight',
                  isLight ? 'text-[#062E25]' : 'text-white'
                )}
              >
                {t('stayConnected')}
              </span>
              <div className="flex gap-4">
                {socialLinks.map(social => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80',
                      isLight && isCommercial
                        ? 'bg-[#9F3E4F] text-white'
                        : isLight
                          ? 'bg-[#062E25] text-solar'
                          : isCommercial
                            ? 'bg-[#9F3E4F] text-white'
                            : 'bg-solar text-[#062E25]'
                    )}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="flex flex-col gap-2.5">
                <span
                  className={cn(
                    'text-base font-medium tracking-tight',
                    isLight ? 'text-[#062E25]' : 'text-white'
                  )}
                >
                  {t('signUpForUpdates')}
                </span>
                <div
                  className={cn(
                    'flex items-center px-3 h-9 rounded-[5px] border backdrop-blur-[65px]',
                    isLight
                      ? 'bg-[#EAEDDF] border-[#B5C0B1]'
                      : 'bg-transparent border-white/30'
                  )}
                >
                  <input
                    type="email"
                    placeholder={t('enterEmail')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={cn(
                      'bg-transparent text-sm font-medium outline-none w-[200px] sm:w-[260px] placeholder:opacity-50',
                      isLight
                        ? 'text-[#062E25] placeholder:text-[#062E25]'
                        : 'text-white placeholder:text-white'
                    )}
                  />
                </div>
              </div>
              <ArrowButton
                variant={isCommercial ? 'secondary' : 'primary'}
                size="md"
                className="h-9 text-xs"
              >
                {t('subscribe')}
              </ArrowButton>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="flex flex-col gap-2.5">
                <span
                  className={cn(
                    'text-base font-medium tracking-tight',
                    isLight ? 'text-[#062E25]' : 'text-white'
                  )}
                >
                  {t('callUs')}
                </span>
                <div
                  className={cn(
                    'flex items-center px-3 h-9 rounded-[5px] border backdrop-blur-[65px] opacity-70',
                    isLight
                      ? 'bg-transparent border-[#062E25]'
                      : 'bg-transparent border-white/30'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isLight ? 'text-[#062E25]' : 'text-white'
                    )}
                  >
                    {t('callHours')}
                  </span>
                </div>
              </div>
              <LinkButton
                href="tel:+41525253305"
                variant={isCommercial ? 'secondary' : 'primary'}
                className="h-9 text-xs"
                iconWrapperClassName={cn(
                  'w-[30px] h-[30px]',
                  isCommercial ? 'bg-white/20' : 'bg-[#062E25]/10'
                )}
                icon={
                  <Phone
                    className={cn(
                      'w-3.5 h-3.5 group-hover:animate-phone-ring',
                      isCommercial ? 'text-white' : 'text-[#062E25]'
                    )}
                  />
                }
              >
                +41 52 525 33 05
              </LinkButton>
            </div>
          </div>
        </div>

        <div className="relative z-20 max-w-[1380px] mx-auto px-6">
          <div
            className={cn(
              'h-px w-full',
              isLight ? 'bg-[#062E25]/10' : 'bg-white/10'
            )}
          />
        </div>

        <div className="relative max-w-[1380px] mx-auto px-6 pt-8 pb-8 z-20">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8">
            <div className="w-fit">
              <Link href="/" className="inline-block">
                {isLight ? (
                  <LogoDark className="h-10 w-auto" />
                ) : (
                  <LogoLight className="h-10 w-auto" />
                )}
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 lg:gap-[60px]">
              <div className="w-fit">
                <LinkColumn title={t('solarAbo.title')} links={solarAboLinks} />
              </div>
              <div className="w-fit">
                <LinkColumn title={t('products.title')} links={productLinks} />
              </div>
              <div className="w-fit">
                <LinkColumn title={t('company.title')} links={companyLinks} />
              </div>
              <div className="w-fit">
                <LinkColumn
                  title={t('knowledgeMedia.title')}
                  links={knowledgeMediaLinks}
                />
              </div>
              <div className="w-fit">
                <LinkColumn title={t('legal.title')} links={legalLinks} />
              </div>
              <div className="w-fit">
                <LinkColumn title={t('contact.title')} links={contactLinks} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <p
                className={cn(
                  'text-sm font-normal',
                  isLight ? 'text-primary' : 'text-white'
                )}
              >
                {t('copyright')}
              </p>
              <p
                className={cn(
                  'text-xs font-normal italic mt-1 max-w-[250px]',
                  isLight ? 'text-primary/40' : 'text-muted-text-light/40'
                )}
              >
                {t('tagline')}
              </p>
            </div>
            <LinkButton
              variant={isCommercial ? 'secondary' : 'primary'}
              href="/calculator"
            >
              {t('cta')}
            </LinkButton>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
