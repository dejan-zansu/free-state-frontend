'use client'

import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { CARD_CLASS } from './leadUtils'

export function Pill({
  tone,
  icon,
  title,
  children,
}: {
  tone: string
  icon?: ReactNode
  title?: string
  children: ReactNode
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium sm:text-base',
        tone
      )}
    >
      {icon}
      {children}
    </span>
  )
}

export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-base text-[#062E25]/75">{label}</dt>
      <dd className="mt-0.5 break-words text-base font-medium text-[#062E25]">
        {children}
      </dd>
    </div>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const t = useTranslations('admin.salesLeads.detail')
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(t('toast.copied'))
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error(t('toast.copyFailed'))
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[#062E25]/60 transition-colors hover:bg-[#062E25]/5 hover:text-[#062E25] focus-visible:outline-2 focus-visible:outline-[#062E25]"
    >
      {copied ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  )
}

export function ContactLine({
  icon,
  href,
  value,
  copyLabel,
}: {
  icon: ReactNode
  href: string
  value: string
  copyLabel: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[#062E25]/60">{icon}</span>
      <a
        href={href}
        className="min-w-0 flex-1 break-all text-base font-medium text-[#062E25] hover:underline"
      >
        {value}
      </a>
      <CopyButton value={value} label={copyLabel} />
    </div>
  )
}

export function EmptyPanel({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Card className={cn(CARD_CLASS, 'mb-6')}>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="text-[#062E25]/40">{icon}</span>
        <p className="max-w-md text-base text-[#062E25]/75">{children}</p>
      </CardContent>
    </Card>
  )
}

export function usePackageLabel() {
  const tLeads = useTranslations('admin.leads')
  return (code: string | null | undefined) => {
    if (!code) return '-'
    const lower = code.toLowerCase()
    if (tLeads.has(`packages.${code}`)) return tLeads(`packages.${code}`)
    if (tLeads.has(`packages.${lower}`)) return tLeads(`packages.${lower}`)
    const words = lower.replace(/_/g, ' ')
    return words.charAt(0).toUpperCase() + words.slice(1)
  }
}
