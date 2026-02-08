import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'

const InvestorsInvesting = async () => {
  const t = await getTranslations('investorsPage.investing')
  const tContact = await getTranslations('contact')

  return (
    <section className='relative py-24 bg-background'>
      <div className='max-w-327.5 mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-foreground text-4xl font-semibold mb-6'>
            {t('title')}
          </h2>
        </div>

        <div className='max-w-4xl mx-auto'>
          <p className='text-foreground/80 text-lg font-light leading-relaxed mb-8'>
            {t('description')}
          </p>

          <div className='flex justify-center'>
            <LinkButton variant='primary' href="/contact">
              {tContact('title')}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InvestorsInvesting
