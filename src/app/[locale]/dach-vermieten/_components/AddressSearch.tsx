'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { MapPin, Search } from 'lucide-react'

import { sonnendachService } from '@/services/sonnendach.service'

import { ADDRESS_PATTERN, addressFromSearchLabel } from './roof-rent-api'

// Address field with suggestions from the federal address search (the same
// /api/sonnendach/search the calculator uses). Picking a suggestion gives the
// exact "<Strasse Nr>, <PLZ> <Ort>" form the estimate needs. A typed address
// in that form works too.

type Props = {
  busy: boolean
  onSubmit: (address: string) => void
}

const MIN_QUERY = 4
const DEBOUNCE_MS = 250

export default function AddressSearch({ busy, onSubmit }: Props) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [hint, setHint] = useState<string | null>(null)
  const skipSearch = useRef(false)

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false
      return
    }
    const text = query.trim()
    if (text.length < MIN_QUERY) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const results = await sonnendachService.searchAddress(text, 8)
        if (cancelled) return
        const addresses = results
          .filter(result => result.attrs.origin === 'address')
          .map(result => addressFromSearchLabel(result.attrs.label))
          .filter((address): address is string => address !== null)
        setSuggestions([...new Set(addresses)])
        setActive(-1)
        setOpen(true)
      } catch {
        if (!cancelled) setSuggestions([])
      }
    }, DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  function pick(address: string) {
    skipSearch.current = true
    setQuery(address)
    setSuggestions([])
    setOpen(false)
    setHint(null)
    onSubmit(address)
  }

  function submit() {
    const text = query.trim().replace(/\s+/g, ' ')
    if (ADDRESS_PATTERN.test(text)) {
      setOpen(false)
      setHint(null)
      onSubmit(text)
      return
    }
    if (suggestions.length === 1) {
      pick(suggestions[0])
      return
    }
    setHint(
      'Bitte wählen Sie Ihre Adresse aus der Liste, zum Beispiel «Bahnhofstrasse 10, 8001 Zürich».'
    )
  }

  const expanded = open && suggestions.length > 0

  return (
    <form
      className="space-y-3"
      onSubmit={event => {
        event.preventDefault()
        if (expanded && active >= 0) pick(suggestions[active])
        else submit()
      }}
    >
      <label
        htmlFor={`${listId}-input`}
        className="block text-base font-medium"
      >
        Adresse der Liegenschaft
      </label>
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#062E25]/50" />
            <input
              id={`${listId}-input`}
              type="text"
              role="combobox"
              aria-expanded={expanded}
              aria-controls={`${listId}-list`}
              aria-autocomplete="list"
              aria-activedescendant={
                expanded && active >= 0 ? `${listId}-opt-${active}` : undefined
              }
              autoComplete="off"
              placeholder="Strasse Nr., PLZ Ort"
              value={query}
              onChange={event => {
                setQuery(event.target.value)
                setHint(null)
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={event => {
                if (!expanded) return
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActive(index =>
                    Math.min(index + 1, suggestions.length - 1)
                  )
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActive(index => Math.max(index - 1, 0))
                } else if (event.key === 'Escape') {
                  setOpen(false)
                }
              }}
              className="w-full rounded-full border border-[#062E25]/20 bg-white py-3 pl-12 pr-4 text-base text-[#062E25] focus:border-[#062E25]/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#062E25] px-8 py-3 text-base font-semibold text-white hover:bg-[#062E25]/90 disabled:opacity-60"
          >
            <Search className="h-5 w-5" />
            {busy ? 'Wird geprüft' : 'Dach prüfen'}
          </button>
        </div>
        {expanded && (
          <ul
            id={`${listId}-list`}
            role="listbox"
            className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-auto rounded-2xl border border-[#062E25]/15 bg-white py-2 shadow-lg sm:right-44"
          >
            {suggestions.map((address, index) => (
              <li
                key={address}
                id={`${listId}-opt-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={event => {
                  event.preventDefault()
                  pick(address)
                }}
                className={`cursor-pointer px-4 py-2 text-base ${index === active ? 'bg-[#062E25]/10' : 'hover:bg-[#062E25]/5'}`}
              >
                {address}
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && (
        <p role="alert" className="text-base text-red-700">
          {hint}
        </p>
      )}
    </form>
  )
}
