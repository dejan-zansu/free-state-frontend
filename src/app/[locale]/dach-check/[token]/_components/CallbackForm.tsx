'use client'

import { useState } from 'react'

// Call-back request of the homeowner roof report (doc 69 §13.2). Posts from
// the browser, so the API's per-IP rate limit sees the visitor. A repeat
// request is accepted without a change and shows the same confirmation.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type Status = 'idle' | 'sending' | 'done' | 'error' | 'rate_limited'

const inputClass =
  'mt-1 w-full rounded-xl border border-[#062E25]/20 bg-white px-4 py-3 text-base text-[#062E25] focus:border-[#062E25]/50 focus:outline-none'
const labelClass = 'block text-base font-medium text-[#062E25]'

export default function CallbackForm({
  token,
  alreadyResponded,
}: {
  token: string
  alreadyResponded: boolean
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>(
    alreadyResponded ? 'done' : 'idle'
  )
  const [missingContact, setMissingContact] = useState(false)

  if (status === 'done') {
    return (
      <p role="status" className="text-base text-[#062E25]">
        Danke, Ihre Anfrage ist bei uns. Wir rufen Sie zurück oder melden uns
        per E-Mail.
      </p>
    )
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!phone.trim() && !email.trim()) {
      setMissingContact(true)
      return
    }
    setMissingContact(false)
    setStatus('sending')
    try {
      const res = await fetch(
        `${API_URL}/api/public/outreach/homeowner/${encodeURIComponent(token)}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email }),
        }
      )
      setStatus(res.status === 429 ? 'rate_limited' : res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="callback-name" className={labelClass}>
          Name
        </label>
        <input
          id="callback-name"
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
          <label htmlFor="callback-phone" className={labelClass}>
            Telefon
          </label>
          <input
            id="callback-phone"
            type="tel"
            maxLength={50}
            autoComplete="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="callback-email" className={labelClass}>
            E-Mail
          </label>
          <input
            id="callback-email"
            type="email"
            maxLength={320}
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
        Telefon oder E-Mail genügt.
      </p>
      {status === 'rate_limited' && (
        <p role="alert" className="text-base text-red-700">
          Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="text-base text-red-700">
          Das hat leider nicht geklappt. Bitte prüfen Sie Ihre Angaben und
          versuchen Sie es erneut.
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center rounded-full bg-[#062E25] px-8 py-3 text-base font-semibold text-white hover:bg-[#062E25]/90 disabled:opacity-60"
      >
        Rückruf anfordern
      </button>
    </form>
  )
}
