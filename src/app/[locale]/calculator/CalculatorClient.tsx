'use client'

import { trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { cn } from '@/lib/utils'
import { activeLenis } from '@/providers/SmoothScrollProvider'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { useTranslations } from 'next-intl'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'

import Steps from '@/components/Steps'

import type { SolarModel } from '@/stores/solar-abo-calculator.store'
import { CalculatorEmbedContext } from './CalculatorEmbedContext'
import SolarModelSelection from './SolarModelSelection'
import Step1HouseholdSize from './steps/Step2HouseholdSize'
import Step2Devices from './steps/Step3Devices'
import Step3RoofAreas from './steps/Step4RoofAreas'
import Step4RoofCovering from './steps/Step5RoofCovering'
import Step5ContactDetails from './steps/Step6ContactDetails'

const SESSION_ACTIVE_KEY = 'solar-calculator-session-active'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

export default function CalculatorClient({
  embedded = false,
}: {
  embedded?: boolean
}) {
  const t = useTranslations('solarAboCalculator')
  const { solarModel, currentStep, goToStep, setSolarModel } =
    useSolarAboCalculatorStore()

  const [stepParam, setStepParam] = useQueryState('step', parseAsInteger)
  const [modelParam, setModelParam] = useQueryState('model')
  const [resetReady, setResetReady] = useState(false)

  useEffect(() => {
    sessionStorage.setItem(SESSION_ACTIVE_KEY, '1')
    setResetReady(true)
    return () => {
      sessionStorage.removeItem(SESSION_ACTIVE_KEY)
    }
  }, [])

  const modelSelectedFiredRef = useRef(false)
  useEffect(() => {
    if (embedded) return
    if (!resetReady) return
    if (!modelParam) return
    if (
      modelParam === 'solar-free' ||
      modelParam === 'solar-direct' ||
      modelParam === 'solar-abo'
    ) {
      if (solarModel !== modelParam) {
        setSolarModel(modelParam as SolarModel)
      }
      if (!modelSelectedFiredRef.current) {
        modelSelectedFiredRef.current = true
        trackFunnelEvent('model_selected', {
          meta: { model: modelParam, preselected: true },
        })
      }
    }
    setModelParam(null, { history: 'replace' })
  }, [embedded, resetReady, modelParam, solarModel, setSolarModel, setModelParam])
  const initRef = useRef(false)
  const fromUrlRef = useRef(false)
  const lastPushedRef = useRef<number | null>(null)

  useEffect(() => {
    if (embedded) return
    if (!resetReady) return
    if (!solarModel || initRef.current) return
    initRef.current = true

    if (stepParam !== null && stepParam !== currentStep) {
      fromUrlRef.current = true
      lastPushedRef.current = stepParam
      goToStep(stepParam)
    } else if (stepParam === null) {
      lastPushedRef.current = currentStep
      setStepParam(currentStep, { history: 'replace' })
    } else {
      lastPushedRef.current = stepParam
    }
  }, [embedded, resetReady, solarModel, stepParam, currentStep, goToStep, setStepParam])

  useEffect(() => {
    if (embedded) return
    if (!initRef.current) return
    if (fromUrlRef.current) {
      fromUrlRef.current = false
      lastPushedRef.current = currentStep
      return
    }
    if (lastPushedRef.current === currentStep) return
    lastPushedRef.current = currentStep
    setStepParam(currentStep, { history: 'push' })
  }, [embedded, currentStep, setStepParam])

  const stepEventRef = useRef<number | null>(null)
  const initialModelRef = useRef(solarModel)
  useEffect(() => {
    if (stepEventRef.current === currentStep) return
    if (embedded) {
      if (!solarModel) return
      if (stepEventRef.current === null && initialModelRef.current) {
        stepEventRef.current = currentStep
        return
      }
    }
    stepEventRef.current = currentStep
    trackFunnelEvent('calculator_step_viewed', { step: currentStep })
  }, [embedded, solarModel, currentStep])

  useEffect(() => {
    if (embedded) return
    const handler = () => {
      const raw = new URLSearchParams(window.location.search).get('step')
      const n = raw ? parseInt(raw, 10) : null
      const state = useSolarAboCalculatorStore.getState()
      if (n !== null && !isNaN(n) && n !== state.currentStep) {
        fromUrlRef.current = true
        state.goToStep(n)
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [embedded])

  const wrapperRef = useRef<HTMLDivElement>(null)
  const prevStepRef = useRef(currentStep)
  useEffect(() => {
    if (!embedded) return
    if (prevStepRef.current === currentStep) return
    prevStepRef.current = currentStep
    const raf = requestAnimationFrame(() => {
      const el = wrapperRef.current
      if (!el) return
      const top = Math.max(
        0,
        el.getBoundingClientRect().top + window.scrollY - 112
      )
      if (activeLenis) {
        activeLenis.resize()
        activeLenis.scrollTo(top)
      } else {
        window.scrollTo({ top, behavior: 'smooth' })
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [embedded, currentStep])

  const renderStep = () => {
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
      default:
        return <Step1HouseholdSize />
    }
  }

  const isMapStep = currentStep === 3

  if (embedded) {
    return (
      <CalculatorEmbedContext.Provider value={true}>
        <div
          ref={wrapperRef}
          className="relative rounded-[24px] border border-[#546963]/40 overflow-clip scroll-mt-28 [overflow-anchor:none]"
          style={{ background: PAGE_BG }}
        >
          {!solarModel ? (
            <SolarModelSelection />
          ) : (
            <>
              <Steps />
              <div
                className={cn(
                  isMapStep &&
                    'relative h-[70vh] min-h-[560px] overflow-hidden rounded-[24px]'
                )}
              >
                {renderStep()}
              </div>
            </>
          )}
        </div>
      </CalculatorEmbedContext.Provider>
    )
  }

  if (!solarModel) {
    return (
      <div
        className="h-screen flex flex-col"
        style={{
          paddingTop: '77px',
          background: PAGE_BG,
        }}
      >
        <div className="flex-1">
          <SolarModelSelection />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'h-screen relative',
        isMapStep ? 'overflow-hidden' : 'overflow-y-auto pb-20'
      )}
      style={{
        paddingTop: '77px',
        background: PAGE_BG,
      }}
    >
      <Steps />

      <div className={cn(isMapStep && 'h-full')}>{renderStep()}</div>
    </div>
  )
}
