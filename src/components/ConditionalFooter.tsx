'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

interface ConditionalFooterProps {
  locale: string
}

const HIDDEN_PATTERNS = ['/admin/', '/dashboard', '/calculator', '/login', '/anmelden', '/register', '/registrieren', '/set-password', '/passwort-setzen', '/forgot-password', '/passwort-vergessen', '/verify-email', '/email-verifizieren']

export default function ConditionalFooter({}: ConditionalFooterProps) {
  const pathname = usePathname()

  if (pathname && HIDDEN_PATTERNS.some(p => pathname.includes(p))) {
    return null
  }

  return <Footer />
}
