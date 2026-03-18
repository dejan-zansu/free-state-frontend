'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Card, CardContent } from '@/components/ui/card'
import { adminService } from '@/services/admin.service'
import type { AdminContract } from '@/types/admin'

export default function AdminContractDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('admin.contracts')
  const tc = useTranslations('admin.common')

  const { data: contract, isLoading } = useQuery<AdminContract>({
    queryKey: ['admin', 'contract', params.id],
    queryFn: () => adminService.getContractById(params.id as string),
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!contract) {
    return <p className="text-[#062E25]/60">{tc('notFound')}</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">
          {contract.contractNumber}
        </h1>
        <StatusBadge status={contract.status} />
        <StatusBadge status={contract.contractType} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('contractDetails')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('status')}</span>
                <StatusBadge status={contract.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('type')}</span>
                <StatusBadge status={contract.contractType} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('package')}</span>
                <span className="text-sm font-medium text-[#062E25]">
                  {contract.packageCode || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('language')}</span>
                <span className="text-sm font-medium text-[#062E25]">
                  {contract.language.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('created')}</span>
                <span className="text-sm font-medium text-[#062E25]">
                  {new Date(contract.createdAt).toLocaleDateString('de-CH')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('financials')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('grossAmount')}</span>
                <span className="text-sm font-medium text-[#062E25]">
                  {contract.grossAmount
                    ? `CHF ${parseFloat(contract.grossAmount).toLocaleString('de-CH')}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('subsidy')}</span>
                <span className="text-sm font-medium text-green-700">
                  {contract.subsidyAmount
                    ? `- CHF ${parseFloat(contract.subsidyAmount).toLocaleString('de-CH')}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#062E25]/10 pt-3">
                <span className="text-sm font-medium text-[#062E25]">{t('netAmount')}</span>
                <span className="text-sm font-bold text-[#062E25]">
                  {contract.netAmount
                    ? `CHF ${parseFloat(contract.netAmount).toLocaleString('de-CH')}`
                    : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('customer')}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-[#062E25]/60">{t('name')}</span>
                <p className="font-medium text-[#062E25]">
                  {contract.customer.user.firstName}{' '}
                  {contract.customer.user.lastName}
                </p>
              </div>
              <div>
                <span className="text-sm text-[#062E25]/60">{t('email')}</span>
                <p className="font-medium text-[#062E25]">
                  {contract.customer.user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('signatureStatus')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('signatureStatus')}</span>
                {contract.signatureStatus ? (
                  <StatusBadge status={contract.signatureStatus} />
                ) : (
                  <span className="text-sm text-[#062E25]/30">{t('notStarted')}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">{t('customerSigned')}</span>
                <span className="text-sm font-medium text-[#062E25]">
                  {contract.customerSignedAt
                    ? new Date(contract.customerSignedAt).toLocaleString('de-CH')
                    : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('project')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-[#062E25]/60">{t('property')}</span>
                <p className="font-medium text-[#062E25]">
                  {contract.project.propertyAddress}
                </p>
              </div>
              <div>
                <span className="text-sm text-[#062E25]/60">{t('projectStatus')}</span>
                <p>
                  <StatusBadge status={contract.project.status} />
                </p>
              </div>
              <div>
                <span className="text-sm text-[#062E25]/60">{t('package')}</span>
                <p className="font-medium text-[#062E25]">
                  {contract.project.selectedPackage || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
