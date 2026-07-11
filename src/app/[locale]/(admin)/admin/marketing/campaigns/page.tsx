'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { adminMarketingService } from '@/services/admin-marketing.service'
import type { MarketingCampaigns, MarketingSettings } from '@/types/admin-marketing'

function formatChf(value: number) {
  return value.toLocaleString('de-CH', { maximumFractionDigits: 2 })
}

function cplClass(value: number | null, target: number | null) {
  if (value === null) return 'text-[#062E25]/40'
  if (target === null) return 'text-[#062E25]'
  if (value <= target) return 'text-green-700'
  if (value <= target * 1.3) return 'text-amber-600'
  return 'text-red-600'
}

export default function AdminMarketingCampaignsPage() {
  const t = useTranslations('admin.marketing.campaigns')
  const tc = useTranslations('admin.common')

  const { data, isLoading } = useQuery<MarketingCampaigns>({
    queryKey: ['admin', 'marketing', 'campaigns'],
    queryFn: () => adminMarketingService.getCampaigns(),
  })

  const { data: settings } = useQuery<MarketingSettings>({
    queryKey: ['admin', 'marketing', 'settings'],
    queryFn: () => adminMarketingService.getSettings(),
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]/60">{tc('failedToLoad')}</p>
  }

  const target = settings?.targets.cplTargetChf ?? null

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          {data.rows.length === 0 ? (
            <p className="text-center py-12 text-[#062E25]/40">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('campaign')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('spend7d')}</TableHead>
                    <TableHead className="text-right">{t('spend30d')}</TableHead>
                    <TableHead className="text-right">{t('metaLeads')}</TableHead>
                    <TableHead className="text-right">{t('dbLeads')}</TableHead>
                    <TableHead className="text-right">{t('trueCpl')}</TableHead>
                    <TableHead className="text-right">{t('consults')}</TableHead>
                    <TableHead className="text-right">{t('contracts')}</TableHead>
                    <TableHead className="text-right">{t('won')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row) => (
                    <TableRow key={row.campaignId}>
                      <TableCell className="font-medium text-[#062E25]">{row.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatChf(row.spend7dChf)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatChf(row.spend30dChf)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {row.metaLeads30d}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {row.dbLeads30d}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right tabular-nums font-medium',
                          cplClass(row.trueCplChf, target)
                        )}
                      >
                        {row.trueCplChf !== null ? formatChf(row.trueCplChf) : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {row.consults30d}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {row.contracts30d}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatChf(row.wonChf30d)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-[#062E25]/[0.03] hover:bg-[#062E25]/[0.03]">
                    <TableCell colSpan={10} className="text-[#062E25]/60">
                      {t('unattributed', { count: data.unattributedLeads30d })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-[#062E25]/10">
            {data.rows.length === 0 && (
              <p className="text-sm text-[#062E25]/60">
                {t('unattributed', { count: data.unattributedLeads30d })}
              </p>
            )}
            <p className="text-sm text-[#062E25]/40 ml-auto">
              {data.lastSyncAt
                ? t('lastSync', { date: new Date(data.lastSyncAt).toLocaleString('de-CH') })
                : t('neverSynced')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
