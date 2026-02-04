'use client'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import LogoDark from './icons/LogoDark'
import LogoLight from './icons/LogoLight'
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
  const locale = useParams().locale as string
  const pathname = usePathname()
  const isCommercial = pathname?.includes('/commercial')
  const isLight =
    pathname?.includes('/solar-systems') || pathname?.includes('/heat-pumps')

  const solarAboLinks = [
    {
      label: t('solarAbo.singleFamily'),
      href: `/${locale}/solar-abo/single-family`,
    },
    {
      label: t('solarAbo.multiFamily'),
      href: `/${locale}/solar-abo/multi-family`,
    },
    {
      label: t('solarAbo.businesses'),
      href: `/${locale}/solar-abo/businesses`,
    },
    {
      label: t('solarAbo.agriculture'),
      href: `/${locale}/solar-abo/agriculture`,
    },
    {
      label: t('solarAbo.publicBuildings'),
      href: `/${locale}/solar-abo/public-buildings`,
    },
  ]

  const productLinks = [
    {
      label: t('products.solarSystems'),
      href: `/${locale}/solar-systems`,
    },
    {
      label: t('products.batteryStorage'),
      href: `/${locale}/battery-storage`,
    },
    { label: t('products.heatPumps'), href: `/${locale}/heat-pumps` },
    {
      label: t('products.chargingStations'),
      href: `/${locale}/charging-stations`,
    },
    {
      label: t('products.energyManagement'),
      href: `/${locale}/energy-management`,
    },
  ]

  const companyLinks = [
    { label: t('company.aboutUs'), href: `/${locale}/about-us` },
    { label: t('company.history'), href: `/${locale}/history` },
    { label: t('company.mission'), href: `/${locale}/mission` },
    { label: t('company.team'), href: `/${locale}/team` },
    { label: t('company.investors'), href: `/${locale}/investors` },
    { label: t('company.careers'), href: `/${locale}/careers` },
  ]

  const knowledgeMediaLinks = [
    { label: t('knowledgeMedia.faq'), href: `/${locale}/faq` },
    { label: t('knowledgeMedia.mediaPress'), href: `/${locale}/media` },
  ]

  const legalLinks = [
    { label: t('legal.legalNotice'), href: `/${locale}/impressum` },
    { label: t('legal.privacyPolicy'), href: `/${locale}/privacy-policy` },
    { label: t('legal.agb'), href: `/${locale}/agb` },
  ]

  const contactLinks = [
    { label: t('contact.kontakt'), href: `/${locale}/contact` },
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
    links: { label: string; href: string }[]
    titleClassName?: string
  }) => (
    <div>
      <h3
        className={cn(
          'font-semibold mb-4 text-sm',
          titleClassName ||
            (isCommercial && isLight
              ? 'text-energy'
              : isCommercial
                ? 'text-energy'
                : isLight
                  ? 'text-primary'
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
                  ? 'text-primary hover:text-primary/80'
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
        'bg-solar',
        isCommercial ? 'bg-[#3D3858]' : isLight ? 'bg-transparent' : 'bg-solar'
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
            background: isCommercial
              ? 'linear-gradient(106.37deg, #191D1C 52.8%, #3D3858 155.13%)'
              : isLight
                ? 'linear-gradient(333.03deg, #F3F4EE 41.26%, #D3D8BF 85.88%)'
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

        <div className="relative z-10 max-w-[1380px] mx-auto px-6 pt-16 pb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8">
            <div className="w-fit">
              <Link href={`/${locale}`} className="inline-block">
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

          <div className="mt-16 flex gap-4">
            {socialLinks.map(social => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border transition-colors',
                  isLight
                    ? 'border-card-foreground bg-card-foreground text-solar hover:opacity-80'
                    : isCommercial
                      ? 'border-white bg-white text-energy hover:opacity-80'
                      : 'border-solar bg-solar text-card-foreground hover:opacity-80'
                )}
                aria-label={social.label}
              >
                <social.icon className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>

          <div
            className={cn(
              'mt-2.5 h-px max-w-[330px] w-full',
              isLight ? 'bg-border' : 'bg-white/20'
            )}
          />

          <div className="mt-2.5 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
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
                  isLight ? 'text-primary' : 'text-muted-text-light/40'
                )}
              >
                {t('tagline')}
              </p>
            </div>
            <LinkButton
              variant={isCommercial ? 'secondary' : 'primary'}
              href="/calculator"
              locale={locale}
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
