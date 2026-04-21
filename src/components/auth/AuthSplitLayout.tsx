'use client'

import { AlertTriangle, Check } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'

const HERO_IMAGE = '/images/battery-storage/roof-with-panels-sunny-day.png'

type AuthSplitLayoutProps = {
  children: ReactNode
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1">
      {' '}
      <div className="relative hidden min-h-0 lg:block lg:w-1/2">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          className="object-cover"
          priority
          quality={100}
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/15 via-black/5 to-transparent" />
      </div>
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2 lg:p-12">
        {children}
      </div>
    </div>
  )
}

export function AuthSuccessMark() {
  return (
    <div
      className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-[0_8px_24px_-4px_rgba(5,150,105,0.45)]"
      aria-hidden
    >
      <Check
        className="h-[1.65rem] w-[1.65rem] text-white"
        strokeWidth={2.75}
      />
    </div>
  )
}

export function AuthErrorMark() {
  return (
    <div
      className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 shadow-[0_8px_24px_-4px_rgba(220,38,38,0.4)]"
      aria-hidden
    >
      <AlertTriangle
        className="h-[1.35rem] w-[1.35rem] text-white"
        strokeWidth={2.5}
      />
    </div>
  )
}
