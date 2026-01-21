import Image from 'next/image'
import { ReactNode } from 'react'

interface SolarAboCardProps {
  image: string
  imageAlt: string
  title: string
  subtitle: string
  children?: ReactNode
  className?: string
}

const SolarAboCard = ({
  image,
  imageAlt,
  title,
  subtitle,
  children,
  className = '',
}: SolarAboCardProps) => {
  return (
    <div
      className={`relative w-full max-w-[264px] h-[268px] border border-[#062E25] rounded-xl overflow-hidden flex flex-col items-center justify-center pt-8 pb-6 hover:bg-solar hover:border-solar transition-colors ${className}`}
    >
      <div
        className='relative w-[132px] h-[132px] flex items-center justify-center mb-5 shrink-0 rounded-full overflow-hidden bg-white z-10'
        style={{
          boxSizing: 'border-box',
          border: '1px solid #062E25',
        }}
      >
        <Image
          src={image}
          alt={imageAlt}
          width={132}
          height={132}
          className='object-contain'
        />
      </div>
      <div className='flex flex-col items-center gap-2.5 px-4 flex-1 justify-center z-10'>
        <h3 className='text-[#062E25] text-lg sm:text-xl lg:text-[22px] font-medium leading-[1.09em] tracking-[-0.02em] text-center'>
          {title}
        </h3>
        <p className='text-[#062E25]/80 text-sm sm:text-base lg:text-base font-medium leading-[1.375em] tracking-[-0.02em] text-center'>
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  )
}

export default SolarAboCard
