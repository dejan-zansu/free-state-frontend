'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
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
import type {
  MarketingCampaigns,
  MarketingPlatform,
  MarketingSettings,
} from '@/types/admin-marketing'

const COLUMN_COUNT = 15

const PLATFORM_PILL_CLASSES: Record<MarketingPlatform, string> = {
  meta: 'bg-blue-100 text-blue-700',
  google: 'bg-amber-100 text-amber-700',
}

function formatChf(value: number) {
  return value.toLocaleString('de-CH', { maximumFractionDigits: 2 })
}

function formatCount(value: number) {
  return value.toLocaleString('de-CH')
}

function formatPct(value: number | null) {
  if (value === null) return '—'
  return `${value.toLocaleString('de-CH', { maximumFractionDigits: 2 })} %`
}

function cplClass(value: number | null, target: number | null) {
  if (value === null) return 'text-[#062E25]/75'
  if (target === null) return 'text-[#062E25]'
  if (value <= target) return 'text-green-700'
  if (value <= target * 1.3) return 'text-amber-700'
  return 'text-red-600'
}

function PlatformPill({ platform, label }: { platform: MarketingPlatform; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium whitespace-nowrap',
        PLATFORM_PILL_CLASSES[platform] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {label}
    </span>
  )
}

export default function AdminMarketingCampaignsPage() {
  const t = useTranslations('admin.marketing.campaigns')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const router = useRouter()

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
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  const target = settings?.targets.cplTargetChf ?? null

  const platformLabel = (platform: MarketingPlatform) =>
    platform === 'google' ? t('platformGoogle') : t('platformMeta')

  const syncLines: { platform: MarketingPlatform; at: string | null }[] = [
    { platform: 'meta', at: data.lastSyncByPlatform?.meta ?? null },
    { platform: 'google', at: data.lastSyncByPlatform?.google ?? null },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          {data.rows.length === 0 ? (
            <p className="text-center py-12 text-[#062E25]">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('campaign')}</TableHead>
                    <TableHead>{t('platform')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('spend7d')}</TableHead>
                    <TableHead className="text-right">{t('spend30d')}</TableHead>
                    <TableHead className="text-right">{t('clicks30d')}</TableHead>
                    <TableHead className="text-right">{t('ctr30d')}</TableHead>
                    <TableHead className="text-right">{t('cpc30d')}</TableHead>
                    <TableHead className="text-right">{t('sessions30d')}</TableHead>
                    <TableHead className="text-right">{t('signups30d')}</TableHead>
                    <TableHead className="text-right">{t('costPerSignup')}</TableHead>
                    <TableHead className="text-right">{t('dbLeads')}</TableHead>
                    <TableHead className="text-right">{t('consults')}</TableHead>
                    <TableHead className="text-right">{t('contracts')}</TableHead>
                    <TableHead className="text-right">{t('won')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row) => (
                    <TableRow
                      key={`${row.platform}-${row.campaignId}`}
                      className="cursor-pointer"
                      onClick={() =>
                        router.push(`/${locale}/admin/marketing/campaigns/${row.campaignId}`)
                      }
                    >
                      <TableCell className="font-medium text-[#062E25]">{row.name}</TableCell>
                      <TableCell>
                        <PlatformPill platform={row.platform} label={platformLabel(row.platform)} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatChf(row.spend7dChf)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatChf(row.spend30dChf)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatCount(row.clicks30d)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatPct(row.ctrPct30d)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {row.cpcChf30d !== null ? formatChf(row.cpcChf30d) : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {row.sessions30d !== null ? formatCount(row.sessions30d) : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatCount(row.signups30d)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right tabular-nums font-medium',
                          cplClass(row.costPerSignupChf, target)
                        )}
                      >
                        {row.costPerSignupChf !== null ? formatChf(row.costPerSignupChf) : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatCount(row.dbLeads30d)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatCount(row.consults30d)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatCount(row.contracts30d)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]">
                        {formatChf(row.wonChf30d)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-[#062E25]/[0.03] hover:bg-[#062E25]/[0.03]">
                    <TableCell colSpan={COLUMN_COUNT} className="text-[#062E25]">
                      {t('unattributed', { count: data.unattributedLeads30d })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-2 mt-4 pt-4 border-t border-[#062E25]/10">
            {data.rows.length === 0 && (
              <p className="text-sm text-[#062E25]">
                {t('unattributed', { count: data.unattributedLeads30d })}
              </p>
            )}
            <div className="ml-auto text-right text-sm text-[#062E25]/75 space-y-0.5">
              {syncLines.map((line) => (
                <p key={line.platform}>
                  {line.at
                    ? t('lastSyncPlatform', {
                        platform: platformLabel(line.platform),
                        date: new Date(line.at).toLocaleString('de-CH'),
                      })
                    : t('neverSyncedPlatform', { platform: platformLabel(line.platform) })}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
