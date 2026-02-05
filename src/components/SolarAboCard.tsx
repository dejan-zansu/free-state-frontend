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
}

const SolarAboCard = ({
  image,
  imageAlt,
  title,
  subtitle,
  children,
  className = '',
  commercial = false,
}: SolarAboCardProps) => {
  return (
    <div
      className={`relative w-full max-w-[264px] h-[268px] border rounded-xl overflow-hidden flex flex-col items-center justify-center pt-8 pb-6 ${commercial ? 'bg-[#3D3858] border-[#3D3858]' : 'bg-[#062E25] border-[#062E25]'} ${className}`}
      style={{
        boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.45), inset 0px 0px 44px 0px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        className='relative w-[132px] h-[132px] flex items-center justify-center mb-5 shrink-0 rounded-full overflow-hidden z-10'
        style={{
          background: '#F3F4EE',
          border: '1px solid #062E25',
          filter: commercial
            ? 'drop-shadow(0 0 44px rgba(159, 62, 79, 0.3))'
            : 'drop-shadow(0 0 44px rgba(183, 254, 26, 0.30))',
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
        <h3 className='text-white text-lg sm:text-xl lg:text-[22px] font-medium leading-[1.09em] tracking-[-0.02em] text-center'>
          {title}
        </h3>
        <p className='text-white/80 text-sm sm:text-base lg:text-base font-medium leading-[1.375em] tracking-[-0.02em] text-center'>
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  )
}

export default SolarAboCard
