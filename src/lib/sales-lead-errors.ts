import axios from 'axios'

const KNOWN_CODES = [
  'INVALID_ASSIGNEE',
  'NOT_FOUND',
  'RECORD_NOT_FOUND',
  'NO_PROJECT',
  'MILESTONE_NOT_FOUND',
  'WON_AMOUNT_REQUIRED',
  'LOST_REASON_REQUIRED',
  'OUTCOME_REQUIRES_STATUS_CHANGE',
  'VALIDATION_ERROR',
  'CALCULATION_NOT_FOUND',
  'FORBIDDEN',
  'UNAUTHORIZED',
]

export function salesLeadErrorKey(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'generic'
  const code = error.response?.data?.error?.code
  return typeof code === 'string' && KNOWN_CODES.includes(code)
    ? code
    : 'generic'
}
