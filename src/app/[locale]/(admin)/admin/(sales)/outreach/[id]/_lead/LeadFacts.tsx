'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import {
  formatCh,
  formatLeadDate,
  formatLeadDateTime,
  formatRoofMwh,
  leadOwnershipKey,
  leadPvKey,
} from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import type { OutboundProspectDetail } from '@/types/admin-outreach'

import { CARD_CLASS } from '../../../residential-leads/[id]/leadUtils'
import { LeadFact } from './lead-shared'

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0">
      <h2 className="mb-3 text-lg font-semibold text-[#062E25]">{title}</h2>
      <dl className="space-y-2">{children}</dl>
    </section>
  )
}

export function LeadFacts({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.work')
  const locale = useLocale()
  const { work, owner } = prospect
  const roofOpen = prospect.linkOpens.find(open => open.kind === 'roof')
  const senderMail = [...prospect.emails]
    .filter(email => email.direction === 'OUTBOUND' && email.mailbox)
    .sort(
      (a, b) =>
        Date.parse(b.sentAt ?? b.createdAt) -
        Date.parse(a.sentAt ?? a.createdAt)
    )[0]
  const sender =
    prospect.assignedMailbox?.address ?? senderMail?.mailbox?.address ?? '-'

  return (
    <Card
      role="region"
      aria-label={t('facts.aria')}
      className={cn(CARD_CLASS, 'mb-6')}
    >
      <CardContent className="grid gap-x-10 gap-y-6 p-4 sm:p-6 lg:grid-cols-2 xl:grid-cols-3">
        <Group title={t('facts.roofTitle')}>
          <LeadFact label={t('facts.roofArea')}>
            <span className="tabular-nums">
              {prospect.roofAreaM2 != null
                ? t('facts.roofAreaValue', {
                    area: formatCh(prospect.roofAreaM2),
                  })
                : '-'}
            </span>
          </LeadFact>
          <LeadFact
            label={t('facts.potential')}
            hint={
              prospect.roofKwhYear != null
                ? t('facts.potentialHint')
                : undefined
            }
          >
            <span className="tabular-nums">
              {prospect.roofKwhYear != null
                ? t('facts.potentialValue', {
                    mwh: formatRoofMwh(prospect.roofKwhYear),
                  })
                : '-'}
            </span>
          </LeadFact>
          <LeadFact label={t('facts.pvCheck')}>
            {t(leadPvKey(prospect.pvVerdict))}
          </LeadFact>
          <LeadFact label={t('facts.buildingYear')}>
            {prospect.buildingYear ?? '-'}
          </LeadFact>
        </Group>

        <Group title={t('facts.ownerTitle')}>
          <LeadFact label={t('facts.whoAnswers')}>
            {t(leadOwnershipKey(prospect.ownershipConfidence))}
          </LeadFact>
          <LeadFact label={t('facts.ownerPerTenant')}>
            {owner?.name ?? owner?.row?.companyName ?? '-'}
          </LeadFact>
          <LeadFact label={t('facts.ownerRow')}>
            {owner?.row ? (
              <Link
                href={`/${locale}/admin/outreach/${owner.row.id}`}
                className="underline underline-offset-2"
              >
                {owner.row.reference}
              </Link>
            ) : (
              '-'
            )}
          </LeadFact>
          <LeadFact label={t('facts.ownerContacted')}>
            {owner
              ? owner.row?.contacted
                ? t('facts.yes')
                : t('facts.no')
              : '-'}
          </LeadFact>
        </Group>

        <Group title={t('facts.acquisitionTitle')}>
          <LeadFact label={t('facts.firstContact')}>
            {formatLeadDate(work.firstContactAt)}
          </LeadFact>
          <LeadFact label={t('facts.mailsFromUs')}>
            {work.counts.automaticMails > 0
              ? t('facts.mailsWithAuto', {
                  count: work.counts.mailsFromUs,
                  automatic: work.counts.automaticMails,
                })
              : work.counts.mailsFromUs}
          </LeadFact>
          <LeadFact label={t('facts.replies')}>{work.counts.replies}</LeadFact>
          <LeadFact label={t('facts.calls')}>{work.counts.calls}</LeadFact>
          <LeadFact label={t('facts.linkOpens')}>
            {roofOpen
              ? t('facts.linkOpensValue', {
                  views: roofOpen.views,
                  dateTime: formatLeadDateTime(roofOpen.lastAt),
                })
              : '-'}
          </LeadFact>
          <LeadFact label={t('facts.sender')}>{sender}</LeadFact>
          <LeadFact label={t('facts.reference')}>{prospect.reference}</LeadFact>
        </Group>
      </CardContent>
    </Card>
  )
}
