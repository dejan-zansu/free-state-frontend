'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { leadOwnershipKey, zurichDaysAgo } from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import type { OutboundProspectDetail } from '@/types/admin-outreach'

import {
  CARD_CLASS,
  OUTLINE_BUTTON,
} from '../../../residential-leads/[id]/leadUtils'
import { Field } from '../../../residential-leads/[id]/parts'
import { LeadOwnerDialog } from './LeadDialogs'

export function LeadOwnerSummary({
  prospect,
}: {
  prospect: OutboundProspectDetail
}) {
  const t = useTranslations('admin.outreach.work')
  const locale = useLocale()
  const [capture, setCapture] = useState(false)
  const { owner, work } = prospect
  const lookup = owner?.lookup ?? null
  const waiting = lookup?.status === 'QUEUED' || lookup?.status === 'CLAIMED'

  return (
    <Card className={cn(CARD_CLASS, 'mb-5')}>
      <CardContent className="p-4 sm:p-6">
        <h2 className="mb-3 text-lg font-semibold text-[#062E25]">
          {t('owner.title')}
        </h2>
        <dl className="grid gap-x-7 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field label={t('facts.whoAnswers')}>
            {t(leadOwnershipKey(prospect.ownershipConfidence))}
          </Field>
          <Field label={t('facts.ownerPerTenant')}>
            {owner?.name ?? owner?.row?.companyName ?? '-'}
          </Field>
          <Field label={t('facts.ownerRow')}>
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
          </Field>
          <Field label={t('owner.lookup')}>
            {!lookup
              ? '-'
              : waiting
                ? t('owner.lookupWaiting', {
                    days: zurichDaysAgo(lookup.createdAt),
                  })
                : t(`lookupStatus.${lookup.status}`)}
          </Field>
        </dl>
        {!work.readOnly && (
          <div className="mt-4 flex flex-wrap gap-2">
            {owner?.row ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className={OUTLINE_BUTTON}
              >
                <Link href={`/${locale}/admin/outreach/${owner.row.id}`}>
                  {t('owner.openOwner')}
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCapture(true)}
                className={OUTLINE_BUTTON}
              >
                {t('owner.captureOwner')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      {capture && (
        <LeadOwnerDialog
          prospect={prospect}
          onClose={() => setCapture(false)}
        />
      )}
    </Card>
  )
}
