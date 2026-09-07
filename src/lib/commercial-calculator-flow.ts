export const COMMERCIAL_TOTAL_STEPS = 4
export const COMMERCIAL_MAP_STEP = 2
export const COMMERCIAL_RESULT_STEP = 5

export const commercialFlowMeta: Record<string, string> = { flow: 'commercial' }

export interface CommercialStepPrerequisiteState {
  address: string
  building: unknown
  selectedSegmentIds: string[]
  submissionDone: boolean
}

export function highestAllowedCommercialStep(
  state: CommercialStepPrerequisiteState
): number {
  if (state.submissionDone) return COMMERCIAL_RESULT_STEP
  if (!state.address) return 1
  if (!state.building || state.selectedSegmentIds.length === 0)
    return COMMERCIAL_MAP_STEP
  return COMMERCIAL_TOTAL_STEPS
}

export function clampToAllowedCommercialStep(
  step: number,
  state: CommercialStepPrerequisiteState
): number {
  if (state.submissionDone) return COMMERCIAL_RESULT_STEP
  const inRange = Math.min(Math.max(step, 1), COMMERCIAL_TOTAL_STEPS)
  return Math.min(inRange, highestAllowedCommercialStep(state))
}
