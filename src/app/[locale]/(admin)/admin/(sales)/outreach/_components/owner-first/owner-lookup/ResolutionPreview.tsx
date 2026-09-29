'use client'

// What confirming the capture will do (backend owner-resolution.service
// preview): the outcome, each party with its type and Zefix match, the
// occupants' new confidence, the owner or Verwaltung row and the letter.
// Ambiguous Zefix names and family matches wait for the operator here.

import { useTranslations } from 'next-intl'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { ResolutionPlan } from '@/types/outreach/owner-lookup'

const NONE = 'none'

export function ResolutionPreview(props: {
  plan: ResolutionPlan
  picks: Record<string, string>
  onPick: (position: number, value: string) => void
  familyOccupantId: string | null
  onFamily: (occupantId: string | null) => void
}) {
  const t = useTranslations('admin.outreach.ownerLookup')
  const tr = useTranslations('admin.outreach.ownerLookup.resolution')
  const tc = useTranslations('admin.outreach.ownership.confidence')
  const tp = useTranslations('admin.outreach.ownership.partyType')
  const { plan } = props
  const { decision } = plan

  return (
    <div className="space-y-3 rounded border border-[#062E25]/15 p-3">
      {plan.egridMismatch && (
        <p className="p-2 rounded bg-red-50 text-red-700 font-medium">
          {t('preview.egridMismatch', {
            extract: plan.extractEgrid ?? '-',
            lookup: plan.lookupEgrid,
          })}
        </p>
      )}
      <p className="font-semibold text-[#062E25]">
        {t('preview.outcome')}: {tr(decision.resolution)}
      </p>
      {decision.excludedReason && (
        <p className="text-amber-800">
          {t(`preview.excluded.${decision.excludedReason}`)}
        </p>
      )}
      {decision.heldForHuman && (
        <p className="text-amber-800">{t('preview.heldForHuman')}</p>
      )}
      {decision.flags.length > 0 && (
        <p className="text-amber-800">{t('preview.contradiction')}</p>
      )}

      <div>
        <p className="font-medium">{t('preview.parties')}</p>
        <ul className="space-y-2 mt-1">
          {plan.parties.map(party => (
            <li
              key={party.position}
              className="border-l-2 border-[#062E25]/20 pl-2"
            >
              <span className="text-[#062E25]/60">
                {t(`partyRole.${party.role}`)}
              </span>{' '}
              {party.name}
              <span className="text-[#062E25]/60">
                {' '}
                | {tp(party.partyType)}
                {party.uid ? ` | ${party.uid}` : ''} |{' '}
                {t(`zefix.${party.zefixMatch}`)}
              </span>
              {party.zefix && (
                <span className="text-[#062E25]/60">
                  {' '}
                  ({party.zefix.legalName},{' '}
                  {[party.zefix.postalCode, party.zefix.locality]
                    .filter(Boolean)
                    .join(' ')}
                  )
                </span>
              )}
              {party.candidates.length > 1 && (
                <fieldset className="mt-1 space-y-1">
                  <legend className="text-amber-800">
                    {t('preview.pickZefix')}
                  </legend>
                  {party.candidates.map(candidate => {
                    const value = candidate.uid ?? candidate.companyUri
                    const id = `pick-${party.position}-${value}`
                    return (
                      <div key={value} className="flex items-center gap-2">
                        <input
                          id={id}
                          type="radio"
                          name={`pick-${party.position}`}
                          checked={
                            props.picks[String(party.position)] === value
                          }
                          onChange={() => props.onPick(party.position, value)}
                        />
                        <label htmlFor={id}>
                          {candidate.legalName} ({candidate.uid ?? '-'},{' '}
                          {[candidate.postalCode, candidate.locality]
                            .filter(Boolean)
                            .join(' ') || '-'}
                          )
                        </label>
                      </div>
                    )
                  })}
                  <div className="flex items-center gap-2">
                    <input
                      id={`pick-${party.position}-none`}
                      type="radio"
                      name={`pick-${party.position}`}
                      checked={props.picks[String(party.position)] === NONE}
                      onChange={() => props.onPick(party.position, NONE)}
                    />
                    <label htmlFor={`pick-${party.position}-none`}>
                      {t('preview.pickNone')}
                    </label>
                  </div>
                </fieldset>
              )}
            </li>
          ))}
        </ul>
      </div>

      {decision.familyCandidateIds.length > 0 && (
        <div className="space-y-1">
          <p className="font-medium">{t('preview.familyTitle')}</p>
          {decision.familyCandidateIds.map(id => {
            const occupant = plan.occupants.find(row => row.id === id)
            return (
              <div key={id} className="flex items-center gap-2">
                <Checkbox
                  id={`family-${id}`}
                  checked={props.familyOccupantId === id}
                  onCheckedChange={checked =>
                    props.onFamily(checked ? id : null)
                  }
                />
                <Label htmlFor={`family-${id}`}>
                  {t('preview.familyConfirm', {
                    company: occupant?.companyName ?? id,
                  })}
                </Label>
              </div>
            )
          })}
        </div>
      )}

      <div>
        <p className="font-medium">{t('preview.occupants')}</p>
        {plan.occupants.length === 0 ? (
          <p className="text-[#062E25]/60">{t('preview.noOccupants')}</p>
        ) : (
          <ul className="mt-1">
            {plan.occupants.map(occupant => (
              <li key={occupant.id}>
                {occupant.reference} {occupant.companyName}:{' '}
                {occupant.implies
                  ? tc(occupant.implies)
                  : t('preview.unchanged')}
                {occupant.implies === 'CONFIRMED_TENANT' &&
                  occupant.unsentColdDrafts > 0 && (
                    <span className="text-amber-800">
                      {' '}
                      {t('preview.draftsRejected', {
                        count: occupant.unsentColdDrafts,
                      })}
                    </span>
                  )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {plan.ownerRow && (
        <div>
          <p className="font-medium">
            {plan.ownerRow.action === 'held'
              ? t('preview.ownerHeld')
              : plan.ownerRow.partyRole === 'MANAGER'
                ? t('preview.managerRow')
                : t('preview.ownerRow')}
          </p>
          <p>
            {plan.ownerRow.companyName} | {tp(plan.ownerRow.ownerPartyType)}
            {plan.ownerRow.ownerUid ? ` | ${plan.ownerRow.ownerUid}` : ''}
          </p>
          {plan.ownerRow.postal && (
            <p className="text-[#062E25]/75">
              {[
                [plan.ownerRow.postal.street, plan.ownerRow.postal.number]
                  .filter(Boolean)
                  .join(' '),
                [plan.ownerRow.postal.postalCode, plan.ownerRow.postal.city]
                  .filter(Boolean)
                  .join(' '),
              ]
                .filter(Boolean)
                .join(', ')}{' '}
              ({t(`postalSource.${plan.ownerRow.postal.source}`)})
            </p>
          )}
          <p className="text-[#062E25]/75">
            {plan.ownerRow.contactEmail
              ? t('preview.contactCopied', {
                  email: plan.ownerRow.contactEmail,
                })
              : t('preview.contactQueue')}
          </p>
        </div>
      )}

      {plan.letter && (
        <p>
          {plan.letter.recipient
            ? t('preview.letter', {
                name: plan.letter.recipient.name,
                city: plan.letter.recipient.city,
              })
            : t('preview.letterNoAddress')}
        </p>
      )}

      {plan.warnings.length > 0 && (
        <p className="text-amber-800">
          {t('preview.warnings')}: {plan.warnings.join(', ')}
        </p>
      )}
    </div>
  )
}
