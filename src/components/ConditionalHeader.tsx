'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  const isAdminPage = pathname?.includes('/admin/')

  if (isAdminPage) {
    return null
  }

  return <Header />
}
