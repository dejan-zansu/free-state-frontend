'use client'

import { useTranslations } from 'next-intl'
import { Mail } from 'lucide-react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { TableCell, TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type {
  OutboundProspectListItem,
  OutboundReplyClassification,
} from '@/types/admin-outreach'

const REPLY_TONE: Record<OutboundReplyClassification, string> = {
  INTERESTED: 'bg-green-100 text-green-800',
  QUESTION: 'bg-green-100 text-green-800',
  NOT_INTERESTED: 'bg-red-100 text-red-700',
  UNSUBSCRIBE: 'bg-red-100 text-red-700',
  NOT_NOW: 'bg-amber-100 text-amber-800',
  OOO: 'bg-slate-100 text-slate-600',
  WRONG_PERSON: 'bg-amber-100 text-amber-800',
  BOUNCE: 'bg-red-100 text-red-700',
  UNCLASSIFIED: 'bg-purple-100 text-purple-800',
}

type NextStep =
  | { key: 'draftReview'; tone: 'act' }
  | { key: 'readReply'; tone: 'act' }
  | { key: 'awaitContact'; tone: 'wait' }
  | { key: 'awaitDraft'; tone: 'wait' }
  | { key: 'awaitReply'; tone: 'wait' }
  | { key: 'snoozedUntil'; tone: 'wait'; date: string }
  | { key: 'none'; tone: 'none' }

export function deriveNextStep(p: OutboundProspectListItem): NextStep {
  if (p.emailSummary.hasUnsentDraft) return { key: 'draftReview', tone: 'act' }
  if (p.status === 'REPLIED') return { key: 'readReply', tone: 'act' }
  if (p.status === 'SNOOZED' && p.nextActionAt)
    return { key: 'snoozedUntil', tone: 'wait', date: p.nextActionAt }
  if (p.status === 'CONTACTED' || p.status === 'FOLLOW_UP_DUE')
    return { key: 'awaitReply', tone: 'wait' }
  if (p.status === 'CONTACT_FOUND') return { key: 'awaitDraft', tone: 'wait' }
  if (p.status === 'ROOF_QUALIFIED' || p.status === 'DISCOVERED')
    return { key: 'awaitContact', tone: 'wait' }
  return { key: 'none', tone: 'none' }
}

export function ProspectTableHeadCells() {
  const t = useTranslations('admin.outreach.table')
  return (
    <>
      <TableHead className="min-w-[220px]">{t('company')}</TableHead>
      <TableHead className="min-w-[220px]">{t('contact')}</TableHead>
      <TableHead className="text-right whitespace-nowrap">{t('roof')}</TableHead>
      <TableHead>{t('status')}</TableHead>
      <TableHead className="min-w-[170px]">{t('history')}</TableHead>
      <TableHead className="min-w-[150px]">{t('nextStep')}</TableHead>
    </>
  )
}

function HistoryCell({ p }: { p: OutboundProspectListItem }) {
  const t = useTranslations('admin.outreach.table')
  const tr = useTranslations('admin.outreach.replyClassifications')
  const s = p.emailSummary
  const nothing = s.sentCount === 0 && !s.hasUnsentDraft && s.replyCount === 0
  if (nothing) return <span className="text-[#062E25]/40">-</span>

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            title={
              s.sentSteps.includes(step)
                ? t('touchSent', { step })
                : t('touchPending', { step })
            }
            className={cn(
              'inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs tabular-nums',
              s.sentSteps.includes(step)
                ? 'bg-[#062E25] border-[#062E25] text-white'
                : 'border-[#062E25]/25 text-[#062E25]/40',
            )}
          >
            {step}
          </span>
        ))}
      </span>
      {s.lastSentAt && (
        <span className="text-[#062E25]/60 whitespace-nowrap">
          {new Date(s.lastSentAt).toLocaleDateString('de-CH')}
        </span>
      )}
      {s.hasUnsentDraft && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 whitespace-nowrap">
          <Mail className="h-3.5 w-3.5" />
          {t('draftReady')}
        </span>
      )}
      {s.lastReplyClassification && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 whitespace-nowrap',
            REPLY_TONE[s.lastReplyClassification],
          )}
          title={s.lastReplyAt ? new Date(s.lastReplyAt).toLocaleString('de-CH') : undefined}
        >
          {tr(s.lastReplyClassification)}
        </span>
      )}
    </div>
  )
}

export function ProspectRowCells({ p }: { p: OutboundProspectListItem }) {
  const t = useTranslations('admin.outreach.table')
  const next = deriveNextStep(p)
  const place = [p.addressPostalCode, p.addressCity].filter(Boolean).join(' ')

  return (
    <>
      <TableCell className="align-top">
        <p className="font-medium max-w-[260px] truncate" title={p.companyName}>
          {p.companyName}
        </p>
        <p className="text-[#062E25]/60">
          {place || '-'}
          {p.companiesAtEgid > 1 && (
            <span
              className="ml-2 rounded-full bg-amber-100 px-1.5 text-amber-800"
              title={t('companiesAtEgid', { count: p.companiesAtEgid })}
            >
              ×{p.companiesAtEgid}
            </span>
          )}
        </p>
      </TableCell>
      <TableCell className="align-top">
        {p.contactEmail ? (
          <>
            <p className="max-w-[240px] truncate" title={p.contactName ?? undefined}>
              {p.contactName ?? (p.contactIsRoleAddress ? t('roleAddress') : '-')}
            </p>
            <p
              className="text-[#062E25]/60 max-w-[240px] truncate tabular-nums"
              title={p.contactEmail}
            >
              {p.contactEmail}
            </p>
          </>
        ) : (
          <span className="text-[#062E25]/40">{t('contactMissing')}</span>
        )}
      </TableCell>
      <TableCell className="align-top text-right tabular-nums whitespace-nowrap">
        {p.roofAreaM2 != null ? (
          <>
            <p>{Math.round(Number(p.roofAreaM2)).toLocaleString('de-CH')} m²</p>
            <p className="text-[#062E25]/60">
              {p.roofKwhYear != null
                ? t('kwhShort', { kwh: Math.round(p.roofKwhYear / 1000).toLocaleString('de-CH') })
                : '-'}
            </p>
          </>
        ) : (
          <span className="text-[#062E25]/40">-</span>
        )}
      </TableCell>
      <TableCell className="align-top">
        <StatusBadge status={p.status} />
        {p.status === 'SCREENED_OUT' && p.disqualifyReason && (
          <p className="text-[#062E25]/60 mt-1">{p.disqualifyReason}</p>
        )}
      </TableCell>
      <TableCell className="align-top">
        <HistoryCell p={p} />
      </TableCell>
      <TableCell className="align-top">
        <span
          className={cn(
            'whitespace-nowrap',
            next.tone === 'act' && 'font-medium text-[#062E25]',
            next.tone === 'wait' && 'text-[#062E25]/60',
            next.tone === 'none' && 'text-[#062E25]/40',
          )}
        >
          {next.key === 'snoozedUntil'
            ? t('nextSnoozedUntil', { date: new Date(next.date).toLocaleDateString('de-CH') })
            : t(
                next.key === 'draftReview'
                  ? 'nextDraftReview'
                  : next.key === 'readReply'
                    ? 'nextReadReply'
                    : next.key === 'awaitDraft'
                      ? 'nextAwaitDraft'
                      : next.key === 'awaitReply'
                        ? 'nextAwaitReply'
                        : next.key === 'awaitContact'
                          ? 'nextAwaitContact'
                          : 'nextNone',
              )}
        </span>
      </TableCell>
    </>
  )
}

export const PROSPECT_TABLE_COLSPAN = 6
