'use client'

import { useTranslations } from 'next-intl'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

import SolarModelSelection from './SolarModelSelection'
import StepMultiPlanning from './steps/StepMultiPlanning'
import Step1BuildingType from './steps/Step1BuildingType'
import Step2HouseholdSize from './steps/Step2HouseholdSize'
import Step3Devices from './steps/Step3Devices'
import Step4RoofAreas from './steps/Step4RoofAreas'
import Step5RoofCovering from './steps/Step5RoofCovering'
import StepResults from './steps/StepResults'
import Step6ContactDetails from './steps/Step6ContactDetails'
import StepContractReview from './steps/StepContractReview'
import StepSignature from './steps/StepSignature'
import StepConfirmation from './steps/StepConfirmation'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

export default function SolarAboCalculatorPage() {
  const t = useTranslations('solarAboCalculator')
  const { solarModel, currentStep, signatureStatus, showMultiInterstitial, goToStep } =
    useSolarAboCalculatorStore()

  if (!solarModel) {
    return (
      <div
        className="min-h-screen"
        style={{
          paddingTop: '77px',
          background: PAGE_BG,
        }}
      >
        <main>
          <SolarModelSelection />
        </main>
      </div>
    )
  }

  if (showMultiInterstitial) {
    return (
      <div
        className="min-h-screen"
        style={{
          paddingTop: '77px',
          background: PAGE_BG,
        }}
      >
        <main>
          <StepMultiPlanning />
        </main>
      </div>
    )
  }

  const isConfirmation = currentStep === 10 || signatureStatus === 'signed'

  const steps = [
    { id: 1, label: t('progress.step1') },
    { id: 2, label: t('progress.step2') },
    { id: 3, label: t('progress.step3') },
    { id: 4, label: t('progress.step4') },
    { id: 5, label: t('progress.step5') },
    { id: 6, label: t('progress.step6') },
    { id: 7, label: t('progress.step7') },
  ]

  const isPostCalculator = currentStep > 7

  const renderStep = () => {
    if (isConfirmation) {
      return <StepConfirmation />
    }

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
        return <StepResults />
      case 7:
        return <Step6ContactDetails />
      case 8:
        return <StepContractReview />
      case 9:
        return <StepSignature />
      default:
        return <Step1BuildingType />
    }
  }

  const isMapStep = currentStep === 4

  return (
    <div
      className={cn(
        isMapStep ? 'h-screen overflow-hidden relative' : 'min-h-screen overflow-y-auto',
      )}
      style={{
        paddingTop: '77px',
        background: PAGE_BG,
      }}
    >
      {!isConfirmation && !isPostCalculator && (
        <div
          className={cn(
            'flex justify-center px-4 py-4',
            isMapStep && 'absolute left-0 right-0 z-20 pointer-events-none',
          )}
          style={isMapStep ? { top: '77px' } : undefined}
        >
          <div
            className="rounded-full px-6 py-4 max-w-[1009px] w-full pointer-events-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(156, 169, 166, 0.3)',
              backdropFilter: isMapStep ? 'blur(14.7px)' : 'blur(29px)',
              boxShadow: '0px 25px 34px 0px rgba(183, 254, 26, 0.1)',
            }}
          >
            <div className="flex items-start justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start flex-1">
                  <div className="flex flex-col items-center gap-[5px] w-[50px]">
                    <button
                      type="button"
                      disabled={step.id > currentStep}
                      onClick={() => goToStep(step.id)}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-[16px] font-medium tracking-tight transition-colors border text-[#062E25]',
                        currentStep === step.id
                          ? 'bg-[#B7FE1A] border-[rgba(123,181,168,0.4)]'
                          : currentStep > step.id
                            ? isMapStep
                              ? 'bg-[rgba(241,242,233,0.1)] border-[rgba(216,220,213,0.4)] cursor-pointer hover:bg-[rgba(241,242,233,0.3)]'
                              : 'bg-[#B7FE1A]/40 border-[#7BB5A8] cursor-pointer hover:bg-[#B7FE1A]/60'
                            : isMapStep
                              ? 'bg-[rgba(241,242,233,0.1)] border-[rgba(216,220,213,0.4)] cursor-default'
                              : 'bg-[#F1F2E9] border-[#D8DCD5] cursor-default'
                      )}
                    >
                      {step.id}
                    </button>
                    <span
                      className={cn(
                        'text-[10px] tracking-tight whitespace-nowrap hidden sm:block',
                        isMapStep ? 'text-[#EAEDDF]' : 'text-[#062E25]',
                        currentStep === step.id ? 'opacity-100' : 'opacity-40'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex-1 flex items-center pt-[14px]">
                      <div
                        className={cn(
                          'w-full h-px opacity-20',
                          isMapStep ? 'bg-[#EAEDDF]' : 'bg-[#036B53]'
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

      <main className={cn(isMapStep && 'h-full')}>
        {renderStep()}
      </main>
    </div>
  )
}
