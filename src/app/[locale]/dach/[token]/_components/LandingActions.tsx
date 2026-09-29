'use client'

import { useState } from 'react'
import { Building2, KeyRound } from 'lucide-react'

// Owner and tenant routing of the roof one-pager (doc 69 W2-12). The owner
// asks for a Richtofferte (name plus email or phone), the tenant names the
// owner or the Verwaltung. Both post from the browser, so the API's per-IP
// rate limit sees the visitor. A repeat answer is accepted without a change,
// the page shows the same confirmation.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type Mode = 'owner' | 'tenant' | null
type Status = 'idle' | 'sending' | 'done' | 'error' | 'rate_limited'

const inputClass =
  'mt-1 w-full rounded-xl border border-[#062E25]/20 bg-white px-4 py-3 text-base text-[#062E25] focus:border-[#062E25]/50 focus:outline-none'
const labelClass = 'block text-base font-medium text-[#062E25]'
const submitClass =
  'inline-flex items-center justify-center rounded-full bg-[#062E25] px-8 py-3 text-base font-semibold text-white hover:bg-[#062E25]/90 disabled:opacity-60'

async function postRoute(
  token: string,
  body: Record<string, unknown>
): Promise<Status> {
  try {
    const res = await fetch(
      `${API_URL}/api/public/outreach/roof/${encodeURIComponent(token)}/route`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    if (res.status === 429) return 'rate_limited'
    return res.ok ? 'done' : 'error'
  } catch {
    return 'error'
  }
}

function ErrorLine({ status }: { status: Status }) {
  if (status === 'rate_limited') {
    return (
      <p role="alert" className="text-base text-red-700">
        Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.
      </p>
    )
  }
  if (status === 'error') {
    return (
      <p role="alert" className="text-base text-red-700">
        Das hat leider nicht geklappt. Bitte prüfen Sie Ihre Angaben oder
        schreiben Sie an ivan.miric@freestate.ch.
      </p>
    )
  }
  return null
}

function OwnerForm({ token }: { token: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [missingContact, setMissingContact] = useState(false)

  if (status === 'done') {
    return (
      <p role="status" className="text-base text-[#062E25]">
        Danke, Ihre Anfrage ist bei uns. Wir melden uns persönlich bei Ihnen.
      </p>
    )
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() && !phone.trim()) {
      setMissingContact(true)
      return
    }
    setMissingContact(false)
    setStatus('sending')
    setStatus(await postRoute(token, { kind: 'owner', name, email, phone }))
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="owner-name" className={labelClass}>
          Name
        </label>
        <input
          id="owner-name"
          required
          minLength={2}
          maxLength={200}
          autoComplete="name"
          value={name}
          onChange={e => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="owner-email" className={labelClass}>
            E-Mail
          </label>
          <input
            id="owner-email"
            type="email"
            maxLength={320}
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="owner-phone" className={labelClass}>
            Telefon
          </label>
          <input
            id="owner-phone"
            type="tel"
            maxLength={50}
            autoComplete="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <p
        className={
          missingContact
            ? 'text-base text-red-700'
            : 'text-base text-[#062E25]/70'
        }
        role={missingContact ? 'alert' : undefined}
      >
        E-Mail oder Telefon genügt.
      </p>
      <ErrorLine status={status} />
      <button
        type="submit"
        disabled={status === 'sending'}
        className={submitClass}
      >
        Richtofferte anfordern
      </button>
    </form>
  )
}

function TenantForm({ token }: { token: string }) {
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [consent, setConsent] = useState<'yes' | 'no' | ''>('')
  const [status, setStatus] = useState<Status>('idle')

  if (status === 'done') {
    return (
      <p role="status" className="text-base text-[#062E25]">
        {consent === 'no'
          ? 'Danke für den Hinweis. Wir wenden uns an die Eigentümerschaft, ohne Sie zu nennen.'
          : 'Danke für den Hinweis. Wir wenden uns direkt an die Eigentümerschaft.'}
      </p>
    )
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')
    setStatus(
      await postRoute(token, {
        kind: 'tenant',
        ownerName,
        ownerEmail,
        tenantConsent: consent === '' ? null : consent === 'yes',
      })
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="tenant-owner-name" className={labelClass}>
          Eigentümerschaft oder Verwaltung
        </label>
        <input
          id="tenant-owner-name"
          required
          minLength={2}
          maxLength={200}
          autoComplete="organization"
          value={ownerName}
          onChange={e => setOwnerName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="tenant-owner-email" className={labelClass}>
          E-Mail der Verwaltung, falls bekannt
        </label>
        <input
          id="tenant-owner-email"
          type="email"
          maxLength={320}
          value={ownerEmail}
          onChange={e => setOwnerEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <fieldset className="space-y-2">
        <legend className={labelClass}>
          Dürfen wir erwähnen, dass der Hinweis von Ihnen kommt?
        </legend>
        <div className="flex gap-6">
          {(['yes', 'no'] as const).map(value => (
            <label
              key={value}
              className="inline-flex items-center gap-2 text-base text-[#062E25]"
            >
              <input
                type="radio"
                name="tenant-consent"
                value={value}
                required
                checked={consent === value}
                onChange={() => setConsent(value)}
                className="h-5 w-5 accent-[#062E25]"
              />
              {value === 'yes' ? 'Ja' : 'Nein'}
            </label>
          ))}
        </div>
      </fieldset>
      <ErrorLine status={status} />
      <button
        type="submit"
        disabled={status === 'sending'}
        className={submitClass}
      >
        Hinweis senden
      </button>
    </form>
  )
}

export default function LandingActions({ token }: { token: string }) {
  const [mode, setMode] = useState<Mode>(null)

  const choiceClass = (active: boolean) =>
    `flex items-center gap-3 rounded-2xl border-2 p-5 text-left text-base font-semibold transition-colors ${
      active
        ? 'border-[#062E25] bg-[#062E25]/5'
        : 'border-[#062E25]/15 hover:border-[#062E25]/40'
    }`

  return (
    <section className="space-y-4" aria-labelledby="landing-actions-heading">
      <h2
        id="landing-actions-heading"
        className="text-2xl font-bold tracking-tight"
      >
        Eigentümer oder Mieter?
      </h2>
      <p className="text-base text-[#062E25]/75">
        Über die Nutzung des Dachs entscheidet die Eigentümerschaft. Wählen Sie,
        was auf Sie zutrifft.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          aria-expanded={mode === 'owner'}
          onClick={() => setMode('owner')}
          className={choiceClass(mode === 'owner')}
        >
          <KeyRound className="w-6 h-6 shrink-0 text-amber-500" />
          Ich bin Eigentümer, Richtofferte anfordern
        </button>
        <button
          type="button"
          aria-expanded={mode === 'tenant'}
          onClick={() => setMode('tenant')}
          className={choiceClass(mode === 'tenant')}
        >
          <Building2 className="w-6 h-6 shrink-0 text-amber-500" />
          Ich bin Mieter, Verwaltung nennen
        </button>
      </div>
      {mode && (
        <div className="rounded-2xl border border-[#062E25]/15 p-6">
          {mode === 'owner' ? (
            <OwnerForm token={token} />
          ) : (
            <TenantForm token={token} />
          )}
        </div>
      )}
    </section>
  )
}
