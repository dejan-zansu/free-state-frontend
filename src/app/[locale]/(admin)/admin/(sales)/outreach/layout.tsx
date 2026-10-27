import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute
      requiredCapability="outreach.manage"
      deniedRedirect="/admin/residential-leads"
    >
      {children}
    </ProtectedRoute>
  )
}
