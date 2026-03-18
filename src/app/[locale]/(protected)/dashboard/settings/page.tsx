'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, useUser } from '@/stores/auth.store'
import { customerPortalService } from '@/services/customer-portal.service'
import { authService } from '@/services/auth.service'

export default function SettingsPage() {
  const user = useUser()
  const { updateUser } = useAuthStore()
  const t = useTranslations('dashboard.settings')

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const updated = await customerPortalService.updateProfile({ firstName, lastName, phone })
      updateUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordsNoMatch'))
      return
    }
    if (newPassword.length < 8) {
      setPasswordError(t('passwordMinLength'))
      return
    }

    setPasswordSaving(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 3000)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } }
      setPasswordError(axiosError?.response?.data?.error?.message || t('failedPassword'))
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>

      <Card className="mb-6 border-[#062E25]/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('profile')}</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-[#062E25]/60">{t('email')}</Label>
              <Input value={user?.email || ''} disabled className="mt-1 bg-[#062E25]/5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-[#062E25]/60">{t('firstName')}</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-[#062E25]/60">{t('lastName')}</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-sm text-[#062E25]/60">{t('phone')}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
            >
              {saved ? <><Check className="h-4 w-4 mr-2" /> {t('saved')}</> : saving ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('changePassword')}</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-[#062E25]/60">{t('currentPassword')}</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-[#062E25]/60">{t('newPassword')}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-[#062E25]/60">{t('confirmPassword')}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            <Button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword}
              variant="outline"
              style={{ borderColor: '#062E25', color: '#062E25' }}
            >
              {passwordSaved ? <><Check className="h-4 w-4 mr-2" /> {t('updated')}</> : passwordSaving ? t('updating') : t('changePassword')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
