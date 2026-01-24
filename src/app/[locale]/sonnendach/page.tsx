'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Progress } from '@/components/ui/progress'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

import SonnendachStep1Address from './steps/SonnendachStep1Address'
import SonnendachStep3Results from './steps/SonnendachStep3Results'

export default function SonnendachCalculatorPage() {
  const t = useTranslations('sonnendach')
  const { currentStep, error, clearError } = useSonnendachCalculatorStore()

  // Simplified 2-step flow: Selection -> Results
  // (Step 1 now combines address search + roof selection)
  const steps = [
    { id: 1, title: t('steps.step1.title'), description: t('steps.step1.description') },
    { id: 3, title: t('steps.step3.title'), description: t('steps.step3.description') },
  ]

  useEffect(() => {
    clearError()
  }, [currentStep, clearError])

  // Map internal step to display step for progress calculation
  const displayStep = currentStep === 3 ? 2 : 1
  const progress = ((displayStep - 1) / (steps.length - 1)) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SonnendachStep1Address />
      case 3:
        return <SonnendachStep3Results />
      default:
        return <SonnendachStep1Address />
    }
  }

  return (
    <div className='flex flex-col' style={{ height: 'calc(100vh - 84px)', marginTop: '84px' }}>
      {currentStep !== 1 && (
        <div className='bg-background/80 backdrop-blur-sm z-40 shrink-0'>
          <div className='container mx-auto px-4 py-4'>
            <div className='space-y-2'>
              <Progress value={progress} className='h-2' />
              <div className='hidden md:flex items-center justify-between text-xs'>
                {steps.map((step, index) => {
                  const isCurrentStep = currentStep === step.id
                  const isCompleted = displayStep > (index + 1)
                  return (
                    <div
                      key={step.id}
                      className={`text-center ${
                        isCurrentStep
                          ? 'font-semibold'
                          : isCompleted
                            ? 'text-energy'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      <main className='flex-1 overflow-hidden relative'>
        {error && (
          <div className='p-4 mx-6 mt-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive max-w-5xl'>
            <p className='font-medium'>{t('error')}</p>
            <p className='text-sm'>{error}</p>
          </div>
        )}

        <div className='h-full'>{renderStep()}</div>
      </main>
    </div>
  )
}
