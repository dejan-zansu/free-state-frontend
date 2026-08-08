'use client'

import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { MarketingSettings, MarketingTargetsUpdate } from '@/types/admin-marketing'

export default function AdminMarketingSettingsPage() {
  const t = useTranslations('admin.marketing.settings')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<MarketingSettings>({
    queryKey: ['admin', 'marketing', 'settings'],
    queryFn: () => adminMarketingService.getSettings(),
  })

  const [form, setForm] = useState({ cpl: '', cap: '', posts: '' })

  useEffect(() => {
    if (data) {
      setForm({
        cpl: data.targets.cplTargetChf !== null ? String(data.targets.cplTargetChf) : '',
        cap: data.targets.monthlySpendCapChf !== null ? String(data.targets.monthlySpendCapChf) : '',
        posts: data.targets.weeklyPostGoal !== null ? String(data.targets.weeklyPostGoal) : '',
      })
    }
  }, [data])

  const runMutation = useMutation({
    mutationFn: (connector: string) => adminMarketingService.runConnector(connector),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'settings'] })
    },
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const body: MarketingTargetsUpdate = {}
      if (form.cpl !== '') body.cplTargetChf = Number(form.cpl)
      if (form.cap !== '') body.monthlySpendCapChf = Number(form.cap)
      if (form.posts !== '') body.weeklyPostGoal = Number(form.posts)
      return adminMarketingService.updateTargets(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing'] })
    },
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('connectorsTitle')}</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('connector')}</TableHead>
                  <TableHead>{t('lastRun')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('items')}</TableHead>
                  <TableHead>{t('error')}</TableHead>
                  <TableHead className="text-right">{t('failures')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.connectors.map((connector) => (
                  <TableRow key={connector.name}>
                    <TableCell className="font-medium text-[#062E25]">
                      {connector.name}
                    </TableCell>
                    <TableCell className="text-sm text-[#062E25]">
                      {connector.lastRunAt
                        ? new Date(connector.lastRunAt).toLocaleString('de-CH')
                        : t('never')}
                    </TableCell>
                    <TableCell>
                      {connector.lastStatus ? (
                        <StatusBadge status={connector.lastStatus} />
                      ) : (
                        <span className="text-[#062E25]/75">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[#062E25]/80">
                      {connector.itemsUpserted ?? '—'}
                    </TableCell>
                    <TableCell>
                      {connector.lastError ? (
                        <span
                          className={cn(
                            'block max-w-[220px] truncate text-sm',
                            connector.lastStatus === 'OK'
                              ? 'text-amber-600'
                              : 'text-red-600'
                          )}
                          title={connector.lastError}
                        >
                          {connector.lastStatus === 'OK'
                            ? `${t('warningPrefix')}: ${connector.lastError}`
                            : connector.lastError}
                        </span>
                      ) : (
                        <span className="text-[#062E25]/75">—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right tabular-nums',
                        connector.consecutiveFailures > 0
                          ? 'text-red-600 font-medium'
                          : 'text-[#062E25]/80'
                      )}
                    >
                      {connector.consecutiveFailures}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={runMutation.isPending}
                        onClick={() => runMutation.mutate(connector.name)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t('runNow')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('targetsTitle')}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-cpl">{t('cplTargetChf')}</Label>
                <Input
                  id="target-cpl"
                  type="number"
                  min="0"
                  value={form.cpl}
                  onChange={(e) => setForm((prev) => ({ ...prev, cpl: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-cap">{t('monthlySpendCapChf')}</Label>
                <Input
                  id="target-cap"
                  type="number"
                  min="0"
                  value={form.cap}
                  onChange={(e) => setForm((prev) => ({ ...prev, cap: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-posts">{t('weeklyPostGoal')}</Label>
                <Input
                  id="target-posts"
                  type="number"
                  min="0"
                  value={form.posts}
                  onChange={(e) => setForm((prev) => ({ ...prev, posts: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  {t('save')}
                </Button>
                {saveMutation.isSuccess && (
                  <span className="text-sm text-green-700">{t('saveSuccess')}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('credentialsTitle')}</h2>
            <div className="space-y-3">
              {data.credentials.map((credential) => (
                <div key={credential.name} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      credential.present ? 'bg-[#0ca30c]' : 'bg-gray-300'
                    )}
                  />
                  <span className="text-sm font-medium text-[#062E25]">{credential.name}</span>
                  <span className="text-sm text-[#062E25] ml-auto">
                    {credential.present ? t('present') : t('missing')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
