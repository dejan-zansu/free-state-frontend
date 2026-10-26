'use client'

import { useMutation } from '@tanstack/react-query'
import {
  Loader2,
  Mail,
  Phone,
  StickyNote,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState, type KeyboardEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { salesLeadErrorKey } from '@/lib/sales-lead-errors'
import { cn } from '@/lib/utils'
import { salesLeadService } from '@/services/sales-lead.service'
import type { SalesLeadNoteKind } from '@/types/sales-lead'

import { useLeadCache } from './leadMutations'
import { PRIMARY_BUTTON } from './leadUtils'

type ComposerKind = 'NOTE' | SalesLeadNoteKind

const KINDS: { key: ComposerKind; icon: LucideIcon }[] = [
  { key: 'NOTE', icon: StickyNote },
  { key: 'CALL', icon: Phone },
  { key: 'EMAIL', icon: Mail },
  { key: 'MEETING', icon: Users },
]

export function NoteComposer({ leadId }: { leadId: string }) {
  const t = useTranslations('admin.salesLeads.detail')
  const tErr = useTranslations('admin.salesLeads.errors')
  const { addActivity } = useLeadCache(leadId)
  const [kind, setKind] = useState<ComposerKind>('NOTE')
  const [body, setBody] = useState('')
  const sending = useRef(false)

  const mutation = useMutation({
    mutationFn: () =>
      salesLeadService.addNote(leadId, {
        body: body.trim(),
        ...(kind === 'NOTE' ? {} : { kind }),
      }),
    onSuccess: activity => {
      addActivity(activity)
      setBody('')
      toast.success(t('toast.noteSaved'))
    },
    onError: error => toast.error(tErr(salesLeadErrorKey(error))),
    onSettled: () => {
      sending.current = false
    },
  })

  const canSubmit = body.trim().length > 0 && !mutation.isPending

  const submit = () => {
    if (!canSubmit || sending.current) return
    sending.current = true
    mutation.mutate()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="mb-6 border-b border-[#062E25]/10 pb-6">
      <div
        role="group"
        aria-label={t('composer.kindLabel')}
        className="mb-3 flex flex-wrap gap-2"
      >
        {KINDS.map(({ key, icon: Icon }) => {
          const selected = kind === key
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => setKind(key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-base transition-colors',
                selected
                  ? 'border-[#062E25] bg-[#062E25] text-white'
                  : 'border-[#062E25]/20 bg-white text-[#062E25] hover:bg-[#062E25]/5'
              )}
            >
              <Icon className="size-4" />
              {t(`composer.kinds.${key}`)}
            </button>
          )
        })}
      </div>
      <Textarea
        value={body}
        onChange={event => setBody(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        maxLength={5000}
        disabled={mutation.isPending}
        aria-label={t('composer.label')}
        placeholder={t(`composer.placeholders.${kind}`)}
        className="text-base md:text-base text-[#062E25]"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="hidden text-base text-[#062E25]/75 sm:inline">
          {t('composer.shortcut')}
        </span>
        <Button
          size="lg"
          onClick={submit}
          disabled={!canSubmit}
          className={cn(PRIMARY_BUTTON, 'w-full sm:ml-auto sm:w-auto')}
        >
          {mutation.isPending && <Loader2 className="animate-spin" />}
          {mutation.isPending ? t('composer.saving') : t('composer.save')}
        </Button>
      </div>
    </div>
  )
}
