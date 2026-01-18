import { getTranslations } from 'next-intl/server'
import { Mail, Phone, MapPin } from 'lucide-react'
import Partners from '@/components/Partners'

const ContactPage = async () => {
  const t = await getTranslations('contact')

  const contactInfo = [
    {
      icon: Mail,
      label: t('email.label'),
      value: t('email.value'),
      href: `mailto:${t('email.value')}`,
    },
    {
      icon: Phone,
      label: t('phone.label'),
      value: t('phone.value'),
      href: `tel:${t('phone.value').replace(/\s/g, '')}`,
    },
    {
      icon: MapPin,
      label: t('address.label'),
      value: t('address.value'),
      href: null,
    },
  ]

  return (
    <div className='relative py-24 bg-background min-h-screen'>
      <div className='max-w-327.5 mx-auto px-6'>
        <div className='text-center mb-12'>
          <h1 className='text-foreground text-5xl font-semibold mb-4'>
            {t('title')}
          </h1>
          <p className='text-foreground/80 text-xl font-light max-w-2xl mx-auto'>
            {t('subtitle')}
          </p>
        </div>

        <div className='text-center mb-12'>
          <p className='text-foreground/70 text-lg font-light max-w-2xl mx-auto'>
            {t('description')}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
          {contactInfo.map((info, index) => {
            const Icon = info.icon
            const content = (
              <div className='flex flex-col items-center text-center p-6 rounded-2xl bg-[#062E25] hover:bg-[#07382e] transition-colors h-full'>
                <div className='mb-4 p-3 rounded-full bg-solar/20 text-solar'>
                  <Icon className='w-6 h-6' />
                </div>
                <h3 className='text-white text-lg font-semibold mb-2'>
                  {info.label}
                </h3>
                <p className='text-white/80 text-sm font-light whitespace-pre-line'>
                  {info.value}
                </p>
              </div>
            )

            if (info.href) {
              return (
                <a
                  key={index}
                  href={info.href}
                  className='block h-full'
                  target={info.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    info.href.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  {content}
                </a>
              )
            }

            return <div key={index}>{content}</div>
          })}
        </div>
      </div>
      <Partners />
    </div>
  )
}

export default ContactPage
