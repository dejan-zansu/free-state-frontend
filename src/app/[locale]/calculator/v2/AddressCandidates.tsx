'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

import type { AddressCandidate } from '@/lib/address/resolve-address'
import { cn } from '@/lib/utils'

export default function AddressCandidates({
  candidates,
  headingAs: Heading = 'h2',
  onPick,
  onNone,
}: {
  candidates: AddressCandidate[]
  headingAs?: 'h2' | 'h4'
  onPick: (candidate: AddressCandidate) => void
  onNone: () => void
}) {
  const t = useTranslations('calculatorV2.screen1.candidates')
  const panelRef = useRef<HTMLDivElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    panelRef.current?.scrollIntoView({ block: 'nearest' })
  }, [])

  return (
    <div
      ref={panelRef}
      data-hj-suppress
      data-cs-mask
      className="mt-4 rounded-2xl border border-[#062E25]/15 bg-white p-4 shadow-sm"
    >
      <Heading
        ref={headingRef}
        tabIndex={-1}
        className="text-lg font-medium text-[#062E25] outline-none"
      >
        {candidates.length === 1 ? t('titleOne') : t('title')}
      </Heading>
      <ul className="mt-3 flex flex-col gap-2">
        {candidates.map(candidate => (
          <li key={candidate.row.featureId || candidate.label}>
            <button
              type="button"
              onClick={() => onPick(candidate)}
              className="flex min-h-12 w-full items-center rounded-xl border border-[#062E25]/20 bg-white px-4 py-2 text-left text-base text-[#062E25] hover:border-[#062E25]/40 hover:bg-[#062E25]/5"
            >
              {candidate.label}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onNone}
            className="flex min-h-12 w-full items-center rounded-xl px-4 py-2 text-left text-base text-[#062E25] underline underline-offset-2 hover:bg-[#062E25]/5"
          >
            {t('none')}
          </button>
        </li>
      </ul>
      <p className="mt-3 text-base text-[#062E25]/70">{t('attribution')}</p>
    </div>
  )
}

export function FederalAddressList({
  id,
  options,
  activeIndex,
  onPick,
}: {
  id: string
  options: AddressCandidate[]
  activeIndex: number
  onPick: (candidate: AddressCandidate) => void
}) {
  const t = useTranslations('calculatorV2.screen1.candidates')

  return (
    <div
      data-hj-suppress
      data-cs-mask
      className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-[#062E25]/15 bg-white py-2 shadow-lg"
    >
      <ul id={id} role="listbox" className="max-h-72 overflow-auto">
        {options.map((option, index) => (
          <li
            key={option.row.featureId || option.label}
            id={`${id}-opt-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            onMouseDown={event => event.preventDefault()}
            onClick={() => onPick(option)}
            className={cn(
              'flex min-h-11 cursor-pointer items-center px-4 py-2 text-left text-base text-[#062E25]',
              index === activeIndex ? 'bg-[#062E25]/10' : 'hover:bg-[#062E25]/5'
            )}
          >
            {option.label}
          </li>
        ))}
      </ul>
      <p className="px-4 pt-1 text-base text-[#062E25]/70">
        {t('attribution')}
      </p>
    </div>
  )
}
