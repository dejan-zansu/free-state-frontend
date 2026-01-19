'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Progress } from '@/components/ui/progress'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

import PVGISStep1Address from './steps/PVGISStep1Address'
import PVGISStep2RoofDrawing from './steps/PVGISStep2RoofDrawing'
import Step3RoofOrientation from './steps/Step3RoofOrientation'
import Step4SolarSystem from './steps/Step4SolarSystem'
import Step5Results from './steps/Step5Results'

export default function PVGISCalculatorPage() {
  const t = useTranslations('calculator')
  const { currentStep, error, setError, latitude, longitude, roofPolygon } =
    usePVGISCalculatorStore()

  const steps = [
    { id: 1, title: t('steps.step1.title'), description: t('steps.step1.description') },
    { id: 2, title: t('steps.step2.title'), description: t('steps.step2.description') },
    { id: 3, title: t('steps.step3.title'), description: t('steps.step3.description') },
    { id: 4, title: t('steps.step4.title'), description: t('steps.step4.description') },
    { id: 5, title: t('steps.step5.title'), description: t('steps.step5.description') },
  ]

  useEffect(() => {
    setError(null)
  }, [currentStep, setError])

  const totalSteps = steps.length
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  // Auto-trigger shading analysis when moving to step 3 (runs in background)
  useEffect(() => {
    if (currentStep === 3 && roofPolygon && latitude && longitude) {
      // Automatically fetch horizon data in the background for calculations
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
        return <Step3RoofOrientation />
      case 4:
        return <Step4SolarSystem />
      case 5:
        return <Step5Results />
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
