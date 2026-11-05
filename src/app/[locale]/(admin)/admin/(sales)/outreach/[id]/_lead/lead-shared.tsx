'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import {
  LEAD_PILL_TONE_CLASS,
  type LeadPillTone,
} from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type {
  OutboundEmail,
  OutboundProspectDetail,
  OutboundProspectStatus,
} from '@/types/admin-outreach'
import type { LeadWorkSnapshot } from '@/types/outreach/kpi'

export const LEAD_NO_ANSWER_OUTCOMES = ['NO_ANSWER', 'WRONG_NUMBER']

export const LEAD_REPLY_BLOCKED_STATUSES: OutboundProspectStatus[] = [
  'OPTED_OUT',
  'BOUNCED',
  'SCREENED_OUT',
]

export const LEAD_DECISION_TERMINAL_STATUSES: OutboundProspectStatus[] = [
  'SCREENED_OUT',
  'OPTED_OUT',
  'CONVERTED',
  'NOT_INTERESTED',
  'BOUNCED',
  'EXPIRED',
]

export const LEAD_INPUT_CLASS = 'mt-1 text-base md:text-base text-[#062E25]'

export const LEAD_COMPOSER_TEXT_ID = 'lead-composer-text'

export function leadProspectKey(id: string) {
  return ['admin', 'outreach', 'prospect', id] as const
}

export function useLeadCache(prospectId: string) {
  const queryClient = useQueryClient()

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })

  const applySnapshot = (snapshot: LeadWorkSnapshot) => {
    queryClient.setQueryData<OutboundProspectDetail>(
      leadProspectKey(prospectId),
      current =>
        current
          ? {
              ...current,
              work: snapshot.work,
              owner: snapshot.owner,
              assignedTo: snapshot.assignedTo,
              crmLead: snapshot.crmLead,
            }
          : current
    )
    return refresh()
  }

  return { refresh, applySnapshot }
}

export function useLeadAssignees() {
  return useQuery({
    queryKey: ['admin', 'outreach', 'assignees'],
    queryFn: () => adminOutreachService.listAssignees(),
    staleTime: 5 * 60 * 1000,
  })
}

export function leadWho(prospect: OutboundProspectDetail): string {
  return prospect.contactName?.trim() || prospect.companyName
}

export function leadAddress(prospect: OutboundProspectDetail): string {
  const street = [prospect.addressStreet, prospect.addressNumber]
    .filter(Boolean)
    .join(' ')
  const city = [prospect.addressPostalCode, prospect.addressCity]
    .filter(Boolean)
    .join(' ')
  return [street, city].filter(Boolean).join(', ')
}

export function leadMailSender(
  prospect: OutboundProspectDetail,
  email: OutboundEmail
): string {
  const from = email.fromAddress?.trim()
  if (!from) return leadWho(prospect)
  const contact = prospect.contactEmail?.trim().toLowerCase()
  return contact === from.toLowerCase() ? leadWho(prospect) : from
}

export function leadCrmHref(
  prospect: OutboundProspectDetail,
  locale: string
): string | null {
  const commercialId = prospect.crmLead?.id ?? prospect.commercialLeadId
  if (commercialId) return `/${locale}/admin/commercial-leads/${commercialId}`
  const residentialId = prospect.leads.find(
    lead => lead.residentialLeadId
  )?.residentialLeadId
  return residentialId
    ? `/${locale}/admin/residential-leads/${residentialId}`
    : null
}

export function LeadPill({
  tone,
  title,
  children,
}: {
  tone: LeadPillTone
  title?: string
  children: ReactNode
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-0.5 font-medium',
        LEAD_PILL_TONE_CLASS[tone]
      )}
    >
      {children}
    </span>
  )
}

export function LeadFact({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-2">
      <dt className="text-[#062E25]/75">{label}</dt>
      <dd className="break-words font-medium text-[#062E25]">
        {children}
        {hint && (
          <span className="block font-normal text-[#062E25]/75">{hint}</span>
        )}
      </dd>
    </div>
  )
}
