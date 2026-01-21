import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

const SolarAboHomeHowItWorks = async () => {
  const t = await getTranslations('solarAboHome.howItWorks')

  const steps = [
    {
      number: '04',
      text: t('steps.step4'),
      row: 0, // First row (0-indexed)
      col: 6, // 7th column (0-indexed: 0-9)
      isHighlighted: false,
    },
    {
      number: '01',
      text: t('steps.step1'),
      row: 1, // Second row
      col: 1, // 2nd column
      isHighlighted: false,
    },
    {
      number: '03',
      text: t('steps.step3'),
      row: 1, // Second row
      col: 4, // 5th column
      isHighlighted: true,
    },
    {
      number: '05',
      text: t('steps.step5'),
      row: 1, // Second row
      col: 8, // 9th column
      isHighlighted: false,
    },
    {
      number: '02',
      text: t('steps.step2'),
      row: 2, // Third row
      col: 3, // 4th column
      isHighlighted: false,
    },
  ]

  return (
    <section className='relative py-16 sm:pt-16 bg-white overflow-visible'>
      <div className='max-w-[1440px] mx-auto px-4 sm:px-6'>
        {/* Header */}
        <div className='flex flex-col items-center text-center mb-12 sm:mb-14 mx-auto'>
          <h2 className='text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1em] mb-5'>
            {t('title')}
          </h2>
          <p className='text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-[1.36em] tracking-[-0.02em]'>
            {t('subtitle')}
          </p>
        </div>

        {/* Grid Container */}
        <div className='relative w-full max-w-[1200px] mx-auto'>
          {/* Dashed Grid - Desktop */}
          <div className='hidden lg:block relative w-full aspect-[10/3] min-h-[400px]'>
            {/* Grid Background with Dashed Lines using SVG */}
            <svg
              className='absolute inset-0 w-full h-full pointer-events-none'
              style={{ zIndex: 0 }}
            >
              <defs>
                <pattern
                  id='dashedGridVertical'
                  width='10%'
                  height='100%'
                  patternUnits='userSpaceOnUse'
                >
                  <line
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='100%'
                    stroke='#D1D5DB'
                    strokeWidth='1'
                    strokeDasharray='8 4'
                  />
                </pattern>
                <pattern
                  id='dashedGridHorizontal'
                  width='100%'
                  height='25%'
                  patternUnits='userSpaceOnUse'
                >
                  <line
                    x1='0'
                    y1='0'
                    x2='100%'
                    y2='0'
                    stroke='#D1D5DB'
                    strokeWidth='1'
                    strokeDasharray='8 4'
                  />
                </pattern>
                {/* Pattern for cross marks at intersections */}
                <pattern
                  id='gridCrosses'
                  x='0'
                  y='0'
                  width='10%'
                  height='25%'
                  patternUnits='userSpaceOnUse'
                  viewBox='0 0 100 100'
                  preserveAspectRatio='none'
                >
                  {/* Cross at top-left corner (0, 0) - all parts within viewBox */}
                  <line
                    x1='0'
                    y1='0'
                    x2='6'
                    y2='0'
                    stroke='#9CA3AF'
                    strokeWidth='2'
                  />
                  <line
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='6'
                    stroke='#9CA3AF'
                    strokeWidth='2'
                  />
                  {/* Cross at top-right corner (100, 0) */}
                  <line
                    x1='100'
                    y1='0'
                    x2='94'
                    y2='0'
                    stroke='#9CA3AF'
                    strokeWidth='2'
                  />
                  <line
                    x1='100'
                    y1='0'
                    x2='100'
                    y2='6'
                    stroke='#9CA3AF'
                    strokeWidth='2'
                  />
                  {/* Cross at bottom-left corner (0, 100) */}
                  <line
                    x1='0'
                    y1='100'
                    x2='6'
                    y2='100'
                    stroke='#9CA3AF'
                    strokeWidth='2'
                  />
                  <line
                    x1='0'
                    y1='100'
                    x2='0'
                    y2='94'
                    stroke='#9CA3AF'
                    strokeWidth='2'
                  />
                  {/* Cross at bottom-right corner (100, 100) */}
                  <line
                    x1='100'
                    y1='100'
                    x2='94'
                    y2='100'
                    stroke='#9CA3AF'
                    strokeWidth='2'
                  />
                  <line
                    x1='100'
                    y1='100'
                    x2='100'
                    y2='94'
                    stroke='#9CA3AF'
                    strokeWidth='2'
                  />
                </pattern>
                {/* Clip path to hide the 4th row but keep crosses visible */}
                <clipPath id='gridClip'>
                  <rect x='0' y='0' width='100%' height='75%' />
                </clipPath>
              </defs>
              {/* Grid lines - clipped to hide bottom row */}
              <g clipPath='url(#gridClip)'>
                <rect width='100%' height='100%' fill='url(#dashedGridVertical)' />
                <rect width='100%' height='100%' fill='url(#dashedGridHorizontal)' />
              </g>
              {/* Cross marks at all intersections - not clipped so bottom row crosses are visible */}
              <rect width='100%' height='100%' fill='url(#gridCrosses)' />
              {/* Ensure right line is visible */}
              <line x1='100%' y1='0' x2='100%' y2='100%' stroke='#D1D5DB' strokeWidth='1' strokeDasharray='8 4' />
            </svg>
            

            {/* Steps positioned on grid */}
            <div className='relative w-full h-full' style={{ zIndex: 10 }}>
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    'absolute flex flex-col items-start justify-between p-3 sm:p-4',
                    'w-[calc(100%/10)] h-[calc(100%/3)]',
                    'overflow-hidden',
                    step.isHighlighted ? 'bg-[#B7FE1A]' : 'bg-[#062E25]'
                  )}
                  style={{
                    left: `calc(${step.col} * 100% / 10)`,
                    top: `calc(${step.row} * 100% / 3)`,
                  }}
                >
                  {/* Step Number */}
                  <div
                    className={cn(
                      'text-sm sm:text-base font-normal leading-[1.93em] tracking-[-0.02em] uppercase shrink-0',
                      step.isHighlighted
                        ? 'text-[#062E25]/80'
                        : 'text-[#B7FE1A]'
                    )}
                  >
                    {step.number}
                  </div>

                  {/* Step Text */}
                  <p
                    className={cn(
                      'text-base sm:text-lg lg:text-[22px] font-medium leading-[1.09em] tracking-[-0.02em] break-words overflow-hidden',
                      step.isHighlighted
                        ? 'text-[#062E25]/80'
                        : 'text-white/80'
                    )}
                  >
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Vertical step list for smaller screens */}
          <div className='lg:hidden space-y-6 mt-8'>
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg',
                  step.isHighlighted ? 'bg-[#B7FE1A]' : 'bg-white border border-[#062E25]/10'
                )}
              >
                <div
                  className={cn(
                    'text-2xl font-normal leading-[1.93em] tracking-[-0.02em] uppercase shrink-0',
                    step.isHighlighted
                      ? 'text-[#062E25]/80'
                      : 'text-[#9EE028]'
                  )}
                >
                  {step.number}
                </div>
                <p
                  className={cn(
                    'text-lg font-medium leading-[1.09em] tracking-[-0.02em] whitespace-pre-line',
                    step.isHighlighted
                      ? 'text-[#062E25]/80'
                      : 'text-[#062E25]/80'
                  )}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarAboHomeHowItWorks
