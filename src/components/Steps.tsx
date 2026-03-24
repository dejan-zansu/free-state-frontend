'use client'

import { cn } from '@/lib/utils'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { useTranslations } from 'next-intl'

export default function Steps() {
  const t = useTranslations('solarAboCalculator')
  const { currentStep, goToStep, building } =
    useSolarAboCalculatorStore()

  const steps = [
    { id: 1, label: t('progress.step2') },
    { id: 2, label: t('progress.step3') },
    { id: 3, label: t('progress.step4') },
    { id: 4, label: t('progress.step5') },
    { id: 5, label: t('progress.step6') },
    { id: 6, label: t('progress.step7') },
  ]

  const isMapStep = currentStep === 3
  const isMapDark = isMapStep && !!building

  return (
    <div
      className={cn(
        'flex justify-center px-2 py-3 sm:px-4 sm:py-4',
        isMapStep
          ? 'absolute left-0 right-0 z-20 pointer-events-none'
          : 'sticky top-0 z-10'
      )}
      style={isMapStep ? { top: '77px' } : undefined}
    >
      <div
        className="rounded-full px-3 py-2 sm:px-6 sm:py-4 max-w-[1009px] w-full pointer-events-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(156, 169, 166, 0.3)',
          backdropFilter: isMapDark ? 'blur(14.7px)' : 'blur(29px)',
          boxShadow: '0px 25px 34px 0px rgba(183, 254, 26, 0.1)',
        }}
      >
        <div className="flex items-start justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start flex-1">
              <div className="flex flex-col items-center gap-[3px] sm:gap-[5px] w-[28px] sm:w-[50px]">
                <button
                  type="button"
                  disabled={step.id > currentStep}
                  onClick={() => goToStep(step.id)}
                  className={cn(
                    'flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full text-sm sm:text-[16px] font-medium tracking-tight transition-colors border text-[#062E25]',
                    currentStep === step.id
                      ? 'bg-[#B7FE1A] border-[rgba(123,181,168,0.4)]'
                      : currentStep > step.id
                        ? isMapDark
                          ? 'bg-[rgba(241,242,233,0.1)] border-[rgba(216,220,213,0.4)] cursor-pointer hover:bg-[rgba(241,242,233,0.3)]'
                          : 'bg-[#B7FE1A]/40 border-[#7BB5A8] cursor-pointer hover:bg-[#B7FE1A]/60'
                        : isMapDark
                          ? 'bg-[rgba(241,242,233,0.1)] border-[rgba(216,220,213,0.4)] cursor-default'
                          : 'bg-[#F1F2E9] border-[#D8DCD5] cursor-default'
                  )}
                >
                  {step.id}
                </button>
                <span
                  className={cn(
                    'text-sm tracking-tight whitespace-nowrap hidden sm:block',
                    isMapDark ? 'text-white' : 'text-[#062E25]',
                    currentStep === step.id ? 'opacity-100' : isMapDark ? 'opacity-60' : 'opacity-40'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center pt-[10px] sm:pt-[14px]">
                  <div
                    className={cn(
                      'w-full h-px opacity-20',
                      isMapDark ? 'bg-[#EAEDDF]' : 'bg-[#036B53]'
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
