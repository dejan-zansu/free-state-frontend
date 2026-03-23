'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, Check } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EquipmentOption {
  id: string
  displayName: string
  manufacturer: { name: string | null }
  specs: string
  price: number
  currency: string
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
  const isActive = required || !!selectedId

  return (
    <Card className={cn(
      'transition-all',
      isActive ? 'border-[#062E25]/20' : 'border-[#062E25]/5'
    )}>
      <button
        type='button'
        onClick={() => setExpanded(v => !v)}
        className='w-full flex items-center justify-between px-6 py-4 text-left'
      >
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold text-sm'>{title}</h3>
          {!required && (
            <span className='text-xs text-muted-foreground/60'>({t('optional')})</span>
          )}
        </div>
        <div className='flex items-center gap-3'>
          {selectedOption && (
            <span className='text-xs text-muted-foreground'>
              CHF {selectedOption.price.toLocaleString('de-CH')}
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      {expanded && (
        <CardContent className='pt-0 pb-4'>
          {loading ? (
            <div className='py-6 text-center text-sm text-muted-foreground'>Loading...</div>
          ) : options.length === 0 ? (
            <div className='py-6 text-center text-sm text-muted-foreground'>No options available</div>
          ) : (
            <div className='space-y-2'>
              {!required && selectedId && (
                <button
                  type='button'
                  onClick={() => onSelect(null)}
                  className='w-full text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-[#F5F7EE] transition-colors'
                >
                  Remove selection
                </button>
              )}
              {options.map(option => {
                const isSelected = option.id === selectedId
                return (
                  <button
                    key={option.id}
                    type='button'
                    onClick={() => onSelect(option.id)}
                    className={cn(
                      'w-full text-left px-3 py-3 rounded-lg border transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:bg-[#F5F7EE]'
                    )}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2'>
                          {isSelected && <Check className='h-3.5 w-3.5 text-primary shrink-0' />}
                          <span className='text-sm font-medium'>{option.displayName}</span>
                        </div>
                        {option.manufacturer.name && (
                          <p className='text-xs text-muted-foreground mt-0.5'>{option.manufacturer.name}</p>
                        )}
                        <p className='text-xs text-muted-foreground/70 mt-0.5'>{option.specs}</p>
                      </div>
                      <span className='text-sm font-semibold shrink-0'>
                        CHF {option.price.toLocaleString('de-CH')}
                      </span>
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
