'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import type { SalesLeadListItem } from '@/types/sales-lead'

import { customerDisplayName } from './lead-format'
import {
  ContactLinks,
  CreatedInfo,
  FollowUpInfo,
  LastActivity,
  LeadBadges,
  ResponsibleInfo,
  SystemSummary,
  useRowNavigation,
} from './lead-parts'

interface LeadCardsProps {
  leads: SalesLeadListItem[]
  loading: boolean
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-sm font-medium text-[#062E25]/60 sm:text-base">
        {label}
      </span>
      <div className="min-w-0 text-base">{children}</div>
    </div>
  )
}

function LeadCard({ lead }: { lead: SalesLeadListItem }) {
  const t = useTranslations('admin.salesLeads.list')
  const { href, onClick } = useRowNavigation(lead.id)
  const accent = lead.status === 'NEW' && !lead.assignedTo

  return (
    <article
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-[#062E25]/10 bg-white p-4 pl-5 transition-colors hover:bg-[#F5F7EE]/70"
    >
      {accent ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 bg-blue-500"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <Link
          href={href}
          className="min-w-0 break-words text-lg font-semibold text-[#062E25] underline-offset-2 outline-none hover:underline focus-visible:underline"
        >
          {customerDisplayName(lead.customer.user, t('unnamed'))}
        </Link>
        <StatusBadge status={lead.status} className="px-3 sm:text-base" />
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <ContactLinks user={lead.customer.user} />
        <LeadBadges lead={lead} />
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-1 border-t border-[#062E25]/10 pt-3">
        <span className="break-words text-base text-[#062E25]">
          {lead.propertyAddress || '-'}
        </span>
        <SystemSummary project={lead.project} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#062E25]/10 pt-3">
        <Fact label={t('columns.responsible')}>
          <ResponsibleInfo lead={lead} />
        </Fact>
        <Fact label={t('columns.followUp')}>
          <FollowUpInfo lead={lead} />
        </Fact>
        <Fact label={t('columns.lastActivity')}>
          <LastActivity activity={lead.lastActivity} />
        </Fact>
        <Fact label={t('columns.created')}>
          <CreatedInfo lead={lead} />
        </Fact>
      </div>
    </article>
  )
}

function LeadCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#062E25]/10 bg-white p-4 pl-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-[#062E25]/10 pt-3">
        <Skeleton className="h-5 w-full max-w-72" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="mt-4 grid gap-3 border-t border-[#062E25]/10 pt-3 sm:grid-cols-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

export function LeadCards({ leads, loading }: LeadCardsProps) {
  return (
    <div className="flex flex-col gap-3 min-[1440px]:hidden">
      {loading
        ? Array.from({ length: 4 }, (_, index) => (
            <LeadCardSkeleton key={index} />
          ))
        : leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
    </div>
  )
}
