import { ArrowRight, Info, Settings, ShieldCheck } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { EnergySystemIcon, HomeIcon, LeafIcon } from './icons'
import ReductionIcon from './icons/ReductionIcon'

const Deals = async () => {
  const t = await getTranslations('home.deals')
  const locale = await getLocale()

  const deals = [
    {
      title: t('cards.0.title'),
      subtitle: t('cards.0.subtitle'),
      benefit1: t('cards.0.benefit1'),
      benefit2: t('cards.0.benefit2'),
      benefit3: t('cards.0.benefit3'),
      feature1: t('cards.0.feature1'),
      feature2: t('cards.0.feature2'),
      feature3: t('cards.0.feature3'),
      feature4: t('cards.0.feature4'),
      explanationLabel: t('cards.0.explanation.label'),
      explanationText: t('cards.0.explanation.text'),
      price: t('cards.0.price'),
      term: t('cards.0.term'),
    },
    {
      title: t('cards.1.title'),
      subtitle: t('cards.1.subtitle'),
      benefit1: t('cards.1.benefit1'),
      benefit2: t('cards.1.benefit2'),
      benefit3: t('cards.1.benefit3'),
      feature1: t('cards.1.feature1'),
      feature2: t('cards.1.feature2'),
      feature3: t('cards.1.feature3'),
      feature4: t('cards.1.feature4'),
      explanationLabel: t('cards.1.explanation.label'),
      explanationText: t('cards.1.explanation.text'),
      price: t('cards.1.price'),
      term: t('cards.1.term'),
    },
    {
      title: t('cards.2.title'),
      subtitle: t('cards.2.subtitle'),
      benefit1: t('cards.2.benefit1'),
      benefit2: t('cards.2.benefit2'),
      benefit3: t('cards.2.benefit3'),
      feature1: t('cards.2.feature1'),
      feature2: t('cards.2.feature2'),
      feature3: t('cards.2.feature3'),
      feature4: t('cards.2.feature4'),
      explanationLabel: t('cards.2.explanation.label'),
      explanationText: t('cards.2.explanation.text'),
      price: t('cards.2.price'),
      term: t('cards.2.term'),
    },
    {
      title: t('cards.3.title'),
      subtitle: t('cards.3.subtitle'),
      benefit1: t('cards.3.benefit1'),
      benefit2: t('cards.3.benefit2'),
      benefit3: t('cards.3.benefit3'),
      feature1: t('cards.3.feature1'),
      feature2: t('cards.3.feature2'),
      feature3: t('cards.3.feature3'),
      feature4: t('cards.3.feature4'),
      explanationLabel: t('cards.3.explanation.label'),
      explanationText: t('cards.3.explanation.text'),
      price: t('cards.3.price'),
      term: t('cards.3.term'),
    },
    {
      title: t('cards.4.title'),
      subtitle: t('cards.4.subtitle'),
      benefit1: t('cards.4.benefit1'),
      benefit2: t('cards.4.benefit2'),
      benefit3: t('cards.4.benefit3'),
      feature1: t('cards.4.feature1'),
      feature2: t('cards.4.feature2'),
      feature3: t('cards.4.feature3'),
      feature4: t('cards.4.feature4'),
      explanationLabel: t('cards.4.explanation.label'),
      explanationText: t('cards.4.explanation.text'),
      price: t('cards.4.price'),
      term: t('cards.4.term'),
    },
  ]

  return (
    <section className='relative pt-24 max-w-[1440px] mx-auto px-6'>
      <div className='text-center mb-10'>
        <h2 className='text-foreground text-5xl font-semibold mb-4'>
          {t('title')}
        </h2>
        <p className='text-foreground/80 text-xl font-light max-w-2xl mx-auto'>
          {t('subtitle')}
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-[1440px] mx-auto'>
        {deals.map((deal, index) => (
          <div key={index} className='rounded-lg overflow-hidden'>
            <div className='p-4 flex items-start gap-2 bg-[#1B332D]'>
              <div className='shrink-0 w-12 h-12 rounded-full border border-solar flex items-center justify-center'>
                <HomeIcon className='w-6 h-6' />
              </div>
              <div>
                <h3 className='text-solar text-xl font-semibold mb-2'>
                  {deal.title}
                </h3>
                <p className='text-white/90 text-base font-light'>
                  {deal.subtitle}
                </p>
              </div>
            </div>

            <div>
              <div className='bg-[#154138]'>
                <div className='flex items-center gap-3 border-b border-white py-4 px-6'>
                  <LeafIcon className='text-solar w-4 h-4 shrink-0' />
                  <p className='text-white text-base font-light'>
                    {deal.benefit1}
                  </p>
                </div>
                <div className='flex items-center gap-3 border-b border-white py-4 px-6'>
                  <LeafIcon className='text-solar w-4 h-4 shrink-0' />

                  <p className='text-white text-base font-light'>
                    {deal.benefit2}
                  </p>
                </div>
                <div className='flex items-center gap-3 py-4 px-6'>
                  <LeafIcon className='text-solar w-4 h-4 shrink-0' />
                  <p className='text-white text-base font-light'>
                    {deal.benefit3}
                  </p>
                </div>
              </div>
            </div>
            <div className='relative'>
              <div
                className='absolute inset-0 bg-cover bg-center'
                style={{
                  backgroundImage: "url('/images/deals-bg.png')",
                }}
              />
              <div className='relative pb-6'>
                <div className='space-y-4 px-6 py-8'>
                  <div className='flex items-center gap-3'>
                    <Settings className='w-4 h-4 text-foreground shrink-0' />
                    <span className='text-foreground'>{deal.feature1}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <EnergySystemIcon className='w-4 h-4 text-foreground shrink-0' />
                    <span className='text-foreground'>{deal.feature2}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <ShieldCheck className='w-4 h-4 text-foreground shrink-0' />
                    <span className='text-foreground'>{deal.feature3}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <ReductionIcon className='w-4 h-4 text-foreground shrink-0' />
                    <span className='text-foreground'>{deal.feature4}</span>
                  </div>
                </div>

                <div className='mb-6 px-6'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Info className='w-4 h-4 text-foreground' />
                    <h4 className='text-foreground'>{deal.explanationLabel}</h4>
                  </div>
                  <p className='text-foreground/80 text-sm font-light'>
                    {deal.explanationText}
                  </p>
                </div>

                <div className='mb-6'>
                  <div className='bg-solar p-2 px-6'>
                    <div className=' flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-1'>
                        {(() => {
                          const priceLower = deal.price.toLowerCase()
                          const isCustomPricing =
                            priceLower.includes('custom') ||
                            priceLower.includes('individuell') ||
                            priceLower.includes('personalizado') ||
                            priceLower.includes('personnalisé') ||
                            priceLower.includes('personalizzato') ||
                            priceLower.includes('prilagođena')
                          const isOneTime =
                            priceLower.includes('einmalig') ||
                            priceLower.includes('one-time') ||
                            priceLower.includes('una vez') ||
                            priceLower.includes('une fois') ||
                            priceLower.includes('una tantum') ||
                            priceLower.includes('jednokratno')

                          if (isCustomPricing) {
                            return (
                              <p className='text-foreground text-3xl font-bold'>
                                {deal.price}
                              </p>
                            )
                          }

                          const cleanPrice = deal.price
                            .replace(
                              /^(ab|from|desde|à partir de|da|od)\s+/i,
                              ''
                            )
                            .replace(
                              /\s*\/\s*(Monat|month|mes|mois|mese|mesec)/i,
                              ''
                            )
                            .replace(
                              /^(Einmalig|One-time|Una vez|Une fois|Una tantum|Jednokratno)\s+/i,
                              ''
                            )

                          return (
                            <>
                              {!isOneTime && (
                                <span className='text-foreground text-sm font-light'>
                                  {t('from')}
                                </span>
                              )}
                              <p className='text-foreground text-3xl font-bold text-nowrap'>
                                {cleanPrice}
                              </p>
                              {!isOneTime && (
                                <p className='text-foreground text-sm font-light'>
                                  {t('month')}
                                </p>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </div>
                    <p className='text-foreground/80 text-sm font-light'>
                      {deal.term}
                    </p>
                  </div>
                </div>

                <div className='flex justify-start px-6'>
                  <Link
                    href={`/${locale}/deals`}
                    className='inline-flex items-center gap-2 text-foreground group/link transition-opacity duration-300 hover:opacity-80'
                  >
                    <span className='inline-flex items-center gap-2 border-b border-foreground pb-0.5'>
                      <span>{t('learnMore')}</span>
                      <ArrowRight className='w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1' />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Deals
