'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, useUser } from '@/stores/auth.store'
import { customerPortalService } from '@/services/customer-portal.service'
import { trackFunnelEvent } from '@/lib/analytics/funnel-events'

const PHONE_REGEX = /^[+\d][\d\s\-().]{6,}$/

export function WorkspacePhoneAsk() {
  const t = useTranslations('dashboard.workspace.phoneAsk')
  const user = useUser()
  const { updateUser } = useAuthStore()

  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<'errorInvalid' | 'errorFailed' | null>(null)

  if (!user) return null
  if (!saved && typeof user.phone === 'string' && user.phone.trim() !== '') return null

  const handleSave = async () => {
    const trimmed = phone.trim()
    if (!trimmed) return
    if (!PHONE_REGEX.test(trimmed)) {
      setError('errorInvalid')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const updated = await customerPortalService.updateProfile({ phone: trimmed })
      updateUser(updated)
      trackFunnelEvent('phone_added', { meta: { source: 'workspace' } })
      setSaved(true)
    } catch {
      setError('errorFailed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="flex flex-col items-start gap-4 rounded-2xl border border-pine/10 bg-white/70 p-6 sm:p-8">
      {saved ? (
        <p className="inline-flex items-center gap-2 text-base text-pine">
          <Check className="h-4 w-4" aria-hidden />
          {t('saved')}
        </p>
      ) : (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-pine tracking-tight">{t('title')}</h2>
            <p className="max-w-2xl text-base text-pine/75">{t('helper')}</p>
          </div>
          <form
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              void handleSave()
            }}
          >
            <div className="flex-1">
              <Label htmlFor="workspace-phone" className="text-sm text-pine">
                {t('label')}
              </Label>
              <Input
                id="workspace-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (error) setError(null)
                }}
                aria-invalid={error === 'errorInvalid' || undefined}
                aria-describedby={error ? 'workspace-phone-error' : undefined}
                className="bg-white"
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
            >
              {t('button')}
            </Button>
          </form>
          {error && (
            <p id="workspace-phone-error" role="alert" className="text-sm text-destructive">
              {t(error)}
            </p>
          )}
        </>
      )}
    </section>
  )
}
