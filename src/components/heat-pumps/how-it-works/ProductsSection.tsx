import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'
import Image from 'next/image'

const products = [
  { key: '1', image: '/images/heat-pumps/how-it-works/product-outdoor.png' },
  { key: '2', image: '/images/heat-pumps/how-it-works/product-indoor.png' },
  { key: '3', image: '/images/heat-pumps/how-it-works/product-ground.png' },
] as const

const ProductsSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  return (
    <section className="relative bg-[#FDFFF5] rounded-t-[30px] border-t border-[#B7C2BF] overflow-hidden py-12 md:py-16">
      <div
        className="absolute pointer-events-none"
        style={{
          width: '419px',
          height: '419px',
          right: '-50px',
          top: '140px',
          background: 'rgba(183, 254, 26, 0.12)',
          filter: 'blur(180px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[1049px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-5">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-full border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
                {t('products.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
              {t('products.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-[100px] w-full">
            {products.map(({ key, image }) => (
              <div key={key} className="flex flex-col items-center gap-[25px]">
                <div className="flex flex-col items-center gap-[15px] w-full">
                  <h3 className="text-[#062E25] text-xl md:text-[26px] font-bold text-center">
                    {t(`products.items.${key}.brand`)}
                  </h3>
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-[9px] h-[9px] rounded-[4px_0px_4px_0px] border-[1.4px] border-[#036B53] shrink-0" />
                    <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                      {t(`products.items.${key}.description`)}
                    </span>
                  </div>
                </div>

                <div className="relative w-full aspect-[283/314] rounded-[10px] overflow-hidden">
                  <Image
                    src={image}
                    alt={t(`products.items.${key}.brand`)}
                    fill
                    className="object-cover"
                  />
                </div>

                <LinkButton
                  variant="tertiary"
                  href={t(`products.items.${key}.link`)}
                >
                  {t('products.cta')}
                </LinkButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductsSection
