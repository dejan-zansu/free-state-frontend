export type CommercialLeadStatus =
  | 'NEW' | 'CONTACTED' | 'QUALIFIED'
  | 'QUOTE_PREPARING' | 'QUOTE_SENT' | 'NEGOTIATION'
  | 'WON' | 'LOST' | 'ON_HOLD'

export type CommercialLegalForm =
  | 'AG' | 'GMBH' | 'EINZELFIRMA' | 'VEREIN'
  | 'GENOSSENSCHAFT' | 'STIFTUNG' | 'OEFFENTLICH_RECHTLICH' | 'ANDERE'

export type CommercialIndustry =
  | 'LANDWIRTSCHAFT' | 'INDUSTRIE' | 'GEWERBE' | 'DIENSTLEISTUNG'
  | 'HANDEL' | 'OEFFENTLICHE_HAND' | 'BILDUNG' | 'GESUNDHEIT'
  | 'GASTRONOMIE_HOTELLERIE' | 'ANDERE'

export type CommercialContactRole =
  | 'EIGENTUEMER' | 'GESCHAEFTSFUEHRUNG' | 'VERWALTUNG'
  | 'FACILITY_MANAGEMENT' | 'NACHHALTIGKEIT' | 'EINKAUF'
  | 'EXTERNE_BERATUNG' | 'ANDERE'

export type CommercialEmployeeBracket =
  | 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN'

export type CommercialTimeline =
  | 'IMMEDIATE' | 'WITHIN_3_MONTHS' | 'WITHIN_6_MONTHS'
  | 'WITHIN_12_MONTHS' | 'EXPLORING'

export type CommercialBudgetBracket =
  | 'UNDER_50K' | 'RANGE_50_150K' | 'RANGE_150_500K'
  | 'RANGE_500K_1M' | 'OVER_1M' | 'UNSPECIFIED'

export type CommercialMotivation =
  | 'COST_SAVINGS' | 'SUSTAINABILITY' | 'ENERGY_INDEPENDENCE'
  | 'EXPIRING_CONTRACT' | 'REGULATORY' | 'OTHER'

export type CommercialFinancingPreference =
  | 'OUTRIGHT_PURCHASE' | 'PPA' | 'LEASING' | 'CONTRACTING' | 'UNDECIDED'

export type CommercialExistingPv = 'NONE' | 'EXISTING_EXPANSION' | 'EXISTING_REPLACEMENT'

export type CommercialPreferredChannel = 'EMAIL' | 'PHONE' | 'WHATSAPP'

export type CommercialPropertyRelation = 'OWNER' | 'TENANT_WITH_CONSENT' | 'TENANT_WITHOUT_CONSENT'

export type CommercialAttachmentType =
  | 'ELECTRICITY_BILL' | 'PROPERTY_REGISTER' | 'BUILDING_PLANS' | 'SUPPLIER_CONTRACT' | 'OTHER'

export type CommercialActivityType =
  | 'CREATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'UNASSIGNED'
  | 'NOTE_ADDED' | 'NOTE_EDITED' | 'NOTE_DELETED'
  | 'EMAIL_SENT' | 'CALL_LOGGED' | 'MEETING_SCHEDULED' | 'QUOTE_SENT'
  | 'ATTACHMENT_UPLOADED' | 'ATTACHMENT_DELETED'
  | 'FOLLOW_UP_SCHEDULED' | 'WON' | 'LOST'

export interface CommercialLeadSummary {
  id: string
  reference: string
  status: CommercialLeadStatus
  companyName: string
  legalForm: CommercialLegalForm
  industry: CommercialIndustry
  addressCanton: string
  contactFirstName: string
  contactLastName: string
  contactRole: CommercialContactRole
  estimatedSystemKwp: string
  timeline: CommercialTimeline
  assignedTo: { id: string; firstName: string; lastName: string } | null
  createdAt: string
  nextFollowUpAt: string | null
}

export interface CommercialLeadNote {
  id: string
  body: string
  createdAt: string
  updatedAt: string
  author: { id: string; firstName: string; lastName: string }
}

export interface CommercialLeadAttachment {
  id: string
  type: CommercialAttachmentType
  fileName: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  uploadedViaToken: boolean
  uploadedAt: string
  uploadedBy: { id: string; firstName: string; lastName: string } | null
}

export interface CommercialLeadActivity {
  id: string
  type: CommercialActivityType
  actor: { id: string; firstName: string; lastName: string } | null
  payload: Record<string, unknown> | null
  createdAt: string
}

export interface CommercialLeadDetail extends CommercialLeadSummary {
  locale: string
  uidNumber: string | null
  employeeBracket: CommercialEmployeeBracket
  website: string | null
  numberOfSites: number
  contactEmail: string
  contactPhone: string
  isDecisionMaker: boolean
  preferredChannel: CommercialPreferredChannel
  preferredTime: string | null
  addressStreet: string
  addressNumber: string | null
  addressPostalCode: string
  addressCity: string
  addressCountry: string
  addressLat: number | null
  addressLng: number | null
  propertyRelation: CommercialPropertyRelation
  ownerName: string | null
  ownerEmail: string | null
  ownerPhone: string | null
  motivations: CommercialMotivation[]
  financingPreferences: CommercialFinancingPreference[]
  budgetBracket: CommercialBudgetBracket
  existingPv: CommercialExistingPv
  comments: string | null
  currentSupplier: string | null
  contractEndDate: string | null
  annualElectricityCostChf: string | null
  annualConsumptionKwh: number | null
  roofAreaM2: string
  usableRoofAreaM2: string | null
  estimatedPanelCount: number
  estimatedAnnualProductionKwh: number
  estimatedInvestmentChf: string
  estimatedSubsidyChf: string
  estimatedNetInvestmentChf: string
  estimatedAnnualSavingsChf: string
  estimatedPaybackYears: string
  estimatedCo2ReductionKg: number
  calculatorSnapshot: unknown
  reportPdfStoragePath: string | null
  privacyConsent: boolean
  marketingConsent: boolean
  consentDate: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
  referrer: string | null
  lostReason: string | null
  wonAmountChf: string | null
  convertedAt: string | null
  attachments: CommercialLeadAttachment[]
  notes: CommercialLeadNote[]
  activities: CommercialLeadActivity[]
}

export interface CommercialLeadListResponse {
  success: true
  data: CommercialLeadSummary[]
  meta: { total: number; page: number; limit: number; totalPages: number }
  summary: {
    byStatus: Partial<Record<CommercialLeadStatus, number>>
    unassignedCount: number
    overdueFollowUpCount: number
  }
}

export interface CreateCommercialLeadResponse {
  id: string
  reference: string
  uploadToken: string
  uploadTokenExpiresAt: string
}
