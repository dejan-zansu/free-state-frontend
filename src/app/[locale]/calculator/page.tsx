'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

import PVGISStep1Address from './steps/PVGISStep1Address'
import PVGISStep2RoofDrawing from './steps/PVGISStep2RoofDrawing'
import PVGISStep2_5ShadingAnalysis from './steps/PVGISStep2_5ShadingAnalysis'
import PVGISStep3BuildingDetails from './steps/PVGISStep3BuildingDetails'
import PVGISStep4PanelSelection from './steps/PVGISStep4PanelSelection'
import PVGISStep5PanelPlacement from './steps/PVGISStep5PanelPlacement'
import PVGISStep6Inverter from './steps/PVGISStep6Inverter'
import PVGISStep7AdditionalParams from './steps/PVGISStep7AdditionalParams'
import PVGISStep8Results from './steps/PVGISStep8Results'

const steps = [
  { id: 1, title: 'Address', description: 'Enter your location' },
  { id: 2, title: 'Roof Area', description: 'Draw your roof' },
  { id: 3, title: 'Shading', description: 'Analyze obstacles' },
  { id: 4, title: 'Building', description: 'Building details' },
  { id: 5, title: 'Panels', description: 'Select solar panels' },
  { id: 6, title: 'Placement', description: 'Configure placement' },
  { id: 7, title: 'Inverter', description: 'Select inverter' },
  { id: 8, title: 'Parameters', description: 'Additional info' },
  { id: 9, title: 'Results', description: 'Your solar system' },
]

export default function PVGISCalculatorPage() {
  const {
    currentStep,
    totalSteps,
    isLoading,
    error,
    nextStep,
    prevStep,
    setError,
    // Step validation data
    latitude,
    roofPolygon,
    buildingDetails,
    selectedPanel,
    panelCount,
    selectedInverter,
  } = usePVGISCalculatorStore()

  useEffect(() => {
    setError(null)
  }, [currentStep, setError])

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  // Can proceed to next step?
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return latitude !== null
      case 2:
        return roofPolygon !== null && roofPolygon.area > 0
      case 3:
        return true // Shading analysis is automatic, can skip
      case 4:
        return buildingDetails !== null
      case 5:
        return selectedPanel !== null && panelCount > 0
      case 6:
        return true // Panel placement has defaults
      case 7:
        return selectedInverter !== null
      case 8:
        return true // Additional params have defaults
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PVGISStep1Address />
      case 2:
        return <PVGISStep2RoofDrawing />
      case 3:
        return <PVGISStep2_5ShadingAnalysis />
      case 4:
        return <PVGISStep3BuildingDetails />
      case 5:
        return <PVGISStep4PanelSelection />
      case 6:
        return <PVGISStep5PanelPlacement />
      case 7:
        return <PVGISStep6Inverter />
      case 8:
        return <PVGISStep7AdditionalParams />
      case 9:
        return <PVGISStep8Results />
      default:
        return <PVGISStep1Address />
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background'>
      {/* Header with progress */}
      <div className='border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-2xl font-bold'>Solar Calculator</h1>
            <div className='text-sm text-muted-foreground'>
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Progress bar */}
          <div className='space-y-2'>
            <Progress value={progress} className='h-2' />
            <div className='hidden md:flex items-center justify-between text-xs'>
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`text-center ${
                    currentStep === step.id
                      ? 'text-solar font-semibold'
                      : currentStep > step.id
                      ? 'text-energy'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className='container mx-auto px-4 py-8'>
        {/* Error display */}
        {error && (
          <div className='mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive max-w-5xl mx-auto'>
            <p className='font-medium'>Error</p>
            <p className='text-sm'>{error}</p>
          </div>
        )}

        {/* Step content */}
        <div className='max-w-7xl mx-auto'>{renderStep()}</div>

        {/* Navigation */}
        <div className='max-w-7xl mx-auto mt-8 flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className='gap-2'
          >
            <ChevronLeft className='w-4 h-4' />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isLoading}
              className='gap-2 bg-solar hover:bg-solar/90 text-solar-foreground'
            >
              {isLoading ? (
                <>
                  <svg
                    className='animate-spin w-4 h-4'
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className='w-4 h-4' />
                </>
              )}
            </Button>
          ) : (
            <div className='text-sm text-muted-foreground'>
              Review your solar system details above
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
