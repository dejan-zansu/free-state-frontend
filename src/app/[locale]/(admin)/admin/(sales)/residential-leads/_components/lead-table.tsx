'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SalesLeadListItem } from '@/types/sales-lead'

import { customerDisplayName } from './lead-format'
import {
  ContactLinks,
  CreatedLine,
  FollowUpInfo,
  LastActivity,
  LeadBadges,
  ResponsibleInfo,
  SystemSummary,
  useRowNavigation,
} from './lead-parts'

const HEAD_CLASS =
  'h-12 overflow-hidden px-3 text-base font-semibold text-[#062E25]'
const CELL_CLASS =
  'min-w-0 overflow-hidden px-3 py-4 align-top text-base break-words whitespace-normal'

interface LeadTableProps {
  leads: SalesLeadListItem[]
  loading: boolean
}

function LeadTableRow({ lead }: { lead: SalesLeadListItem }) {
  const t = useTranslations('admin.salesLeads.list')
  const { href, onClick } = useRowNavigation(lead.id)
  const accent = lead.status === 'NEW' && !lead.assignedTo
  const name = customerDisplayName(lead.customer.user, t('unnamed'))

  return (
    <TableRow
      onClick={onClick}
      className="cursor-pointer border-[#062E25]/10 hover:bg-[#F5F7EE]/70"
    >
      <TableCell className={cn(CELL_CLASS, 'relative pl-5')}>
        {accent ? (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1 bg-blue-500"
          />
        ) : null}
        <div className="flex min-w-0 flex-col gap-1.5">
          <Link
            href={href}
            title={name}
            className="block truncate font-semibold text-[#062E25] underline-offset-2 outline-none hover:underline focus-visible:underline"
          >
            {name}
          </Link>
          <ContactLinks user={lead.customer.user} />
          <LeadBadges lead={lead} />
          <CreatedLine lead={lead} />
        </div>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <div className="flex min-w-0 flex-col gap-1">
          <span
            className="line-clamp-2 text-[#062E25]"
            title={lead.propertyAddress}
          >
            {lead.propertyAddress || '-'}
          </span>
          <SystemSummary project={lead.project} />
        </div>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <div className="flex min-w-0 flex-col items-start gap-2">
          <StatusBadge
            status={lead.status}
            className="max-w-full px-2.5 sm:text-base"
          />
          <ResponsibleInfo lead={lead} withIcon />
        </div>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <LastActivity activity={lead.lastActivity} />
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <FollowUpInfo lead={lead} />
      </TableCell>
    </TableRow>
  )
}

function LeadTableSkeletonRow() {
  return (
    <TableRow className="border-[#062E25]/10 hover:bg-transparent">
      <TableCell className={cn(CELL_CLASS, 'pl-5')}>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-28 max-w-full rounded-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <Skeleton className="h-5 w-2/3" />
      </TableCell>
    </TableRow>
  )
}

export function LeadTable({ leads, loading }: LeadTableProps) {
  const t = useTranslations('admin.salesLeads.list')

  return (
    <div className="hidden overflow-hidden rounded-xl border border-[#062E25]/10 bg-white min-[1440px]:block">
      <Table className="table-fixed text-base">
        <colgroup>
          <col className="w-[27%]" />
          <col className="w-[21%]" />
          <col className="w-[19%]" />
          <col className="w-[18%]" />
          <col className="w-[15%]" />
        </colgroup>
        <TableHeader>
          <TableRow className="border-[#062E25]/10 bg-[#F5F7EE] hover:bg-[#F5F7EE]">
            <TableHead className={cn(HEAD_CLASS, 'pl-5')}>
              {t('columns.customer')}
            </TableHead>
            <TableHead className={HEAD_CLASS}>
              {t('columns.property')}
            </TableHead>
            <TableHead className={HEAD_CLASS}>
              <span className="flex flex-col">
                <span>{t('columns.status')}</span>
                <span className="font-normal text-[#062E25]/75">
                  {t('columns.responsible')}
                </span>
              </span>
            </TableHead>
            <TableHead className={HEAD_CLASS}>
              {t('columns.lastActivity')}
            </TableHead>
            <TableHead className={HEAD_CLASS}>
              {t('columns.followUp')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <LeadTableSkeletonRow key={index} />
              ))
            : leads.map(lead => <LeadTableRow key={lead.id} lead={lead} />)}
        </TableBody>
      </Table>
    </div>
  )
}
