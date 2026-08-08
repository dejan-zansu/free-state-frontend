'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { EyebrowPill } from '@/components/ui/eyebrow-pill'
import { kwp } from '@/lib/format-chf'
import type { WorkspacePayload } from '@/services/customer-portal.service'

const MIN_ROOF_IMAGE_PX = 32

function HeroBand({ address, badge }: { address: string; badge: string | null }) {
  return (
    <div className="relative rounded-[24px] overflow-hidden bg-pine px-5 sm:px-8 py-12 sm:py-16">
      {badge && (
        <span className="inline-flex">
          <EyebrowPill>{badge}</EyebrowPill>
        </span>
      )}
      <p className="mt-6 text-base sm:text-xl font-medium text-white">{address}</p>
    </div>
  )
}

function RoofHero({
  url,
  address,
  badge,
}: {
  url: string
  address: string
  badge: string | null
}) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return <HeroBand address={address} badge={badge} />
  }

  return (
    <div className="relative w-full h-[340px] sm:h-[440px] rounded-[24px] overflow-hidden">
      <Image
        src={url}
        alt={address}
        fill
        sizes="100vw"
        className="object-cover"
        priority
        unoptimized
        onError={() => setBroken(true)}
        onLoad={(event) => {
          const img = event.currentTarget
          if (img.naturalWidth < MIN_ROOF_IMAGE_PX || img.naturalHeight < MIN_ROOF_IMAGE_PX) {
            setBroken(true)
          }
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-pine/40 to-transparent pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-pine/85 to-transparent pointer-events-none"
      />
      {badge && (
        <span className="absolute top-5 left-5 z-10">
          <EyebrowPill>{badge}</EyebrowPill>
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 px-5 sm:px-8 pb-6 sm:pb-8">
        <p className="text-base sm:text-xl font-medium text-white">{address}</p>
      </div>
    </div>
  )
}

export function WorkspaceHero({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace.hero')

  const calc = data.calculation
  const badge = calc.systemSizeKwp > 0 ? t('sizeBadge', { kwp: kwp(calc.systemSizeKwp) }) : null

  return calc.roofImageUrl ? (
    <RoofHero
      key={calc.roofImageUrl}
      url={calc.roofImageUrl}
      address={data.project.address}
      badge={badge}
    />
  ) : (
    <HeroBand address={data.project.address} badge={badge} />
  )
}
