'use client'

import { useEffect, useState } from 'react'
import { FileSignature, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { customerPortalService, type ContractSummary } from '@/services/customer-portal.service'

const STATUS_BADGE: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  PENDING: { label: 'Pending Signature', color: 'bg-amber-100 text-amber-700', icon: Clock },
  SIGNED: { label: 'Signed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-600', icon: AlertCircle },
}

export default function ContractPage() {
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    customerPortalService
      .getContracts()
      .then(setContracts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E25]" />
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-[#062E25] mb-8">My Contract</h1>
        <Card className="border-[#062E25]/10">
          <CardContent className="p-8 text-center">
            <FileSignature className="h-12 w-12 text-[#062E25]/20 mx-auto mb-4" />
            <p className="text-[#062E25]/60 mb-2">No contracts yet.</p>
            <p className="text-sm text-[#062E25]/40">
              Complete the solar calculator and choose to sign a contract to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-8">My Contract</h1>

      <div className="space-y-6">
        {contracts.map((contract) => {
          const badge = STATUS_BADGE[contract.signatureStatus] || STATUS_BADGE.PENDING
          const BadgeIcon = badge.icon

          return (
            <Card key={contract.id} className="border-[#062E25]/10">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-semibold text-[#062E25]">
                        {contract.contractNumber}
                      </h2>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        <BadgeIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#062E25]/60">{contract.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6">
                  <div>
                    <p className="text-[#062E25]/60">Type</p>
                    <p className="font-medium text-[#062E25]">{contract.contractType}</p>
                  </div>
                  <div>
                    <p className="text-[#062E25]/60">Created</p>
                    <p className="font-medium text-[#062E25]">
                      {new Date(contract.createdAt).toLocaleDateString('de-CH')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#062E25]/60">Valid Until</p>
                    <p className="font-medium text-[#062E25]">
                      {contract.validUntil
                        ? new Date(contract.validUntil).toLocaleDateString('de-CH')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#062E25]/60">Signed</p>
                    <p className="font-medium text-[#062E25]">
                      {contract.customerSignedAt
                        ? new Date(contract.customerSignedAt).toLocaleDateString('de-CH')
                        : 'Not yet'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {contract.unsignedPdfUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ borderColor: '#062E25', color: '#062E25' }}
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}/pdf`, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Contract
                    </Button>
                  )}
                  {contract.signedPdfUrl && (
                    <Button
                      size="sm"
                      className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}/pdf?signed=true`, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Signed Contract
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
