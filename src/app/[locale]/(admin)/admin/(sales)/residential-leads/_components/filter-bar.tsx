'use client'

import { ArrowUpDown, Search, X } from 'lucide-react'
import { useId } from 'react'
import { useTranslations } from 'next-intl'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_SOURCES } from '@/lib/sales-lead'
import type { SalesLeadSort, SalesLeadSource } from '@/types/sales-lead'

import { SORT_OPTIONS } from './use-lead-filters'

const ALL_SOURCES_VALUE = '__all__'

interface FilterBarProps {
  searchInput: string
  source: SalesLeadSource | null
  sort: SalesLeadSort
  includeInternal: boolean
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  onSourceChange: (source: SalesLeadSource | null) => void
  onSortChange: (sort: SalesLeadSort) => void
  onIncludeInternalChange: (value: boolean) => void
}

export function FilterBar({
  searchInput,
  source,
  sort,
  includeInternal,
  onSearchChange,
  onSearchClear,
  onSourceChange,
  onSortChange,
  onIncludeInternalChange,
}: FilterBarProps) {
  const t = useTranslations('admin.salesLeads.list')
  const tl = useTranslations('admin.statusLabels')
  const internalId = useId()

  return (
    <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
      <div className="relative col-span-2 md:min-w-72 md:flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#062E25]/60"
        />
        <Input
          type="text"
          inputMode="search"
          autoComplete="off"
          maxLength={200}
          value={searchInput}
          onChange={event => onSearchChange(event.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchLabel')}
          className="h-11 text-ellipsis border-[#062E25]/20 pl-10 pr-11 text-base md:text-base"
        />
        {searchInput ? (
          <button
            type="button"
            onClick={onSearchClear}
            aria-label={t('clearSearch')}
            className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-[#062E25]/70 outline-none hover:bg-[#F5F7EE] hover:text-[#062E25] focus-visible:ring-2 focus-visible:ring-[#062E25]"
          >
            <X aria-hidden className="size-5" />
          </button>
        ) : null}
      </div>

      <Select
        value={source ?? ALL_SOURCES_VALUE}
        onValueChange={value =>
          onSourceChange(
            value === ALL_SOURCES_VALUE ? null : (value as SalesLeadSource)
          )
        }
      >
        <SelectTrigger
          aria-label={t('sourceLabel')}
          className="w-full border-[#062E25]/20 text-base text-[#062E25] data-[size=default]:h-11 md:w-52"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="sales-type-scale">
          <SelectItem value={ALL_SOURCES_VALUE} className="py-2 text-base">
            {t('allSources')}
          </SelectItem>
          {ALL_SOURCES.map(item => (
            <SelectItem key={item} value={item} className="py-2 text-base">
              {tl(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={value => onSortChange(value as SalesLeadSort)}
      >
        <SelectTrigger
          aria-label={t('sortLabel')}
          className="w-full border-[#062E25]/20 text-base text-[#062E25] data-[size=default]:h-11 md:w-56"
        >
          <span className="flex items-center gap-2">
            <ArrowUpDown aria-hidden className="size-4 text-[#062E25]/70" />
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent className="sales-type-scale">
          {SORT_OPTIONS.map(item => (
            <SelectItem key={item} value={item} className="py-2 text-base">
              {t(`sort.${item}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label
        htmlFor={internalId}
        className="col-span-2 flex min-h-11 cursor-pointer items-center gap-2.5 text-base text-[#062E25] md:col-span-1"
      >
        <Checkbox
          id={internalId}
          checked={includeInternal}
          onCheckedChange={value => onIncludeInternalChange(value === true)}
          className="size-5 border-[#062E25]/40 data-[state=checked]:border-[#062E25] data-[state=checked]:bg-[#062E25]"
        />
        {t('showInternal')}
      </label>
    </div>
  )
}
