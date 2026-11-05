'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import { formatLeadDate } from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import type { OutboundProspectDetail } from '@/types/admin-outreach'

import { CARD_CLASS } from '../../../residential-leads/[id]/leadUtils'

export function LeadProtocolIntro({
  prospect,
}: {
  prospect: OutboundProspectDetail
}) {
  const t = useTranslations('admin.outreach.work')
  const td = useTranslations('admin.outreach.detail')
  const { work } = prospect
  return (
    <Card className={cn(CARD_CLASS, 'mb-5')}>
      <CardContent className="space-y-1.5 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[#062E25]">
          {t('protocol.title')}
        </h2>
        <p className="text-[#062E25]/75">
          {t('protocol.intro', { status: prospect.status })}
        </p>
        {work.closedDetail && (
          <p className="break-words text-[#062E25]">
            {t('protocol.closedDetail')}: {work.closedDetail}
          </p>
        )}
        {prospect.disqualifyReason &&
          prospect.disqualifyReason !== work.closedDetail && (
            <p className="break-words text-[#062E25]">
              {td('disqualifyReason')}: {prospect.disqualifyReason}
            </p>
          )}
        {prospect.nextActionAt && (
          <p className="text-[#062E25]">
            {td('nextActionAt')}: {formatLeadDate(prospect.nextActionAt)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
