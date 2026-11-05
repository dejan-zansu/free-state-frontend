'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import {
  LEAD_TURN_TONE,
  assigneeName,
  formatLeadDate,
  formatLeadDateTime,
  leadAnswerTagKey,
  leadClosedReasonKey,
  leadClosingEvent,
  leadNextLine,
  leadOwnerLine,
  leadReopenedLine,
  leadShowsStateLabel,
  leadSinceText,
  leadStandSentence,
  leadStateKey,
  leadTurnKey,
} from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import type { OutboundProspectDetail } from '@/types/admin-outreach'
import type { LeadWorkState } from '@/types/outreach/kpi'

import { CARD_CLASS } from '../../../residential-leads/[id]/leadUtils'
import { Field } from '../../../residential-leads/[id]/parts'
import { LeadPill, leadWho } from './lead-shared'
import { LeadWorkStrip } from './LeadWorkStrip'

const QUOTE_STATES: LeadWorkState[] = [
  'ANTWORT_OFFEN',
  'ENTWURF_PRUEFEN',
  'NACHFASSEN_FAELLIG',
  'EIGENTUEMER_KONTAKTIEREN',
  'ABGESAGT',
]

function useLastContactValues(prospect: OutboundProspectDetail) {
  const t = useTranslations('admin.outreach.work')
  const { lastCustomerTouch, lastOurAnswer } = prospect.work
  const tagKey = leadAnswerTagKey(lastOurAnswer)
  const suffix = lastOurAnswer?.automatic
    ? t('fields.automaticSuffix')
    : tagKey
      ? ` ${t(tagKey)}`
      : ''
  return {
    customer: formatLeadDateTime(lastCustomerTouch?.at),
    us: lastOurAnswer
      ? `${formatLeadDateTime(lastOurAnswer.at)}${suffix}`
      : '-',
  }
}

function OwnerLine({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.work')
  const locale = useLocale()
  const line = leadOwnerLine(prospect.owner)
  if (!line) return null
  return (
    <p className="mt-4 border-t border-[#062E25]/10 pt-4 text-base text-[#062E25]">
      {line.named && (
        <span className="font-semibold">
          {t(line.named.key, line.named.values)}{' '}
        </span>
      )}
      {line.row && (
        <>
          {t('ownerLine.atRow')}{' '}
          <Link
            href={`/${locale}/admin/outreach/${line.row.id}`}
            className="underline underline-offset-2"
          >
            {line.row.reference}
          </Link>
          .{' '}
        </>
      )}
      {line.status && t(line.status.key, line.status.values)}
    </p>
  )
}

function WorkArea({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.work')
  const tl = useTranslations('admin.outreach.leads')
  if (!prospect.work.readOnly) return <LeadWorkStrip prospect={prospect} />
  return (
    <dl className="mt-5 border-t border-[#062E25]/10 pt-5">
      <Field label={t('strip.assignee')}>
        {assigneeName(prospect.assignedTo) ?? tl('unassigned')}
      </Field>
    </dl>
  )
}

function ProspectStatusCard({
  prospect,
}: {
  prospect: OutboundProspectDetail
}) {
  const t = useTranslations('admin.outreach.work')
  const td = useTranslations('admin.outreach.detail')
  const last = useLastContactValues(prospect)
  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <StatusBadge
          status={prospect.status}
          namespace="admin.outreach.statusLabels"
          className="px-3 text-base"
        />
        {prospect.work.doNotContact && (
          <LeadPill tone="red">{t('doNotContact')}</LeadPill>
        )}
      </div>
      {(prospect.disqualifyReason || prospect.nextActionAt) && (
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-base text-[#062E25]">
          {prospect.disqualifyReason && (
            <span className="text-red-700">
              {td('disqualifyReason')}: {prospect.disqualifyReason}
            </span>
          )}
          {prospect.nextActionAt && (
            <span>
              {td('nextActionAt')}: {formatLeadDate(prospect.nextActionAt)}
            </span>
          )}
        </div>
      )}
      <dl className="mt-4 grid gap-x-7 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
        <Field label={t('fields.customerLast')}>{last.customer}</Field>
        <Field label={t('fields.usLast')}>{last.us}</Field>
      </dl>
    </>
  )
}

function LeadStandBody({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.work')
  const { work, owner, crmLead } = prospect
  const last = useLastContactValues(prospect)
  const crmReference = crmLead?.reference ?? null
  const closing = leadClosingEvent(work, prospect.activities)
  const since = closing?.since ?? leadSinceText(work, crmReference)
  const sentence =
    closing?.sentence ??
    leadStandSentence(work, {
      who: leadWho(prospect),
      owner,
      crmReference,
    })
  const reopened = leadReopenedLine(work)
  const next = leadNextLine(work)
  const quote =
    work.openTouch ??
    (QUOTE_STATES.includes(work.state) ? work.lastCustomerTouch : null)

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <LeadPill tone={LEAD_TURN_TONE[work.turn]}>
          {t(leadTurnKey(work.turn))}
        </LeadPill>
        {leadShowsStateLabel(work) && (
          <span className="text-xl font-bold text-[#062E25]">
            {t(leadStateKey(work.state))}
          </span>
        )}
        {since && (
          <span
            className={cn(
              'text-base',
              work.late ? 'font-semibold text-red-700' : 'text-[#062E25]/75'
            )}
          >
            {t(since.key, since.values)}
          </span>
        )}
        {work.closedReason && (
          <LeadPill tone="grey">
            {t(leadClosedReasonKey(work.closedReason))}
          </LeadPill>
        )}
        {work.doNotContact && (
          <LeadPill tone="red">{t('doNotContact')}</LeadPill>
        )}
      </div>
      <p className="mt-2.5 text-base text-[#062E25]">
        {t(sentence.key, sentence.values)}
      </p>
      {reopened && (
        <p className="mt-1 text-base font-semibold text-[#062E25]">
          {t(reopened.key)}
        </p>
      )}
      <dl className="mt-4 grid gap-x-7 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
        <Field label={t('fields.customerLast')}>{last.customer}</Field>
        <Field label={t('fields.usLast')}>{last.us}</Field>
        <Field label={t('fields.next')}>{t(next.key, next.values)}</Field>
      </dl>
      {quote?.excerpt && (
        <p className="mt-3.5 whitespace-pre-wrap break-words rounded-xl bg-[#F5F7EE] px-3.5 py-3 text-base text-[#062E25]">
          {quote.excerpt}
        </p>
      )}
      <OwnerLine prospect={prospect} />
    </>
  )
}

export function StandCard({
  prospect,
  hasLead,
}: {
  prospect: OutboundProspectDetail
  hasLead: boolean
}) {
  const t = useTranslations('admin.outreach.work')
  return (
    <section aria-label={t('header.standAria')}>
      <Card className={cn(CARD_CLASS, 'mb-6')}>
        <CardContent className="p-4 sm:p-6">
          {hasLead ? (
            <LeadStandBody prospect={prospect} />
          ) : (
            <ProspectStatusCard prospect={prospect} />
          )}
          <WorkArea prospect={prospect} />
        </CardContent>
      </Card>
    </section>
  )
}
