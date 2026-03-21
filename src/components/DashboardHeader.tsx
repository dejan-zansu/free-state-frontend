'use client'

import { Link } from '@/i18n/navigation'
import LogoDark from './icons/LogoDark'

export default function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#062E25]/10">
      <div className="max-w-360 mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center">
        <Link href="/" className="flex items-center">
          <LogoDark className="h-6 sm:h-7.25 w-auto" />
        </Link>
      </div>
    </header>
  )
}
