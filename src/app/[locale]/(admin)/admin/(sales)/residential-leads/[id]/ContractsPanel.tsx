'use client'

import { useTranslations } from 'next-intl'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { ContractsCard } from '@/components/admin/calculation/ContractsCard'
import { fmtChf } from '@/components/admin/calculation/format'
import { Card, CardContent } from '@/components/ui/card'
import { useHasCapability } from '@/lib/capabilities'
import { formatDate } from '@/lib/sales-lead'
import { cn } from '@/lib/utils'
import type { AdminLeadContract } from '@/types/admin'

import { CARD_CLASS } from './leadUtils'

export function ContractsPanel({
  contracts,
}: {
  contracts: AdminLeadContract[]
}) {
  const t = useTranslations('admin.leads')
  const canOpenContracts = useHasCapability('users.manage')

  if (contracts.length === 0) return null
  if (canOpenContracts) {
    return (
      <div className="sm:[&_.text-sm]:text-base">
        <ContractsCard contracts={contracts} />
      </div>
    )
  }

  return (
    <Card className={cn(CARD_CLASS, 'mb-6')}>
      <CardContent className="p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#062E25]">
          {t('contractsTitle')}
        </h2>
        <ul className="grid gap-3">
          {contracts.map(contract => (
            <li
              key={contract.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#062E25]/10 p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-[#062E25]">
                    {contract.contractNumber}
                  </p>
                  <StatusBadge
                    status={contract.status}
                    className="px-3 text-sm sm:text-base"
                  />
                </div>
                <p className="mt-1 text-base text-[#062E25]/75">
                  {t('contractCreatedOn', {
                    date: formatDate(contract.createdAt),
                  })}
                  {contract.customerSignedAt &&
                    ` · ${t('signedOn', {
                      date: formatDate(contract.customerSignedAt),
                    })}`}
                </p>
              </div>
              <p className="text-base font-semibold tabular-nums text-[#062E25]">
                {fmtChf(contract.netAmount)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
