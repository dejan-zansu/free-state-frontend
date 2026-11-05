'use client'

import { useTranslations } from 'next-intl'
import { Fragment } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

const COLUMN_COUNT = 5
const HEAD_CLASS =
  'h-12 overflow-hidden px-3 text-lg font-semibold whitespace-normal text-[#062E25]'
const CELL_CLASS =
  'min-w-0 overflow-hidden px-3 py-3.5 align-top text-base whitespace-normal'

interface LeadTableProps {
  groups: LeadGroup[]
  counts: Partial<Record<LeadWorkState, number>> | undefined
  loading: boolean
  assignees: OutboundAssignee[] | undefined
}

function LeadTableRow({
  lead,
  assignees,
}: {
  lead: OutboundLeadListItem
  assignees: OutboundAssignee[] | undefined
}) {
  const { href, onClick } = useLeadRowNavigation(lead)

  return (
    <TableRow
      onClick={onClick}
      className={cn(
        'border-[#062E25]/10',
        href ? 'cursor-pointer hover:bg-[#F5F7EE]/70' : 'hover:bg-transparent'
      )}
    >
      <TableCell className={cn(CELL_CLASS, 'relative pl-5')}>
        {leadHasRedBar(lead.work) ? (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1 bg-red-600"
          />
        ) : null}
        <CompanyCell lead={lead} />
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <StandCell lead={lead} />
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <LastContactCell lead={lead} />
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <BuildingCell lead={lead} />
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <OwnerCell lead={lead} assignees={assignees} />
      </TableCell>
    </TableRow>
  )
}

function LeadTableSkeleton() {
  return (
    <>
      <TableRow className="border-[#062E25]/20 hover:bg-transparent">
        <TableCell
          colSpan={COLUMN_COUNT}
          className="whitespace-normal px-3 pb-2.5 pl-5 pt-4"
        >
          <Skeleton className="h-6 w-96 max-w-full" />
        </TableCell>
      </TableRow>
      {Array.from({ length: 5 }, (_, index) => (
        <TableRow
          key={index}
          className="border-[#062E25]/10 hover:bg-transparent"
        >
          <TableCell className={cn(CELL_CLASS, 'pl-5')}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          </TableCell>
          <TableCell className={CELL_CLASS}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-28 max-w-full rounded-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </TableCell>
          <TableCell className={CELL_CLASS}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </TableCell>
          <TableCell className={CELL_CLASS}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </TableCell>
          <TableCell className={CELL_CLASS}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function LeadTable({
  groups,
  counts,
  loading,
  assignees,
}: LeadTableProps) {
  const t = useTranslations('admin.outreach.leads')

  return (
    <div className="hidden overflow-hidden rounded-xl border border-[#062E25]/10 bg-white min-[1440px]:block">
      <Table className="table-fixed text-base">
        <colgroup>
          <col className="w-[25%]" />
          <col className="w-[20%]" />
          <col className="w-[22%]" />
          <col className="w-[15%]" />
          <col className="w-[18%]" />
        </colgroup>
        <TableHeader>
          <TableRow className="border-[#062E25]/10 bg-[#F5F7EE] hover:bg-[#F5F7EE]">
            <TableHead className={cn(HEAD_CLASS, 'pl-5')}>
              {t('col.company')}
            </TableHead>
            <TableHead className={HEAD_CLASS}>{t('col.stand')}</TableHead>
            <TableHead className={HEAD_CLASS}>{t('col.lastContact')}</TableHead>
            <TableHead className={HEAD_CLASS}>{t('col.building')}</TableHead>
            <TableHead className={HEAD_CLASS}>{t('col.owner')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <LeadTableSkeleton />
          ) : (
            groups.map(group => (
              <Fragment key={group.state}>
                <TableRow className="border-[#062E25]/20 hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="whitespace-normal px-3 pb-2.5 pl-5 pt-4 text-base"
                  >
                    <LeadGroupHeading
                      state={group.state}
                      count={counts?.[group.state] ?? group.items.length}
                      sentenceKeys={group.sentenceKeys}
                    />
                  </TableCell>
                </TableRow>
                {group.items.map(lead => (
                  <LeadTableRow
                    key={lead.id}
                    lead={lead}
                    assignees={assignees}
                  />
                ))}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
