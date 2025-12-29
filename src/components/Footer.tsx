'use client'
import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import LogoLight from './icons/LogoLight'
const Footer = () => {
  const t = useTranslations('footer')
  const locale = useParams().locale as string
  const navigationLinks = [
    { label: t('links.home'), href: `/${locale}`, hasArrow: false },
    {
      label: t('links.solarSolutions'),
      href: `/${locale}/solar-solutions`,
      hasArrow: true,
    },
    {
      label: t('links.companies'),
      href: `/${locale}/companies`,
      hasArrow: true,
    },
    {
      label: t('links.portfolio'),
      href: `/${locale}/portfolio`,
      hasArrow: true,
    },
  ]

  const communityLinks = [
    {
      label: t('links.facebook'),
      href: 'https://facebook.com',
      hasArrow: false,
    },
    { label: t('links.twitter'), href: 'https://twitter.com', hasArrow: false },
    {
      label: t('links.instagram'),
      href: 'https://www.instagram.com/free_state_ag',
      hasArrow: false,
    },
    {
      label: t('links.impressum'),
      href: `/${locale}/impressum`,
      hasArrow: true,
    },
  ]

  const contactLinks = [
    { label: t('links.contact'), href: `/${locale}/contact`, hasArrow: false },
  ]

  return (
    <footer className='relative text-white overflow-hidden bg-[#011F19]'>
      <div className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage: "url('/images/solar-panels.png')",
            filter: 'blur(3px)',
          }}
        />

        <div
          className='absolute inset-0'
          style={{
            background:
              'linear-gradient(0deg, rgba(0, 33, 26, 0.01), rgba(0, 33, 26, 0.01))',
          }}
        />
        <div
          className='absolute inset-0'
          style={{
            background:
              'linear-gradient(0deg, rgba(6, 46, 37, 0.05), rgba(6, 46, 37, 0.05))',
            mixBlendMode: 'hard-light',
          }}
        />
      </div>
      <div className='relative z-10 max-w-327.5 mx-auto px-6 pt-32 pb-8 flex flex-col md:min-h-132.5'>
        <div className='flex flex-1'>
          <div className='flex-1'>
            <Link href={`/${locale}`} className='inline-block'>
              <LogoLight className='md:h-12 xl:h-16 w-auto' />
            </Link>
          </div>
          <div className='flex flex-1 justify-between'>
            <div>
              <h3 className='text-solar font-medium mb-6'>{t('contact')}</h3>
              <ul className='space-y-4'>
                {contactLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className='group font-normal hover:text-white transition-colors inline-flex items-center gap-2 text-muted-text-light hover:underline hover:decoration-white underline-offset-4'
                    >
                      {link.label}
                      {link.hasArrow && (
                        <ChevronRight className='w-3 h-3 transition-transform duration-200 group-hover:translate-x-1' />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className='text-solar font-medium mb-6'>{t('navigation')}</h3>
              <ul className='space-y-4'>
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className='group font-normal hover:text-white transition-colors inline-flex items-center gap-2 text-muted-text-light hover:underline hover:decoration-white underline-offset-4'
                    >
                      {link.label}
                      {link.hasArrow && (
                        <ChevronRight className='w-3 h-3 transition-transform duration-200 group-hover:translate-x-1' />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className='text-solar font-medium mb-6'>{t('community')}</h3>
              <ul className='space-y-4'>
                {communityLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className='group font-normal hover:text-white transition-colors inline-flex items-center gap-2 text-muted-text-light hover:underline decoration-muted-text-light hover:decoration-white underline-offset-4'
                      target={
                        link.href.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        link.href.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                    >
                      {link.label}
                      {link.hasArrow && (
                        <ChevronRight className='w-3 h-3 transition-transform duration-200 group-hover:translate-x-1' />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className='pt-8'>
          <p className='text-muted-text-light text-xs font-normal uppercase tracking-wide'>
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
