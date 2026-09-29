'use client'

// Compact ownership badge in the prospect table (outreach/prospect-table.tsx,
// company column, next to the xN companies badge). Rows whose ownership is
// still unknown show nothing, so the list stays quiet until evidence exists.

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import type { OutboundProspectListItem } from '@/types/admin-outreach'
import type { OwnershipConfidence } from '@/types/outreach/owner-first'

export const CONFIDENCE_CLASSES: Record<OwnershipConfidence, string> = {
  CONFIRMED_OWNER: 'bg-emerald-100 text-emerald-900',
  LIKELY_OWNER: 'bg-emerald-50 text-emerald-800',
  MANAGER: 'bg-sky-100 text-sky-900',
  UNKNOWN: 'bg-gray-100 text-gray-700',
  LIKELY_TENANT: 'bg-amber-100 text-amber-900',
  CONFIRMED_TENANT: 'bg-orange-100 text-orange-900',
}

export function OwnershipBadge(props: { prospect: OutboundProspectListItem }) {
  const tc = useTranslations('admin.outreach.ownership.confidence')
  const tr = useTranslations('admin.outreach.ownership.partyRole')
  const ts = useTranslations('admin.outreach.ownership.segment')
  const { prospect } = props
  const ownParty = prospect.partyRole !== 'OCCUPANT'
  const known = prospect.ownershipConfidence !== 'UNKNOWN'
  if (!known && !ownParty && !prospect.portfolioName) return null
  const title = [
    prospect.ownerName,
    prospect.ownerUid,
    prospect.segment ? ts(prospect.segment) : null,
    prospect.segmentReason,
  ]
    .filter(Boolean)
    .join(' | ')
  return (
    <p className="mt-1 flex flex-wrap items-center gap-1">
      {ownParty && (
        <span className="rounded-full bg-[#062E25] px-2 text-white">
          {tr(prospect.partyRole)}
        </span>
      )}
      {prospect.portfolioName && (
        <span
          className="rounded-full bg-violet-100 px-2 text-violet-900"
          title={prospect.portfolioName}
        >
          {prospect.portfolioEgids.length > 0
            ? `${prospect.portfolioEgids.length}×`
            : ''}{' '}
          {prospect.portfolioName}
        </span>
      )}
      {known && (
        <span
          className={cn(
            'rounded-full px-2',
            CONFIDENCE_CLASSES[prospect.ownershipConfidence]
          )}
          title={title || undefined}
        >
          {tc(prospect.ownershipConfidence)}
        </span>
      )}
    </p>
  )
}
