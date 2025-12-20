'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const Header = () => {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href={`/${locale}`} className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg border-2 border-foreground flex items-center justify-center'>
              <div className='w-3 h-3 rounded-sm bg-foreground' />
            </div>
            <span className='text-xl font-medium'>{t('title')}</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className='hidden md:flex items-center gap-1'>
            <Link href={`/${locale}`}>
              <Button
                variant='ghost'
                className='rounded-full'
              >
                {t('nav.home')}
              </Button>
            </Link>
            <Link href={`/${locale}/calculator`}>
              <Button
                variant='ghost'
                className='rounded-full'
              >
                {t('nav.calculator')}
              </Button>
            </Link>
            <Link href={`/${locale}/solutions`}>
              <Button
                variant='ghost'
                className='rounded-full'
              >
                {t('nav.solutions')}
              </Button>
            </Link>
            <Link href={`/${locale}/companies`}>
              <Button
                variant='ghost'
                className='rounded-full'
              >
                {t('nav.companies')}
              </Button>
            </Link>
            <Link href={`/${locale}/portfolio`}>
              <Button
                variant='ghost'
                className='rounded-full'
              >
                {t('nav.portfolio')}
              </Button>
            </Link>
            <Link href={`/${locale}/investors`}>
              <Button
                variant='ghost'
                className='rounded-full'
              >
                {t('nav.investors')}
              </Button>
            </Link>
          </nav>

          {/* Right side - Language & CTA */}
          <div className='flex items-center gap-4'>
            {/* Language Selector */}
            <div className='flex items-center gap-1'>
              <span className='text-sm font-bold'>{locale.toUpperCase()}</span>
              <ChevronDown className='w-4 h-4' />
            </div>

            {/* CTA Button */}
            <Button
              variant='default'
              className='rounded-full hover:opacity-90'
              style={{ backgroundColor: '#062E25', color: '#FFFFFF' }}
              asChild
            >
              <Link href={`/${locale}/contact`}>
                {locale === 'de' ? 'Kontakt' : 'Contact'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
