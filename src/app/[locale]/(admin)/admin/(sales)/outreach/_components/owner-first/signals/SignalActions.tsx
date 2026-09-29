'use client'

// Actions on one owner signal: a routing preview (reads only), routing after
// a confirmation, and ignoring with a reason. Tenders are bid on simap by a
// person, so they have no routing here. Nothing on this page sends anything:
// routing adds evidence, creates an owner prospect or queues a letter.

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { outreachSignalsService } from '@/services/outreach/signals.service'
import type {
  OwnerSignalListItem,
  OwnerSignalRouteResponse,
} from '@/types/outreach/signals'

function resultText(
  t: ReturnType<typeof useTranslations>,
  result: OwnerSignalRouteResponse
): string {
  const outcome = t(`routeOutcome.${result.outcome}`)
  return result.reason ? `${outcome}: ${result.reason}` : outcome
}

export function SignalActions({ signal }: { signal: OwnerSignalListItem }) {
  const t = useTranslations('admin.outreach.signals')
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [ignoreOpen, setIgnoreOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin', 'outreach', 'signals'],
    })

  const preview = useMutation({
    mutationFn: () => outreachSignalsService.route(signal.id, { dryRun: true }),
    onSuccess: result =>
      setMessage(`${t('previewPrefix')} ${resultText(t, result)}`),
    onError: () => setMessage(t('actionFailed')),
  })
  const route = useMutation({
    mutationFn: () =>
      outreachSignalsService.route(signal.id, { dryRun: false }),
    onSuccess: result => {
      setConfirmOpen(false)
      setMessage(resultText(t, result))
      refresh()
    },
    onError: () => {
      setConfirmOpen(false)
      setMessage(t('actionFailed'))
    },
  })
  const ignore = useMutation({
    mutationFn: () =>
      outreachSignalsService.ignore(signal.id, { reason: reason.trim() }),
    onSuccess: () => {
      setIgnoreOpen(false)
      setReason('')
      refresh()
    },
    onError: () => setMessage(t('actionFailed')),
  })

  const isTender = signal.kind === 'TENDER'
  const done = signal.status === 'ROUTED'
  const busy = preview.isPending || route.isPending || ignore.isPending

  return (
    <div className="flex flex-col gap-2 min-w-[11rem]">
      {signal.sourceUrl && (
        <a
          href={signal.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {t('publication')}
        </a>
      )}
      {isTender ? (
        <span className="text-[#062E25]/75">{t('tenderHint')}</span>
      ) : (
        !done && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-base"
              disabled={busy}
              onClick={() => preview.mutate()}
            >
              {t('preview')}
            </Button>
            <Button
              size="sm"
              className="text-base"
              disabled={busy}
              onClick={() => setConfirmOpen(true)}
            >
              {t('route')}
            </Button>
          </div>
        )
      )}
      {!done && signal.status !== 'IGNORED' && (
        <Button
          variant="ghost"
          size="sm"
          className="text-base justify-start px-0"
          disabled={busy}
          onClick={() => setIgnoreOpen(true)}
        >
          {t('ignore')}
        </Button>
      )}
      {message && <p className="text-[#062E25]/75 break-words">{message}</p>}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('routeConfirmTitle')}</DialogTitle>
            <DialogDescription className="text-base">
              {t('routeConfirmText', { party: signal.partyName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t('cancel')}
            </Button>
            <Button disabled={route.isPending} onClick={() => route.mutate()}>
              {t('route')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ignoreOpen} onOpenChange={setIgnoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ignoreTitle')}</DialogTitle>
            <DialogDescription className="text-base">
              {signal.partyName}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor={`ignore-${signal.id}`}>{t('ignoreReason')}</Label>
            <Textarea
              id={`ignore-${signal.id}`}
              className="mt-1 text-base"
              value={reason}
              maxLength={300}
              placeholder={t('ignoreReasonPlaceholder')}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIgnoreOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              disabled={reason.trim().length < 2 || ignore.isPending}
              onClick={() => ignore.mutate()}
            >
              {t('ignore')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
