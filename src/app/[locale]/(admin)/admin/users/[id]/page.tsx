'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminService } from '@/services/admin.service'
import type { AdminUserDetail } from '@/types/admin'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminService
      .getUserById(params.id as string)
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const handleUpdate = async (field: string, value: string) => {
    if (!user) return
    setSaving(true)
    try {
      const updated = await adminService.updateUser(user.id, { [field]: value })
      setUser((prev) => prev ? { ...prev, ...updated } : prev)
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

  if (!user) {
    return <p className="text-[#062E25]/60">User not found.</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/admin/users`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[#062E25]">
          {user.firstName} {user.lastName}
        </h1>
        <StatusBadge status={user.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Account Info</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25]/60">Email</label>
                <p className="font-medium text-[#062E25]">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Phone</label>
                <p className="font-medium text-[#062E25]">{user.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Email Verified</label>
                <p className="font-medium text-[#062E25]">{user.emailVerified ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Last Login</label>
                <p className="font-medium text-[#062E25]">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('de-CH') : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">Joined</label>
                <p className="font-medium text-[#062E25]">
                  {new Date(user.createdAt).toLocaleDateString('de-CH')}
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
                <label className="text-sm text-[#062E25]/60 mb-1 block">Role</label>
                <Select
                  value={user.role}
                  onValueChange={(v) => handleUpdate('role', v)}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="SALES_REP">Sales Rep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60 mb-1 block">Status</label>
                <Select
                  value={user.status}
                  onValueChange={(v) => handleUpdate('status', v)}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.customer && (
          <Card className="border-[#062E25]/10 lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">Customer Profile</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-[#062E25]/60">Company</label>
                  <p className="font-medium text-[#062E25]">{user.customer.companyName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">Street</label>
                  <p className="font-medium text-[#062E25]">{user.customer.street || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">City</label>
                  <p className="font-medium text-[#062E25]">{user.customer.city || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">Canton</label>
                  <p className="font-medium text-[#062E25]">{user.customer.canton || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-[#062E25]/10 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-2">Activity Summary</h2>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-[#062E25]">{user._count.assignedLeads}</p>
                <p className="text-sm text-[#062E25]/60">Assigned Leads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#062E25]">{user._count.createdQuotes}</p>
                <p className="text-sm text-[#062E25]/60">Created Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
