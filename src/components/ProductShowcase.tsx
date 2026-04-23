import { LearnMoreLink } from './ui/learn-more-link'
import { LinkButton } from './ui/link-button'
import Image from 'next/image'

type ProductShowcaseProps = {
  title: string
  subtitle: string
  steps: { number: string; text: string }[]
  cta: string
  ctaHref: React.ComponentProps<typeof LinkButton>['href']
  imageSrc: string
  imageAlt: string
  brandLogoSrc: string
  brandLogoAlt: string
  brandLogoWidth?: number
  brandLogoHeight?: number
  exploreLabel: string
  exploreHref: React.ComponentProps<typeof LearnMoreLink>['href']
  imagePosition?: 'left' | 'right'
  mobileTextFirst?: boolean
  isCommercial?: boolean
}

const ProductShowcase = ({
  title,
  subtitle,
  steps,
  cta,
  ctaHref,
  imageSrc,
  imageAlt,
  brandLogoSrc,
  brandLogoAlt,
  brandLogoWidth = 51,
  brandLogoHeight = 49,
  exploreLabel,
  exploreHref,
  imagePosition = 'left',
  mobileTextFirst = false,
  isCommercial = false,
}: ProductShowcaseProps) => {
  const imageColumn = (
    <div className={`relative flex-1 flex flex-col ${mobileTextFirst ? 'order-2 lg:order-0' : ''}`}>
      <div className="relative flex-1 min-h-[300px] lg:min-h-0">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
      </div>
      <div className={`relative flex items-center justify-between overflow-hidden ${isCommercial ? 'bg-[#3D3858]' : 'bg-solar'}`}>
        <div className="px-8 py-5 opacity-0 pointer-events-none">
          <LearnMoreLink href={exploreHref}>{exploreLabel}</LearnMoreLink>
        </div>
        <div className="pr-4 py-2 shrink-0">
          <Image
            src={brandLogoSrc}
            alt={brandLogoAlt}
            width={brandLogoWidth}
            height={brandLogoHeight}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )

  const textColumn = (
    <div
      className={`flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-0 py-14 ${
        mobileTextFirst ? 'order-1 lg:order-0' : ''
      }`}
    >
      <div className="flex flex-col gap-[30px] max-w-[340px]">
        <div className="flex flex-col gap-5">
          <h2 className="text-foreground text-3xl md:text-[45px] font-medium">
            {title}
          </h2>
          <p className="text-foreground/80 text-lg font-light tracking-tight max-w-[387px]">
            {subtitle}
          </p>

          <div className="flex flex-col gap-2.5">
            {steps.map(step => (
              <div key={step.number} className="flex items-center gap-2">
                <div className={`w-[18px] h-[18px] rounded-[9px] border-[1.5px] flex items-center justify-center shrink-0 ${isCommercial ? 'border-[#3D3858]' : 'border-[#036B53]'}`}>
                  <span className="text-[9px] font-bold text-foreground">
                    {step.number}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground/80 tracking-tight">
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* <LinkButton href={ctaHref} variant={isCommercial ? 'quaternary' : 'primary'} className="w-fit">
          {cta}
        </LinkButton> */}
      </div>
    </div>
  )

  return (
    <section
      className="w-full"
      style={{
        background: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)',
      }}
    >
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        {imagePosition === 'left' ? (
          <>
            {imageColumn}
            {textColumn}
          </>
        ) : (
          <>
            {textColumn}
            {imageColumn}
          </>
        )}
      </div>
    </section>
  )
}

export default ProductShowcase
