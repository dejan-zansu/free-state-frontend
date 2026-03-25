'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { cn } from '@/lib/utils'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

import SonnendachStep1Address from './steps/SonnendachStep1Address'
import SonnendachStep2UsableArea from './steps/SonnendachStep2UsableArea'
import SonnendachStep3SolarSystem from './steps/SonnendachStep3SolarSystem'
import SonnendachStep4Consumption from './steps/SonnendachStep4Consumption'
import SonnendachStep5CompanyDetails from './steps/SonnendachStep5CompanyDetails'
import SonnendachStep6Results from './steps/SonnendachStep5Results'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

export default function SonnendachCalculatorPage() {
  const t = useTranslations('sonnendach')
  const { currentStep, error, clearError, building } =
    useSonnendachCalculatorStore()

  useEffect(() => {
    clearError()
  }, [currentStep, clearError])

  const steps = [
    { id: 1, label: t('steps.step1.title') },
    { id: 2, label: t('steps.step2.title') },
    { id: 3, label: t('steps.step3.title') },
    { id: 4, label: t('steps.step4.title') },
    { id: 5, label: t('steps.step5Company.title') },
    { id: 6, label: t('steps.step5.title') },
  ]

  const isMapStep = currentStep === 1 || currentStep === 2
  const isMapDark = isMapStep && !!building

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SonnendachStep1Address />
      case 2:
        return <SonnendachStep2UsableArea />
      case 3:
        return <SonnendachStep3SolarSystem />
      case 4:
        return <SonnendachStep4Consumption />
      case 5:
        return <SonnendachStep5CompanyDetails />
      case 6:
        return <SonnendachStep6Results />
      default:
        return <SonnendachStep1Address />
    }
  }

  return (
    <div
      className={cn(
        isMapStep
          ? 'h-screen overflow-hidden relative'
          : 'h-screen overflow-y-auto pb-20'
      )}
      style={{
        paddingTop: '77px',
        background: PAGE_BG,
      }}
    >
      {currentStep > 1 && (
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
                    <div
                      className={cn(
                        'flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[14px] sm:text-[16px] font-medium tracking-tight transition-colors border text-[#062E25]',
                        currentStep === step.id
                          ? 'bg-[#B7FE1A] border-[rgba(123,181,168,0.4)]'
                          : currentStep > step.id
                            ? isMapDark
                              ? 'bg-[rgba(241,242,233,0.1)] border-[rgba(216,220,213,0.4)]'
                              : 'bg-[#B7FE1A]/40 border-[#7BB5A8]'
                            : isMapDark
                              ? 'bg-[rgba(241,242,233,0.1)] border-[rgba(216,220,213,0.4)] cursor-default'
                              : 'bg-[#F1F2E9] border-[#D8DCD5] cursor-default'
                      )}
                    >
                      {step.id}
                    </div>
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
      )}

      {error && (
        <div className="container mx-auto px-4 mt-4">
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive max-w-5xl mx-auto">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <main className={cn(isMapStep && 'h-full')}>{renderStep()}</main>
    </div>
  )
}
