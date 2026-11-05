'use client'

import { useTranslations } from 'next-intl'

import { Skeleton } from '@/components/ui/skeleton'
import { leadHasRedBar } from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import type { OutboundAssignee } from '@/types/admin-outreach'
import type { LeadWorkState, OutboundLeadListItem } from '@/types/outreach/kpi'

import {
  BuildingCell,
  CompanyCell,
  LastContactCell,
  LeadGroupHeading,
  OwnerCell,
  StandCell,
} from './lead-cells'
import { useLeadRowNavigation, type LeadGroup } from './lead-list-model'

const CARD_GRID_CLASS =
  'grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-x-5 gap-y-3.5'

interface LeadCardsProps {
  groups: LeadGroup[]
  counts: Partial<Record<LeadWorkState, number>> | undefined
  loading: boolean
  assignees: OutboundAssignee[] | undefined
}

function LeadCard({
  lead,
  assignees,
}: {
  lead: OutboundLeadListItem
  assignees: OutboundAssignee[] | undefined
}) {
  const t = useTranslations('admin.outreach.leads')
  const { href, onClick } = useLeadRowNavigation(lead)

  return (
    <article
      onClick={onClick}
      className={cn(
        CARD_GRID_CLASS,
        'relative overflow-hidden rounded-xl border border-[#062E25]/10 bg-white p-4 pl-5 text-base',
        href && 'cursor-pointer transition-colors hover:bg-[#F5F7EE]/70'
      )}
    >
      {leadHasRedBar(lead.work) ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 bg-red-600"
        />
      ) : null}
      <CompanyCell lead={lead} />
      <StandCell lead={lead} />
      <LastContactCell lead={lead} />
      <BuildingCell lead={lead} />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium text-[#062E25]/70">{t('col.owner')}</span>
        <OwnerCell lead={lead} assignees={assignees} />
      </div>
    </article>
  )
}

function LeadCardSkeleton() {
  return (
    <div
      className={cn(
        CARD_GRID_CLASS,
        'rounded-xl border border-[#062E25]/10 bg-white p-4 pl-5'
      )}
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-5/6" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  )
}

export function LeadCards({
  groups,
  counts,
  loading,
  assignees,
}: LeadCardsProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 min-[1440px]:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <LeadCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 min-[1440px]:hidden">
      {groups.map(group => (
        <section key={group.state} className="flex flex-col gap-2">
          <LeadGroupHeading
            state={group.state}
            count={counts?.[group.state] ?? group.items.length}
            sentenceKeys={group.sentenceKeys}
          />
          <div className="flex flex-col gap-3">
            {group.items.map(lead => (
              <LeadCard key={lead.id} lead={lead} assignees={assignees} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
