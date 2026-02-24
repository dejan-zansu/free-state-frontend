import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const products = [
  {
    key: 'e3dc',
    image: '/images/energy-storage/product-e3dc.png',
    hasSections: ['features', 'warranty', 'options'] as const,
  },
  {
    key: 'sonnen',
    image: '/images/energy-storage/product-sonnen-50d6f2.png',
    hasSections: ['features', 'warranty', 'options'] as const,
  },
  {
    key: 'byd',
    image: '/images/energy-storage/product-byd-50d6f2.png',
    hasSections: ['features', 'warranty'] as const,
  },
  {
    key: 'huawei',
    image: '/images/energy-storage/product-huawei-50d6f2.png',
    hasSections: ['features', 'warranty'] as const,
  },
] as const

const DiamondBullet = () => (
  <div
    className="w-[9px] h-[9px] shrink-0 border border-[#036B53]"
    style={{ borderRadius: '4px 0px 4px 0px' }}
  />
)

const CheckBullet = () => (
  <div className="w-[14px] h-[14px] shrink-0 rounded-full bg-[#B7FE1A] flex items-center justify-center">
    <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
      <path
        d="M0.5 2.1L2.16 3.5L5.5 0.5"
        stroke="#062E25"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
)

const Divider = () => (
  <div className="w-full max-w-[186px] h-px bg-[#1F433B]/20" />
)

const StorageSolutionsSection = async () => {
  const t = await getTranslations('energyStorage')

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[907px] mx-auto px-4 sm:px-6 pt-12 md:pt-[50px] pb-[56px]">
        <div className="flex flex-col items-center gap-5">
          <div
            className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(65px)',
              WebkitBackdropFilter: 'blur(65px)',
            }}
          >
            <span className="text-[#062E25] text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
              {t('solutions.eyebrow')}
            </span>
          </div>

          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('solutions.title')}
          </h2>

          <p className="text-[#062E25]/80 text-base md:text-[22px] font-light leading-[1.27em] tracking-[-0.02em] text-center">
            {t('solutions.description')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-[30px]">
        {products.map((product, index) => {
          const featuresRaw = t(`solutions.products.${product.key}.features`)
          const features = featuresRaw.split('|')
          const warrantyRaw = t(`solutions.products.${product.key}.warranty`)
          const warranties = warrantyRaw.split('|')
          const hasOptions = (
            product.hasSections as readonly string[]
          ).includes('options')
          const options = hasOptions
            ? t(`solutions.products.${product.key}.options`).split('|')
            : []

          return (
            <div
              key={product.key}
              className="relative max-w-[1440px] mx-auto w-full border border-[#B7C2BF] rounded-t-[30px] bg-[#FDFFF5] overflow-hidden"
            >
              <div className="max-w-[1038px] mx-auto px-4 sm:px-6 lg:px-0 py-12 md:py-[50px]">
                <div className={`flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-[100px] justify-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex flex-col gap-5 w-full md:w-[238px] shrink-0">
                    <div className="flex flex-col gap-4">
                      <span className="text-[#062E25] text-base font-bold capitalize">
                        {t(`solutions.products.${product.key}.featuresLabel`)}
                      </span>
                      <div className="flex flex-col gap-[10px]">
                        {features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <DiamondBullet />
                            <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                              {feature.trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Divider />

                    <div className="flex flex-col gap-4">
                      <span className="text-[#062E25] text-base font-bold capitalize">
                        {t('solutions.warrantyLabel')}
                      </span>
                      <div className="flex flex-col gap-[10px]">
                        {warranties.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckBullet />
                            <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                              {item.trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {options.length > 0 && (
                      <>
                        <Divider />
                        <div className="flex flex-col gap-4">
                          <span className="text-[#062E25] text-base font-bold capitalize">
                            {t('solutions.optionsLabel')}
                          </span>
                          <div className="flex flex-col gap-[10px]">
                            {options.map((item, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <CheckBullet />
                                <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                                  {item.trim()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4 w-full md:w-[260px] shrink-0">
                    <h3 className="text-[#062E25] text-xl md:text-[26px] font-bold text-center">
                      {t(`solutions.products.${product.key}.name`)}
                    </h3>
                    <div className="relative w-[200px] sm:w-[260px] h-[320px] sm:h-[418px]">
                      <Image
                        src={product.image}
                        alt={t(`solutions.products.${product.key}.name`)}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <LinkButton
                      variant="tertiary"
                      href={t('solutions.ctaLink') as '/contact'}
                    >
                      {t('solutions.cta')}
                    </LinkButton>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default StorageSolutionsSection
