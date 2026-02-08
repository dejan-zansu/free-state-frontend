import LongArrow from '@/components/icons/LongArrow'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const HeatPumpsSolutions = async () => {
  const t = await getTranslations('heatPumps')

  const solutions = [
    {
      title: t('solutions.residential.title'),
      description: t('solutions.residential.description'),
      image: '/images/heat-pumps/heat-pump-solutions-1.png',
    },
    {
      title: t('solutions.agricultural.title'),
      description: t('solutions.agricultural.description'),
      image: '/images/heat-pumps/heat-pump-solutions-2.png',
    },
    {
      title: t('solutions.commercial.title'),
      description: t('solutions.commercial.description'),
      image: '/images/heat-pumps/heat-pump-solutions-3.png',
    },
  ]

  return (
    <section className="relative bg-[#FDFFF5] py-10 md:py-12 lg:py-14">
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />

      <div className="container mx-auto px-4 max-w-[1200px]">
        <h2 className="text-[#062E25] text-3xl md:text-4xl lg:text-[45px] font-medium leading-tight text-center mb-12 md:mb-16 lg:mb-20">
          {t('solutions.title')}
        </h2>

        <div className="flex flex-col lg:flex-row lg:justify-between">
          {/* Left side - Solution items */}
          <div className="w-full lg:w-[288px] flex flex-col mb-8 lg:mb-0">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="flex items-center h-auto lg:h-[150px]"
              >
                <div className="flex flex-col">
                  <h3 className="text-[#062E25] text-lg md:text-[22px] font-medium leading-tight tracking-tight mb-2 md:mb-3">
                    {solution.title}
                  </h3>
                  <p className="text-[#062E25]/80 text-sm md:text-base font-medium leading-relaxed tracking-tight">
                    {solution.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Center - Arrows */}
          <div className="hidden lg:flex flex-col flex-shrink-0">
            {solutions.map((_, index) => (
              <div key={index} className="h-[150px] flex items-center">
                <LongArrow className="text-[#062E25]" />
              </div>
            ))}
          </div>

          {/* Right side - Images */}
          <div className="w-full lg:w-[680px] flex flex-col overflow-hidden border border-t-0 border-b-0 border-x-[#062E25]/50 flex-shrink-0">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className={`relative w-full h-[150px] ${
                  index === 1 ? 'bg-[#B7FE1A]' : ''
                }`}
              >
                <Image
                  src={solution.image}
                  alt={solution.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeatPumpsSolutions
