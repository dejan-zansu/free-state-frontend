import { isAxiosError } from 'axios'

import { ACTIVE_STATUSES } from '@/lib/sales-lead'
import type { SalesLeadDetail, SalesLeadStatus } from '@/types/sales-lead'

export const PRIMARY_BUTTON =
  'bg-[#062E25] hover:bg-[#062E25]/90 text-white text-base'
export const OUTLINE_BUTTON =
  'border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5 text-base'
export const CARD_CLASS = 'border-[#062E25]/10 py-0'

export function leadKey(id: string) {
  return ['sales-lead', id] as const
}

export function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404
}

function statusActivities(lead: SalesLeadDetail) {
  return lead.activities
    .filter(
      activity =>
        activity.type === 'STATUS_CHANGED' ||
        activity.type === 'WON' ||
        activity.type === 'LOST' ||
        activity.type === 'CONSULT_BOOKED'
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

function statusChangeActivities(lead: SalesLeadDetail) {
  return statusActivities(lead).filter(
    activity => activity.toValue === lead.status
  )
}

export function statusSince(lead: SalesLeadDetail): string {
  return statusChangeActivities(lead)[0]?.createdAt ?? lead.createdAt
}

export function resumeStatus(lead: SalesLeadDetail): SalesLeadStatus {
  for (const activity of statusActivities(lead)) {
    const match = ACTIVE_STATUSES.find(status => status === activity.fromValue)
    if (match) return match
  }
  return 'NEW'
}

export function formatChfAmount(value: number): string {
  const cents = Math.round(value * 100)
  const whole = Math.floor(cents / 100)
  const fraction = cents % 100
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
  return fraction === 0
    ? `CHF ${grouped}`
    : `CHF ${grouped}.${String(fraction).padStart(2, '0')}`
}

export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/['’\s]/g, '').replace(',', '.')
  if (!cleaned) return null
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null
  const amount = Number(cleaned)
  return Number.isFinite(amount) ? amount : null
}

export function suggestedWonAmount(lead: SalesLeadDetail): {
  value: string
  fromCalculation: boolean
} {
  if (lead.wonAmountChf != null) {
    return { value: String(lead.wonAmountChf), fromCalculation: false }
  }
  const fromCalc =
    lead.financials?.totalInvestmentChf ??
    lead.project?.solarCalculation?.systemCostChf ??
    null
  if (fromCalc != null && Number.isFinite(fromCalc)) {
    return {
      value: String(Math.round(fromCalc * 100) / 100),
      fromCalculation: true,
    }
  }
  return { value: '', fromCalculation: false }
}

export function daysSince(value: string): number {
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return 0
  const diff = Date.now() - time
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)))
}
