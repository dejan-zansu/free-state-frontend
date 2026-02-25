import HeroNav from '@/components/HeroNav'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface PageHeroProps {
  backgroundImage?: string
  title?: string
  description?: string
  children?: ReactNode
  className?: string
  contentClassName?: string
  isCommercial?: boolean
}

const PageHero = ({
  backgroundImage,
  title,
  description,
  children,
  className,
  contentClassName,
  isCommercial = false,
}: PageHeroProps) => {
  return (
    <section
      className={cn(
        'relative z-20 min-h-[550px] flex justify-center overflow-hidden rounded-b-[40px] bg-[#4A9A99]',
        className
      )}
    >
      <HeroNav isCommercial={isCommercial} />

      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      <div
        className={cn(
          'relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px] pt-[220px] w-full',
          contentClassName
        )}
      >
        <div className="flex flex-col items-center text-center">
          {title && (
            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-medium leading-[1em] capitalize whitespace-pre-line">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-xl mt-5 text-white/80">{description}</p>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}

export default PageHero
