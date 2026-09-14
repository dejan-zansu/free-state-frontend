'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

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
import { Textarea } from '@/components/ui/textarea'
import { adminWorkspaceService } from '@/services/admin-workspace.service'

interface WorkspaceLink {
  residentialProjectId?: string
  commercialLeadId?: string
  name: string
  siteAddress?: string
}

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: WorkspaceLink
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  link,
}: CreateWorkspaceDialogProps) {
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [name, setName] = useState(link?.name ?? '')
  const [siteAddress, setSiteAddress] = useState(link?.siteAddress ?? '')
  const [description, setDescription] = useState('')
  const [template, setTemplate] = useState<'standard' | 'empty'>('standard')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setName(link?.name ?? '')
    setSiteAddress(link?.siteAddress ?? '')
    setDescription('')
    setTemplate('standard')
    setError(null)
  }

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      const created = await adminWorkspaceService.create({
        name: name.trim(),
        siteAddress: siteAddress.trim() || undefined,
        description: description.trim() || undefined,
        template,
        residentialProjectId: link?.residentialProjectId,
        commercialLeadId: link?.commercialLeadId,
      })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] })
      reset()
      onOpenChange(false)
      router.push(`/${locale}/admin/workspaces/${created.id}`)
    } catch (e: unknown) {
      const code = (
        e as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code
      setError(
        code === 'LINK_TAKEN' ? t('errors.LINK_TAKEN') : t('errors.generic')
      )
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
          <DialogTitle>{t('dialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('dialog.name')}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t('dialog.siteAddress')}</Label>
            <Input
              value={siteAddress}
              onChange={e => setSiteAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>{t('dialog.description')}</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>{t('dialog.template')}</Label>
            <Select
              value={template}
              onValueChange={v => setTemplate(v as 'standard' | 'empty')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  {t('dialog.templateStandard')}
                </SelectItem>
                <SelectItem value="empty">
                  {t('dialog.templateEmpty')}
                </SelectItem>
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
            disabled={busy || !name.trim()}
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
          >
            {t('dialog.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
