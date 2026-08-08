'use client'

import { useState } from 'react'
import { CheckCheck, ExternalLink, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { adminMarketingService } from '@/services/admin-marketing.service'
import type { MarketingCompetitors } from '@/types/admin-marketing'

const DAY_MS = 24 * 60 * 60 * 1000

function daysSince(value: string) {
  return Math.floor((Date.now() - new Date(value).getTime()) / DAY_MS)
}

const EMPTY_FORM = {
  name: '',
  website: '',
  igHandle: '',
  adLibraryUrl: '',
  watchUrls: '',
  notes: '',
}

export default function AdminMarketingCompetitorsPage() {
  const t = useTranslations('admin.marketing.competitors')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery<MarketingCompetitors>({
    queryKey: ['admin', 'marketing', 'competitors'],
    queryFn: () => adminMarketingService.getCompetitors(),
  })

  const sweepMutation = useMutation({
    mutationFn: () => adminMarketingService.markSweepDone(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const watchUrls = form.watchUrls
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean)
      return adminMarketingService.createCompetitor({
        name: form.name.trim(),
        website: form.website.trim() || undefined,
        igHandle: form.igHandle.trim() || undefined,
        adLibraryUrl: form.adLibraryUrl.trim() || undefined,
        watchUrls: watchUrls.length > 0 ? watchUrls : undefined,
        notes: form.notes.trim() || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'competitors'] })
      setAddOpen(false)
      setForm(EMPTY_FORM)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminMarketingService.updateCompetitor(id, { active }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'competitors'] })
    },
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  const relativeAdSeen = (value: string | null) => {
    if (!value) return <span className="text-[#062E25]">{t('never')}</span>
    const days = daysSince(value)
    const label = days <= 0 ? t('today') : days === 1 ? t('yesterday') : t('daysAgo', { count: days })
    return (
      <span className={cn('tabular-nums', days > 30 ? 'text-red-600 font-medium' : 'text-[#062E25]/80')}>
        {label}
      </span>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <div className="flex items-center gap-3 ml-auto">
          {sweepMutation.isSuccess && (
            <span className="text-sm text-green-700">{t('sweepSuccess')}</span>
          )}
          <Button
            variant="outline"
            disabled={sweepMutation.isPending}
            onClick={() => {
              if (confirm(t('sweepConfirm'))) sweepMutation.mutate()
            }}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            {t('sweepDone')}
          </Button>
          <Button
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addCompetitor')}
          </Button>
        </div>
      </div>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          {data.rows.length === 0 ? (
            <p className="text-center py-12 text-[#062E25]">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('lastAdSeen')}</TableHead>
                    <TableHead className="text-right">{t('adsLogged30d')}</TableHead>
                    <TableHead>{t('lastPageChange')}</TableHead>
                    <TableHead>{t('active')}</TableHead>
                    <TableHead className="text-right">{t('adLibrary')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() =>
                        router.push(`/${locale}/admin/marketing/competitors/${row.id}`)
                      }
                    >
                      <TableCell className="font-medium text-[#062E25]">
                        {row.website ? (
                          <a
                            href={row.website}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {row.name}
                          </a>
                        ) : (
                          row.name
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{relativeAdSeen(row.lastAdSeenAt)}</TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {row.adsLogged30d}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]">
                        {row.lastPageDiffAt
                          ? new Date(row.lastPageDiffAt).toLocaleDateString('de-CH')
                          : '—'}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={row.active}
                          disabled={toggleMutation.isPending}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: row.id, active: checked })
                          }
                          aria-label={t('active')}
                        />
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {row.adLibraryUrl ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={row.adLibraryUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-[#062E25]/75">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) setForm(EMPTY_FORM)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addCompetitor')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="competitor-name">{t('formName')}</Label>
              <Input
                id="competitor-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-website">{t('formWebsite')}</Label>
              <Input
                id="competitor-website"
                type="url"
                placeholder="https://"
                value={form.website}
                onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-ig">{t('formIgHandle')}</Label>
              <Input
                id="competitor-ig"
                placeholder="@"
                value={form.igHandle}
                onChange={(e) => setForm((prev) => ({ ...prev, igHandle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-adlib">{t('formAdLibraryUrl')}</Label>
              <Input
                id="competitor-adlib"
                type="url"
                placeholder="https://www.facebook.com/ads/library/..."
                value={form.adLibraryUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, adLibraryUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-watch">{t('formWatchUrls')}</Label>
              <Textarea
                id="competitor-watch"
                rows={3}
                placeholder={t('formWatchUrlsHint')}
                value={form.watchUrls}
                onChange={(e) => setForm((prev) => ({ ...prev, watchUrls: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-notes">{t('formNotes')}</Label>
              <Textarea
                id="competitor-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false)
                setForm(EMPTY_FORM)
              }}
            >
              {t('formCancel')}
            </Button>
            <Button
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              disabled={!form.name.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {t('formSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
