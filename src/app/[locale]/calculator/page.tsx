'use client'

import { cn } from '@/lib/utils'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { useTranslations } from 'next-intl'

import Steps from '@/components/Steps'
import SolarModelSelection from './SolarModelSelection'
import Step1HouseholdSize from './steps/Step2HouseholdSize'
import Step2Devices from './steps/Step3Devices'
import Step3RoofAreas from './steps/Step4RoofAreas'
import Step4RoofCovering from './steps/Step5RoofCovering'
import Step5ContactDetails from './steps/Step6ContactDetails'
import StepConfirmation from './steps/StepConfirmation'
import StepContractReview from './steps/StepContractReview'
import StepResults from './steps/StepResults'
import StepEquipmentResults from './steps/StepEquipmentResults'
import StepSignature from './steps/StepSignature'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

export default function SolarAboCalculatorPage() {
  const t = useTranslations('solarAboCalculator')
  const {
    solarModel,
    currentStep,
    signatureStatus,
    resultsPath,
    goToStep,
  } = useSolarAboCalculatorStore()

  if (!solarModel) {
    return (
      <div
        className="h-screen flex flex-col"
        style={{
          paddingTop: '77px',
          background: PAGE_BG,
        }}
      >
        <main className="flex-1">
          <SolarModelSelection />
        </main>
      </div>
    )
  }

  const isConfirmation = currentStep === 9 || signatureStatus === 'signed'

  const steps = [
    { id: 1, label: t('progress.step2') },
    { id: 2, label: t('progress.step3') },
    { id: 3, label: t('progress.step4') },
    { id: 4, label: t('progress.step5') },
    { id: 5, label: t('progress.step6') },
    { id: 6, label: t('progress.step7') },
  ]

  const isPostCalculator = currentStep > 6

  const renderStep = () => {
    if (isConfirmation) {
      return <StepConfirmation />
    }

    switch (currentStep) {
      case 1:
        return <Step1HouseholdSize />
      case 2:
        return <Step2Devices />
      case 3:
        return <Step3RoofAreas />
      case 4:
        return <Step4RoofCovering />
      case 5:
        return <Step5ContactDetails />
      case 6:
        return solarModel === 'solar-direct' ? <StepEquipmentResults /> : <StepResults />
      case 7:
        return <StepContractReview />
      case 8:
        return <StepSignature />
      default:
        return <Step1HouseholdSize />
    }
  }

  const isMapStep = currentStep === 3

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
      {!isConfirmation && !isPostCalculator && <Steps />}

      <main className={cn(isMapStep && 'h-full')}>{renderStep()}</main>
    </div>
  )
}
