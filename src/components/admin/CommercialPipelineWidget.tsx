'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { adminCommercialLeadService } from '@/services/admin-commercial-lead.service'
import { statusLabel } from '@/lib/commercial-lead-labels'
import type { CommercialLeadStatus } from '@/types/commercial-lead'

const FUNNEL_ORDER: CommercialLeadStatus[] = [
  'NEW','CONTACTED','QUALIFIED','QUOTE_SENT','WON',
]

interface Stats {
  funnel?: Partial<Record<CommercialLeadStatus, number>>
  recentTotal?: number
  won?: number
  lost?: number
  conversionRate?: number
  upcoming?: Array<{ id: string; reference: string; companyName: string; nextFollowUpAt: string }>
}

export default function CommercialPipelineWidget() {
  const locale = useLocale()
  const t = useTranslations('admin.commercialLeads.dashboard')
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    adminCommercialLeadService.stats(90).then((s: Stats) => setStats(s)).catch(() => setStats(null))
  }, [])

  if (!stats) return null

  return (
    <Card><CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#062E25]">{t('title')}</h2>
        <Link href={`/${locale}/admin/commercial-leads`} className="text-sm text-blue-600 hover:underline">{t('viewAll')}</Link>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {FUNNEL_ORDER.map((s) => (
          <div key={s} className="text-center">
            <div className="text-xl font-bold text-[#062E25]">{stats.funnel?.[s] ?? 0}</div>
            <div className="text-sm text-[#062E25]/60 truncate">{statusLabel[s]}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-[#062E25]/60">
        {t('conversion', { pct: Math.round((stats.conversionRate ?? 0) * 100) })}
      </div>
      {stats.upcoming && stats.upcoming.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[#062E25]/70 mb-2">{t('upcoming')}</p>
          <ul className="space-y-1">
            {stats.upcoming.map((u) => (
              <li key={u.id} className="text-sm flex justify-between">
                <Link href={`/${locale}/admin/commercial-leads/${u.id}`} className="text-blue-600 hover:underline">
                  {u.reference} · {u.companyName}
                </Link>
                <span className="text-[#062E25]/60">{new Date(u.nextFollowUpAt).toLocaleDateString('de-CH')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardContent></Card>
  )
}
