'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/services/admin.service'
import type { AdminLead, SalesRep } from '@/types/admin'

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD']

export default function AdminLeadDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const [lead, setLead] = useState<AdminLead | null>(null)
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    Promise.all([
      adminService.getLeadById(params.id as string),
      adminService.listSalesReps(),
    ])
      .then(([leadData, reps]) => {
        setLead(leadData)
        setNotes(leadData.notes || '')
        setSalesReps(reps)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const handleUpdate = async (data: Record<string, string | null>) => {
    if (!lead) return
    setSaving(true)
    try {
      const updated = await adminService.updateLead(lead.id, data)
      setLead(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E25]" />
      </div>
    )
  }

  if (!lead) {
    return <p className="text-[#062E25]/60">Lead not found.</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/admin/leads`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[#062E25]">
          {lead.customer.user.firstName} {lead.customer.user.lastName}
        </h1>
        <StatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Lead Info</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25]/60">Property Address</label>
                <p className="font-medium text-[#062E25]">{lead.propertyAddress}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Source</label>
                <p className="font-medium text-[#062E25]">{lead.source}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Interested Package</label>
                <p className="font-medium text-[#062E25]">{lead.interestedPackage || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Estimated Budget</label>
                <p className="font-medium text-[#062E25]">
                  {lead.estimatedBudget ? `CHF ${lead.estimatedBudget.toLocaleString('de-CH')}` : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Created</label>
                <p className="font-medium text-[#062E25]">
                  {new Date(lead.createdAt).toLocaleDateString('de-CH')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Manage</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25]/60 mb-1 block">Status</label>
                <Select
                  value={lead.status}
                  onValueChange={(v) => handleUpdate({ status: v })}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60 mb-1 block">Assigned To</label>
                <Select
                  value={lead.assignedTo?.id || ''}
                  onValueChange={(v) => handleUpdate({ assignedToId: v || null })}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {salesReps.map((rep) => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.firstName} {rep.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60 mb-1 block">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mb-2"
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdate({ notes })}
                  disabled={saving || notes === (lead.notes || '')}
                  className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Contact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-[#062E25]/60">Name</label>
                <p className="font-medium text-[#062E25]">
                  {lead.customer.user.firstName} {lead.customer.user.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Email</label>
                <p className="font-medium text-[#062E25]">{lead.customer.user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
