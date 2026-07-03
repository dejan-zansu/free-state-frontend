'use client'

import { ArrowRight, CheckCircle2, Download, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { linkButtonVariants } from '@/components/ui/link-button'
import { SectionHeader } from '@/components/ui/section-header'
import { WorkspaceSignDialog } from '@/components/workspace/WorkspaceSignDialog'
import { cn } from '@/lib/utils'
import { contractService } from '@/services/contract.service'
import type { WorkspacePayload } from '@/services/customer-portal.service'

const MAX_POLL_ATTEMPTS = 120

export function WorkspaceSignSection({
  data,
  onRefresh,
}: {
  data: WorkspacePayload
  onRefresh: () => Promise<void>
}) {
  const t = useTranslations('dashboard.workspace')

  const [config, setConfig] = useState<{ enabled: boolean; aboContractsEnabled: boolean }>({
    enabled: true,
    aboContractsEnabled: false,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pollingContractId, setPollingContractId] = useState<string | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)
  const [pollExhausted, setPollExhausted] = useState<string | null>(null)
  const attemptsRef = useRef(0)

  useEffect(() => {
    contractService
      .getSigningConfig()
      .then(setConfig)
      .catch(() => setConfig({ enabled: true, aboContractsEnabled: false }))
  }, [])

  const model = data.calculation.solarModel
  const contract = data.contract
  const signedAlready = data.conversionStatus === 'contract_signed'
  const aboBlocked = model === 'solar-abo' && !config.aboContractsEnabled
  const resumable =
    contract != null && contract.signatureStatus === 'PENDING' && !contract.customerSignedAt

  const handleSigningStarted = useCallback((contractId: string) => {
    attemptsRef.current = 0
    setPollError(null)
    setPollExhausted(null)
    setPollingContractId(contractId)
  }, [])

  useEffect(() => {
    if (!pollingContractId) return
    let cancelled = false

    const interval = setInterval(async () => {
      attemptsRef.current += 1
      if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
        if (!cancelled) {
          setPollingContractId(null)
          setPollExhausted(t('sign.checkBackLater'))
        }
        return
      }
      try {
        const result = await contractService.checkSignatureStatus(pollingContractId)
        if (cancelled) return
        if (result.status === 'COMPLETED') {
          setPollingContractId(null)
          await onRefresh()
        } else if (result.status === 'EXPIRED') {
          setPollError(t('sign.errors.expired'))
          setPollingContractId(null)
        }
      } catch {
        return
      }
    }, 5000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pollingContractId, onRefresh, t])

  const handleReopen = async () => {
    if (!pollingContractId) return
    try {
      const url = await contractService.getSigningUrl(pollingContractId)
      window.open(url, '_blank')
    } catch {
      setPollError(t('sign.errors.generic'))
    }
  }

  if (signedAlready) {
    if (!contract) return null
    return (
      <section className="space-y-6">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-green-200 bg-green-50/70 p-8 text-center sm:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-700" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-medium text-pine tracking-tight">
              {t('sign.signedTitle')}
            </h2>
            <p className="text-base text-pine/70">{contract.contractNumber}</p>
          </div>
          <a
            href={contractService.getDownloadUrl(contract.id, true)}
            className={cn(linkButtonVariants({ variant: 'primary' }), 'text-base tracking-tight')}
          >
            {t('sign.downloadContract')}
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#062E25]">
              <Download className="h-4 w-4 text-white" aria-hidden />
            </div>
          </a>
        </div>
      </section>
    )
  }

  if (aboBlocked) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-pine/10 bg-white/70 p-8 text-center sm:p-12">
          <p className="mx-auto max-w-md text-base text-pine/80">{t('sign.aboFallback')}</p>
        </div>
      </section>
    )
  }

  const isPolling = pollingContractId != null
  const ctaLabel = resumable ? t('sign.resumeCta') : t('sign.cta')

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/60 bg-white/50 p-8 shadow-[0_8px_24px_rgba(6,46,37,0.08)] backdrop-blur-xl sm:p-12">
        <SectionHeader title={t('sign.title')} subtitle={t('sign.subtitle')} />

        <div className="flex flex-col items-center gap-4">
          {isPolling ? (
            <>
              <span className="inline-flex items-center gap-2 text-base text-pine">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('sign.awaiting')}
              </span>
              <button
                type="button"
                onClick={() => void handleReopen()}
                className={cn(
                  linkButtonVariants({ variant: 'outline-primary' }),
                  'text-base tracking-tight',
                )}
              >
                {t('sign.reopen')}
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#062E25]">
                  <ArrowRight className="h-4 w-4 -rotate-45 text-white" aria-hidden />
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                disabled={!config.enabled}
                title={config.enabled ? ctaLabel : t('sign.unavailable')}
                className={cn(
                  linkButtonVariants({ variant: 'primary' }),
                  'text-base tracking-tight',
                  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                {ctaLabel}
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#062E25]">
                  <ArrowRight
                    className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-white opacity-100 transition-all duration-300 group-hover:-translate-y-6 group-hover:opacity-0"
                    aria-hidden
                  />
                  <ArrowRight
                    className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 translate-y-6 -rotate-45 text-white opacity-0 transition-all duration-300 group-hover:-translate-y-1/2 group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
              </button>
              {!config.enabled && (
                <span className="text-base font-medium uppercase tracking-widest text-pine/60">
                  {t('sign.unavailable')}
                </span>
              )}
            </>
          )}

          {(pollError || pollExhausted) && (
            <p className="mx-auto max-w-md rounded-lg border border-pine/10 bg-white/80 p-3 text-base text-pine/80">
              {pollError ?? pollExhausted}
            </p>
          )}
        </div>
      </div>

      <WorkspaceSignDialog
        data={data}
        existingContractId={resumable && contract ? contract.id : null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSigningStarted={handleSigningStarted}
      />
    </section>
  )
}
