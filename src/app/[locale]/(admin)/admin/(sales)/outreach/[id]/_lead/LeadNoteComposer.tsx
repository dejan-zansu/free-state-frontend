'use client'

import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { leadErrorKey } from '@/lib/outbound-lead-work'
import { adminOutreachService } from '@/services/admin-outreach.service'

import { OUTLINE_BUTTON } from '../../../residential-leads/[id]/leadUtils'
import { useLeadCache } from './lead-shared'

export function LeadNoteComposer({ prospectId }: { prospectId: string }) {
  const t = useTranslations('admin.outreach.work')
  const { refresh } = useLeadCache(prospectId)
  const [text, setText] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      adminOutreachService.logActivity(prospectId, {
        type: 'NOTE',
        note: text.trim(),
      }),
    onSuccess: () => {
      setText('')
      refresh()
    },
    onError: error => toast.error(t(leadErrorKey(error))),
  })

  const save = () => {
    if (!text.trim()) {
      toast.error(t('toast.noteEmpty'))
      return
    }
    mutation.mutate()
  }

  return (
    <div className="mb-6 border-b border-[#062E25]/10 pb-6">
      <label
        htmlFor="lead-note"
        className="block text-lg font-semibold text-[#062E25]"
      >
        {t('note.label')}
      </label>
      <Textarea
        id="lead-note"
        rows={3}
        maxLength={2000}
        value={text}
        onChange={event => setText(event.target.value)}
        disabled={mutation.isPending}
        placeholder={t('note.placeholder')}
        className="mt-2 text-base md:text-base text-[#062E25]"
      />
      <div className="mt-2.5">
        <Button
          variant="outline"
          size="lg"
          onClick={save}
          disabled={mutation.isPending}
          className={OUTLINE_BUTTON}
        >
          {mutation.isPending && <Loader2 className="animate-spin" />}
          {t('note.save')}
        </Button>
      </div>
    </div>
  )
}
