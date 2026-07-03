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
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
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

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-50 print:hidden">
      {open && (
        <div
          role="dialog"
          aria-label={t('title')}
          className="mb-3 w-[320px] max-w-[calc(100vw-3rem)] rounded-2xl border border-glass-border bg-white/80 backdrop-blur-md shadow-[0_25px_34px_0_rgba(6,46,37,0.15)] p-5"
        >
          <div className="flex items-start gap-3">
            <Image
              src={advisor.image}
              alt={name}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover object-top bg-sage"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-deep">
                {t('eyebrow')}
              </p>
              <p className="text-base font-semibold text-pine truncate">{name}</p>
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
            <a href={`tel:${advisor.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1 hover:text-pine">
              <Phone className="h-3.5 w-3.5" /> {t('call')}
            </a>
            <a href={`mailto:${advisor.email}`} className="inline-flex items-center gap-1 hover:text-pine">
              <Mail className="h-3.5 w-3.5" /> {t('email')}
            </a>
          </div>
        </div>
      )}

      <button
        aria-label={t('open')}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-2 rounded-full bg-pine text-white shadow-lg shadow-pine/25 transition-all hover:bg-pine/90',
          'pl-2 pr-4 py-2',
        )}
      >
        <Image
          src={advisor.image}
          alt={name}
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover object-top bg-sage/40"
        />
        <span className="text-sm font-semibold">{t('open')}</span>
      </button>
    </div>
  )
}
