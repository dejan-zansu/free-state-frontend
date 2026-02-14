'use client'

import { useTranslations } from 'next-intl'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

import Step1BuildingType from './steps/Step1BuildingType'
import Step2HouseholdSize from './steps/Step2HouseholdSize'
import Step3Devices from './steps/Step3Devices'
import Step4RoofAreas from './steps/Step4RoofAreas'
import Step5RoofCovering from './steps/Step5RoofCovering'
import Step6ContactDetails from './steps/Step6ContactDetails'

export default function SolarAboCalculatorPage() {
  const t = useTranslations('solarAboCalculator')
  const { currentStep } = useSolarAboCalculatorStore()

  const steps = [
    { id: 1, label: t('progress.step1') },
    { id: 2, label: t('progress.step2') },
    { id: 3, label: t('progress.step3') },
    { id: 4, label: t('progress.step4') },
    { id: 5, label: t('progress.step5') },
    { id: 6, label: t('progress.step6') },
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BuildingType />
      case 2:
        return <Step2HouseholdSize />
      case 3:
        return <Step3Devices />
      case 4:
        return <Step4RoofAreas />
      case 5:
        return <Step5RoofCovering />
      case 6:
        return <Step6ContactDetails />
      default:
        return <Step1BuildingType />
    }
  }

  return (
    <div className='flex flex-col' style={{ height: 'calc(100vh - 84px)', marginTop: '84px' }}>
      <div className='bg-background/80 backdrop-blur-sm z-40 shrink-0'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-center gap-1 overflow-x-auto'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div className='flex flex-col items-center'>
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.id
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.id}
                  </div>
                  <span
                    className={cn(
                      'mt-1 text-[10px] whitespace-nowrap hidden sm:block',
                      currentStep === step.id
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-1 h-0.5 w-6 sm:w-10 transition-colors',
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className='flex-1 overflow-hidden'>
        <div className='h-full'>{renderStep()}</div>
      </main>
    </div>
  )
}
