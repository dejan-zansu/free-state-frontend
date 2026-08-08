'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Download } from 'lucide-react'

import { OfferCta } from '@/components/workspace/OfferCta'
import { linkButtonVariants } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'
import { contractService } from '@/services/contract.service'
import type { WorkspacePayload } from '@/services/customer-portal.service'

function SignedCard({ contractId, contractNumber }: { contractId: string; contractNumber: string }) {
  const t = useTranslations('dashboard.workspace.sign')

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-green-200 bg-green-50/70 p-8 text-center sm:p-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-7 w-7 text-green-700" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-medium text-pine tracking-tight">{t('signedTitle')}</h2>
        <p className="text-base text-pine">{contractNumber}</p>
      </div>
      <button
        type="button"
        onClick={() => contractService.downloadPdf(contractId, true)}
        className={cn(linkButtonVariants({ variant: 'primary' }), 'text-base tracking-tight')}
      >
        {t('downloadContract')}
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#062E25]">
          <Download className="h-4 w-4 text-white" aria-hidden />
        </div>
      </button>
    </div>
  )
}

export function WorkspaceNextStep({
  data,
  onRefresh,
}: {
  data: WorkspacePayload
  onRefresh: () => Promise<void>
}) {
  const tStatus = useTranslations('dashboard.status')

  const signed = data.conversionStatus === 'contract_signed' && data.contract != null

  return (
    <section className="space-y-8">
      <p className="max-w-2xl text-base text-pine tracking-tight">
        {tStatus(data.conversionStatus)}
        {data.contract
          ? ` ${tStatus('contractNumber', { number: data.contract.contractNumber })}`
          : ''}
      </p>

      {signed && data.contract ? (
        <SignedCard contractId={data.contract.id} contractNumber={data.contract.contractNumber} />
      ) : (
        <OfferCta data={data} onRefresh={onRefresh} />
      )}
    </section>
  )
}
