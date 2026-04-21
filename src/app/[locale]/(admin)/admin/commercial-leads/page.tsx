'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { adminCommercialLeadService, type ListQuery } from '@/services/admin-commercial-lead.service'
import {
  statusLabel, industryLabel, timelineLabel, legalFormLabel,
} from '@/lib/commercial-lead-labels'
import type { CommercialLeadListResponse, CommercialLeadStatus, CommercialIndustry, CommercialTimeline } from '@/types/commercial-lead'

const PAGE_SIZE = 20

export default function AdminCommercialLeadsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.commercialLeads')
  const tc = useTranslations('admin.common')

  const [query, setQuery] = useState<ListQuery>({ page: 1, limit: PAGE_SIZE, sort: '-createdAt' })
  const [data, setData] = useState<CommercialLeadListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    adminCommercialLeadService.list(query).then((res) => {
      if (!cancelled) setData(res)
    }).finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [query])

  const updateFilter = <K extends keyof ListQuery>(key: K, value: ListQuery[K]) => {
    setQuery((q) => ({ ...q, page: 1, [key]: value }))
  }

  const summary = data?.summary

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <a href={adminCommercialLeadService.exportCsvUrl(query)}>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />{t('exportCsv')}
          </Button>
        </a>
      </div>

      {summary && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(summary.byStatus).map(([s, n]) => (
            <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#062E25]/5">
              {statusLabel[s as CommercialLeadStatus]}: <strong>{n}</strong>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
            {t('unassigned')}: <strong>{summary.unassignedCount}</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-rose-100 text-rose-800">
            {t('overdueFollowUp')}: <strong>{summary.overdueFollowUpCount}</strong>
          </span>
        </div>
      )}

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <Input className="max-w-xs"
                   placeholder={t('searchPlaceholder')}
                   onChange={(e) => updateFilter('search', e.target.value || undefined)} />

            <Select value={query.status?.[0] ?? '__all__'}
                    onValueChange={(v) => updateFilter('status', v === '__all__' ? undefined : [v as CommercialLeadStatus])}>
              <SelectTrigger className="w-48"><SelectValue placeholder={t('allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allStatuses')}</SelectItem>
                {(Object.keys(statusLabel) as CommercialLeadStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={query.industry?.[0] ?? '__all__'}
                    onValueChange={(v) => updateFilter('industry', v === '__all__' ? undefined : [v as CommercialIndustry])}>
              <SelectTrigger className="w-48"><SelectValue placeholder={t('allIndustries')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allIndustries')}</SelectItem>
                {Object.entries(industryLabel).map(([v, label]) => (
                  <SelectItem key={v} value={v}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={query.timeline?.[0] ?? '__all__'}
                    onValueChange={(v) => updateFilter('timeline', v === '__all__' ? undefined : [v as CommercialTimeline])}>
              <SelectTrigger className="w-48"><SelectValue placeholder={t('allTimelines')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allTimelines')}</SelectItem>
                {Object.entries(timelineLabel).map(([v, label]) => (
                  <SelectItem key={v} value={v}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={query.unassigned ? 'default' : 'outline'}
              onClick={() => updateFilter('unassigned', query.unassigned ? undefined : true)}
            >
              {t('filterUnassigned')}
            </Button>
            <Button
              variant={query.overdueFollowUp ? 'default' : 'outline'}
              onClick={() => updateFilter('overdueFollowUp', query.overdueFollowUp ? undefined : true)}
            >
              {t('filterOverdue')}
            </Button>
          </div>

          {isLoading ? <AdminPageLoader /> : data && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reference')}</TableHead>
                    <TableHead>{t('company')}</TableHead>
                    <TableHead>{t('contact')}</TableHead>
                    <TableHead className="text-right">{t('kwp')}</TableHead>
                    <TableHead>{t('timeline')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('assigned')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead>{t('nextFollowUp')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-sm">{l.reference}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{l.companyName}</p>
                          <p className="text-sm text-[#062E25]/50">
                            {legalFormLabel[l.legalForm]} · {industryLabel[l.industry]} · {l.addressCanton}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {l.contactFirstName} {l.contactLastName}
                      </TableCell>
                      <TableCell className="text-right font-medium">{Number(l.estimatedSystemKwp).toFixed(1)}</TableCell>
                      <TableCell className="text-sm">{timelineLabel[l.timeline]}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell className="text-sm">
                        {l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : <span className="text-[#062E25]/30">{t('unassigned')}</span>}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60">
                        {new Date(l.createdAt).toLocaleDateString('de-CH')}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60">
                        {l.nextFollowUpAt ? new Date(l.nextFollowUpAt).toLocaleDateString('de-CH') : '—'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/admin/commercial-leads/${l.id}`}>{t('view')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-[#062E25]/40">
                        {t('empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/60">{t('total', { count: data.meta.total })}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"
                          disabled={data.meta.page <= 1}
                          onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#062E25]/60">
                    {tc('page', { page: data.meta.page, totalPages: data.meta.totalPages })}
                  </span>
                  <Button variant="outline" size="sm"
                          disabled={data.meta.page >= data.meta.totalPages}
                          onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
