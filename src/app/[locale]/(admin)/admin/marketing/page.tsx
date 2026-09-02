'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { adminMarketingService } from '@/services/admin-marketing.service'
import type { MarketingAlertSeverity, MarketingOverview } from '@/types/admin-marketing'

const SOURCE_COLORS = ['#178f63', '#2a78d6', '#eda100', '#4a3aa7', '#e34948']
const OTHER_COLOR = '#8a8781'
const OTHER_KEY = '__other'

const SEVERITY_CLASSES: Record<MarketingAlertSeverity, string> = {
  red: 'bg-[#d03b3b]',
  amber: 'bg-[#fab219]',
  info: 'bg-[#2a78d6]',
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
}

function formatChf(value: number) {
  return value.toLocaleString('de-CH', { maximumFractionDigits: 2 })
}

export default function AdminMarketingOverviewPage() {
  const t = useTranslations('admin.marketing.overview')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<MarketingOverview>({
    queryKey: ['admin', 'marketing', 'overview'],
    queryFn: () => adminMarketingService.getOverview(),
  })

  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState({ date: '', type: '', title: '', detail: '' })

  const noteMutation = useMutation({
    mutationFn: () =>
      adminMarketingService.createEvent({
        date: note.date || undefined,
        type: note.type,
        title: note.title,
        detail: note.detail || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'overview'] })
      setNoteOpen(false)
      setNote({ date: '', type: '', title: '', detail: '' })
    },
  })

  const chart = useMemo(() => {
    if (!data || data.timeline.length === 0) return null
    const totals = new Map<string, number>()
    data.timeline.forEach((point) => {
      Object.entries(point.bySource).forEach(([source, count]) => {
        totals.set(source, (totals.get(source) ?? 0) + count)
      })
    })
    const ordered = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([source]) => source)
    const top = ordered.slice(0, SOURCE_COLORS.length)
    const rest = ordered.slice(SOURCE_COLORS.length)
    const rows = data.timeline.map((point) => {
      const row: Record<string, number | string> = { date: point.date }
      top.forEach((source) => {
        row[source] = point.bySource[source] ?? 0
      })
      if (rest.length > 0) {
        row[OTHER_KEY] = rest.reduce((sum, source) => sum + (point.bySource[source] ?? 0), 0)
      }
      return row
    })
    const series = top.map((source, index) => ({
      key: source,
      label: source,
      color: SOURCE_COLORS[index],
    }))
    if (rest.length > 0) {
      series.push({ key: OTHER_KEY, label: t('otherSources'), color: OTHER_COLOR })
    }
    return { rows, series }
  }, [data, t])

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  const { leads, cpl, funnel } = data.tiles
  const signups = data.tiles.signups
  const leadsDelta = leads.thisWeek - leads.lastWeek
  const signupsDelta = signups ? signups.thisWeek - signups.lastWeek : 0
  const spendByPlatform = cpl.spendByPlatform7d

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('todayTitle')}</h2>
          {data.today.length === 0 ? (
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#0ca30c] shrink-0" />
              <p className="text-[#062E25]">{t('todayEmpty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.today.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 rounded-full shrink-0',
                      SEVERITY_CLASSES[alert.severity]
                    )}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-[#062E25]">{alert.title}</p>
                    {alert.detail && (
                      <p className="text-sm text-[#062E25]">{alert.detail}</p>
                    )}
                  </div>
                  {alert.link && (
                    <Button variant="ghost" size="sm" asChild className="ml-auto shrink-0">
                      <Link href={alert.link}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6',
          signups ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
        )}
      >
        <Card className="border-[#062E25]/10">
          <CardContent className="p-5">
            <p className="text-sm text-[#062E25] mb-2">{t('leadsTile')}</p>
            <p className="text-2xl font-bold text-[#062E25] mb-1">
              {leads.thisWeek}
              <span
                className={cn(
                  'ml-2 text-sm font-medium',
                  leadsDelta >= 0 ? 'text-[#006300]' : 'text-[#d03b3b]'
                )}
              >
                {leadsDelta >= 0 ? `+${leadsDelta}` : leadsDelta}
              </span>
            </p>
            <p className="text-sm text-[#062E25]">{t('lastWeek', { count: leads.lastWeek })}</p>
            {leads.bySource.length > 0 && (
              <p className="text-sm text-[#062E25] truncate">
                {leads.bySource.map((s) => `${s.source} ${s.count}`).join(' · ')}
              </p>
            )}
          </CardContent>
        </Card>

        {signups && (
          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <p className="text-sm text-[#062E25] mb-2">{t('signupsTile')}</p>
              <p className="text-2xl font-bold text-[#062E25] mb-1">
                {signups.thisWeek}
                <span
                  className={cn(
                    'ml-2 text-sm font-medium',
                    signupsDelta >= 0 ? 'text-[#006300]' : 'text-[#d03b3b]'
                  )}
                >
                  {signupsDelta >= 0 ? `+${signupsDelta}` : signupsDelta}
                </span>
              </p>
              <p className="text-sm text-[#062E25]">{t('lastWeek', { count: signups.lastWeek })}</p>
              {Array.isArray(signups.byChannel) && signups.byChannel.length > 0 && (
                <p className="text-sm text-[#062E25] truncate">
                  {signups.byChannel.map((c) => `${c.channel} ${c.count}`).join(' · ')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-[#062E25]/10">
          <CardContent className="p-5">
            <p className="text-sm text-[#062E25] mb-2">{t('cplTile')}</p>
            <p className="text-2xl font-bold text-[#062E25] mb-1">
              {cpl.valueChf !== null ? `CHF ${formatChf(cpl.valueChf)}` : '—'}
            </p>
            <p className="text-sm text-[#062E25]">
              {cpl.targetChf !== null
                ? t('cplTargetLabel', { value: formatChf(cpl.targetChf) })
                : t('cplNoTarget')}
            </p>
            <p className="text-sm text-[#062E25]">
              {cpl.valueChf !== null
                ? t('cplSpend', { spend: formatChf(cpl.spend7dChf), leads: cpl.paidLeads7d })
                : t('cplHint')}
            </p>
            {spendByPlatform && (
              <p className="text-sm text-[#062E25] truncate">
                {t('spendByPlatform', {
                  meta: formatChf(spendByPlatform.meta ?? 0),
                  google: formatChf(spendByPlatform.google ?? 0),
                })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-5">
            <p className="text-sm text-[#062E25] mb-2">{t('funnelTile')}</p>
            <p className="text-2xl font-bold text-[#062E25] mb-1">
              {funnel.ratePct !== null
                ? `${funnel.ratePct.toLocaleString('de-CH', { maximumFractionDigits: 1 })} %`
                : '—'}
            </p>
            <p className="text-sm text-[#062E25]">
              {funnel.ratePct !== null
                ? t('funnelDetail', { sessions: funnel.sessions7d, leads: funnel.leads7d })
                : t('funnelHint')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 opacity-50">
          <CardContent className="p-5">
            <p className="text-sm text-[#062E25] mb-2">{t('engagementTile')}</p>
            <p className="text-2xl font-bold text-[#062E25] mb-1">{'—'}</p>
            <p className="text-sm text-[#062E25]/75">{t('engagementHint')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#062E25]/10 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('timelineTitle')}</h2>
            {chart ? (
              <>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
                  {chart.series.map((series) => (
                    <span
                      key={series.key}
                      className="flex items-center gap-1.5 text-sm text-[#062E25]"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: series.color }}
                      />
                      {series.label}
                    </span>
                  ))}
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart.rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(6,46,37,0.06)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDay}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'rgba(6,46,37,0.75)', fontSize: 11 }}
                        minTickGap={24}
                      />
                      <YAxis
                        allowDecimals={false}
                        width={28}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'rgba(6,46,37,0.75)', fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(6,46,37,0.04)' }}
                        contentStyle={{
                          borderRadius: 8,
                          border: '1px solid rgba(6,46,37,0.1)',
                          fontSize: 13,
                        }}
                        labelFormatter={(value) => formatDay(String(value))}
                      />
                      {chart.series.map((series) => (
                        <Bar
                          key={series.key}
                          dataKey={series.key}
                          name={series.label}
                          stackId="a"
                          fill={series.color}
                          stroke="#ffffff"
                          strokeWidth={1}
                          maxBarSize={22}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#062E25] py-8 text-center">{t('timelineEmpty')}</p>
            )}
            {data.events.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#062E25]/10">
                <h3 className="text-sm font-semibold text-[#062E25] mb-2">{t('eventsTitle')}</h3>
                <div className="space-y-2">
                  {data.events.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 text-sm">
                      <span className="text-[#062E25]/75 w-20 shrink-0">
                        {new Date(event.date).toLocaleDateString('de-CH')}
                      </span>
                      <StatusBadge status={event.type} />
                      <span className="text-[#062E25]/80 truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#062E25]">{t('digestTitle')}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNoteOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addNote')}
              </Button>
            </div>
            {data.latestDigest ? (
              <>
                <p className="text-sm text-[#062E25]/75 mb-2">
                  {new Date(data.latestDigest.date).toLocaleDateString('de-CH')}
                </p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-[#062E25]/80 max-h-[28rem] overflow-y-auto">
                  {data.latestDigest.markdown}
                </pre>
              </>
            ) : (
              <p className="text-sm text-[#062E25]">{t('digestEmpty')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addNote')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-date">{t('noteDate')}</Label>
              <Input
                id="note-date"
                type="date"
                value={note.date}
                onChange={(e) => setNote((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-type">{t('noteType')}</Label>
              <Input
                id="note-type"
                placeholder={t('noteTypePlaceholder')}
                value={note.type}
                onChange={(e) => setNote((prev) => ({ ...prev, type: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-title">{t('noteTitleLabel')}</Label>
              <Input
                id="note-title"
                value={note.title}
                onChange={(e) => setNote((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-detail">{t('noteDetail')}</Label>
              <Textarea
                id="note-detail"
                rows={3}
                value={note.detail}
                onChange={(e) => setNote((prev) => ({ ...prev, detail: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>
              {t('noteCancel')}
            </Button>
            <Button
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              disabled={!note.type.trim() || !note.title.trim() || noteMutation.isPending}
              onClick={() => noteMutation.mutate()}
            >
              {t('noteSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
