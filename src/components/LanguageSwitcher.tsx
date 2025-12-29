'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const locales = ['en', 'de', 'fr', 'it', 'es', 'sr']

const localeLabels: Record<string, string> = {
  en: 'EN',
  de: 'DE',
  fr: 'FR',
  it: 'IT',
  es: 'ES',
  sr: 'SR',
}

interface LanguageSwitcherProps {
  isScrolled?: boolean
}

const LanguageSwitcher = ({ isScrolled = false }: LanguageSwitcherProps) => {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = (params.locale as string) || 'en'

  const handleLocaleChange = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
    router.refresh()
  }

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger
        className={`h-auto w-auto border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-0! focus-visible:ring-0! focus-visible:border-transparent! outline-none! focus:outline-none! focus-visible:outline-none! ${
          isScrolled ? 'text-[#062E25]' : 'text-white'
        }`}
      >
        <SelectValue>
          <div className='flex items-center gap-2'>
            <span className='font-bold'>
              {localeLabels[currentLocale] || currentLocale.toUpperCase()}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className='min-w-[80px]'
        position='popper'
        sideOffset={4}
        collisionPadding={100}
      >
        {locales.map((locale: string) => (
          <SelectItem key={locale} value={locale}>
            {localeLabels[locale] || locale.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LanguageSwitcher
