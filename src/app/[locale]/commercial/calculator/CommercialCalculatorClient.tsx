'use client'

import { trackFunnelEvent } from '@/lib/analytics/funnel-events'
import {
  COMMERCIAL_MAP_STEP,
  COMMERCIAL_RESULT_STEP,
  clampToAllowedCommercialStep,
  commercialFlowMeta,
} from '@/lib/commercial-calculator-flow'
import { cn } from '@/lib/utils'
import { useCommercialCalculatorStore } from '@/stores/commercial-calculator.store'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'

import CommercialSteps from './screens/CommercialSteps'
import ResultScreen from './screens/ResultScreen'
import Screen1Address from './screens/Screen1Address'
import Screen2Roof from './screens/Screen2Roof'
import Screen3Business from './screens/Screen3Business'
import Screen4Contact from './screens/Screen4Contact'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

function prerequisiteState() {
  const s = useCommercialCalculatorStore.getState()
  return {
    address: s.address,
    building: s.building,
    selectedSegmentIds: s.selectedSegmentIds,
    submissionDone: s.submission.status === 'done',
  }
}

export default function CommercialCalculatorClient() {
  const currentStep = useCommercialCalculatorStore(state => state.currentStep)
  const goToStep = useCommercialCalculatorStore(state => state.goToStep)
  const submission = useCommercialCalculatorStore(state => state.submission)
  const hasExistingPv = useCommercialCalculatorStore(
    state => state.hasExistingPv
  )
  const tariff = useCommercialCalculatorStore(state => state.tariff)
  const subsidyRate = useCommercialCalculatorStore(state => state.subsidyRate)
  const roofImage = useCommercialCalculatorStore(state => state.roofImage)
  const address = useCommercialCalculatorStore(state => state.address)
  const reset = useCommercialCalculatorStore(state => state.reset)

  const [stepParam, setStepParam] = useQueryState('step', parseAsInteger)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const initRef = useRef(false)
  const fromUrlRef = useRef(false)
  const lastPushedRef = useRef<number | null>(null)

  useEffect(() => {
    if (!hydrated || initRef.current) return
    initRef.current = true

    if (stepParam !== null && stepParam !== currentStep) {
      const target = clampToAllowedCommercialStep(
        stepParam,
        prerequisiteState()
      )
      if (target !== currentStep) {
        fromUrlRef.current = true
        lastPushedRef.current = target
        goToStep(target)
      } else {
        lastPushedRef.current = currentStep
      }
      if (target !== stepParam) {
        setStepParam(target, { history: 'replace' })
      }
    } else if (stepParam === null) {
      lastPushedRef.current = currentStep
      setStepParam(currentStep, { history: 'replace' })
    } else {
      lastPushedRef.current = stepParam
    }
  }, [hydrated, stepParam, currentStep, goToStep, setStepParam])

  useEffect(() => {
    if (!initRef.current) return
    if (fromUrlRef.current) {
      fromUrlRef.current = false
      lastPushedRef.current = currentStep
      return
    }
    if (lastPushedRef.current === currentStep) return
    lastPushedRef.current = currentStep
    setStepParam(currentStep, { history: 'push' })
  }, [currentStep, setStepParam])

  useEffect(() => {
    const handler = () => {
      const raw = new URLSearchParams(window.location.search).get('step')
      const n = raw ? parseInt(raw, 10) : null
      const state = useCommercialCalculatorStore.getState()
      fromUrlRef.current = false
      if (n === null || isNaN(n)) return
      const target = clampToAllowedCommercialStep(n, prerequisiteState())
      if (target !== state.currentStep) {
        fromUrlRef.current = true
        state.goToStep(target)
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const stepEventRef = useRef<number | null>(null)
  useEffect(() => {
    if (!hydrated) return
    if (stepEventRef.current === currentStep) return
    stepEventRef.current = currentStep
    if (currentStep === 1 || currentStep >= COMMERCIAL_RESULT_STEP) return
    trackFunnelEvent('calculator_step_viewed', {
      step: currentStep,
      meta: { ...commercialFlowMeta },
    })
  }, [hydrated, currentStep])

  const showResult = submission.status === 'done' && !!submission.result
  const isMapStep = currentStep === COMMERCIAL_MAP_STEP && !showResult

  const wrapperRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    wrapperRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }, [currentStep, showResult])

  const renderStep = () => {
    if (showResult && submission.result) {
      const estimate = useCommercialCalculatorStore.getState().getEstimate()
      return (
        <ResultScreen
          estimate={estimate}
          tariff={tariff}
          subsidyRate={subsidyRate}
          hasExistingPv={hasExistingPv}
          addressLabel={address}
          roofImage={roofImage}
          reference={submission.result.reference}
          leadId={submission.result.id}
          uploadToken={submission.result.uploadToken}
          source="flow"
          onRestart={() => {
            reset()
            setStepParam(1, { history: 'replace' })
          }}
        />
      )
    }
    switch (currentStep) {
      case 1:
        return <Screen1Address />
      case 2:
        return <Screen2Roof />
      case 3:
        return <Screen3Business />
      case 4:
        return <Screen4Contact />
      default:
        return <Screen1Address />
    }
  }

  return (
    <div
      ref={wrapperRef}
      data-lenis-prevent
      className={cn(
        'h-svh relative',
        isMapStep ? 'overflow-hidden' : 'overflow-y-auto pb-20'
      )}
      style={{
        paddingTop: '77px',
        background: PAGE_BG,
      }}
    >
      {hydrated && !showResult && <CommercialSteps />}

      <div className={cn(isMapStep && 'h-full')}>
        {hydrated ? renderStep() : null}
      </div>
    </div>
  )
}
