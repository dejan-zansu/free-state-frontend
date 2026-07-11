'use client'

import { useState } from 'react'
import { ImageOff, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { adminMarketingService } from '@/services/admin-marketing.service'
import type {
  MarketingDraftStatus,
  MarketingSocialPlatform,
  MarketingStudioDraft,
  MarketingStudioDrafts,
} from '@/types/admin-marketing'

const CHANNEL_CLASSES: Record<MarketingSocialPlatform, string> = {
  INSTAGRAM: 'bg-pink-100 text-pink-700',
  FACEBOOK: 'bg-blue-100 text-blue-700',
}

const STATUS_TABS: MarketingDraftStatus[] = [
  'PENDING_APPROVAL',
  'APPROVED',
  'PUBLISHED',
  'REJECTED',
]

function ChannelBadge({ channel }: { channel: MarketingSocialPlatform }) {
  return (
    <Badge
      variant="secondary"
      className={cn('font-medium border-0', CHANNEL_CLASSES[channel] ?? 'bg-gray-100 text-gray-700')}
    >
      {channel === 'INSTAGRAM' ? 'Instagram' : 'Facebook'}
    </Badge>
  )
}

function DraftImage({ draft }: { draft: MarketingStudioDraft }) {
  const t = useTranslations('admin.marketing.studio')
  const src = draft.renderedCardUrl ?? draft.imageSource

  return (
    <div className="aspect-square bg-[#062E25]/5">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <ImageOff className="h-6 w-6 text-[#062E25]/20" />
          <span className="text-sm text-[#062E25]/30">{t('noImage')}</span>
        </div>
      )}
    </div>
  )
}

function toDatetimeLocal(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function PendingDraftCard({
  draft,
  onReject,
}: {
  draft: MarketingStudioDraft
  onReject: (id: string) => void
}) {
  const t = useTranslations('admin.marketing.studio')
  const queryClient = useQueryClient()

  const [caption, setCaption] = useState(draft.caption)
  const [schedule, setSchedule] = useState(toDatetimeLocal(draft.scheduledFor))

  const dirty = caption !== draft.caption

  const saveMutation = useMutation({
    mutationFn: () => adminMarketingService.updateStudioDraft(draft.id, { caption }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'studio'] })
    },
  })

  const approveMutation = useMutation({
    mutationFn: () =>
      adminMarketingService.approveStudioDraft(draft.id, {
        scheduledFor: schedule ? new Date(schedule).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'studio'] })
    },
  })

  return (
    <Card className="border-[#062E25]/10 overflow-hidden">
      <DraftImage draft={draft} />
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ChannelBadge channel={draft.channel} />
          {draft.variantGroup && (
            <Badge variant="secondary" className="font-medium border-0 bg-gray-100 text-gray-700">
              {t('variant', { group: draft.variantGroup })}
            </Badge>
          )}
          <span className="text-sm text-[#062E25]/40 ml-auto">
            {new Date(draft.createdAt).toLocaleDateString('de-CH')}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <Label htmlFor={`caption-${draft.id}`}>{t('captionLabel')}</Label>
          <Textarea
            id={`caption-${draft.id}`}
            rows={6}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          {dirty && (
            <Button
              variant="outline"
              size="sm"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {t('saveCaption')}
            </Button>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor={`schedule-${draft.id}`}>{t('scheduleLabel')}</Label>
          <Input
            id={`schedule-${draft.id}`}
            type="datetime-local"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
        </div>

        {(draft.generatedBy || draft.promptVersion) && (
          <p className="text-sm text-[#062E25]/40 mb-4 truncate">
            {[draft.generatedBy, draft.promptVersion].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
            disabled={dirty || approveMutation.isPending}
            onClick={() => approveMutation.mutate()}
          >
            {t('approve')}
          </Button>
          <Button variant="outline" onClick={() => onReject(draft.id)}>
            {t('reject')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ReadOnlyDraftCard({ draft }: { draft: MarketingStudioDraft }) {
  const t = useTranslations('admin.marketing.studio')

  return (
    <Card className="border-[#062E25]/10 overflow-hidden">
      <DraftImage draft={draft} />
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ChannelBadge channel={draft.channel} />
          {draft.variantGroup && (
            <Badge variant="secondary" className="font-medium border-0 bg-gray-100 text-gray-700">
              {t('variant', { group: draft.variantGroup })}
            </Badge>
          )}
          <span className="text-sm text-[#062E25]/40 ml-auto">
            {new Date(draft.createdAt).toLocaleDateString('de-CH')}
          </span>
        </div>
        <p className="text-sm text-[#062E25]/80 whitespace-pre-wrap max-h-40 overflow-y-auto mb-3">
          {draft.caption}
        </p>
        {draft.scheduledFor && (
          <p className="text-sm text-[#062E25]/40">
            {t('scheduledForLabel', {
              date: new Date(draft.scheduledFor).toLocaleString('de-CH'),
            })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminMarketingStudioPage() {
  const t = useTranslations('admin.marketing.studio')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<MarketingDraftStatus>('PENDING_APPROVAL')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery<MarketingStudioDrafts>({
    queryKey: ['admin', 'marketing', 'studio', 'drafts', status],
    queryFn: () => adminMarketingService.getStudioDrafts({ status }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      adminMarketingService.rejectStudioDraft(id, { reason: rejectReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'studio'] })
      setRejectId(null)
      setRejectReason('')
    },
  })

  const tabLabels: Record<MarketingDraftStatus, string> = {
    DRAFT: t('tabPending'),
    PENDING_APPROVAL: t('tabPending'),
    APPROVED: t('tabApproved'),
    PUBLISHED: t('tabPublished'),
    REJECTED: t('tabRejected'),
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
        <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">{t('guardrail')}</p>
      </div>

      <Tabs
        value={status}
        onValueChange={(value) => setStatus(value as MarketingDraftStatus)}
        className="mb-6"
      >
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tabLabels[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <AdminPageLoader className="h-64" />
      ) : !data ? (
        <p className="text-[#062E25]/60">{tc('failedToLoad')}</p>
      ) : data.rows.length === 0 ? (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <p className="text-center py-12 text-[#062E25]/40">
              {status === 'PENDING_APPROVAL' ? t('emptyPending') : t('empty')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.rows.map((draft) =>
            status === 'PENDING_APPROVAL' ? (
              <PendingDraftCard key={draft.id} draft={draft} onReject={setRejectId} />
            ) : (
              <ReadOnlyDraftCard key={draft.id} draft={draft} />
            )
          )}
        </div>
      )}

      <Dialog
        open={rejectId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectId(null)
            setRejectReason('')
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('rejectTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">{t('rejectReason')}</Label>
            <Textarea
              id="reject-reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectId(null)
                setRejectReason('')
              }}
            >
              {t('rejectCancel')}
            </Button>
            <Button
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => rejectId && rejectMutation.mutate(rejectId)}
            >
              {t('rejectConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
