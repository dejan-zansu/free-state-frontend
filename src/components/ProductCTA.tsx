import { LinkButton } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ProductCTAProps {
  badge: string
  title: string
  subtitle: string
  buttonText: string
  buttonHref: string
  imageSrc: string
  imageAlt?: string
  containerClassName?: string
}

const ProductCTA = ({
  badge,
  title,
  subtitle,
  buttonText,
  buttonHref,
  imageSrc,
  imageAlt = '',
  containerClassName = '',
}: ProductCTAProps) => {
  return (
    <section className="relative h-[659px] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: 'rgba(183, 254, 26, 0.7)',
          filter: 'blur(245px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div className="absolute left-0 top-0 w-1/2 h-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="50vw"
          className="object-cover"
        />
      </div>

      <div className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center">
        <div
          className={cn(
            'flex flex-col items-center gap-10 max-w-[431px] px-4',
            containerClassName
          )}
        >
          <div
            className="px-4 py-2.5 rounded-full border border-white bg-white/20"
            style={{ backdropFilter: 'blur(65px)' }}
          >
            <span className="text-white text-base font-medium tracking-tight">
              {badge}
            </span>
          </div>

          <h2 className="text-white text-3xl md:text-4xl lg:text-[65px] font-medium leading-tight text-center capitalize">
            {title}
          </h2>

          <p className="text-white/60 text-lg md:text-[22px] font-normal leading-relaxed tracking-tight text-center">
            {subtitle}
          </p>

          <LinkButton variant="primary" href={buttonHref}>
            {buttonText}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default ProductCTA
