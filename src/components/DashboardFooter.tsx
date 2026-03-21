'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function DashboardFooter() {
  const locale = useLocale()

  return (
    <footer className="border-t border-[#062E25]/10 bg-white/60 backdrop-blur-sm">
      <div className="max-w-360 mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[#062E25]/60">
        <p>&copy; {new Date().getFullYear()} Free State AG</p>
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/privacy`} className="hover:text-[#062E25] transition-colors">
            Privacy
          </Link>
          <Link href={`/${locale}/imprint`} className="hover:text-[#062E25] transition-colors">
            Imprint
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-[#062E25] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
