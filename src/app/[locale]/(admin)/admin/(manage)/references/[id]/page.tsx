'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { ReferenceForm } from '@/components/admin/ReferenceForm'
import { adminService } from '@/services/admin.service'
import type { AdminReference } from '@/types/admin'

export default function AdminReferenceEditPage() {
  const params = useParams()

  const { data: reference, isLoading } = useQuery<AdminReference>({
    queryKey: ['admin', 'references', params.id],
    queryFn: () => adminService.getReferenceById(params.id as string),
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!reference) {
    return <p className="text-[#062E25]">Reference not found.</p>
  }

  return <ReferenceForm reference={reference} />
}
