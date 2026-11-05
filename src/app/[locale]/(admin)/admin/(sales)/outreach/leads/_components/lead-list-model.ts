import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

import { leadGroupKey, leadOpenRequestAnswered } from '@/lib/outbound-lead-work'
import type { LeadWorkState, OutboundLeadListItem } from '@/types/outreach/kpi'

import { isInteractiveTarget } from '../../../residential-leads/_components/lead-format'

export const LEAD_LIST_QUERY_KEY = [
  'admin',
  'outreach',
  'leads',
  'list',
] as const
export const LEAD_ASSIGNEES_QUERY_KEY = [
  'admin',
  'outreach',
  'assignees',
] as const

const LEAD_GROUP_REQUEST_KEY = 'group.ANTWORT_OFFEN_REQUEST'

export interface LeadRowIdentity {
  title: string
  person: string | null
  role: string | null
  phone: string | null
  email: string | null
}

export interface LeadGroup {
  state: LeadWorkState
  items: OutboundLeadListItem[]
  sentenceKeys: string[]
}

function joined(parts: (string | null | undefined)[], glue: string): string {
  return parts.filter(Boolean).join(glue)
}

function letterTargetLine(lead: OutboundLeadListItem): string {
  const target = lead.letterTarget
  if (!target) return ''
  return joined(
    [
      joined([target.addressStreet, target.addressNumber], ' '),
      joined([target.addressPostalCode, target.addressCity], ' '),
    ],
    ', '
  )
}

export function leadRowIdentity(lead: OutboundLeadListItem): LeadRowIdentity {
  const { prospect, residentialLead } = lead
  if (prospect) {
    return {
      title: prospect.companyName,
      person: prospect.contactName,
      role: prospect.contactRole,
      phone: prospect.contactPhone,
      email: prospect.contactEmail,
    }
  }
  return {
    title:
      residentialLead?.contactName ||
      letterTargetLine(lead) ||
      lead.buildingKey,
    person: residentialLead?.contactName ?? null,
    role: null,
    phone: residentialLead?.contactPhone ?? null,
    email: residentialLead?.contactEmail ?? null,
  }
}

export function leadRowHref(
  lead: OutboundLeadListItem,
  locale: string
): string | null {
  if (lead.prospect) return `/${locale}/admin/outreach/${lead.prospect.id}`
  if (lead.commercialLead) {
    return `/${locale}/admin/commercial-leads/${lead.commercialLead.id}`
  }
  if (lead.residentialLead) {
    return `/${locale}/admin/residential-leads/${lead.residentialLead.id}`
  }
  return null
}

export function useLeadRowNavigation(lead: OutboundLeadListItem) {
  const router = useRouter()
  const locale = useLocale()
  const href = leadRowHref(lead, locale)

  const onClick = (event: MouseEvent<HTMLElement>) => {
    if (!href || isInteractiveTarget(event.target)) return
    if (window.getSelection()?.toString()) return
    router.push(href)
  }

  return { href, onClick }
}

export function groupLeadsByState(items: OutboundLeadListItem[]): LeadGroup[] {
  const groups = new Map<LeadWorkState, LeadGroup>()
  for (const item of items) {
    const { state, ownerStep } = item.work
    const group = groups.get(state) ?? { state, items: [], sentenceKeys: [] }
    const key = leadGroupKey(state, ownerStep)
    group.items.push(item)
    if (!group.sentenceKeys.includes(key)) group.sentenceKeys.push(key)
    if (
      leadOpenRequestAnswered(item.work) &&
      !group.sentenceKeys.includes(LEAD_GROUP_REQUEST_KEY)
    ) {
      group.sentenceKeys.push(LEAD_GROUP_REQUEST_KEY)
    }
    groups.set(state, group)
  }
  return [...groups.values()]
}
