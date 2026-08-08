'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { X, Phone, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { getStickyAdvisor } from '@/lib/advisor'
import { type ConsultationAdvisor } from '@/lib/company-contact'
import { LinkButton } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'
import { useUser } from '@/stores/auth.store'

export default function ConsultationDock() {
  const t = useTranslations('dashboard.consultation')
  const tTeam = useTranslations('team.grid')
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [advisor, setAdvisor] = useState<ConsultationAdvisor | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const user = useUser()
  const inCalculatorFlow = pathname?.endsWith('/calculator') ?? false
  const onProjectWorkspace = pathname?.includes('/dashboard/project/') ?? false
  const [embedInView, setEmbedInView] = useState(false)

  useEffect(() => {
    setAdvisor(getStickyAdvisor())
  }, [])

  useEffect(() => {
    if (inCalculatorFlow) {
      setEmbedInView(false)
      return
    }
    let observer: IntersectionObserver | null = null
    let retryTimer: number | null = null
    const attach = () => {
      const embedEl = document.querySelector('[data-calculator-embed]')
      if (!embedEl) return false
      observer = new IntersectionObserver(entries => {
        setEmbedInView(entries.some(entry => entry.isIntersecting))
      })
      observer.observe(embedEl)
      return true
    }
    if (!attach()) {
      retryTimer = window.setTimeout(() => {
        attach()
      }, 1000)
    }
    return () => {
      observer?.disconnect()
      if (retryTimer !== null) window.clearTimeout(retryTimer)
      setEmbedInView(false)
    }
  }, [pathname, inCalculatorFlow])

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

  if (hidden || onProjectWorkspace || !advisor) return null

  const name = tTeam(`${advisor.key}.name`)
  const role = tTeam(`${advisor.key}.role`)
  const firstName = name.split(' ')[0]
  const calendlyHref = user?.id
    ? `${advisor.calendlyUrl}${advisor.calendlyUrl.includes('?') ? '&' : '?'}utm_content=${encodeURIComponent(user.id)}`
    : advisor.calendlyUrl

  return (
    <div
      ref={rootRef}
      className={cn(
        'fixed right-4 sm:right-10 z-50 flex items-end print:hidden',
        inCalculatorFlow
          ? 'hidden sm:flex sm:bottom-auto sm:top-[14px] sm:flex-col-reverse'
          : 'bottom-4 sm:bottom-6 flex-col',
        !inCalculatorFlow && embedInView && 'hidden sm:flex'
      )}
    >
      {open && (
        <div
          role="dialog"
          aria-label={t('title')}
          className={cn(
            'w-[300px] sm:w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-glass-border bg-white/80 backdrop-blur-md shadow-[0_25px_34px_0_rgba(6,46,37,0.15)] p-5 sm:p-6',
            inCalculatorFlow ? 'mb-3 sm:mb-0 sm:mt-3' : 'mb-3'
          )}
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
              <p className="text-sm text-pine/75 truncate">{role}</p>
            </div>
            <button
              aria-label={t('close')}
              onClick={() => setOpen(false)}
              className="ml-auto text-pine/50 hover:text-pine"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-base text-pine">{t('subtitle')}</p>
          <LinkButton
            href={calendlyHref}
            target="_blank"
            variant="tertiary"
            className="mt-4 w-full justify-center"
            onClick={() =>
              trackFunnelEvent('consultation_booked', {
                meta: { advisor: advisor.key, path: pathname ?? undefined },
              })
            }
          >
            {t('cta')}
          </LinkButton>
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-pine/75">
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
          className={cn(
            'flex items-center rounded-full transition-opacity hover:opacity-90',
            inCalculatorFlow
              ? 'gap-2 pl-2 pr-9 py-1.5'
              : 'gap-2 sm:gap-2.5 pl-2 pr-9 py-2 sm:pl-2.5 sm:pr-10 sm:py-2.5'
          )}
        >
          <Image
            src={advisor.image}
            alt={name}
            width={48}
            height={48}
            className={cn(
              'rounded-full object-cover object-top bg-sage/40',
              inCalculatorFlow ? 'h-9 w-9' : 'h-10 w-10 sm:h-12 sm:w-12'
            )}
          />
          <span
            className={cn(
              'font-semibold whitespace-nowrap',
              'text-sm sm:text-base'
            )}
          >
            {t('open', { name: firstName })}
          </span>
        </button>
        {!open && (
          <button
            aria-label={t('dismiss')}
            onClick={() => setHidden(true)}
            className={cn(
              'absolute flex h-5 w-5 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white',
              inCalculatorFlow ? 'top-1 right-3.5' : 'top-1.5 right-4'
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
