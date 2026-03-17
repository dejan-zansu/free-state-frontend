'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminQuery } from '@/hooks/use-admin-query'
import { adminService } from '@/services/admin.service'
import type { AdminContract } from '@/types/admin'

export default function AdminContractsPage() {
  const locale = useLocale()
  const {
    data,
    isLoading,
    page,
    totalPages,
    total,
    setPage,
    setSearch,
    setFilter,
    filters,
  } = useAdminQuery<AdminContract>(adminService.listContracts.bind(adminService))

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">Contracts</h1>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder="Search by contract number, name..."
              className="max-w-xs"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={filters.status || ''} onValueChange={(v) => setFilter('status', v || undefined)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_SIGNATURE">Pending Signature</SelectItem>
                <SelectItem value="OTP_SENT">OTP Sent</SelectItem>
                <SelectItem value="SIGNED">Signed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.contractType || ''} onValueChange={(v) => setFilter('contractType', v || undefined)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="PRELIMINARY">Preliminary</SelectItem>
                <SelectItem value="FINAL">Final</SelectItem>
                <SelectItem value="AMENDMENT">Amendment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E25]" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm">{contract.contractNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {contract.customer.user.firstName} {contract.customer.user.lastName}
                          </p>
                          <p className="text-xs text-[#062E25]/50">{contract.customer.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={contract.contractType} /></TableCell>
                      <TableCell><StatusBadge status={contract.status} /></TableCell>
                      <TableCell>
                        {contract.signatureStatus
                          ? <StatusBadge status={contract.signatureStatus} />
                          : <span className="text-[#062E25]/30 text-sm">-</span>
                        }
                      </TableCell>
                      <TableCell className="text-sm">
                        {contract.netAmount
                          ? `CHF ${parseFloat(contract.netAmount).toLocaleString('de-CH')}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-[#062E25]/60 text-sm">
                        {new Date(contract.createdAt).toLocaleDateString('de-CH')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/admin/contracts/${contract.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[#062E25]/40">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/60">{total} total contracts</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#062E25]/60">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
