'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

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
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
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
      setPasswordError(axiosError?.response?.data?.error?.message || 'Failed to change password')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-8">Settings</h1>

      <Card className="mb-6 border-[#062E25]/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-[#062E25]/60">Email</Label>
              <Input value={user?.email || ''} disabled className="mt-1 bg-[#062E25]/5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-[#062E25]/60">First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-[#062E25]/60">Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-sm text-[#062E25]/60">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
            >
              {saved ? <><Check className="h-4 w-4 mr-2" /> Saved</> : saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-[#062E25]/60">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-[#062E25]/60">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-[#062E25]/60">Confirm New Password</Label>
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
              {passwordSaved ? <><Check className="h-4 w-4 mr-2" /> Updated</> : passwordSaving ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
