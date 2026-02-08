'use client'

import { cn } from '@/lib/utils'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useTransition } from 'react'
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
}

const localeFlags: Record<string, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
}

interface LanguageSwitcherProps {
  isScrolled?: boolean
}

const LanguageSwitcher = ({ isScrolled = false }: LanguageSwitcherProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(
        // @ts-expect-error - pathname type is complex with pathnames config
        { pathname },
        { locale: newLocale }
      )
    })
  }

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange} disabled={isPending}>
      <SelectTrigger
        className={cn(
          'h-auto w-auto border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-0! focus-visible:ring-0! focus-visible:border-transparent! outline-none! focus:outline-none! focus-visible:outline-none! ml-6',
          isScrolled ? 'text-[#062E25]' : 'text-white',
          isPending && 'opacity-50'
        )}
      >
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">
              {localeFlags[currentLocale] || '🌐'}
            </span>
            <span className="font-bold">
              {localeLabels[currentLocale] || currentLocale.toUpperCase()}
            </span>
          </div>
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
