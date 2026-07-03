'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, Mail, Send } from 'lucide-react'

import { ActionRow } from '@/components/ui/action-row'
import { SectionHeader } from '@/components/ui/section-header'
import { customerPortalService, type WorkspacePayload } from '@/services/customer-portal.service'
import { residentialCalculatorService } from '@/services/residential-calculator.service'

const CONTRACT_STATUS_KEYS = [
  'DRAFT',
  'PENDING_SIGNATURE',
  'OTP_SENT',
  'SIGNED',
  'CANCELLED',
  'EXPIRED',
]

export function WorkspaceActions({
  data,
  onRefresh,
}: {
  data: WorkspacePayload
  onRefresh: () => Promise<void>
}) {
  const t = useTranslations('dashboard.workspace')
  const [downloading, setDownloading] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [emailDone, setEmailDone] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      await customerPortalService.downloadProjectReport(data.project.id)
    } catch {
      setError(t('actions.actionError'))
    } finally {
      setDownloading(false)
    }
  }

  const handleEmail = async () => {
    setEmailing(true)
    setError(null)
    try {
      await residentialCalculatorService.emailReport({ projectId: data.project.id })
      setEmailDone(true)
      setTimeout(() => setEmailDone(false), 3000)
    } catch {
      setError(t('actions.actionError'))
    } finally {
      setEmailing(false)
    }
  }

  const handleRequestOffer = async () => {
    setRequesting(true)
    setError(null)
    try {
      await residentialCalculatorService.requestOffer({ projectId: data.project.id })
      await onRefresh()
    } catch {
      setError(t('actions.actionError'))
    } finally {
      setRequesting(false)
    }
  }

  const offerActionable = data.conversionStatus === 'calculation_complete'
  const offerRequestedSubtitle = data.offerRequestedAt
    ? t('actions.offerRequestedOn', {
        date: new Date(data.offerRequestedAt).toLocaleDateString('de-CH'),
      })
    : t('actions.offerSubtitle')
  const contractSigned = data.contract?.signatureStatus === 'SIGNED'
  const contractCancelled = data.contract?.status === 'CANCELLED'
  const contractStatusLabel = data.contract
    ? CONTRACT_STATUS_KEYS.includes(data.contract.status)
      ? t(`contractStatus.${data.contract.status}`)
      : data.contract.status
    : ''

  return (
    <section className="space-y-4">
      <SectionHeader title={t('actionsTitle')} />

      {data.contract && (
        <div className="flex flex-col gap-2 rounded-xl border border-pine/10 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-pine/60">{t('actions.contractTitle')}</p>
              <p className="text-base font-medium text-pine">{data.contract.contractNumber}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
                contractCancelled
                  ? 'bg-gray-100 text-gray-600'
                  : contractSigned
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              {contractStatusLabel}
            </span>
          </div>
          {data.contract.validUntil && (
            <p className="text-sm text-pine/60">
              {t('actions.validUntil', {
                date: new Date(data.contract.validUntil).toLocaleDateString('de-CH'),
              })}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <ActionRow
          icon={<Download className="h-5 w-5" />}
          title={t('actions.downloadTitle')}
          subtitle={t('actions.downloadSubtitle')}
          buttonLabel={t('actions.downloadButton')}
          onClick={() => void handleDownload()}
          loading={downloading}
          disabled={downloading}
        />
        <ActionRow
          icon={<Mail className="h-5 w-5" />}
          title={t('actions.emailTitle')}
          subtitle={t('actions.emailSubtitle')}
          buttonLabel={emailDone ? t('actions.emailSent') : t('actions.emailButton')}
          onClick={() => void handleEmail()}
          loading={emailing}
          done={emailDone}
          disabled={emailing || emailDone}
        />
        {offerActionable ? (
          <ActionRow
            icon={<Send className="h-5 w-5" />}
            title={t('actions.offerTitle')}
            subtitle={t('actions.offerSubtitle')}
            buttonLabel={t('actions.offerButton')}
            onClick={() => void handleRequestOffer()}
            loading={requesting}
            disabled={requesting}
          />
        ) : (
          <ActionRow
            icon={<Send className="h-5 w-5" />}
            title={t('actions.offerTitle')}
            subtitle={offerRequestedSubtitle}
            buttonLabel={t('actions.offerButton')}
            onClick={() => {}}
            done
            disabled
          />
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-700">
          {error}
        </p>
      )}
    </section>
  )
}
