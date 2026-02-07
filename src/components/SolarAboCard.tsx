import { cn } from '@/lib/utils'
import Image from 'next/image'
import { ReactNode } from 'react'

interface SolarAboCardProps {
  image: string
  imageAlt: string
  title: string
  subtitle: string
  children?: ReactNode
  className?: string
  commercial?: boolean
  compact?: boolean
}

const SolarAboCard = ({
  image,
  imageAlt,
  title,
  subtitle,
  children,
  className,
  commercial = false,
  compact = false,
}: SolarAboCardProps) => {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl overflow-hidden border',
        'shadow-[0px_4px_24px_0px_rgba(0,0,0,0.45),inset_0px_0px_44px_0px_rgba(0,0,0,0.4)]',
        compact
          ? 'w-[160px] sm:w-[180px] lg:w-[200px] h-[228px] pt-5 pb-4'
          : 'w-full max-w-[264px] shrink-0 h-[268px] pt-8 pb-6',
        commercial ? 'bg-[#3D3858] border-[#3D3858]' : 'bg-[#062E25] border-[#062E25]',
        className
      )}
    >
      <div
        className={cn(
          'relative z-10 flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white',
          compact ? 'mb-3 h-[96px] w-[96px]' : 'mb-5 h-[132px] w-[132px]',
          commercial ? 'border-[#3D3858] drop-shadow-[0_0_44px_rgba(159,62,79,0.3)]' : 'border-[#062E25] drop-shadow-[0_0_44px_rgba(183,254,26,0.3)]'
        )}
      >
        <Image
          src={image}
          alt={imageAlt}
          width={compact ? 96 : 132}
          height={compact ? 96 : 132}
          className="object-contain"
        />
      </div>
      <div
        className={cn(
          'z-10 flex flex-1 flex-col items-center justify-center',
          compact ? 'gap-1.5 px-2' : 'gap-2.5 px-4'
        )}
      >
        <h3
          className={cn(
            'text-center font-medium leading-[1.09em] tracking-[-0.02em] text-white',
            compact ? 'text-sm lg:text-base' : 'text-lg sm:text-xl lg:text-[22px]'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-center font-medium leading-[1.375em] tracking-[-0.02em] text-white/80',
            compact ? 'text-xs lg:text-sm' : 'text-sm sm:text-base lg:text-base'
          )}
        >
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  )
}

export default SolarAboCard
