'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import type {
  AdminProjectAttribution,
  AdminProjectJourneyEntry,
} from '@/types/admin'

import { fmtDateTime } from './format'

type Props = {
  attribution: AdminProjectAttribution
  journey: AdminProjectJourneyEntry[]
}

const CHANNEL_STYLES: Record<string, string> = {
  google_ads: 'bg-amber-100 text-amber-900',
  meta_ads: 'bg-blue-100 text-blue-900',
  paid_other: 'bg-purple-100 text-purple-900',
  organic_search: 'bg-emerald-100 text-emerald-900',
  ai_assistant: 'bg-teal-100 text-teal-900',
  social: 'bg-pink-100 text-pink-900',
  referral: 'bg-slate-100 text-slate-900',
  direct: 'bg-[#062E25]/10 text-[#062E25]',
}

export function JourneyCard({ attribution, journey }: Props) {
  const t = useTranslations('admin.projects')

  const detailRows: { label: string; value: string }[] = []
  if (attribution.landingPage) {
    detailRows.push({ label: t('landingPage'), value: attribution.landingPage })
  }
  if (attribution.referrer) {
    detailRows.push({ label: t('referrer'), value: attribution.referrer })
  }
  if (attribution.utmSource || attribution.utmMedium) {
    detailRows.push({
      label: t('sourceMedium'),
      value: `${attribution.utmSource ?? '-'} / ${attribution.utmMedium ?? '-'}`,
    })
  }
  if (attribution.utmCampaign) {
    detailRows.push({ label: t('campaign'), value: attribution.utmCampaign })
  }
  if (attribution.utmId) {
    detailRows.push({ label: t('campaignId'), value: attribution.utmId })
  }
  if (attribution.utmTerm) {
    detailRows.push({ label: t('keyword'), value: attribution.utmTerm })
  }
  if (attribution.gclid) {
    detailRows.push({ label: 'gclid', value: attribution.gclid })
  }
  if (attribution.fbclid) {
    detailRows.push({ label: 'fbclid', value: attribution.fbclid })
  }

  return (
    <Card className="border-[#062E25]/10 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-[#062E25]">
            {t('journeyTitle')}
          </h2>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
              CHANNEL_STYLES[attribution.channel] ?? CHANNEL_STYLES.direct
            }`}
          >
            {t(`channels.${attribution.channel}`)}
          </span>
          {attribution.marketingConsent === true && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {t('marketingConsentGiven')}
            </span>
          )}
        </div>

        {detailRows.length === 0 ? (
          <p className="text-base text-[#062E25]">{t('noAttribution')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailRows.map(row => (
              <div key={row.label}>
                <label className="text-sm text-[#062E25]">{row.label}</label>
                <p className="font-medium text-[#062E25] break-all">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-[#062E25]/10">
          <h3 className="text-base font-semibold text-[#062E25] mb-3">
            {t('sessionTimeline')}
          </h3>
          {journey.length === 0 ? (
            <p className="text-base text-[#062E25]">{t('noJourney')}</p>
          ) : (
            <ol className="space-y-2">
              {journey.map(entry => (
                <li
                  key={`${entry.kind}-${entry.id}`}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 border-[#062E25]/10 pl-4 py-1"
                >
                  <span className="text-sm text-[#062E25]/75 tabular-nums">
                    {fmtDateTime(entry.createdAt)}
                  </span>
                  <span className="text-base font-medium text-[#062E25]">
                    {t.has(`events.${entry.name}`)
                      ? t(`events.${entry.name}`)
                      : entry.name}
                    {entry.step != null ? ` ${entry.step}` : ''}
                  </span>
                  {entry.path && (
                    <span className="text-sm text-[#062E25]/75 break-all">
                      {entry.path}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
