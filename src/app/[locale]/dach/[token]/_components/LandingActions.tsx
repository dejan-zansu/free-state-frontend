'use client'

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

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

export default function LandingActions({ token }: { token: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [missingContact, setMissingContact] = useState(false)

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
    <section className="space-y-4" aria-labelledby="landing-actions-heading">
      <h2
        id="landing-actions-heading"
        className="text-2xl font-bold tracking-tight"
      >
        Richtofferte für SolarFree anfordern
      </h2>
      <div className="rounded-2xl border border-[#062E25]/15 p-6">
        {status === 'done' ? (
          <p role="status" className="text-base text-[#062E25]">
            Danke, Ihre Anfrage ist bei uns. Wir melden uns persönlich bei
            Ihnen.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-base text-[#062E25]/75">
              Wir rechnen SolarFree für Ihr Dach durch und melden uns persönlich
              bei Ihnen.
            </p>
            <div>
              <label htmlFor="offer-name" className={labelClass}>
                Name
              </label>
              <input
                id="offer-name"
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
                <label htmlFor="offer-email" className={labelClass}>
                  E-Mail
                </label>
                <input
                  id="offer-email"
                  type="email"
                  maxLength={320}
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="offer-phone" className={labelClass}>
                  Telefon
                </label>
                <input
                  id="offer-phone"
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
        )}
      </div>
      <p className="text-base text-[#062E25]/70">
        Sind Sie Mieter? Leiten Sie diese Seite gerne an die Eigentümerschaft
        weiter.
      </p>
    </section>
  )
}
