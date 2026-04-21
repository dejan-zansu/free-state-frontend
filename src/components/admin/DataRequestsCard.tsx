'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { dataRequestService } from '@/services/data-request.service'
import { NewDataRequestDialog } from '@/components/admin/NewDataRequestDialog'
import type { DataRequest } from '@/types/data-request'

interface Props {
  contractId: string
  canCreate: boolean
}

export function DataRequestsCard({ contractId, canCreate }: Props) {
  const locale = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: requests = [], isLoading } = useQuery<DataRequest[]>({
    queryKey: ['admin', 'data-requests', 'contract', contractId],
    queryFn: () => dataRequestService.adminListForContract(contractId),
  })

  return (
    <Card className="border-[#062E25]/10 lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#062E25]">Data requests</h2>
          {canCreate && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> New request
            </Button>
          )}
        </div>

        {!canCreate && (
          <p className="text-sm text-[#062E25]/60">
            Data requests become available after the contract is signed.
          </p>
        )}

        {canCreate && isLoading && (
          <p className="text-sm text-[#062E25]/60">Loading…</p>
        )}

        {canCreate && !isLoading && requests.length === 0 && (
          <p className="text-sm text-[#062E25]/60">No requests yet.</p>
        )}

        {canCreate && requests.length > 0 && (
          <div className="space-y-2">
            {requests.map(r => (
              <Link
                key={r.id}
                href={`/${locale}/admin/contracts/${contractId}/data-requests/${r.id}`}
                className="flex items-center justify-between px-4 py-3 border border-[#062E25]/10 rounded-lg hover:bg-[#062E25]/5"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#062E25]">{r.title}</span>
                  <span className="text-sm text-[#062E25]/50">
                    {new Date(r.createdAt).toLocaleDateString('de-CH')}
                    {r.dueDate && ` · due ${new Date(r.dueDate).toLocaleDateString('de-CH')}`}
                    {r.submittedAt &&
                      ` · submitted ${new Date(r.submittedAt).toLocaleDateString('de-CH')}`}
                  </span>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        )}

        {canCreate && (
          <NewDataRequestDialog
            contractId={contractId}
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
          />
        )}
      </CardContent>
    </Card>
  )
}
