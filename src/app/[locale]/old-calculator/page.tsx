'use client'

import { useEffect } from 'react'
import { Sun, MapPin, Settings, BarChart3, FileText, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCalculatorStore } from '@/stores/calculator.store'

import Step1Address from './steps/Step1Address'
import Step2BuildingInsights from './steps/Step2BuildingInsights'
import Step3Configuration from './steps/Step3Configuration'
import Step4Results from './steps/Step4Results'

const steps = [
  { id: 1, title: 'Location', icon: MapPin, description: 'Enter your address' },
  { id: 2, title: 'Roof Analysis', icon: Sun, description: 'View solar potential' },
  { id: 3, title: 'Configuration', icon: Settings, description: 'Customize your system' },
  { id: 4, title: 'Results', icon: BarChart3, description: 'View your savings' },
]

export default function CalculatorPage() {
  const {
    currentStep,
    totalSteps,
    isLoading,
    error,
    latitude,
    buildingInsights,
    nextStep,
    prevStep,
    clearError,
  } = useCalculatorStore()

  // Clear error when step changes
  useEffect(() => {
    clearError()
  }, [currentStep, clearError])

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  // Can proceed to next step?
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return latitude !== null
      case 2:
        return buildingInsights !== null
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Address />
      case 2:
        return <Step2BuildingInsights />
      case 3:
        return <Step3Configuration />
      case 4:
        return <Step4Results />
      default:
        return <Step1Address />
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background'>
      {/* Header */}
      <div className='border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-solar flex items-center justify-center'>
                <Sun className='w-6 h-6 text-solar-foreground' />
              </div>
              <div>
                <h1 className='text-xl font-bold'>Solar Calculator</h1>
                <p className='text-sm text-muted-foreground'>
                  Calculate your solar potential
                </p>
              </div>
            </div>

            {/* Step indicators - Desktop */}
            <div className='hidden md:flex items-center gap-2'>
              {steps.map((step, index) => (
                <div key={step.id} className='flex items-center'>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                      currentStep === step.id
                        ? 'bg-solar text-solar-foreground'
                        : currentStep > step.id
                          ? 'bg-energy/20 text-energy'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <step.icon className='w-4 h-4' />
                    <span className='text-sm font-medium'>{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className='w-4 h-4 mx-1 text-muted-foreground' />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar - Mobile */}
          <div className='md:hidden mt-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium'>
                Step {currentStep} of {totalSteps}
              </span>
              <span className='text-sm text-muted-foreground'>
                {steps[currentStep - 1]?.title}
              </span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className='container mx-auto px-4 py-8'>
        {/* Error display */}
        {error && (
          <div className='mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive'>
            <p className='font-medium'>Error</p>
            <p className='text-sm'>{error}</p>
          </div>
        )}

        {/* Step content */}
        <div className='max-w-5xl mx-auto'>{renderStep()}</div>

        {/* Navigation */}
        <div className='max-w-5xl mx-auto mt-8 flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className='gap-2'
          >
            <ChevronLeft className='w-4 h-4' />
            Back
          </Button>

          <div className='flex items-center gap-2'>
            {/* Step dots - Mobile */}
            <div className='flex md:hidden items-center gap-1.5'>
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentStep === step.id
                      ? 'bg-solar'
                      : currentStep > step.id
                        ? 'bg-energy'
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isLoading}
              className='gap-2 bg-solar hover:bg-solar/90 text-solar-foreground'
            >
              {isLoading ? (
                <>
                  <svg className='animate-spin w-4 h-4' viewBox='0 0 24 24' fill='none'>
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
            <Button className='gap-2 bg-energy hover:bg-energy/90 text-energy-foreground'>
              <FileText className='w-4 h-4' />
              Get Quote
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

