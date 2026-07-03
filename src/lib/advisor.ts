import { CONSULTATION_ADVISORS, type ConsultationAdvisor } from './company-contact'

export function getAdvisor(stableId: string | null | undefined): ConsultationAdvisor {
  if (!stableId) return CONSULTATION_ADVISORS[0]
  let sum = 0
  for (let i = 0; i < stableId.length; i++) sum = (sum + stableId.charCodeAt(i)) % 100000
  return CONSULTATION_ADVISORS[sum % CONSULTATION_ADVISORS.length]
}
