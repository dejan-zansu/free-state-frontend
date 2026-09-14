import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredCapability="users.manage">
      {children}
    </ProtectedRoute>
  )
}
