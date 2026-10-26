import type { ReactNode } from 'react'

export default function ResidentialLeadsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="sales-type-scale">{children}</div>
}
