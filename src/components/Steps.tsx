'use client'

import { motion, MotionConfig } from 'motion/react'
import { useTranslations } from 'next-intl'

import { useCalculatorEmbed } from '@/app/[locale]/calculator/CalculatorEmbedContext'
import { calculatorFlowV2Enabled, mapStep } from '@/lib/calculator-flow'
import { cn } from '@/lib/utils'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

export default function Steps() {
  const t = useTranslations('solarAboCalculator')
  const tV2 = useTranslations('calculatorV2.progress')
  const { currentStep, goToStep, building } =
    useSolarAboCalculatorStore()

  const embedded = useCalculatorEmbed()

  const steps = calculatorFlowV2Enabled
    ? [
        // Four screens, matching totalSteps in calculator-flow.ts. The result is not
        // a step: it lives in the project workspace after the contact step.
        { id: 1, label: tV2('screen1') },
        { id: 2, label: tV2('screen2') },
        { id: 3, label: tV2('screen3') },
        { id: 4, label: tV2('screen4') },
      ]
    : [
        { id: 1, label: t('progress.step2') },
        { id: 2, label: t('progress.step3') },
        { id: 3, label: t('progress.step4') },
        { id: 4, label: t('progress.step5') },
        { id: 5, label: t('progress.step6') },
      ]

  const isMapStep = currentStep === mapStep
  const isOverlayStep = isMapStep
  const isMapDark = isMapStep && !!building

  return (
    <div
      className={cn(
        'flex justify-center px-2 py-3 sm:px-4 sm:py-4',
        isOverlayStep
          ? 'absolute left-0 right-0 z-20 pointer-events-none'
          : embedded || calculatorFlowV2Enabled
            ? 'relative z-10'
            : 'sticky top-0 z-10'
      )}
      style={isOverlayStep && !embedded ? { top: '77px' } : undefined}
    >
      <div
        className={cn(
          'rounded-full pointer-events-auto w-full',
          calculatorFlowV2Enabled
            ? 'px-4 py-2 sm:px-6 sm:py-2.5 max-w-[720px]'
            : 'px-3 py-2 sm:px-6 sm:py-4 max-w-[1009px]'
        )}
        style={{
          background:
            calculatorFlowV2Enabled && !isMapStep
              ? 'rgba(255, 255, 255, 1)'
              : 'rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(156, 169, 166, 0.3)',
          backdropFilter: isMapDark ? 'blur(14.7px)' : 'blur(29px)',
          boxShadow: '0px 25px 34px 0px rgba(183, 254, 26, 0.1)',
        }}
      >
        {calculatorFlowV2Enabled ? (
          <>
            <MotionConfig reducedMotion="user">
              <div className="hidden sm:flex items-center justify-between gap-1">
                {steps.map(step => (
                  <button
                    key={step.id}
                    type="button"
                    disabled={step.id > currentStep}
                    onClick={() => goToStep(step.id)}
                    className={cn(
                      'relative rounded-full px-3.5 py-1.5 text-sm tracking-tight whitespace-nowrap transition-colors',
                      currentStep === step.id
                        ? 'font-medium text-[#062E25]'
                        : currentStep > step.id
                          ? isMapDark
                            ? 'text-white/80 cursor-pointer hover:bg-[rgba(241,242,233,0.15)]'
                            : 'text-[#062E25]/80 cursor-pointer hover:bg-[#B7FE1A]/25'
                          : isMapDark
                            ? 'text-white/70 cursor-default'
                            : 'text-[#062E25]/75 cursor-default'
                    )}
                  >
                    {currentStep === step.id && (
                      <motion.span
                        layoutId="calculatorStepPill"
                        className="absolute inset-0 rounded-full bg-[#B7FE1A]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">{step.label}</span>
                  </button>
                ))}
              </div>
            </MotionConfig>
            <div className="sm:hidden flex flex-col items-center gap-1.5 py-0.5">
              <div className="flex items-center gap-1.5">
                {steps.map(step => (
                  <span
                    key={step.id}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      currentStep === step.id
                        ? 'w-4 bg-[#B7FE1A]'
                        : currentStep > step.id
                          ? cn('w-1.5', isMapDark ? 'bg-white/60' : 'bg-[#062E25]/50')
                          : cn('w-1.5', isMapDark ? 'bg-white/25' : 'bg-[#062E25]/15')
                    )}
                  />
                ))}
              </div>
              <div
                className={cn(
                  'text-sm tracking-tight',
                  isMapDark ? 'text-white' : 'text-[#062E25]'
                )}
              >
                {steps[currentStep - 1]?.label}
              </div>
            </div>
          </>
        ) : (
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
                      currentStep === step.id ? 'opacity-100' : isMapDark ? 'opacity-60' : 'opacity-75'
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
        )}
      </div>
    </div>
  )
}
