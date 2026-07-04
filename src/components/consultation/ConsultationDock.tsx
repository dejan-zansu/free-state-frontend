'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { X, Phone, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useUser } from '@/stores/auth.store'
import { getAdvisor } from '@/lib/advisor'
import { LinkButton } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'

export default function ConsultationDock() {
  const user = useUser()
  const advisor = getAdvisor(user?.id)
  const t = useTranslations('dashboard.consultation')
  const tTeam = useTranslations('team.grid')
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const name = tTeam(`${advisor.key}.name`)
  const role = tTeam(`${advisor.key}.role`)
  const firstName = name.split(' ')[0]

  if (hidden) return null

  return (
    <div
      ref={rootRef}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-10 z-50 flex flex-col items-end print:hidden"
    >
      {open && (
        <div
          role="dialog"
          aria-label={t('title')}
          className="mb-3 w-[300px] sm:w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-glass-border bg-white/80 backdrop-blur-md shadow-[0_25px_34px_0_rgba(6,46,37,0.15)] p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <Image
              src={advisor.image}
              alt={name}
              width={64}
              height={64}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover object-top bg-sage"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-deep">
                {t('eyebrow')}
              </p>
              <p className="text-base font-semibold text-pine truncate">
                {name}
              </p>
              <p className="text-sm text-pine/60 truncate">{role}</p>
            </div>
            <button
              aria-label={t('close')}
              onClick={() => setOpen(false)}
              className="ml-auto text-pine/50 hover:text-pine"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-base text-pine/70">{t('subtitle')}</p>
          <LinkButton
            href={advisor.calendlyUrl}
            target="_blank"
            variant="tertiary"
            className="mt-4 w-full justify-center"
          >
            {t('cta')}
          </LinkButton>
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-pine/60">
            <a
              href={`tel:${advisor.phone.replace(/[^+\d]/g, '')}`}
              className="inline-flex items-center gap-1 hover:text-pine"
            >
              <Phone className="h-3.5 w-3.5" /> {t('call')}
            </a>
            <a
              href={`mailto:${advisor.email}`}
              className="inline-flex items-center gap-1 hover:text-pine"
            >
              <Mail className="h-3.5 w-3.5" /> {t('email')}
            </a>
          </div>
        </div>
      )}

      <div
        className={cn(
          'relative rounded-full bg-pine text-white shadow-lg shadow-pine/25'
        )}
      >
        <button
          aria-label={t('open', { name: firstName })}
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 sm:gap-2.5 rounded-full pl-2 pr-9 py-2 sm:pl-2.5 sm:pr-10 sm:py-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src={advisor.image}
            alt={name}
            width={48}
            height={48}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover object-top bg-sage/40"
          />
          <span className="text-sm sm:text-base font-semibold whitespace-nowrap">
            {t('open', { name: firstName })}
          </span>
        </button>
        {!open && (
          <button
            aria-label={t('dismiss')}
            onClick={() => setHidden(true)}
            className="absolute top-1.5 right-4 flex h-5 w-5 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
