'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { contractService } from '@/services/contract.service'

interface PortalSignDialogProps {
  contractId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSigningStarted: () => void
}

const REQUIRED_ACKS = [
  'PRELIMINARY_QUOTE_NOTICE',
  'SITE_VISIT_CONSENT',
  'CONTRACT_REVIEW',
] as const

export default function PortalSignDialog({
  contractId,
  open,
  onOpenChange,
  onSigningStarted,
}: PortalSignDialogProps) {
  const t = useTranslations('dashboard.signing')

  const [acks, setAcks] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setAcks([])
      setError(null)
    }
  }, [open])

  const toggleAck = (type: string) => {
    setAcks((prev) =>
      prev.includes(type) ? prev.filter((a) => a !== type) : [...prev, type],
    )
  }

  const allAcknowledged = REQUIRED_ACKS.every((ack) => acks.includes(ack))

  const handleSign = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await contractService.initiateSignature(contractId, acks)
      const url = await contractService.getSigningUrl(contractId)
      window.open(url, '_blank')
      onSigningStarted()
      onOpenChange(false)
    } catch (err) {
      const code = (err as { code?: string }).code
      setError(
        code === 'SIGNING_DISABLED'
          ? t('signingDisabled')
          : code === 'CONTRACT_CANCELLED'
            ? t('contractCancelled')
            : code === 'CONTRACT_EXPIRED'
              ? t('signatureExpired')
              : code === 'CONTRACT_MODEL_CHANGED'
                ? t('modelChanged')
                : code === 'CONTRACT_DETAILS_MISSING'
                  ? t('detailsMissing')
                  : code === 'ALREADY_SIGNED'
                    ? t('alreadySigned')
                    : t('signingError'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const ackRows = [
    {
      type: 'PRELIMINARY_QUOTE_NOTICE',
      id: 'portal-ack-preliminary',
      label: t('ackPreliminary'),
    },
    {
      type: 'SITE_VISIT_CONSENT',
      id: 'portal-ack-sitevisit',
      label: t('ackSiteVisit'),
    },
    {
      type: 'CONTRACT_REVIEW',
      id: 'portal-ack-contract',
      label: t('ackContractReview'),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] flex flex-col gap-0 p-0"
        data-hj-suppress data-cs-mask
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl">{t('title')}</DialogTitle>
          <DialogDescription>{t('subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2 text-amber-900 font-semibold mb-4">
              <AlertTriangle className="h-4 w-4" />
              {t('noticeTitle')}
            </div>
            <div className="space-y-4">
              {ackRows.map((row) => (
                <div key={row.type} className="flex items-start gap-3">
                  <Checkbox
                    id={row.id}
                    checked={acks.includes(row.type)}
                    onCheckedChange={() => toggleAck(row.type)}
                  />
                  <Label
                    htmlFor={row.id}
                    className="text-base font-normal cursor-pointer text-amber-900"
                  >
                    {row.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t sm:justify-center">
          <Button
            onClick={handleSign}
            disabled={!allAcknowledged || submitting}
            className="w-full bg-[#062E25] text-white hover:bg-[#062E25]/90"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('starting')}
              </>
            ) : (
              t('proceed')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
