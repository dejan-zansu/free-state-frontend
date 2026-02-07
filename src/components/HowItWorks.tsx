'use client'

import { cn } from '@/lib/utils'

export interface HowItWorksStep {
  number: string
  text: string
  icon: React.ElementType
  bubblePosition: 'top' | 'bottom'
  iconStyle?: { width?: number; height?: number }
}

interface HowItWorksProps {
  title: string
  subtitle: string
  steps: HowItWorksStep[]
  className?: string
  isCommercial?: boolean
}

const HowItWorks = ({
  title,
  subtitle,
  steps,
  className,
  isCommercial = false,
}: HowItWorksProps) => {
  return (
    <section className={cn('py-16 sm:py-20 lg:py-24 bg-[#FDFFF5]', className)}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4">
            {title}
          </h2>
          <p className="text-[#062E25]/70 text-base sm:text-lg lg:text-xl">
            {subtitle}
          </p>
        </div>

        <div className="hidden lg:flex justify-between items-center gap-4 relative min-h-[340px]">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isTop = step.bubblePosition === 'top'

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center w-[180px]',
                  isTop ? 'self-start' : 'self-end'
                )}
              >
                {isTop ? (
                  <>
                    <div
                      className={cn(
                        'relative flex items-center justify-center w-[100px] h-[100px] rounded-2xl',
                        isCommercial ? 'bg-[#3D3858]' : 'bg-[#062E25]'
                      )}
                    >
                      <Icon
                        className={cn(
                          isCommercial ? 'text-white' : 'text-[#9EE028]'
                        )}
                        style={step.iconStyle}
                      />

                      <div
                        className={cn(
                          'absolute bottom-0 translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px]',
                          isCommercial
                            ? 'border-t-[#3D3858]'
                            : 'border-t-[#062E25]'
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-full text-lg mt-8',
                        isCommercial
                          ? 'bg-energy text-white'
                          : 'bg-[#B7FE1A] text-[#062E25]'
                      )}
                    >
                      {step.number}
                    </div>

                    <p className="text-[#062E25] text-lg font-medium text-center leading-tight mt-3 max-w-[120px]">
                      {step.text}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[#062E25] text-lg font-medium text-center leading-tight mb-3 max-w-[120px]">
                      {step.text}
                    </p>

                    <div
                      className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-full text-lg mb-8',
                        isCommercial
                          ? 'bg-energy text-white'
                          : 'bg-[#B7FE1A] text-[#062E25]'
                      )}
                    >
                      {step.number}
                    </div>

                    <div
                      className={cn(
                        'relative flex items-center justify-center w-[100px] h-[100px] rounded-2xl',
                        isCommercial ? 'bg-[#3D3858]' : 'bg-[#062E25]'
                      )}
                    >
                      <Icon
                        className={cn(
                          isCommercial ? 'text-white' : 'text-[#9EE028]'
                        )}
                        style={step.iconStyle}
                      />

                      <div
                        className={cn(
                          'absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[16px]',
                          isCommercial
                            ? 'border-b-[#3D3858]'
                            : 'border-b-[#062E25]'
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center gap-3',
                  index === steps.length - 1 &&
                    steps.length % 2 !== 0 &&
                    'col-span-2 sm:col-span-1'
                )}
              >
                <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-[#062E25] rounded-2xl">
                  <Icon
                    className="w-8 h-8 sm:w-10 sm:h-10 text-[#9EE028]"
                    strokeWidth={1.5}
                  />

                  <div className="absolute bottom-0 translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-[#062E25]" />
                </div>

                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#B7FE1A] text-[#062E25] font-semibold text-base sm:text-lg mt-2">
                  {step.number}
                </div>

                <p className="text-[#062E25] text-base sm:text-lg font-medium text-center leading-tight">
                  {step.text}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
