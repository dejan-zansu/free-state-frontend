'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LinkButton, linkButtonVariants } from '@/components/ui/link-button'
import { trackFunnelEvent } from '@/lib/analytics/funnel-events'
import {
  COMPANY_CALENDLY_URL,
  COMPANY_MAIN_PHONE_DISPLAY,
  COMPANY_MAIN_PHONE_TEL_HREF,
} from '@/lib/company-contact'
import { cn } from '@/lib/utils'
import { contractService } from '@/services/contract.service'
import type { WorkspacePayload } from '@/services/customer-portal.service'
import { residentialCalculatorService } from '@/services/residential-calculator.service'
import { useUser } from '@/stores/auth.store'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('de-CH')
}

export function OfferCta({
  data,
  onRefresh,
}: {
  data: WorkspacePayload
  onRefresh: () => Promise<void>
}) {
  const t = useTranslations('dashboard.workspace.cta')
  const tActions = useTranslations('dashboard.workspace')
  const pathname = usePathname()
  const user = useUser()

  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offerResult, setOfferResult] = useState<
    'sent' | 'updated' | 'unchanged' | 'cooldown' | null
  >(null)
  const [aboContractsEnabled, setAboContractsEnabled] = useState(false)

  useEffect(() => {
    contractService
      .getSigningConfig()
      .then((config) => setAboContractsEnabled(config.aboContractsEnabled))
      .catch(() => setAboContractsEnabled(false))
  }, [])

  const offer = data.offer
  const notOwner = !data.project.isPropertyOwner
  const aboBlocked = data.calculation.solarModel === 'solar-abo' && !aboContractsEnabled

  const handleRequestOffer = async () => {
    setRequesting(true)
    setError(null)
    try {
      const res = await residentialCalculatorService.requestOffer({ projectId: data.project.id })
      setOfferResult(res.data.status)
      setTimeout(() => setOfferResult(null), 4000)
      if (res.data.status === 'sent' || res.data.status === 'updated') {
        trackFunnelEvent('offer_requested', {
          meta: {
            model: data.calculation.solarModel ?? 'solar-direct',
            kWp: Math.round(data.calculation.systemSizeKwp * 100) / 100,
            subsidyChf: data.rates.subsidy?.estimatedAmountChf ?? 0,
            status: res.data.status,
          },
        })
      }
      await onRefresh()
    } catch {
      setError(tActions('actions.actionError'))
    } finally {
      setRequesting(false)
    }
  }

  const calendlyHref = user?.id
    ? `${COMPANY_CALENDLY_URL}${COMPANY_CALENDLY_URL.includes('?') ? '&' : '?'}utm_content=${encodeURIComponent(user.id)}`
    : COMPANY_CALENDLY_URL

  const notes = (
    <>
      {notOwner && (
        <p className="text-base text-pine tracking-tight">{t('notOwnerNote')}</p>
      )}
      {aboBlocked && (
        <p className="text-base text-pine tracking-tight">{t('aboNote')}</p>
      )}
    </>
  )

  const feedback = (
    <>
      {offerResult && offerResult !== 'sent' && (
        <p className="text-base text-pine tracking-tight">
          {tActions(`actions.offerResult_${offerResult}`)}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-700">
          {error}
        </p>
      )}
    </>
  )

  const requestButton = (label: string, disabled: boolean) => (
    <button
      type="button"
      onClick={() => void handleRequestOffer()}
      disabled={disabled}
      className={cn(
        linkButtonVariants({ variant: 'primary' }),
        'text-base tracking-tight',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      {requesting ? t('primaryPending') : label}
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#062E25]">
        <ArrowRight className="h-4 w-4 -rotate-45 text-white" aria-hidden />
      </div>
    </button>
  )

  if (offer.requested && offer.configChanged && offer.canReoffer) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-pine/10 bg-white/70 p-6 sm:p-8">
        <p className="text-xl font-medium text-pine tracking-tight sm:text-2xl">
          {t('updateTitle')}
        </p>
        {requestButton(t('updateButton'), requesting)}
        {notes}
        {feedback}
      </div>
    )
  }

  if (offer.requested && offer.configChanged && !offer.canReoffer) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-pine/10 bg-white/70 p-6 sm:p-8">
        <p className="text-xl font-medium text-pine tracking-tight sm:text-2xl">
          {t('updateTitle')}
        </p>
        {requestButton(t('updateButton'), true)}
        {offer.cooldownUntil && (
          <p className="text-base text-pine tracking-tight">
            {t('cooldown', { date: formatDate(offer.cooldownUntil) })}
          </p>
        )}
        {notes}
        {feedback}
      </div>
    )
  }

  if (offer.requested) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-pine/10 bg-white/70 p-6 sm:p-8">
        <p className="text-xl font-medium text-pine tracking-tight sm:text-2xl">
          {t('requestedTitle')}
        </p>
        <p className="max-w-2xl text-base text-pine tracking-tight">
          {t('requestedBody')}
        </p>
        <LinkButton
          href={calendlyHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          className="text-base tracking-tight"
          onClick={() =>
            trackFunnelEvent('consultation_booked', {
              meta: { path: pathname ?? undefined },
            })
          }
        >
          {t('bookSlot')}
        </LinkButton>
        <p className="text-base font-light text-pine/75 tracking-tight">{t('bookSlotHelper')}</p>
        {offer.sentAt && (
          <p className="text-base font-light text-pine/75 tracking-tight">
            {t('requestedOn', { date: formatDate(offer.sentAt) })}
          </p>
        )}
        {feedback}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-pine/10 bg-white/70 p-6 sm:p-8">
      {requestButton(t('primary'), requesting)}
      <p className="max-w-2xl text-base font-light text-pine/80 tracking-tight">
        {t('primaryHelper')}
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-base text-pine tracking-tight">{t('trustFree')}</p>
        <p className="text-base text-pine tracking-tight">{t('trustSubsidy')}</p>
        <a
          href={COMPANY_MAIN_PHONE_TEL_HREF}
          className="text-base text-pine underline underline-offset-2 tracking-tight hover:text-pine"
        >
          {t('trustPhone', { phone: COMPANY_MAIN_PHONE_DISPLAY })}
        </a>
      </div>
      {notes}
      {feedback}
    </div>
  )
}
