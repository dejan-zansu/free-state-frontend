'use client'

import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type LeadTabValue =
  | 'verlauf'
  | 'dach'
  | 'eigentum'
  | 'firma'
  | 'brief'
  | 'protokoll'

const TAB_VALUES: LeadTabValue[] = [
  'verlauf',
  'dach',
  'eigentum',
  'firma',
  'brief',
  'protokoll',
]

const TAB_TRIGGER_CLASS =
  'h-auto flex-none rounded-none border-0 border-b-2 px-4 py-3 text-base text-[#062E25]/75 shadow-none data-[state=active]:border-[#062E25] data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[#062E25] data-[state=active]:shadow-none'

function TabCount({ value }: { value: number }) {
  if (value <= 0) return null
  return (
    <span className="rounded-full bg-[#062E25]/10 px-2 font-medium text-[#062E25]">
      {value}
    </span>
  )
}

export function LeadTabs({
  value,
  onValueChange,
  counts,
  panels,
}: {
  value: LeadTabValue
  onValueChange: (value: LeadTabValue) => void
  counts: Partial<Record<LeadTabValue, number>>
  panels: Record<LeadTabValue, ReactNode>
}) {
  const t = useTranslations('admin.outreach.work')
  return (
    <Tabs
      value={value}
      onValueChange={next => onValueChange(next as LeadTabValue)}
      className="gap-4"
    >
      <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-[#062E25]/10 bg-transparent p-0">
        {TAB_VALUES.map(tab => (
          <TabsTrigger key={tab} value={tab} className={TAB_TRIGGER_CLASS}>
            {t(`tabs.${tab}`)}
            <TabCount value={counts[tab] ?? 0} />
          </TabsTrigger>
        ))}
      </TabsList>
      {TAB_VALUES.map(tab =>
        tab === 'verlauf' ? (
          <TabsContent
            key={tab}
            value={tab}
            forceMount
            className="data-[state=inactive]:hidden"
          >
            {panels[tab]}
          </TabsContent>
        ) : (
          <TabsContent key={tab} value={tab}>
            {panels[tab]}
          </TabsContent>
        )
      )}
    </Tabs>
  )
}
