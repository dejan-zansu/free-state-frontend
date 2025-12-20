import LogoLight from '@/components/icons/LogoLight'
import { useTranslations } from 'next-intl'


const Footer = () => {
  const t = useTranslations()

  return (
    <footer className='bg-gray-800 text-white py-4'>
      <div className='container mx-auto px-4 flex items-center justify-between'>
        <LogoLight />
        <div>{t('footer.copyright')}</div>
      </div>
    </footer>
  )
}

export default Footer
