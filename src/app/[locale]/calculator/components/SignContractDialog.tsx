'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

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
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

interface SignContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCHF(num: number): string {
  return num.toLocaleString('de-CH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

const REQUIRED_ACKS = [
  'PRELIMINARY_QUOTE_NOTICE',
  'SITE_VISIT_CONSENT',
  'CONTRACT_REVIEW',
] as const

export default function SignContractDialog({
  open,
  onOpenChange,
}: SignContractDialogProps) {
  const t = useTranslations('solarAboCalculator.contractReview')
  const tNotice = useTranslations(
    'solarAboCalculator.contractReview.importantNotice',
  )
  const tAck = useTranslations('solarAboCalculator.contractReview.acknowledgments')
  const tRecap = useTranslations('solarAboCalculator.contractReview.recap')

  const {
    solarModel,
    selectedPackageCode,
    selectedPackageContractTermYears,
    selectedPackageInstallerWarrantyYears,
    getAnnualPpaSavings,
    getAnnualSavings,
    getGrossAmount,
    getSubsidyAmount,
    getNetAmount,
    acknowledgments,
    addAcknowledgment,
    removeAcknowledgment,
    createContract,
    setResultsPath,
    goToStep,
  } = useSolarAboCalculatorStore()

  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const isSolarFree = solarModel === 'solar-free'
  const yearlySavings = isSolarFree ? getAnnualPpaSavings() : getAnnualSavings()
  const grossAmount = getGrossAmount()
  const subsidyAmount = getSubsidyAmount()
  const netAmount = getNetAmount()
  const termYears = selectedPackageContractTermYears ?? 25
  const installerWarrantyYears = selectedPackageInstallerWarrantyYears ?? 2

  const toggleAcknowledgment = (type: string) => {
    if (acknowledgments.includes(type)) {
      removeAcknowledgment(type)
    } else {
      addAcknowledgment(type)
    }
  }

  const allAcknowledged = REQUIRED_ACKS.every((ack) =>
    acknowledgments.includes(ack),
  )

  const handleProceed = async () => {
    if (!allAcknowledged || isCreating) return

    setIsCreating(true)
    setCreateError(null)

    try {
      setResultsPath('contract')
      await createContract()
      goToStep(7)
      onOpenChange(false)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create contract',
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl">{t('title')}</DialogTitle>
          <DialogDescription>{t('subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-xl border border-[#062E25]/10 bg-[#F5F7EE]/70 p-4">
            <dl className="space-y-2 text-base">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#062E25]/60">{tRecap('package')}</dt>
                <dd className="font-semibold text-[#062E25] text-right">
                  {selectedPackageCode || 'SolarFree Home'}
                </dd>
              </div>
              {isSolarFree && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[#062E25]/60">{tRecap('term')}</dt>
                  <dd className="font-semibold text-[#062E25] text-right">
                    {tRecap('years', { years: termYears })}
                  </dd>
                </div>
              )}
              {!isSolarFree && (
                <>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[#062E25]/60">{tRecap('grossPrice')}</dt>
                    <dd className="font-semibold text-[#062E25] text-right tabular-nums">
                      CHF {formatCHF(grossAmount)}
                    </dd>
                  </div>
                  {subsidyAmount > 0 && (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-[#062E25]/60">
                        {tRecap('estimatedSubsidy')}
                      </dt>
                      <dd className="font-semibold text-[#062E25] text-right tabular-nums">
                        − CHF {formatCHF(subsidyAmount)}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[#062E25]/60">{tRecap('netAmount')}</dt>
                    <dd className="font-semibold text-[#062E25] text-right tabular-nums">
                      CHF {formatCHF(netAmount)}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#062E25]/60">{tRecap('yearlySavings')}</dt>
                <dd className="font-semibold text-[#062E25] text-right tabular-nums">
                  CHF {formatCHF(yearlySavings)}
                </dd>
              </div>
              {!isSolarFree && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[#062E25]/60">
                    {tRecap('installerWarranty')}
                  </dt>
                  <dd className="font-semibold text-[#062E25] text-right">
                    {tRecap('years', { years: installerWarrantyYears })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {createError && (
            <Alert variant="destructive">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2 text-amber-900 font-semibold mb-3">
              <AlertTriangle className="h-4 w-4" />
              {tNotice('title')}
            </div>
            <ul className="space-y-2 text-base text-amber-900">
              <li className="flex gap-2">
                <span className="font-bold shrink-0">1.</span>
                <span>{tNotice('point1')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">2.</span>
                <span>{tNotice('point2')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">3.</span>
                <span>{tNotice('point3')}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#062E25]">
              {tAck('title')}
            </h3>

            <div className="flex items-start gap-3">
              <Checkbox
                id="dialog-ack-preliminary"
                checked={acknowledgments.includes('PRELIMINARY_QUOTE_NOTICE')}
                onCheckedChange={() =>
                  toggleAcknowledgment('PRELIMINARY_QUOTE_NOTICE')
                }
              />
              <Label
                htmlFor="dialog-ack-preliminary"
                className="text-base font-normal cursor-pointer"
              >
                {tAck('preliminary')}
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="dialog-ack-sitevisit"
                checked={acknowledgments.includes('SITE_VISIT_CONSENT')}
                onCheckedChange={() =>
                  toggleAcknowledgment('SITE_VISIT_CONSENT')
                }
              />
              <Label
                htmlFor="dialog-ack-sitevisit"
                className="text-base font-normal cursor-pointer"
              >
                {tAck('siteVisit')}
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="dialog-ack-contract"
                checked={acknowledgments.includes('CONTRACT_REVIEW')}
                onCheckedChange={() => toggleAcknowledgment('CONTRACT_REVIEW')}
              />
              <Label
                htmlFor="dialog-ack-contract"
                className="text-base font-normal cursor-pointer"
              >
                {tAck('contractReview')}
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t sm:justify-center">
          <Button
            onClick={handleProceed}
            disabled={!allAcknowledged || isCreating}
            className="w-full bg-[#062E25] text-white hover:bg-[#062E25]/90"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('creatingContract')}
              </>
            ) : (
              t('proceedToSign')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
