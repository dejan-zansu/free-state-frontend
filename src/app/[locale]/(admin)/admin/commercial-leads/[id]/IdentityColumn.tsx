'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import type { CommercialLeadDetail } from '@/types/commercial-lead'
import {
  legalFormLabel, industryLabel, contactRoleLabel, employeeBracketLabel,
  timelineLabel, budgetLabel, motivationLabel, financingLabel,
  existingPvLabel, channelLabel, propertyRelationLabel,
} from '@/lib/commercial-lead-labels'

export default function IdentityColumn({
  lead, onUpdated: _onUpdated,
}: { lead: CommercialLeadDetail; onUpdated: () => void }) {
  const t = useTranslations('admin.commercialLeads.detail')

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[#062E25]/60 uppercase tracking-wide">{t('companyCard')}</h3>
        <p className="font-medium">{lead.companyName}</p>
        <p className="text-sm text-[#062E25]/60">
          {legalFormLabel[lead.legalForm]} · {industryLabel[lead.industry]} · {employeeBracketLabel[lead.employeeBracket]}
        </p>
        {lead.uidNumber && (
          <a href={`https://www.zefix.ch/de/search/entity/list?name=${encodeURIComponent(lead.companyName)}`}
             target="_blank" rel="noreferrer"
             className="text-sm text-blue-600 hover:underline block">
            {lead.uidNumber} · Zefix
          </a>
        )}
        {lead.website && (
          <a href={lead.website} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline block">
            {lead.website}
          </a>
        )}
        <p className="text-sm text-[#062E25]/60">{t('sites', { count: lead.numberOfSites })}</p>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[#062E25]/60 uppercase tracking-wide">{t('contactCard')}</h3>
        <p className="font-medium">{lead.contactFirstName} {lead.contactLastName}</p>
        <p className="text-sm text-[#062E25]/60">{contactRoleLabel[lead.contactRole]}</p>
        <a href={`mailto:${lead.contactEmail}`} className="text-sm text-blue-600 hover:underline block">{lead.contactEmail}</a>
        <a href={`tel:${lead.contactPhone}`} className="text-sm text-blue-600 hover:underline block">{lead.contactPhone}</a>
        <p className="text-sm text-[#062E25]/60">{t('preferredChannel')}: {channelLabel[lead.preferredChannel]}</p>
        {lead.preferredTime && <p className="text-sm text-[#062E25]/60">{t('preferredTime')}: {lead.preferredTime}</p>}
        <p className="text-sm text-[#062E25]/60">
          {lead.isDecisionMaker ? t('isDecisionMaker') : t('isNotDecisionMaker')}
        </p>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[#062E25]/60 uppercase tracking-wide">{t('addressCard')}</h3>
        <p className="text-sm">
          {lead.addressStreet}{lead.addressNumber ? ' ' + lead.addressNumber : ''}<br />
          {lead.addressPostalCode} {lead.addressCity} · {lead.addressCanton}
        </p>
        {lead.addressLat != null && lead.addressLng != null && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${lead.addressLat},${lead.addressLng}`}
             target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
            {t('openMaps')}
          </a>
        )}
        <p className="text-sm mt-2">{propertyRelationLabel[lead.propertyRelation]}</p>
        {(lead.ownerName || lead.ownerEmail || lead.ownerPhone) && (
          <div className="mt-2 p-2 bg-[#062E25]/5 rounded text-sm">
            <p className="font-medium">{t('ownerContact')}</p>
            {lead.ownerName && <p>{lead.ownerName}</p>}
            {lead.ownerEmail && <p>{lead.ownerEmail}</p>}
            {lead.ownerPhone && <p>{lead.ownerPhone}</p>}
          </div>
        )}
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[#062E25]/60 uppercase tracking-wide">{t('intentCard')}</h3>
        <p className="text-sm"><strong>{t('timeline')}:</strong> {timelineLabel[lead.timeline]}</p>
        <p className="text-sm"><strong>{t('budget')}:</strong> {budgetLabel[lead.budgetBracket]}</p>
        <p className="text-sm"><strong>{t('existingPv')}:</strong> {existingPvLabel[lead.existingPv]}</p>
        <div className="text-sm">
          <strong>{t('motivations')}:</strong>{' '}
          {lead.motivations.map((m) => motivationLabel[m]).join(', ')}
        </div>
        <div className="text-sm">
          <strong>{t('financing')}:</strong>{' '}
          {lead.financingPreferences.map((f) => financingLabel[f]).join(', ')}
        </div>
        {lead.comments && <p className="text-sm text-[#062E25]/70 mt-2">&ldquo;{lead.comments}&rdquo;</p>}
      </CardContent></Card>
    </div>
  )
}
