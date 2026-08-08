export const calculatorFlowV2Enabled =
  process.env.NEXT_PUBLIC_CALCULATOR_FLOW_V2 === 'true'

export const mapStep = calculatorFlowV2Enabled ? 2 : 3

export const flowVersionMeta: Record<string, number> = calculatorFlowV2Enabled
  ? { flowVersion: 2 }
  : {}

export const totalSteps = calculatorFlowV2Enabled ? 4 : 5

export interface StepPrerequisiteState {
  address: string
  building: unknown
  selectedSegmentIds: string[]
}

export function highestAllowedStep(state: StepPrerequisiteState): number {
  if (calculatorFlowV2Enabled && !state.address) return 1
  if (!state.building || state.selectedSegmentIds.length === 0) return mapStep
  return totalSteps
}

export function clampToAllowedStep(
  step: number,
  state: StepPrerequisiteState
): number {
  const inRange = Math.min(Math.max(step, 1), totalSteps)
  return Math.min(inRange, highestAllowedStep(state))
}
