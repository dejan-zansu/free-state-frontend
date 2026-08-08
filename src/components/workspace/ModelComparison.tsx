'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

const ROWS = [
  {
    question: 'payTodayQuestion',
    direct: 'payTodayDirect',
    free: 'payTodayFree',
    abo: 'payTodayAbo',
  },
  { question: 'ownerQuestion', direct: 'ownerDirect', free: 'ownerFree', abo: 'ownerAbo' },
  {
    question: 'whenMineQuestion',
    direct: 'whenMineDirect',
    free: 'whenMineFree',
    abo: 'whenMineAbo',
  },
] as const

export function ModelComparison() {
  const t = useTranslations('dashboard.workspace.modelComparison')
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 text-base font-medium text-pine underline underline-offset-4 hover:text-pine/75"
      >
        {t('toggle')}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#062E25]/10 bg-white">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-[#062E25]/10">
                <th className="px-5 py-4" />
                <th className="px-5 py-4 text-base font-semibold text-pine">
                  {t('headerSolarDirect')}
                </th>
                <th className="px-5 py-4 text-base font-semibold text-pine">
                  {t('headerSolarFree')}
                </th>
                <th className="px-5 py-4 text-base font-semibold text-pine">
                  {t('headerSolarAbo')}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => (
                <tr
                  key={row.question}
                  className="border-b border-[#062E25]/10 last:border-b-0 align-top"
                >
                  <th scope="row" className="px-5 py-4 text-base font-medium text-pine">
                    {t(row.question)}
                  </th>
                  <td className="px-5 py-4 text-base text-pine">{t(row.direct)}</td>
                  <td className="px-5 py-4 text-base text-pine">{t(row.free)}</td>
                  <td className="px-5 py-4 text-base text-pine">{t(row.abo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
