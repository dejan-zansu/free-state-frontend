import { getTranslations } from 'next-intl/server'
import { MinimalLogoIcon } from './icons'

const SolarAboHomePricing = async () => {
  const t = await getTranslations('solarAboHome.pricing')

  const features = [
    t('features.contractTerm'),
    t('features.buybackOption'),
    t('features.noUpfrontCosts'),
    t('features.batteryStorage'),
  ]

  return (
    <section className='relative w-full min-h-[747px] bg-white overflow-hidden'>
    
      <div
        className='absolute w-full max-w-[1442px] h-[652px] left-1/2 -translate-x-1/2 top-[95px]'
        style={{
          backgroundImage: "url('/images/solar-abo-home-roof.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className='relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6'>
      
        <div className='flex flex-col items-center gap-5 pt-[50px] max-w-[619px] mx-auto'>
          <h2 className='text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[100%] text-center w-full'>
            {t('title')}
          </h2>
          <p className='text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-[30px] text-center tracking-[-0.02em] w-full flex items-center justify-center'>
            {t('subtitle')}
          </p>
        </div>

      
        <div className='relative mt-[71px] mb-8 max-w-[579px] mx-auto'>
        
          <div
            className='relative w-full h-[375px] rounded-2xl border border-white/40'
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
          
            <div
              className='absolute top-0 left-0 w-full h-[124px] bg-[#B7FE1A] flex items-center justify-center'
              style={{
                borderRadius: '19px 19px 0px 0px',
              }}
            >
              <div className='flex items-center gap-2 sm:gap-3'>
                <span className='text-[#062E25]/80 text-xl sm:text-2xl lg:text-[30px] font-medium italic leading-[45px] tracking-[-0.02em] whitespace-nowrap'>
                  {t('pricing.from')}
                </span>
                <span className='text-[#1F433B] text-3xl sm:text-4xl lg:text-[60px] font-bold leading-[50px] tracking-[-0.02em] uppercase whitespace-nowrap'>
                  {t('pricing.amount')}
                </span>
                <span className='text-[#062E25]/80 text-xl sm:text-2xl lg:text-[30px] font-medium italic leading-[45px] tracking-[-0.02em] whitespace-nowrap'>
                  {t('pricing.perMonth')}
                </span>
              </div>
            </div>

          
            <div className='absolute top-[124px] left-0 right-0 px-6 pt-8 pb-6 flex justify-center'>
              <div className='flex flex-col gap-5'>
                {features.map((feature, index) => (
                  <div key={index} className='flex items-center gap-4'>
                  
                    <MinimalLogoIcon
                      className='w-3.5 h-3.5 shrink-0 text-solar'
                                          />
                    <p className='text-white/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-[30px] tracking-[-0.02em]'>
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        
          <p className='text-white/80 text-sm sm:text-base lg:text-base font-medium italic leading-[30px] text-center tracking-[-0.02em] mt-6 max-w-[515px] mx-auto'>
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default SolarAboHomePricing

