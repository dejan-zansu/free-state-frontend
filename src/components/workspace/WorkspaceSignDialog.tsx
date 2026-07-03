'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
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
import { cn } from '@/lib/utils'
import { contractService } from '@/services/contract.service'
import type { WorkspacePayload } from '@/services/customer-portal.service'
import { residentialCalculatorService } from '@/services/residential-calculator.service'

const REQUIRED_ACKS = [
  'PRELIMINARY_QUOTE_NOTICE',
  'SITE_VISIT_CONSENT',
  'CONTRACT_REVIEW',
] as const

function fmt(n: number): string {
  return n.toLocaleString('de-CH', { maximumFractionDigits: 0 })
}

interface RecapRow {
  label: string
  value: string
  bold?: boolean
}

export function WorkspaceSignDialog({
  data,
  existingContractId,
  open,
  onOpenChange,
  onSigningStarted,
}: {
  data: WorkspacePayload
  existingContractId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSigningStarted: (contractId: string) => void
}) {
  const t = useTranslations('dashboard.workspace')
  const locale = useLocale()

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

  const fin = data.financials
  const model = fin.solarModel
  const packageName = data.package?.name
  const termYears = fin.contractTermYears

  const recapRows = (): RecapRow[] => {
    const rows: RecapRow[] = []
    if (packageName) rows.push({ label: t('sign.recap.package'), value: packageName })

    if (model === 'solar-free') {
      if (termYears != null) {
        rows.push({ label: t('sign.recap.term'), value: t('sign.recap.termYears', { years: termYears }) })
      }
      rows.push({ label: t('sign.recap.yearlySavings'), value: `CHF ${fmt(fin.annualSavingsChf)}` })
      rows.push({ label: t('sign.recap.investment'), value: 'CHF 0' })
    } else if (model === 'solar-direct') {
      if (termYears != null) {
        rows.push({ label: t('sign.recap.term'), value: t('sign.recap.termYears', { years: termYears }) })
      }
      rows.push({ label: t('sign.recap.gross'), value: `CHF ${fmt(fin.grossPriceChf)}` })
      rows.push({ label: t('sign.recap.subsidy'), value: `- CHF ${fmt(fin.subsidiesChf ?? 0)}` })
      rows.push({ label: t('sign.recap.net'), value: `CHF ${fmt(fin.netPriceChf)}`, bold: true })
      if (fin.evChargerTotalChf > 0) {
        rows.push({ label: t('sign.recap.evCharger'), value: `CHF ${fmt(fin.evChargerTotalChf)}` })
      }
    } else {
      rows.push({ label: t('sign.recap.term'), value: t('sign.recap.termMonths', { months: fin.aboTermMonths }) })
      rows.push({ label: t('sign.recap.monthlyRate'), value: `CHF ${fmt(fin.aboMonthlyChf ?? 0)} / Mt.`, bold: true })
      rows.push({ label: t('sign.recap.total'), value: `CHF ${fmt(fin.aboTotalChf ?? 0)}` })
    }
    return rows
  }

  const recapNote = (): string | null => {
    if (model === 'solar-direct') return t('sign.recap.oneTime')
    if (model === 'solar-abo') {
      return t('sign.recap.uplift', { percent: Math.round((fin.aboUpliftFactor - 1) * 100) })
    }
    return null
  }

  const ackRows = [
    { type: 'PRELIMINARY_QUOTE_NOTICE', id: 'workspace-ack-preliminary', label: t('sign.acks.preliminary') },
    { type: 'SITE_VISIT_CONSENT', id: 'workspace-ack-sitevisit', label: t('sign.acks.siteVisit') },
    { type: 'CONTRACT_REVIEW', id: 'workspace-ack-contract', label: t('sign.acks.contractReview') },
  ]

  const handleProceed = async () => {
    setSubmitting(true)
    setError(null)
    try {
      let contractId = existingContractId
      if (!contractId) {
        const created = await residentialCalculatorService.createContract({
          projectId: data.project.id,
          acknowledgments: acks,
          language: locale,
        })
        contractId = created.data.contractId
      }
      await contractService.initiateSignature(contractId, acks)
      const url = await contractService.getSigningUrl(contractId)
      window.open(url, '_blank')
      onSigningStarted(contractId)
      onOpenChange(false)
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'SIGNING_DISABLED') setError(t('sign.errors.disabled'))
      else if (code === 'CONTRACT_CANCELLED') setError(t('sign.errors.cancelled'))
      else if (code === 'ALREADY_SIGNED') setError(t('sign.errors.alreadySigned'))
      else if (code === 'ABO_CONTRACT_NOT_AVAILABLE') setError(t('sign.errors.aboUnavailable'))
      else setError(t('sign.errors.generic'))
    } finally {
      setSubmitting(false)
    }
  }

  const rows = recapRows()
  const note = recapNote()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl">{t('sign.title')}</DialogTitle>
          <DialogDescription>{t('sign.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-xl border border-pine/10 bg-pine/5 p-4 space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3">
                <span className="text-base text-pine/70">{row.label}</span>
                <span className={cn('text-base text-pine', row.bold && 'text-lg font-semibold')}>
                  {row.value}
                </span>
              </div>
            ))}
            {note && <p className="text-base text-pine/60">{note}</p>}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2 text-amber-900 font-semibold mb-4">
              <AlertTriangle className="h-4 w-4" />
              {t('sign.noticeTitle')}
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
            onClick={handleProceed}
            disabled={!allAcknowledged || submitting}
            className="w-full bg-[#062E25] text-white hover:bg-[#062E25]/90"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('sign.starting')}
              </>
            ) : (
              t('sign.proceed')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
