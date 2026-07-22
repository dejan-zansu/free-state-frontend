'use client'

import { createContext, useContext } from 'react'

export const CalculatorEmbedContext = createContext(false)

export function useCalculatorEmbed() {
  return useContext(CalculatorEmbedContext)
}
