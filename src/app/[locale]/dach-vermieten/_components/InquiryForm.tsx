'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

import {
  COMPANY_MAIN_EMAIL,
  COMPANY_MAIN_MAILTO_HREF,
} from '@/lib/company-contact'
import { getAttribution } from '@/lib/analytics/funnel-events'

import {
  ADDRESS_PATTERN,
  type InquiryOutcome,
  type RoofRentRole,
  postRoofRentInquiry,
} from './roof-rent-api'

// Inquiry of an owner or a Verwaltung. The API stores it as a commercial
// lead, sends the usual confirmation mail and alerts sales. Every field is
// required, as on the commercial lead form (phone included).

type Status = 'idle' | 'sending' | InquiryOutcome

const inputClass =
  'mt-1 w-full rounded-xl border border-[#062E25]/20 bg-white px-4 py-3 text-base text-[#062E25] focus:border-[#062E25]/50 focus:outline-none'
const labelClass = 'block text-base font-medium text-[#062E25]'

export default function InquiryForm({
  address: checkedAddress,
}: {
  address: string | null
}) {
  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState(checkedAddress ?? '')
  const [role, setRole] = useState<RoofRentRole | null>(null)
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [missing, setMissing] = useState<string | null>(null)

  // A new roof check fills in its address.
  useEffect(() => {
    if (checkedAddress) setAddress(checkedAddress)
  }, [checkedAddress])

  if (status === 'done') {
    return (
      <div role="status" className="flex gap-4 rounded-2xl bg-white p-6">
        <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-emerald-600" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">Vielen Dank für Ihre Anfrage.</p>
          <p className="text-base text-[#062E25]/75">
            Sie erhalten eine Bestätigung per E-Mail. Wir melden uns mit der
            Richtofferte für Ihre Liegenschaft.
          </p>
        </div>
      </div>
    )
  }

  async function submit() {
    const cleanAddress = address.trim().replace(/\s+/g, ' ')
    if (!role)
      return setMissing(
        'Bitte wählen Sie, ob Sie Eigentümerin, Eigentümer oder Verwaltung sind.'
      )
    if (!ADDRESS_PATTERN.test(cleanAddress)) {
      return setMissing(
        'Bitte geben Sie die Adresse als «Strasse Nr., PLZ Ort» an.'
      )
    }
    if (!consent)
      return setMissing('Bitte bestätigen Sie die Datenschutzerklärung.')
    setMissing(null)
    setStatus('sending')
    setStatus(
      await postRoofRentInquiry({
        company: company.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: cleanAddress,
        role,
        privacyConsent: true,
        attribution: getAttribution(),
      })
    )
  }

  return (
    <form
      className="space-y-5 rounded-2xl bg-white p-6 sm:p-8"
      onSubmit={event => {
        event.preventDefault()
        void submit()
      }}
    >
      <fieldset className="space-y-2">
        <legend className={labelClass}>Sie sind</legend>
        <div className="flex flex-col gap-3 sm:flex-row">
          {(
            [
              ['owner', 'Eigentümerin oder Eigentümer'],
              ['manager', 'Verwaltung'],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-base ${role === value ? 'border-[#062E25] bg-[#062E25]/5' : 'border-[#062E25]/20'}`}
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => setRole(value)}
                className="h-4 w-4 accent-[#062E25]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Firma
          <input
            required
            minLength={2}
            maxLength={200}
            autoComplete="organization"
            value={company}
            onChange={event => setCompany(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Vorname und Name
          <input
            required
            minLength={2}
            maxLength={200}
            autoComplete="name"
            value={name}
            onChange={event => setName(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          E-Mail
          <input
            required
            type="email"
            maxLength={320}
            autoComplete="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Telefon
          <input
            required
            type="tel"
            maxLength={50}
            pattern="\+?[\d\s\-()]{7,}"
            autoComplete="tel"
            value={phone}
            onChange={event => setPhone(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Adresse der Liegenschaft
        <input
          required
          maxLength={200}
          placeholder="Strasse Nr., PLZ Ort"
          value={address}
          onChange={event => setAddress(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex items-start gap-3 text-base">
        <input
          type="checkbox"
          checked={consent}
          onChange={event => setConsent(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#062E25]"
        />
        <span>
          Ich habe die{' '}
          <Link
            href="/datenschutz"
            className="underline hover:text-[#062E25]/80"
          >
            Datenschutzerklärung
          </Link>{' '}
          gelesen und bin einverstanden, dass Free State AG mich zu dieser
          Anfrage kontaktiert.
        </span>
      </label>

      {missing && (
        <p role="alert" className="text-base text-red-700">
          {missing}
        </p>
      )}
      {status === 'invalid' && (
        <p role="alert" className="text-base text-red-700">
          Bitte prüfen Sie Ihre Angaben, insbesondere E-Mail, Telefon und
          Adresse.
        </p>
      )}
      {status === 'rate_limited' && (
        <p role="alert" className="text-base text-red-700">
          Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="text-base text-red-700">
          Das hat leider nicht geklappt. Bitte versuchen Sie es erneut oder
          schreiben Sie an{' '}
          <a href={COMPANY_MAIN_MAILTO_HREF} className="underline">
            {COMPANY_MAIN_EMAIL}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center rounded-full bg-[#062E25] px-8 py-3 text-base font-semibold text-white hover:bg-[#062E25]/90 disabled:opacity-60"
      >
        {status === 'sending' ? 'Wird gesendet' : 'Richtofferte anfordern'}
      </button>
    </form>
  )
}
