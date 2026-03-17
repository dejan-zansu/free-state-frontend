'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { adminService } from '@/services/admin.service'
import type { AdminContract } from '@/types/admin'

export default function AdminContractDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const [contract, setContract] = useState<AdminContract | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService
      .getContractById(params.id as string)
      .then(setContract)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E25]" />
      </div>
    )
  }

  if (!contract) {
    return <p className="text-[#062E25]/60">Contract not found.</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/admin/contracts`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[#062E25]">{contract.contractNumber}</h1>
        <StatusBadge status={contract.status} />
        <StatusBadge status={contract.contractType} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Contract Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Status</span>
                <StatusBadge status={contract.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Type</span>
                <StatusBadge status={contract.contractType} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Package</span>
                <span className="text-sm font-medium text-[#062E25]">{contract.packageCode || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Language</span>
                <span className="text-sm font-medium text-[#062E25]">{contract.language.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Created</span>
                <span className="text-sm font-medium text-[#062E25]">
                  {new Date(contract.createdAt).toLocaleDateString('de-CH')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Financials</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Gross Amount</span>
                <span className="text-sm font-medium text-[#062E25]">
                  {contract.grossAmount ? `CHF ${parseFloat(contract.grossAmount).toLocaleString('de-CH')}` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Subsidy</span>
                <span className="text-sm font-medium text-green-700">
                  {contract.subsidyAmount ? `- CHF ${parseFloat(contract.subsidyAmount).toLocaleString('de-CH')}` : '-'}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#062E25]/10 pt-3">
                <span className="text-sm font-medium text-[#062E25]">Net Amount</span>
                <span className="text-sm font-bold text-[#062E25]">
                  {contract.netAmount ? `CHF ${parseFloat(contract.netAmount).toLocaleString('de-CH')}` : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-[#062E25]/60">Name</span>
                <p className="font-medium text-[#062E25]">
                  {contract.customer.user.firstName} {contract.customer.user.lastName}
                </p>
              </div>
              <div>
                <span className="text-sm text-[#062E25]/60">Email</span>
                <p className="font-medium text-[#062E25]">{contract.customer.user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Signature</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Signature Status</span>
                {contract.signatureStatus
                  ? <StatusBadge status={contract.signatureStatus} />
                  : <span className="text-sm text-[#062E25]/30">Not started</span>
                }
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#062E25]/60">Customer Signed</span>
                <span className="text-sm font-medium text-[#062E25]">
                  {contract.customerSignedAt
                    ? new Date(contract.customerSignedAt).toLocaleString('de-CH')
                    : '-'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Project</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-[#062E25]/60">Property</span>
                <p className="font-medium text-[#062E25]">{contract.project.propertyAddress}</p>
              </div>
              <div>
                <span className="text-sm text-[#062E25]/60">Project Status</span>
                <p><StatusBadge status={contract.project.status} /></p>
              </div>
              <div>
                <span className="text-sm text-[#062E25]/60">Package</span>
                <p className="font-medium text-[#062E25]">{contract.project.selectedPackage || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
