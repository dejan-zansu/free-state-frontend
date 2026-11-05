'use client'

import { ArrowRight, Mail, Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  LEAD_FOLLOW_UP_TONE_CLASS,
  LEAD_INTEREST_TONE,
  LEAD_KIND_TONE,
  LEAD_PILL_TONE_CLASS,
  LEAD_TURN_TONE,
  formatCh,
  formatLeadShortDateTime,
  formatRoofMwh,
  leadAnswerTagKey,
  leadClosedReasonKey,
  leadContactBlocked,
  leadFollowUpLine,
  leadInterestKey,
  leadKindHintKey,
  leadKindKey,
  leadNewerContact,
  leadNextLine,
  leadOpenRequestAnswered,
  leadOpenRequestLine,
  leadOwnershipKey,
  leadPvKey,
  leadReasonKey,
  leadReopenedLine,
  leadShownReason,
  leadShowsStateLabel,
  leadSinceText,
  leadStandSentence,
  leadStateKey,
  leadTurnKey,
} from '@/lib/outbound-lead-work'
import { telHref } from '@/lib/sales-lead'
import { cn } from '@/lib/utils'
import type { OutboundAssignee } from '@/types/admin-outreach'
import type { OutboundLeadListItem } from '@/types/outreach/kpi'

import { LeadAssignControl } from './lead-assign-select'
import { leadRowHref, leadRowIdentity } from './lead-list-model'

const PILL_CLASS =
  'inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 font-medium'
const LINK_CLASS =
  'underline-offset-2 outline-none hover:underline focus-visible:underline'
const ANYWHERE_CLASS = 'min-w-0 [overflow-wrap:anywhere]'

function ContactLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: typeof Phone
}) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex max-w-full items-start gap-2 text-[#062E25]/80 hover:text-[#062E25] focus-visible:text-[#062E25]',
        LINK_CLASS
      )}
    >
      <Icon aria-hidden className="mt-1 size-4 shrink-0" />
      <span className={ANYWHERE_CLASS}>{label}</span>
    </a>
  )
}

export function CompanyCell({ lead }: { lead: OutboundLeadListItem }) {
  const t = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')
  const locale = useLocale()
  const { work } = lead
  const identity = leadRowIdentity(lead)
  const href = leadRowHref(lead, locale)

  const kindLabel = tw(leadKindKey(lead.kind))
  const interestLabel = work.interest
    ? tw(leadInterestKey(work.interest))
    : null
  const shownReason = leadShownReason(work)
  const reasonLabel = shownReason ? tw(leadReasonKey(shownReason)) : null
  const showReason =
    reasonLabel !== null &&
    reasonLabel !== kindLabel &&
    reasonLabel !== interestLabel
  const titleClass = cn('text-lg font-semibold text-[#062E25]', ANYWHERE_CLASS)

  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      {href ? (
        <Link href={href} className={cn(titleClass, LINK_CLASS)}>
          {identity.title}
        </Link>
      ) : (
        <span className={titleClass}>{identity.title}</span>
      )}

      <div className="flex max-w-full flex-wrap items-center gap-1.5">
        <span
          title={tw(leadKindHintKey(lead.kind))}
          className={cn(
            PILL_CLASS,
            LEAD_PILL_TONE_CLASS[LEAD_KIND_TONE[lead.kind]]
          )}
        >
          {kindLabel}
        </span>
        {interestLabel ? (
          <span
            className={cn(PILL_CLASS, LEAD_PILL_TONE_CLASS[LEAD_INTEREST_TONE])}
          >
            {interestLabel}
          </span>
        ) : null}
        {showReason ? (
          <span className="text-[#062E25]/70">{reasonLabel}</span>
        ) : null}
      </div>

      {identity.person ? (
        <span className={cn('text-[#062E25]', ANYWHERE_CLASS)}>
          {identity.role
            ? t('personRole', { name: identity.person, role: identity.role })
            : identity.person}
        </span>
      ) : (
        <span className="text-[#062E25]/70">{t('noPerson')}</span>
      )}

      {identity.phone ? (
        <ContactLink
          href={telHref(identity.phone)}
          label={identity.phone}
          icon={Phone}
        />
      ) : (
        <span className="inline-flex items-center gap-2 text-[#062E25]/70">
          <Phone aria-hidden className="size-4 shrink-0" />
          {t('noPhone')}
        </span>
      )}
      {identity.email ? (
        <ContactLink
          href={`mailto:${identity.email}`}
          label={identity.email}
          icon={Mail}
        />
      ) : null}
    </div>
  )
}

function nextStepHref(
  lead: OutboundLeadListItem,
  locale: string
): string | null {
  const { nextStep } = lead.work
  if (nextStep === 'OPEN_CRM' && lead.commercialLead) {
    return `/${locale}/admin/commercial-leads/${lead.commercialLead.id}`
  }
  if (nextStep === 'OPEN_OWNER' && lead.owner?.row) {
    return `/${locale}/admin/outreach/${lead.owner.row.id}`
  }
  return null
}

export function StandCell({ lead }: { lead: OutboundLeadListItem }) {
  const t = useTranslations('admin.outreach.work')
  const tl = useTranslations('admin.outreach.leads')
  const locale = useLocale()
  const { work } = lead
  const since = leadSinceText(work, lead.commercialLead?.reference)
  const next = leadNextLine(work)
  const nextLabel = t(next.key, next.values)
  const nextHref = nextStepHref(lead, locale)
  const noRoute = work.readOnly && !work.nextStep && !lead.residentialLead
  const requestLine = leadOpenRequestLine(work)
  const reopenedLine = leadReopenedLine(work)
  const showArrow = !!work.nextStep && !leadContactBlocked(work)

  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      <span
        className={cn(
          PILL_CLASS,
          LEAD_PILL_TONE_CLASS[LEAD_TURN_TONE[work.turn]]
        )}
      >
        {t(leadTurnKey(work.turn))}
      </span>
      {leadShowsStateLabel(work) ? (
        <span className="text-lg font-bold text-[#062E25]">
          {t(leadStateKey(work.state))}
        </span>
      ) : null}
      {work.state === 'BEENDET' && work.closedReason ? (
        <span className="text-[#062E25]/70">
          {t(leadClosedReasonKey(work.closedReason))}
        </span>
      ) : null}
      {since ? (
        <span
          className={cn(
            work.late ? 'font-semibold text-red-700' : 'text-[#062E25]/70'
          )}
        >
          {t(since.key, since.values)}
        </span>
      ) : null}
      {work.doNotContact ? (
        <span className="font-semibold text-red-700">{t('doNotContact')}</span>
      ) : null}
      {requestLine ? (
        <span className="text-[#062E25]">
          {t(requestLine.key, requestLine.values)}
        </span>
      ) : null}
      {reopenedLine ? (
        <span className="text-[#062E25]">{t(reopenedLine.key)}</span>
      ) : null}
      {noRoute ? (
        lead.prospect ? null : (
          <span className="text-[#062E25]">
            {tl.rich('letterCallback', {
              link: chunks => (
                <Link
                  href={`/${locale}/admin/outreach/letters`}
                  className="font-semibold underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        )
      ) : (
        <span className="flex min-w-0 items-start gap-1.5 font-semibold text-[#062E25]">
          {showArrow ? (
            <ArrowRight aria-hidden className="mt-1 size-4 shrink-0" />
          ) : null}
          {nextHref ? (
            <Link href={nextHref} className={cn('min-w-0', LINK_CLASS)}>
              {nextLabel}
            </Link>
          ) : (
            <span className="min-w-0">{nextLabel}</span>
          )}
        </span>
      )}
    </div>
  )
}

function TouchLine({
  who,
  value,
  newer,
}: {
  who: string
  value: string
  newer: boolean
}) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-[3.5rem_minmax(0,1fr)] gap-x-1.5 tabular-nums',
        newer && 'font-bold'
      )}
    >
      <span className={newer ? 'text-[#062E25]' : 'text-[#062E25]/70'}>
        {who}
      </span>
      <span className="text-[#062E25]">{value}</span>
    </div>
  )
}

function leadExcerpt(
  lead: OutboundLeadListItem,
  sentence: () => string
): string | null {
  const { work } = lead
  const excerpt = (work.openTouch ?? work.lastCustomerTouch)?.excerpt
  if (excerpt) return excerpt
  return work.state === 'ANTWORT_OFFEN' && !leadOpenRequestAnswered(work)
    ? sentence()
    : null
}

export function LastContactCell({ lead }: { lead: OutboundLeadListItem }) {
  const t = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')
  const { work } = lead
  const newer = leadNewerContact(work)
  const answer = work.lastOurAnswer
  const tag = leadAnswerTagKey(answer)
  const ours = formatLeadShortDateTime(answer?.at)
  const identity = leadRowIdentity(lead)

  const excerpt = leadExcerpt(lead, () => {
    const text = leadStandSentence(work, {
      who: identity.person ?? identity.title,
      owner: lead.owner,
      crmReference: lead.commercialLead?.reference,
    })
    return tw(text.key, text.values)
  })

  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      <TouchLine
        who={t('customer')}
        value={formatLeadShortDateTime(work.lastCustomerTouch?.at)}
        newer={newer === 'customer'}
      />
      <TouchLine
        who={t('us')}
        value={tag ? `${ours} ${tw(tag)}` : ours}
        newer={newer === 'us'}
      />
      {excerpt ? (
        <span
          title={excerpt}
          className={cn('line-clamp-2 text-[#062E25]/70', ANYWHERE_CLASS)}
        >
          {excerpt}
        </span>
      ) : null}
      <span className="text-[#062E25]/70">
        {t('countsLine', {
          mails: work.counts.mailsFromUs,
          replies: work.counts.replies,
        })}
      </span>
    </div>
  )
}

export function BuildingCell({ lead }: { lead: OutboundLeadListItem }) {
  const t = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')
  const { prospect, owner } = lead

  if (!prospect) return <span className="text-[#062E25]/70">-</span>

  const ownerName = owner?.name ?? owner?.row?.companyName ?? null

  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      {prospect.roofAreaM2 !== null ? (
        <span className="font-semibold tabular-nums text-[#062E25]">
          {t('roofArea', { area: formatCh(prospect.roofAreaM2) })}
        </span>
      ) : null}
      {prospect.roofKwhYear !== null ? (
        <span
          title={tw('facts.potentialHint')}
          className="tabular-nums text-[#062E25]"
        >
          {t('roofPotential', { mwh: formatRoofMwh(prospect.roofKwhYear) })}
        </span>
      ) : null}
      <span title={tw('facts.pvCheck')} className="text-[#062E25]">
        {tw(leadPvKey(prospect.pvVerdict))}
      </span>
      <span title={tw('facts.whoAnswers')} className="text-[#062E25]">
        {tw(leadOwnershipKey(prospect.ownershipConfidence))}
      </span>
      {ownerName ? (
        <span className={cn('text-[#062E25]/70', ANYWHERE_CLASS)}>
          {t('ownerPerTenant', { name: ownerName })}
        </span>
      ) : null}
    </div>
  )
}

export function OwnerCell({
  lead,
  assignees,
}: {
  lead: OutboundLeadListItem
  assignees: OutboundAssignee[] | undefined
}) {
  const t = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')
  const locale = useLocale()
  const followUp = leadFollowUpLine(lead.work)
  const { commercialLead, residentialLead } = lead

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-1.5">
      <LeadAssignControl lead={lead} assignees={assignees} />
      {followUp ? (
        <span className={LEAD_FOLLOW_UP_TONE_CLASS[followUp.tone]}>
          {tw(followUp.text.key, followUp.text.values)}
        </span>
      ) : null}
      {commercialLead ? (
        <Link
          href={`/${locale}/admin/commercial-leads/${commercialLead.id}`}
          className={cn('text-[#062E25]/70 hover:text-[#062E25]', LINK_CLASS)}
        >
          {commercialLead.reference}
        </Link>
      ) : null}
      {residentialLead ? (
        <Link
          href={`/${locale}/admin/residential-leads/${residentialLead.id}`}
          className={cn('text-[#062E25]/70 hover:text-[#062E25]', LINK_CLASS)}
        >
          {t('crmCalculator')}
        </Link>
      ) : null}
    </div>
  )
}

export function LeadGroupHeading({
  state,
  count,
  sentenceKeys,
}: {
  state: OutboundLeadListItem['work']['state']
  count: number
  sentenceKeys: string[]
}) {
  const t = useTranslations('admin.outreach.work')

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-center gap-2 text-lg font-bold text-[#062E25]">
        {t(leadStateKey(state))}
        <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-[#062E25]/10 px-1.5 text-base font-semibold tabular-nums">
          {formatCh(count)}
        </span>
      </span>
      <span className="min-w-0 text-[#062E25]/70">
        {sentenceKeys.map(key => t(key)).join(' ')}
      </span>
    </p>
  )
}
