'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const Footer = () => {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  const navigationLinks = [
    { label: t('nav.home'), href: `/${locale}` },
    { label: t('nav.solutions'), href: `/${locale}/solutions` },
    { label: t('nav.companies'), href: `/${locale}/companies` },
    { label: t('nav.portfolio'), href: `/${locale}/portfolio` },
  ]

  const communityLinks = [
    { label: 'Facebook', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: locale === 'de' ? 'Impressum' : 'Legal', href: '#' },
  ]

  const contactLinks = [
    { label: locale === 'de' ? 'Über uns' : 'About us', href: `/${locale}/about` },
  ]

  return (
    <footer className='text-white border-t' style={{ backgroundColor: '#011F19', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <div className='container mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
          {/* Logo & Copyright */}
          <div className='md:col-span-1'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-16 h-16 rounded-2xl border-4 flex items-center justify-center' style={{ borderColor: '#FFFFFF' }}>
                <div className='w-8 h-8 rounded-lg' style={{ backgroundColor: '#FFFFFF' }} />
              </div>
              <span className='text-2xl font-medium text-white'>{t('title')}</span>
            </div>
            <p className='text-xs uppercase' style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {t('footer.copyright')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className='text-sm font-normal mb-4' style={{ color: '#B7FE1A' }}>
              {locale === 'de' ? 'Navigation' : 'Navigation'}
            </h3>
            <ul className='space-y-4'>
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm flex items-center gap-2 group'
                    style={{ color: '#ABBDCC' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ABBDCC'}
                  >
                    {link.label}
                    <ChevronRight className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className='text-sm font-normal mb-4' style={{ color: '#B7FE1A' }}>
              {locale === 'de' ? 'Community' : 'Community'}
            </h3>
            <ul className='space-y-4'>
              {communityLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm flex items-center gap-2 group'
                    style={{ color: '#ABBDCC' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ABBDCC'}
                  >
                    {link.label}
                    <ChevronRight className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-sm font-normal mb-4' style={{ color: '#B7FE1A' }}>
              {locale === 'de' ? 'Kontakt' : 'Contact'}
            </h3>
            <ul className='space-y-4'>
              {contactLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm flex items-center gap-2 group'
                    style={{ color: '#ABBDCC' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ABBDCC'}
                  >
                    {link.label}
                    <ChevronRight className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
