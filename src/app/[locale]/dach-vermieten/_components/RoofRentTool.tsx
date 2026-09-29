'use client'

import { useState } from 'react'

import AddressSearch from './AddressSearch'
import EstimateResult from './EstimateResult'
import InquiryForm from './InquiryForm'
import { type EstimateOutcome, fetchRoofRentEstimate } from './roof-rent-api'

// Roof check and inquiry of the "Dach vermieten" page: an address, the roof
// figures behind it, then the Richtofferte form with that address filled in.

type State = { kind: 'idle' } | { kind: 'loading' } | EstimateOutcome

export default function RoofRentTool() {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [address, setAddress] = useState<string | null>(null)

  async function check(value: string) {
    setAddress(value)
    setState({ kind: 'loading' })
    setState(await fetchRoofRentEstimate(value))
  }

  return (
    <div className="space-y-10">
      <section
        id="dach-pruefen"
        className="space-y-6 rounded-3xl bg-[#062E25]/5 p-6 sm:p-10"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Wie viel Solarstrom liefert Ihr Dach?
          </h2>
          <p className="text-base text-[#062E25]/75">
            Geben Sie die Adresse Ihrer Liegenschaft ein. Wir lesen die
            Dachfläche und den Ertrag aus sonnendach.ch und prüfen das
            Anlagenregister des Bundes.
          </p>
        </div>

        <AddressSearch
          busy={state.kind === 'loading'}
          onSubmit={value => void check(value)}
        />

        {state.kind === 'result' && (
          <EstimateResult estimate={state.estimate} />
        )}
        {state.kind === 'invalid' && (
          <p role="alert" className="text-base text-red-700">
            Bitte geben Sie die Adresse als «Strasse Nr., PLZ Ort» an.
          </p>
        )}
        {state.kind === 'rate_limited' && (
          <p role="alert" className="text-base text-red-700">
            Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.
          </p>
        )}
        {state.kind === 'error' && (
          <p role="alert" className="text-base text-red-700">
            Die Prüfung hat leider nicht geklappt. Sie können uns unten trotzdem
            eine Anfrage senden.
          </p>
        )}
      </section>

      <section id="anfrage" className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Richtofferte für Ihre Liegenschaft
          </h2>
          <p className="text-base text-[#062E25]/75">
            Für Eigentümerinnen, Eigentümer und Verwaltungen. Die Anfrage ist
            unverbindlich.
          </p>
        </div>
        <InquiryForm address={address} />
      </section>
    </div>
  )
}
