import type {
  CommercialLeadStatus, CommercialLegalForm, CommercialIndustry, CommercialContactRole,
  CommercialEmployeeBracket, CommercialTimeline, CommercialBudgetBracket,
  CommercialMotivation, CommercialFinancingPreference, CommercialExistingPv,
  CommercialPreferredChannel, CommercialPropertyRelation, CommercialAttachmentType,
  CommercialActivityType,
} from '@/types/commercial-lead'

export const statusLabel: Record<CommercialLeadStatus, string> = {
  NEW: 'Neu', CONTACTED: 'Kontaktiert', QUALIFIED: 'Qualifiziert',
  QUOTE_PREPARING: 'Angebot in Vorbereitung', QUOTE_SENT: 'Angebot versendet',
  NEGOTIATION: 'Verhandlung', WON: 'Gewonnen', LOST: 'Verloren', ON_HOLD: 'Pausiert',
}

export const legalFormLabel: Record<CommercialLegalForm, string> = {
  AG: 'AG', GMBH: 'GmbH', EINZELFIRMA: 'Einzelfirma', VEREIN: 'Verein',
  GENOSSENSCHAFT: 'Genossenschaft', STIFTUNG: 'Stiftung',
  OEFFENTLICH_RECHTLICH: 'Öffentlich-rechtlich', ANDERE: 'Andere',
}

export const industryLabel: Record<CommercialIndustry, string> = {
  LANDWIRTSCHAFT: 'Landwirtschaft', INDUSTRIE: 'Industrie', GEWERBE: 'Gewerbe',
  DIENSTLEISTUNG: 'Dienstleistung', HANDEL: 'Handel',
  OEFFENTLICHE_HAND: 'Öffentliche Hand', BILDUNG: 'Bildung', GESUNDHEIT: 'Gesundheit',
  GASTRONOMIE_HOTELLERIE: 'Gastronomie & Hotellerie', ANDERE: 'Andere',
}

export const contactRoleLabel: Record<CommercialContactRole, string> = {
  EIGENTUEMER: 'Eigentümer:in', GESCHAEFTSFUEHRUNG: 'Geschäftsführung',
  VERWALTUNG: 'Verwaltung', FACILITY_MANAGEMENT: 'Facility Management',
  NACHHALTIGKEIT: 'Nachhaltigkeit', EINKAUF: 'Einkauf',
  EXTERNE_BERATUNG: 'Externe Beratung', ANDERE: 'Andere',
}

export const employeeBracketLabel: Record<CommercialEmployeeBracket, string> = {
  MICRO: '1–9', SMALL: '10–49', MEDIUM: '50–249', LARGE: '250+', UNKNOWN: 'Keine Angabe',
}

export const timelineLabel: Record<CommercialTimeline, string> = {
  IMMEDIATE: 'Sofort (< 1 Monat)', WITHIN_3_MONTHS: 'Innert 3 Monaten',
  WITHIN_6_MONTHS: 'Innert 6 Monaten', WITHIN_12_MONTHS: 'Innert 12 Monaten',
  EXPLORING: 'Noch in Abklärung',
}

export const budgetLabel: Record<CommercialBudgetBracket, string> = {
  UNDER_50K: '< CHF 50\u2019000', RANGE_50_150K: 'CHF 50\u2019000 – 150\u2019000',
  RANGE_150_500K: 'CHF 150\u2019000 – 500\u2019000',
  RANGE_500K_1M: 'CHF 500\u2019000 – 1 Mio.', OVER_1M: '> CHF 1 Mio.',
  UNSPECIFIED: 'Noch keine Angabe',
}

export const motivationLabel: Record<CommercialMotivation, string> = {
  COST_SAVINGS: 'Stromkosten senken', SUSTAINABILITY: 'Nachhaltigkeitsziele',
  ENERGY_INDEPENDENCE: 'Energieautarkie', EXPIRING_CONTRACT: 'Auslaufender Stromvertrag',
  REGULATORY: 'Regulatorische Vorgaben', OTHER: 'Andere',
}

export const financingLabel: Record<CommercialFinancingPreference, string> = {
  OUTRIGHT_PURCHASE: 'Kauf', PPA: 'PPA', LEASING: 'Leasing',
  CONTRACTING: 'Contracting', UNDECIDED: 'Noch unsicher',
}

export const existingPvLabel: Record<CommercialExistingPv, string> = {
  NONE: 'Keine', EXISTING_EXPANSION: 'Vorhanden, Erweiterung geplant',
  EXISTING_REPLACEMENT: 'Vorhanden, Ersatz geplant',
}

export const channelLabel: Record<CommercialPreferredChannel, string> = {
  EMAIL: 'E-Mail', PHONE: 'Telefon', WHATSAPP: 'WhatsApp',
}

export const propertyRelationLabel: Record<CommercialPropertyRelation, string> = {
  OWNER: 'Eigentümer:in',
  TENANT_WITH_CONSENT: 'Mieter:in mit Zustimmung des Eigentümers',
  TENANT_WITHOUT_CONSENT: 'Mieter:in ohne Zustimmung',
}

export const attachmentTypeLabel: Record<CommercialAttachmentType, string> = {
  ELECTRICITY_BILL: 'Stromrechnung', PROPERTY_REGISTER: 'Grundbuchauszug',
  BUILDING_PLANS: 'Gebäudepläne', SUPPLIER_CONTRACT: 'Stromliefervertrag', OTHER: 'Sonstiges',
}

export const activityLabel: Record<CommercialActivityType, string> = {
  CREATED: 'Anfrage erstellt', STATUS_CHANGED: 'Status geändert',
  ASSIGNED: 'Zugewiesen', UNASSIGNED: 'Zuweisung entfernt',
  NOTE_ADDED: 'Notiz hinzugefügt', NOTE_EDITED: 'Notiz bearbeitet', NOTE_DELETED: 'Notiz gelöscht',
  EMAIL_SENT: 'E-Mail versendet', CALL_LOGGED: 'Anruf protokolliert',
  MEETING_SCHEDULED: 'Meeting geplant', QUOTE_SENT: 'Angebot versendet',
  ATTACHMENT_UPLOADED: 'Dokument hochgeladen', ATTACHMENT_DELETED: 'Dokument gelöscht',
  FOLLOW_UP_SCHEDULED: 'Follow-up geplant', WON: 'Gewonnen', LOST: 'Verloren',
}
