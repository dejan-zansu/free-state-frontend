'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, Check } from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EquipmentOption {
  id: string
  displayName: string
  manufacturer: { name: string | null }
  specs: string
  price: number
  currency: string
  imageUrl?: string | null
}

interface EquipmentCategoryCardProps {
  title: string
  required: boolean
  options: EquipmentOption[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  loading?: boolean
}

export default function EquipmentCategoryCard({
  title,
  required,
  options,
  selectedId,
  onSelect,
  loading,
}: EquipmentCategoryCardProps) {
  const t = useTranslations('solarAboCalculator.results.packages')
  const [expanded, setExpanded] = useState(!!selectedId || required)

  const selectedOption = options.find(o => o.id === selectedId)

  return (
    <Card className="border-[#062E25]/10">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-base text-[#062E25]">{title}</h3>
          {!required && (
            <span className="text-sm text-[#062E25]/40">({t('optional')})</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedOption && (
            <span className="text-sm text-[#062E25]/60">
              CHF {selectedOption.price.toLocaleString('de-CH')}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-5 w-5 text-[#062E25]/30 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {expanded && (
        <CardContent className="pt-0 pb-5 px-5">
          {loading ? (
            <div className="py-8 text-center text-sm text-[#062E25]/40">
              Loading...
            </div>
          ) : options.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#062E25]/40">
              No options available
            </div>
          ) : (
            <div className="space-y-3">
              {!required && selectedId && (
                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-[#062E25]/50 hover:bg-[#F5F7EE] transition-colors"
                >
                  Remove selection
                </button>
              )}
              {options.map(option => {
                const isSelected = option.id === selectedId
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelect(option.id)}
                    className={cn(
                      'w-full text-left rounded-xl transition-all',
                      isSelected
                        ? 'ring-2 ring-[#062E25] bg-[#062E25]/[0.02]'
                        : 'hover:bg-[#F5F7EE]'
                    )}
                  >
                    <div className="flex gap-4 p-3">
                      {option.imageUrl && (
                        <div className="relative w-[140px] h-[100px] rounded-lg bg-[#F5F7EE] overflow-hidden shrink-0">
                          <Image
                            src={option.imageUrl}
                            alt={option.displayName}
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <Check className="h-4 w-4 text-[#062E25] shrink-0" />
                              )}
                              <span className="text-sm font-semibold text-[#062E25]">
                                {option.displayName}
                              </span>
                            </div>
                            {option.manufacturer.name && (
                              <p className="text-sm text-[#062E25]/40 mt-0.5">
                                {option.manufacturer.name}
                              </p>
                            )}
                          </div>
                          <span className="text-base font-bold text-[#062E25] shrink-0 tabular-nums">
                            CHF {option.price.toLocaleString('de-CH')}
                          </span>
                        </div>
                        <p className="text-sm text-[#062E25]/50 mt-1">
                          {option.specs}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
