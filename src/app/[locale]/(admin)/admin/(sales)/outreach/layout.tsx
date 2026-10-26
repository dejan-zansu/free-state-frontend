import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredCapability="outreach.manage">
      {children}
    </ProtectedRoute>
  )
}
