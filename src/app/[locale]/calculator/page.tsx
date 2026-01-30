'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Progress } from '@/components/ui/progress'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

import SonnendachStep1Address from './steps/SonnendachStep1Address'
import SonnendachStep2UsableArea from './steps/SonnendachStep2UsableArea'
import SonnendachStep3SolarSystem from './steps/SonnendachStep3SolarSystem'
import SonnendachStep4Consumption from './steps/SonnendachStep4Consumption'
import SonnendachStep5Results from './steps/SonnendachStep5Results'
import SonnendachStep6PersonalInfo from './steps/SonnendachStep6PersonalInfo'
import SonnendachStep7ContractReview from './steps/SonnendachStep7ContractReview'
import SonnendachStep8Signature from './steps/SonnendachStep8Signature'
import SonnendachConfirmation from './steps/SonnendachConfirmation'

export default function SonnendachCalculatorPage() {
  const t = useTranslations('sonnendach')
  const { currentStep, error, clearError, signatureStatus } = useSonnendachCalculatorStore()

  // Check if we're on the confirmation page (after successful signature)
  const isConfirmation = currentStep === 9 || signatureStatus === 'signed'

  // 8-step flow + confirmation
  const steps = [
    { id: 1, title: t('steps.step1.title'), description: t('steps.step1.description') },
    { id: 2, title: t('steps.step2.title'), description: t('steps.step2.description') },
    { id: 3, title: t('steps.step3.title'), description: t('steps.step3.description') },
    { id: 4, title: t('steps.step4.title'), description: t('steps.step4.description') },
    { id: 5, title: t('steps.step5.title'), description: t('steps.step5.description') },
    { id: 6, title: t('steps.step6.title'), description: t('steps.step6.description') },
    { id: 7, title: t('steps.step7.title'), description: t('steps.step7.description') },
    { id: 8, title: t('steps.step8.title'), description: t('steps.step8.description') },
  ]

  useEffect(() => {
    clearError()
  }, [currentStep, clearError])

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  const renderStep = () => {
    // Show confirmation page after successful signature
    if (isConfirmation) {
      return <SonnendachConfirmation />
    }

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
        return <SonnendachStep5Results />
      case 6:
        return <SonnendachStep6PersonalInfo />
      case 7:
        return <SonnendachStep7ContractReview />
      case 8:
        return <SonnendachStep8Signature />
      default:
        return <SonnendachStep1Address />
    }
  }

  return (
    <div className='flex flex-col' style={{ height: 'calc(100vh - 84px)', marginTop: '84px' }}>
      {currentStep !== 1 && !isConfirmation && (
        <div className='bg-background/80 backdrop-blur-sm z-40 shrink-0'>
          <div className='container mx-auto px-4 py-4'>
            <div className='space-y-2'>
              <Progress value={progress} className='h-2' />
              <div className='hidden md:flex items-center justify-between text-xs'>
                {steps.map((step, index) => {
                  const isCurrentStep = currentStep === step.id
                  const isCompleted = currentStep > step.id
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
