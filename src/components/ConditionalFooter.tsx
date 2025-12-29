'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

interface ConditionalFooterProps {
  locale: string
}

export default function ConditionalFooter({}: ConditionalFooterProps) {
  const pathname = usePathname()
  const isCalculatorPage = pathname?.includes('/calculator')

  if (isCalculatorPage) {
    return null
  }

  return <Footer />
}
