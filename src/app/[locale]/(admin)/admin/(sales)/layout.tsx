import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredCapability="sales.tools">{children}</ProtectedRoute>
  )
}
