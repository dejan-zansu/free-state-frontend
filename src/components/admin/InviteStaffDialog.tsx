'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminService } from '@/services/admin.service'
import type { UserRole } from '@/types/auth'

interface InviteStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STAFF_ROLES: UserRole[] = [
  'EMPLOYEE',
  'PROJECT_MANAGER',
  'SALES_REP',
  'ADMIN',
]
const LANGUAGES = ['de', 'en', 'fr', 'it'] as const

export function InviteStaffDialog({
  open,
  onOpenChange,
}: InviteStaffDialogProps) {
  const t = useTranslations('admin.users.invite')
  const tl = useTranslations('admin.statusLabels')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<UserRole>('EMPLOYEE')
  const [language, setLanguage] = useState<string>('de')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setEmail('')
    setFirstName('')
    setLastName('')
    setRole('EMPLOYEE')
    setLanguage('de')
    setPassword('')
    setError(null)
  }

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await adminService.inviteStaff({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        preferredLanguage: language,
        password,
      })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      reset()
      onOpenChange(false)
    } catch (e: unknown) {
      const code = (
        e as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code
      setError(code === 'USER_EXISTS' ? t('errorExists') : t('errorGeneric'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="min-w-0 space-y-4">
          <div>
            <Label>{t('firstName')}</Label>
            <Input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label>{t('lastName')}</Label>
            <Input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>
          <div>
            <Label>{t('email')}</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>{t('password')}</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p className="mt-1 text-sm text-[#062E25]/75">{t('passwordHint')}</p>
          </div>
          <div>
            <Label>{t('role')}</Label>
            <Select value={role} onValueChange={v => setRole(v as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map(r => (
                  <SelectItem key={r} value={r}>
                    {tl(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('language')}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => (
                  <SelectItem key={l} value={l}>
                    {l.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
            disabled={busy}
          >
            {tc('cancel')}
          </Button>
          <Button
            onClick={submit}
            disabled={
              busy ||
              !email.trim() ||
              !firstName.trim() ||
              !lastName.trim() ||
              password.length < 6
            }
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
          >
            {t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
