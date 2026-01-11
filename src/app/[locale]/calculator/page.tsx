'use client'

import { useEffect } from 'react'

import { Progress } from '@/components/ui/progress'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

import PVGISStep1Address from './steps/PVGISStep1Address'
import PVGISStep2RoofDrawing from './steps/PVGISStep2RoofDrawing'
import PVGISStep3BuildingDetails from './steps/PVGISStep3BuildingDetails'
import PVGISStep4PanelSelection from './steps/PVGISStep4PanelSelection'
import PVGISStep5PanelPlacement from './steps/PVGISStep5PanelPlacement'
import PVGISStep6Inverter from './steps/PVGISStep6Inverter'
import PVGISStep7AdditionalParams from './steps/PVGISStep7AdditionalParams'
import PVGISStep8Results from './steps/PVGISStep8Results'

const steps = [
  { id: 1, title: 'Address', description: 'Enter your location' },
  { id: 2, title: 'Roof Area', description: 'Draw your roof' },
  { id: 4, title: 'Building', description: 'Building details' },
  { id: 5, title: 'Panels', description: 'Select solar panels' },
  { id: 6, title: 'Placement', description: 'Configure placement' },
  { id: 7, title: 'Inverter', description: 'Select inverter' },
  { id: 8, title: 'Parameters', description: 'Additional info' },
  { id: 9, title: 'Results', description: 'Your solar system' },
]

export default function PVGISCalculatorPage() {
  const { currentStep, error, setError, latitude, longitude, roofPolygon } =
    usePVGISCalculatorStore()

  useEffect(() => {
    setError(null)
  }, [currentStep, setError])

  // Redirect from step 3 to step 4 if somehow we land on step 3
  useEffect(() => {
    if (currentStep === 3) {
      const { goToStep } = usePVGISCalculatorStore.getState()
      goToStep(4)
    }
  }, [currentStep])

  // Map internal step to visible step for progress (step 3 is skipped)
  const getVisibleStepNumber = (step: number) => {
    if (step <= 2) return step
    if (step >= 4) return step - 1 // Step 3 is hidden, so shift everything after it
    return 2
  }

  const visibleStepNumber = getVisibleStepNumber(currentStep)
  const totalVisibleSteps = steps.length
  const progress = ((visibleStepNumber - 1) / (totalVisibleSteps - 1)) * 100

  // Auto-trigger shading analysis when moving from step 2 (runs in background)
  useEffect(() => {
    if (currentStep === 4 && roofPolygon && latitude && longitude) {
      // Automatically fetch horizon data in the background for calculations
      // This ensures shading data is available even though step 3 is hidden
      const fetchHorizonData = async () => {
        const { horizonData, setHorizonData } =
          usePVGISCalculatorStore.getState()

        // Only fetch if we don't already have the data
        if (horizonData) {
          return
        }

        try {
          // Calculate roof centroid for more accurate analysis
          const centroidLat =
            roofPolygon.coordinates.reduce((sum, p) => sum + p.lat, 0) /
            roofPolygon.coordinates.length
          const centroidLng =
            roofPolygon.coordinates.reduce((sum, p) => sum + p.lng, 0) /
            roofPolygon.coordinates.length

          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
          const response = await fetch(
            `${apiUrl}/api/pvgis/horizon?lat=${centroidLat}&lon=${centroidLng}`
          )

          if (response.ok) {
            const data = await response.json()
            setHorizonData(data.outputs.horizon_profile)
          }
        } catch (error) {
          console.warn('⚠️ Failed to fetch horizon data automatically:', error)
          // Don't show error to user, calculations will proceed without shading data
        }
      }

      fetchHorizonData()
    }
  }, [currentStep, roofPolygon, latitude, longitude])

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PVGISStep1Address />
      case 2:
        return <PVGISStep2RoofDrawing />
      case 3:
        // Step 3 should never be reached, redirect handled in useEffect
        return null
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
    <div className='h-screen flex flex-col mt-[84px]'>
      {currentStep !== 1 && (
        <div className='bg-background/80 backdrop-blur-sm z-40 shrink-0'>
          <div className='container mx-auto px-4 py-4'>
            <div className='space-y-2'>
              <Progress value={progress} className='h-2' />
              <div className='hidden md:flex items-center justify-between text-xs'>
                {steps.map((step) => {
                  const isCurrentStep =
                    currentStep === step.id ||
                    (currentStep === 3 && step.id === 4)
                  const isCompleted =
                    currentStep > step.id || (currentStep === 3 && step.id < 3)
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
            <p className='font-medium'>Error</p>
            <p className='text-sm'>{error}</p>
          </div>
        )}

        <div className='h-full'>{renderStep()}</div>
      </main>
    </div>
  )
}
