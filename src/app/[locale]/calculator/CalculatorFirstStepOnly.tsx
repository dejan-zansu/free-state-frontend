'use client'

import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { type ReactNode, useEffect, useState } from 'react'

export default function CalculatorFirstStepOnly({
  children,
}: {
  children: ReactNode
}) {
  const currentStep = useSolarAboCalculatorStore(state => state.currentStep)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (mounted && currentStep !== 1) return null
  return <>{children}</>
}
