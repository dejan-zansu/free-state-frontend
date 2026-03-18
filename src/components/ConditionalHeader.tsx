'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

const HIDDEN_PATTERNS = ['/admin/', '/login', '/anmelden', '/register', '/registrieren', '/set-password', '/passwort-setzen', '/forgot-password', '/passwort-vergessen', '/verify-email', '/email-verifizieren']

export default function ConditionalHeader() {
  const pathname = usePathname()

  if (pathname && HIDDEN_PATTERNS.some(p => pathname.includes(p))) {
    return null
  }

  return <Header />
}
