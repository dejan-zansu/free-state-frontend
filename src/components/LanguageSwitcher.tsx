'use client'

import { cn } from '@/lib/utils'
import { usePathname, getPathname } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { locales } from '@/i18n/routing'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const localeLabels: Record<string, string> = {
  en: 'EN',
  de: 'DE',
  fr: 'FR',
  it: 'IT',
}

const localeFlags: Record<string, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  it: '🇮🇹',
}

interface LanguageSwitcherProps {
  isScrolled?: boolean
}

const LanguageSwitcher = ({ isScrolled = false }: LanguageSwitcherProps) => {
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = useLocale()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return
    setIsNavigating(true)
    const target = getPathname({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href: { pathname, params } as any,
      locale: newLocale,
    })
    window.location.href = `${target}${window.location.search}${window.location.hash}`
  }

  return (
    <Select
      value={currentLocale}
      onValueChange={handleLocaleChange}
      disabled={isNavigating}
    >
      <SelectTrigger
        className={cn(
          'h-auto w-auto border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-0! focus-visible:ring-0! focus-visible:border-transparent! outline-none! focus:outline-none! focus-visible:outline-none!',
          isScrolled ? 'text-[#062E25]' : 'text-white',
          isNavigating && 'opacity-50'
        )}
      >
        <SelectValue>
          <span className="font-bold">
            {localeLabels[currentLocale] || currentLocale.toUpperCase()}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className="min-w-[80px]"
        position="popper"
        sideOffset={4}
        collisionPadding={100}
      >
        {locales.map((locale: string) => (
          <SelectItem key={locale} value={locale}>
            <div className="flex items-center gap-2.5">
              <span className="text-base leading-none">
                {localeFlags[locale]}
              </span>
              <span>{localeLabels[locale] || locale.toUpperCase()}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LanguageSwitcher
