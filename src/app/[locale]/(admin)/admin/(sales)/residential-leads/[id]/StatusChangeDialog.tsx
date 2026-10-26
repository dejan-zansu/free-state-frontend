'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { toast } from 'sonner'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { salesLeadErrorKey } from '@/lib/sales-lead-errors'
import { cn } from '@/lib/utils'
import type {
  SalesLeadDetail,
  SalesLeadStatus,
  SalesLeadUpdateInput,
} from '@/types/sales-lead'

import { useLeadUpdate } from './leadMutations'
import {
  leadKey,
  OUTLINE_BUTTON,
  parseAmount,
  PRIMARY_BUTTON,
  suggestedWonAmount,
} from './leadUtils'

const LOST_REASONS = [
  'tooExpensive',
  'noInterest',
  'notOwner',
  'roofUnsuitable',
  'competitor',
  'unreachable',
  'other',
] as const

type Props = {
  lead: SalesLeadDetail
  target: SalesLeadStatus
  onClose: () => void
}

export function StatusChangeDialog({ lead, target, onClose }: Props) {
  const t = useTranslations('admin.salesLeads.detail')
  const tErr = useTranslations('admin.salesLeads.errors')
  const update = useLeadUpdate(lead.id)
  const queryClient = useQueryClient()
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  const sending = useRef(false)

  const suggestion = suggestedWonAmount(lead)
  const [amount, setAmount] = useState(suggestion.value)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isWon = target === 'WON'
  const isLost = target === 'LOST'
  const parsedAmount = parseAmount(amount)
  const amountMissing = isWon && parsedAmount === null
  const reasonMissing = isLost && !reason.trim()
  const canSubmit = !update.isPending && !amountMissing && !reasonMissing
  const showSuggestionHint =
    isWon && suggestion.fromCalculation && amount === suggestion.value

  const quickPickLabels = LOST_REASONS.filter(key => key !== 'other').map(key =>
    t(`lostReasons.${key}`)
  )
  const reasonIsQuickPick = quickPickLabels.includes(reason)

  const pickReason = (key: (typeof LOST_REASONS)[number]) => {
    if (key === 'other') {
      if (reasonIsQuickPick) setReason('')
      reasonRef.current?.focus()
      return
    }
    setReason(t(`lostReasons.${key}`))
  }

  const submit = () => {
    if (!canSubmit || sending.current) return
    sending.current = true
    setError(null)
    const input: SalesLeadUpdateInput = { status: target }
    if (isWon && parsedAmount !== null) input.wonAmountChf = parsedAmount
    if (isLost) input.lostReason = reason.trim()
    if (note.trim()) input.note = note.trim()
    update.mutate(input, {
      onSuccess: () => {
        toast.success(t('toast.statusChanged'))
        onClose()
      },
      onError: err => {
        const key = salesLeadErrorKey(err)
        if (key === 'OUTCOME_REQUIRES_STATUS_CHANGE') {
          queryClient.invalidateQueries({ queryKey: leadKey(lead.id) })
          onClose()
          return
        }
        sending.current = false
        setError(key)
      },
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleShortcut = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open && !update.isPending) onClose()
      }}
    >
      <DialogContent className="sales-type-scale max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#062E25]">
            {t('statusDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('statusDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base text-[#062E25]/75">
                {t('statusDialog.from')}
              </span>
              <StatusBadge status={lead.status} className="px-3 text-base" />
            </div>
            <ArrowRight className="size-5 text-[#062E25]/60" aria-hidden />
            <div className="flex items-center gap-2">
              <span className="text-base text-[#062E25]/75">
                {t('statusDialog.to')}
              </span>
              <StatusBadge status={target} className="px-3 text-base" />
            </div>
          </div>

          {isWon && (
            <div>
              <label
                htmlFor="status-won-amount"
                className="mb-1.5 block text-base font-medium text-[#062E25]"
              >
                {t('statusDialog.wonAmount')}
                <span className="ml-2 text-base font-normal text-[#062E25]/75">
                  {t('statusDialog.required')}
                </span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-base text-[#062E25]/75">
                  CHF
                </span>
                <Input
                  id="status-won-amount"
                  autoFocus
                  inputMode="decimal"
                  value={amount}
                  onChange={event => setAmount(event.target.value)}
                  disabled={update.isPending}
                  aria-invalid={amount !== '' && parsedAmount === null}
                  className="h-10 pl-14 text-base md:text-base text-[#062E25]"
                />
              </div>
              {showSuggestionHint && (
                <p className="mt-1.5 text-base text-[#062E25]/75">
                  {t('statusDialog.wonAmountHint')}
                </p>
              )}
              {amount !== '' && parsedAmount === null && (
                <p className="mt-1.5 text-base text-red-700">
                  {t('statusDialog.wonAmountInvalid')}
                </p>
              )}
            </div>
          )}

          {isLost && (
            <div>
              <label
                htmlFor="status-lost-reason"
                className="mb-1.5 block text-base font-medium text-[#062E25]"
              >
                {t('statusDialog.lostReason')}
                <span className="ml-2 text-base font-normal text-[#062E25]/75">
                  {t('statusDialog.required')}
                </span>
              </label>
              <div
                role="group"
                aria-label={t('statusDialog.quickPicks')}
                className="mb-3 flex flex-wrap gap-2"
              >
                {LOST_REASONS.map(key => {
                  const label = t(`lostReasons.${key}`)
                  const selected =
                    key === 'other'
                      ? reason.trim() !== '' && !reasonIsQuickPick
                      : reason === label
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={selected}
                      disabled={update.isPending}
                      onClick={() => pickReason(key)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-base transition-colors disabled:opacity-50',
                        selected
                          ? 'border-[#062E25] bg-[#062E25] text-white'
                          : 'border-[#062E25]/20 bg-white text-[#062E25] hover:bg-[#062E25]/5'
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <Textarea
                id="status-lost-reason"
                ref={reasonRef}
                autoFocus
                rows={2}
                maxLength={1000}
                value={reason}
                onChange={event => setReason(event.target.value)}
                onKeyDown={handleShortcut}
                disabled={update.isPending}
                placeholder={t('statusDialog.lostReasonPlaceholder')}
                className="text-base md:text-base text-[#062E25]"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="status-note"
              className="mb-1.5 block text-base font-medium text-[#062E25]"
            >
              {t('statusDialog.note')}
            </label>
            <Textarea
              id="status-note"
              autoFocus={!isWon && !isLost}
              rows={3}
              maxLength={5000}
              value={note}
              onChange={event => setNote(event.target.value)}
              onKeyDown={handleShortcut}
              disabled={update.isPending}
              placeholder={t('statusDialog.notePlaceholder')}
              className="text-base md:text-base text-[#062E25]"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-700"
            >
              {tErr(error)}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onClose}
              disabled={update.isPending}
              className={OUTLINE_BUTTON}
            >
              {t('statusDialog.cancel')}
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className={PRIMARY_BUTTON}
            >
              {update.isPending && <Loader2 className="animate-spin" />}
              {update.isPending
                ? t('statusDialog.saving')
                : t('statusDialog.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
