'use client'

import { ExternalLink } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import type { AdminLeadContract } from '@/types/admin'

import { fmtChf } from './format'

type Props = {
  contracts: AdminLeadContract[]
}

export function ContractsCard({ contracts }: Props) {
  const locale = useLocale()
  const t = useTranslations('admin.leads')

  if (contracts.length === 0) return null

  return (
    <Card className="border-[#062E25]/10 mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[#062E25] mb-4">
          {t('contractsTitle')}
        </h2>
        <div className="space-y-3">
          {contracts.map(contract => (
            <Link
              key={contract.id}
              href={`/${locale}/admin/contracts/${contract.id}`}
              className="flex items-center justify-between p-4 rounded-xl border border-[#062E25]/10 bg-white hover:bg-[#F5F7EE] transition-colors"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-[#062E25]">
                    {contract.contractNumber}
                  </p>
                  <StatusBadge status={contract.status} />
                </div>
                <p className="text-base text-[#062E25]/60 mt-1">
                  {t('contractCreatedOn', {
                    date: new Date(contract.createdAt).toLocaleDateString('de-CH'),
                  })}
                  {contract.customerSignedAt &&
                    ` · ${t('signedOn', {
                      date: new Date(
                        contract.customerSignedAt,
                      ).toLocaleDateString('de-CH'),
                    })}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {fmtChf(contract.netAmount)}
                </p>
                <ExternalLink className="h-4 w-4 text-[#062E25]/50" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
