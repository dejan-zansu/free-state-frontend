'use client'

import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { formatLeadDate } from '@/lib/outbound-lead-work'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type { OutboundProspectDetail } from '@/types/admin-outreach'

import {
  OUTLINE_BUTTON,
  PRIMARY_BUTTON,
} from '../../../residential-leads/[id]/leadUtils'
import { LEAD_INPUT_CLASS, useLeadCache } from '../../[id]/_lead/lead-shared'
import {
  Actions,
  DialogShell,
  decisionToast,
  useErrorToast,
} from '../../[id]/_lead/LeadDialogs'

const NOTE_MAX_LENGTH = 2000

type DialogProps = {
  prospect: OutboundProspectDetail
  onClose: () => void
}

type ClosingChoice = 'NOT_INTERESTED' | 'HINT_DONE'

function NoteField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  const t = useTranslations('admin.outreach.work')
  return (
    <div>
      <Label htmlFor={id} className="text-base">
        {t('decisionDialog.note')}
      </Label>
      <Textarea
        id={id}
        rows={3}
        maxLength={NOTE_MAX_LENGTH}
        value={value}
        onChange={event => onChange(event.target.value)}
        className={LEAD_INPUT_CLASS}
      />
    </div>
  )
}

export function InboxNotLeadDialog({ prospect, onClose }: DialogProps) {
  const t = useTranslations('admin.outreach.inbox')
  const tw = useTranslations('admin.outreach.work')
  const showError = useErrorToast()
  const { applySnapshot } = useLeadCache(prospect.id)
  const [choice, setChoice] = useState<ClosingChoice | null>(null)
  const [note, setNote] = useState('')

  const mutation = useMutation({
    mutationFn: (outcome: ClosingChoice) =>
      adminOutreachService.recordDecision(prospect.id, {
        outcome,
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: result => {
      toast.success(decisionToast(tw, result))
      applySnapshot(result)
      onClose()
    },
    onError: showError,
  })

  const options: { value: ClosingChoice; label: string; text: string }[] = [
    {
      value: 'NOT_INTERESTED',
      label: t('notLeadDialog.refusal'),
      text: t('notLeadDialog.refusalText'),
    },
    {
      value: 'HINT_DONE',
      label: t('notLeadDialog.close'),
      text: t('notLeadDialog.closeText'),
    },
  ]

  return (
    <DialogShell title={t('notLeadDialog.title')} onClose={onClose}>
      <div className="space-y-4">
        <RadioGroup
          value={choice ?? ''}
          onValueChange={value => setChoice(value as ClosingChoice)}
          aria-label={t('notLeadDialog.title')}
        >
          {options.map(option => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#062E25]/15 p-3 text-base text-[#062E25] hover:bg-[#F5F7EE]"
            >
              <RadioGroupItem value={option.value} className="mt-1" />
              <span className="min-w-0">
                <span className="block font-semibold">{option.label}</span>
                <span className="block text-[#062E25]/75">{option.text}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
        <NoteField id="inbox-not-lead-note" value={note} onChange={setNote} />
      </div>
      <Actions
        cancel={tw('decisionDialog.cancel')}
        save={
          choice === 'HINT_DONE'
            ? t('notLeadDialog.confirmClose')
            : t('notLeadDialog.confirmRefusal')
        }
        pending={mutation.isPending}
        disabled={!choice}
        danger={choice === 'NOT_INTERESTED'}
        onCancel={onClose}
        onSave={() => {
          if (choice) mutation.mutate(choice)
        }}
      />
    </DialogShell>
  )
}

export function InboxDoneDialog({ prospect, onClose }: DialogProps) {
  const t = useTranslations('admin.outreach.inbox')
  const tw = useTranslations('admin.outreach.work')
  const showError = useErrorToast()
  const { applySnapshot } = useLeadCache(prospect.id)
  const [note, setNote] = useState('')
  const request = prospect.work.openRequest

  const mutation = useMutation({
    mutationFn: (byPhone: boolean) =>
      adminOutreachService.recordDecision(prospect.id, {
        outcome: 'HANDLED',
        ...(byPhone ? { byPhone } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: result => {
      const open = result.work.openRequest
      toast.success(
        open
          ? tw('toast.handledRequestOpen', { date: formatLeadDate(open.at) })
          : decisionToast(tw, result)
      )
      applySnapshot(result)
      onClose()
    },
    onError: showError,
  })

  const pendingPhone = mutation.isPending && mutation.variables === true
  const pendingAnswer = mutation.isPending && mutation.variables === false

  return (
    <DialogShell
      title={t('doneDialog.title')}
      description={t('doneDialog.text')}
      onClose={onClose}
    >
      <div className="space-y-4">
        {request && (
          <p className="rounded-lg bg-amber-50 p-3 text-base text-amber-800">
            {t(
              request.criterion === 'MEETING_DATED'
                ? 'doneDialog.meetingOpen'
                : 'doneDialog.offerOpen',
              { date: formatLeadDate(request.at) }
            )}
          </p>
        )}
        <NoteField id="inbox-done-note" value={note} onChange={setNote} />
      </div>
      <DialogFooter className="flex-wrap">
        <Button
          variant="outline"
          size="lg"
          onClick={onClose}
          disabled={mutation.isPending}
          className={OUTLINE_BUTTON}
        >
          {tw('decisionDialog.cancel')}
        </Button>
        <Button
          size="lg"
          onClick={() => mutation.mutate(true)}
          disabled={mutation.isPending}
          className={PRIMARY_BUTTON}
        >
          {pendingPhone && <Loader2 className="animate-spin" />}
          {t('doneDialog.byPhone')}
        </Button>
        <Button
          size="lg"
          onClick={() => mutation.mutate(false)}
          disabled={mutation.isPending}
          className={PRIMARY_BUTTON}
        >
          {pendingAnswer && <Loader2 className="animate-spin" />}
          {t('doneDialog.noAnswer')}
        </Button>
      </DialogFooter>
    </DialogShell>
  )
}
