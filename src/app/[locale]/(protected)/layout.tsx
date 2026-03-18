'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute adminRedirect="/admin/dashboard">
      {children}
    </ProtectedRoute>
  )
}
