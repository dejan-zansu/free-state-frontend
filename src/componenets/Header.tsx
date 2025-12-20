import LogoLight from '@/components/icons/LogoLight'
import { useTranslations } from 'next-intl'
import Link from 'next/link'


const Header = () => {
  const t = useTranslations()

  return (
    <header className='flex items-center justify-between p-4'>
      <div className='flex items-center'>
        <LogoLight />
        <span className='ml-2 font-bold'>{t('title')}</span>
      </div>
      <nav>
        <Link href='/en' className='mr-2'>
          EN
        </Link>
        <Link href='/de' className='mr-2'>
          DE
        </Link>
        <Link href='/fr' className='mr-2'>
          FR
        </Link>
        <Link href='/it' className='mr-2'>
          IT
        </Link>
        <Link href='/es' className='mr-2'>
          ES
        </Link>
        <Link href='/sr'>SR</Link>
      </nav>
    </header>
  )
}

export default Header
