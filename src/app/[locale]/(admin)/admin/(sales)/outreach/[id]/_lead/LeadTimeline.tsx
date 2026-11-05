'use client'

import {
  CalendarDays,
  Circle,
  Linkedin,
  Mail,
  Phone,
  Send,
  StickyNote,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState, type ReactNode } from 'react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  assigneeName,
  formatLeadDate,
  formatLeadDateTime,
} from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import type {
  OutboundActivity,
  OutboundProspectDetail,
  OutboundProspectEmail,
} from '@/types/admin-outreach'

import {
  buildLeadTimeline,
  leadIsDecision,
  leadPayloadText,
  type LeadEventKind,
  type LeadSystemLine,
  type LeadTimelineEntry,
} from './lead-timeline-entries'
import {
  LeadPill,
  leadMailSender,
  leadWho,
  useLeadAssignees,
} from './lead-shared'

type Side = 'customer' | 'us'

const SIDE_CLASS: Record<Side, string> = {
  customer: 'bg-blue-100 text-blue-800',
  us: 'bg-[#062E25] text-white',
}

const EVENT_ICON: Record<LeadEventKind, LucideIcon> = {
  meeting: CalendarDays,
  visit: CalendarDays,
  offer: Send,
  letter: Mail,
}

const SHORT_LINES = 12
const SINGLE_LINE_LENGTH = 200

function joinMeta(parts: (ReactNode | null | undefined)[]): ReactNode[] {
  return parts.filter(Boolean).flatMap((part, index) =>
    index === 0
      ? [part]
      : [
          <span key={`separator-${index}`} aria-hidden>
            {' · '}
          </span>,
          part,
        ]
  )
}

function FullRow({
  side,
  icon: Icon,
  title,
  tags,
  body,
  meta,
}: {
  side: Side
  icon: LucideIcon
  title: string
  tags?: ReactNode
  body?: ReactNode
  meta: ReactNode
}) {
  return (
    <li className="group relative flex gap-3.5 pb-6 last:pb-0">
      <span
        aria-hidden
        className="absolute left-5 top-10 bottom-0 w-px -translate-x-1/2 bg-[#062E25]/10 group-last:hidden"
      />
      <span
        className={cn(
          'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full',
          SIDE_CLASS[side]
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[#062E25]">
          <span className="min-w-0 break-words text-base font-semibold">
            {title}
          </span>
          {tags}
        </div>
        {body}
        <p className="mt-1 break-words text-[#062E25]/75">{meta}</p>
      </div>
    </li>
  )
}

function SystemRow({
  text,
  at,
  actor,
  body,
}: {
  text: string
  at: string
  actor?: string | null
  body?: string | null
}) {
  const t = useTranslations('admin.outreach.work')
  const [open, setOpen] = useState(false)
  return (
    <li className="group relative flex gap-3.5 pb-6 pl-1.5 last:pb-0">
      <span
        aria-hidden
        className="absolute left-5 top-7 bottom-0 w-px -translate-x-1/2 bg-[#062E25]/10 group-last:hidden"
      />
      <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#062E25]/10 text-[#062E25]/75">
        <Circle className="size-2 fill-current" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5 text-[#062E25]/75">
        <p className="break-words">
          {joinMeta([
            <span key="text">{text}</span>,
            <span key="at">{formatLeadDateTime(at)}</span>,
            actor ? <span key="actor">{actor}</span> : null,
            body ? (
              <button
                key="toggle"
                type="button"
                onClick={() => setOpen(value => !value)}
                className="underline underline-offset-2 hover:text-[#062E25]"
              >
                {open ? t('timeline.less') : t('timeline.fullMail')}
              </button>
            ) : null,
          ])}
        </p>
        {open && body && (
          <p className="mt-1.5 whitespace-pre-wrap break-words rounded-xl bg-[#F5F7EE] p-3 text-[#062E25]">
            {body}
          </p>
        )}
      </div>
    </li>
  )
}

function useMailBody(email: OutboundProspectEmail, startMedium: boolean) {
  const t = useTranslations('admin.outreach.work')
  const [full, setFull] = useState(false)
  const text = email.bodyText ?? ''
  const lines = text.split('\n')
  const cut = startMedium && lines.length > SHORT_LINES
  const shown =
    !full && cut ? `${lines.slice(0, SHORT_LINES).join('\n')}…` : text
  const hasToggle = !!text && (!startMedium || cut)

  return {
    box: text ? (
      <div className="mt-1.5 rounded-xl bg-[#F5F7EE] px-3 py-2.5 text-base text-[#062E25]">
        {full && (
          <p className="mb-1.5 break-words font-semibold">{email.subject}</p>
        )}
        <p
          className={cn(
            'break-words',
            !full && !startMedium
              ? 'line-clamp-2 whitespace-normal'
              : 'whitespace-pre-wrap'
          )}
        >
          {shown}
        </p>
        {full && email.messageId && (
          <p
            className="mt-1.5 truncate font-mono text-[#062E25]/60"
            title={email.messageId}
          >
            {email.messageId}
          </p>
        )}
      </div>
    ) : null,
    toggle: hasToggle ? (
      <button
        key="toggle"
        type="button"
        onClick={() => setFull(value => !value)}
        className="underline underline-offset-2 hover:text-[#062E25]"
      >
        {full ? t('timeline.less') : t('timeline.fullMail')}
      </button>
    ) : null,
  }
}

function InboundRow({
  entry,
  prospect,
}: {
  entry: Extract<LeadTimelineEntry, { kind: 'inbound' }>
  prospect: OutboundProspectDetail
}) {
  const t = useTranslations('admin.outreach.work')
  const { email } = entry
  const mail = useMailBody(email, entry.newest)
  const classification = email.replyClassification
  const known = classification && classification !== 'UNCLASSIFIED'
  return (
    <FullRow
      side="customer"
      icon={Mail}
      title={t('timeline.wrote', { who: leadMailSender(prospect, email) })}
      tags={
        <>
          {known ? (
            <LeadPill tone="blue">
              {t(`classification.${classification}`)}
            </LeadPill>
          ) : (
            <LeadPill tone="grey">{t('timeline.unread')}</LeadPill>
          )}
          {entry.open && (
            <LeadPill tone="red">{t('timeline.unanswered')}</LeadPill>
          )}
        </>
      }
      body={mail.box}
      meta={joinMeta([
        <span key="at">{formatLeadDateTime(entry.at)}</span>,
        mail.toggle,
      ])}
    />
  )
}

function OutboundRow({
  entry,
}: {
  entry: Extract<LeadTimelineEntry, { kind: 'outbound' }>
}) {
  const t = useTranslations('admin.outreach.work')
  const { email } = entry
  const mail = useMailBody(email, false)
  const mailbox = email.mailbox?.address ?? email.fromAddress
  return (
    <FullRow
      side="us"
      icon={Send}
      title={t('timeline.weWrote')}
      tags={
        email.status === 'SENT' ? null : (
          <StatusBadge
            status={email.status}
            namespace="admin.outreach.statusLabels"
            className="px-3 text-base"
          />
        )
      }
      body={mail.box}
      meta={joinMeta([
        <span key="at">{formatLeadDateTime(entry.at)}</span>,
        mailbox ? (
          <span key="mailbox">{t('timeline.fromMailbox', { mailbox })}</span>
        ) : null,
        mail.toggle,
      ])}
    />
  )
}

function roofLines(
  activity: OutboundActivity,
  t: ReturnType<typeof useTranslations>
): string | null {
  const read = (key: string) => leadPayloadText(activity, key)
  const kind = read('kind')
  if (kind === 'tenant_answer') {
    const owner = read('ownerName')
    const named = owner ? t('ownerLine.named', { name: owner }) : null
    return [named, read('ownerEmail')].filter(Boolean).join(' ') || null
  }
  if (kind === 'owner_request') {
    return (
      [read('name'), read('email'), read('phone')].filter(Boolean).join(', ') ||
      null
    )
  }
  return (
    [read('companyName'), read('commercialLeadReference')]
      .filter(Boolean)
      .join(', ') || null
  )
}

function BoxText({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1.5 whitespace-pre-wrap break-words rounded-xl bg-[#F5F7EE] px-3 py-2.5 text-base text-[#062E25]">
      {children}
    </div>
  )
}

function activityActor(activity: OutboundActivity): string | null {
  return activity.actor ? assigneeName(activity.actor) : null
}

function activityMeta(at: string, activity: OutboundActivity): ReactNode[] {
  const actor = activityActor(activity)
  return joinMeta([
    <span key="at">{formatLeadDateTime(at)}</span>,
    actor ? <span key="actor">{actor}</span> : null,
  ])
}

function singleLine(text: string | null | undefined): string {
  const flat = (text ?? '').replace(/\s+/g, ' ').trim()
  return flat.length > SINGLE_LINE_LENGTH
    ? `${flat.slice(0, SINGLE_LINE_LENGTH)}…`
    : flat
}

function recipients(email: OutboundProspectEmail): string | null {
  const to = email.headersJson?.to
  if (Array.isArray(to)) return to.join(', ') || null
  return typeof to === 'string' && to.trim() ? to.trim() : null
}

export function LeadTimeline({
  prospect,
  onShowProtocol,
}: {
  prospect: OutboundProspectDetail
  onShowProtocol: () => void
}) {
  const t = useTranslations('admin.outreach.work')
  const ts = useTranslations('admin.outreach.statusLabels')
  const tli = useTranslations('admin.outreach.linkedin')
  const { data: assignees } = useLeadAssignees()

  const entries = useMemo(() => buildLeadTimeline(prospect), [prospect])

  const names = useMemo(() => {
    const map = new Map<string, string>()
    for (const activity of prospect.activities) {
      const name = activityActor(activity)
      if (activity.actor && name) map.set(activity.actor.id, name)
    }
    const assigned = prospect.assignedTo
    if (assigned) map.set(assigned.id, assigneeName(assigned) ?? '-')
    for (const person of assignees ?? []) map.set(person.id, person.name)
    return map
  }, [prospect.activities, prospect.assignedTo, assignees])

  const who = leadWho(prospect)
  const statusLabel = (status: string | null) => {
    if (!status) return '-'
    return ts.has(status) ? ts(status) : status
  }

  const systemText = (activity: OutboundActivity): string | null => {
    const read = (key: string) => leadPayloadText(activity, key)
    const actor = activityActor(activity) ?? '-'
    switch (activity.type) {
      case 'ASSIGNED': {
        const to = read('to')
        if (!to) return t('timeline.unassigned', { actor })
        const person = names.get(to) ?? '-'
        if (!activity.actorId) {
          return t('timeline.assignedAuto', { person })
        }
        return activity.actorId === to
          ? t('timeline.tookOver', { actor })
          : t('timeline.assigned', { actor, person })
      }
      case 'SNOOZED':
        return t('timeline.snoozed', {
          date: formatLeadDate(read('until')),
        })
      case 'PROMOTED':
        return t('timeline.promoted', { reference: read('reference') ?? '-' })
      case 'QRL_RECORDED': {
        if (read('kind') !== 'QRL') return t('timeline.recordedHint')
        const criterion = read('criterion')
        const reason =
          criterion && t.has(`reason.${criterion}`)
            ? t(`reason.${criterion}`)
            : '-'
        return t('timeline.recordedQrl', { reason })
      }
      case 'STATUS_CHANGED':
        if (leadIsDecision(activity)) {
          if (read('decision') === 'HINT_DONE') return t('timeline.hintDone')
          return read('suppressed')
            ? t('timeline.declined')
            : t('reason.NOT_INTERESTED')
        }
        return t('timeline.statusChanged', {
          from: statusLabel(read('from')),
          to: statusLabel(read('to')),
        })
      case 'NOTE':
        return read('note')
      default:
        return null
    }
  }

  const renderSystem = (
    entry: Extract<LeadTimelineEntry, { kind: 'system' }>
  ) => {
    const line: LeadSystemLine = entry.line
    if (line.type === 'activity') {
      const text = systemText(line.activity)
      if (!text) return null
      const note =
        line.activity.type === 'NOTE'
          ? null
          : leadPayloadText(line.activity, 'note')
      return (
        <SystemRow
          key={entry.id}
          text={note ? `${text}. ${note}` : text}
          at={entry.at}
          actor={
            line.activity.type === 'ASSIGNED'
              ? null
              : activityActor(line.activity)
          }
        />
      )
    }
    const { email } = line
    if (line.type === 'received') {
      const classification = email.replyClassification
      const label = classification
        ? t(`classification.${classification}`)
        : t('timeline.unread')
      return (
        <SystemRow
          key={entry.id}
          text={t('timeline.received', {
            label,
            text: singleLine(email.bodyText),
          })}
          at={entry.at}
          body={email.bodyText || null}
        />
      )
    }
    if (line.type === 'forwarded') {
      const to = recipients(email)
      return (
        <SystemRow
          key={entry.id}
          text={
            to ? `${t('timeline.forwarded')} (${to})` : t('timeline.forwarded')
          }
          at={entry.at}
          body={email.bodyText || null}
        />
      )
    }
    return (
      <SystemRow
        key={entry.id}
        text={
          line.type === 'autoMail'
            ? t('timeline.autoMail')
            : t('timeline.mailFailed', { subject: email.subject })
        }
        at={entry.at}
        body={email.bodyText || null}
      />
    )
  }

  const renderEntry = (entry: LeadTimelineEntry) => {
    switch (entry.kind) {
      case 'inbound':
        return <InboundRow key={entry.id} entry={entry} prospect={prospect} />
      case 'outbound':
        return <OutboundRow key={entry.id} entry={entry} />
      case 'roof': {
        const text = roofLines(entry.activity, t)
        const name = leadPayloadText(entry.activity, 'name') ?? who
        const answer =
          leadPayloadText(entry.activity, 'kind') === 'tenant_answer'
        return (
          <FullRow
            key={entry.id}
            side="customer"
            icon={Sun}
            title={
              answer
                ? t('timeline.roofPageAnswer', { who: name })
                : t('timeline.roofPage', { who: name })
            }
            tags={
              entry.open ? (
                <LeadPill tone="red">{t('timeline.unanswered')}</LeadPill>
              ) : null
            }
            body={text ? <BoxText>{text}</BoxText> : null}
            meta={formatLeadDateTime(entry.at)}
          />
        )
      }
      case 'linkedin': {
        const note = leadPayloadText(entry.activity, 'note')
        const isReply = entry.fromCustomer && entry.action !== 'accepted'
        const label = tli.has(`actions.${entry.action}`)
          ? tli(`actions.${entry.action}`)
          : entry.action
        return (
          <FullRow
            key={entry.id}
            side={entry.fromCustomer ? 'customer' : 'us'}
            icon={Linkedin}
            title={isReply ? t('timeline.linkedin', { who }) : label}
            tags={
              entry.open ? (
                <LeadPill tone="red">{t('timeline.unanswered')}</LeadPill>
              ) : null
            }
            body={note ? <BoxText>{note}</BoxText> : null}
            meta={activityMeta(entry.at, entry.activity)}
          />
        )
      }
      case 'call': {
        const outcome = leadPayloadText(entry.activity, 'callOutcome')
        const note = leadPayloadText(entry.activity, 'note')
        const label =
          outcome && t.has(`callOutcome.${outcome}`)
            ? t(`callOutcome.${outcome}`)
            : t('callOutcome.REACHED')
        return (
          <FullRow
            key={entry.id}
            side="us"
            icon={Phone}
            title={t('timeline.call')}
            tags={<LeadPill tone="grey">{label}</LeadPill>}
            body={note ? <BoxText>{note}</BoxText> : null}
            meta={activityMeta(entry.at, entry.activity)}
          />
        )
      }
      case 'event': {
        const note = leadPayloadText(entry.activity, 'note')
        const meetingAt = leadPayloadText(entry.activity, 'meetingAt')
        const title = t(`timeline.${entry.event}`)
        return (
          <FullRow
            key={entry.id}
            side="us"
            icon={EVENT_ICON[entry.event]}
            title={
              meetingAt ? `${title} (${formatLeadDateTime(meetingAt)})` : title
            }
            body={note ? <BoxText>{note}</BoxText> : null}
            meta={activityMeta(entry.at, entry.activity)}
          />
        )
      }
      case 'note':
        return (
          <FullRow
            key={entry.id}
            side="us"
            icon={StickyNote}
            title={t('timeline.noteTitle')}
            body={<BoxText>{entry.note}</BoxText>}
            meta={activityMeta(entry.at, entry.activity)}
          />
        )
      case 'system':
        return renderSystem(entry)
    }
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-[#062E25]">
        {t('timeline.title')}
      </h2>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[#062E25]/75">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-blue-800" aria-hidden />
          {t('timeline.legendCustomer')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#062E25]" aria-hidden />
          {t('timeline.legendUs')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#062E25]/20" aria-hidden />
          {t('timeline.legendSystem')}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-xl bg-[#F5F7EE] p-4 text-[#062E25]/75">
          {t('timeline.empty')}
        </p>
      ) : (
        <ol>{entries.map(renderEntry)}</ol>
      )}
      <p className="mt-4 text-[#062E25]/75">
        {t('timeline.technicalHint')}{' '}
        <button
          type="button"
          onClick={onShowProtocol}
          className="underline underline-offset-2 hover:text-[#062E25]"
        >
          {t('timeline.technicalLink')}
        </button>
        .
      </p>
    </section>
  )
}
