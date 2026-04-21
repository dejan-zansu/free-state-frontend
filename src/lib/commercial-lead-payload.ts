import { useCommercialCalculatorStore } from '@/stores/commercial-calculator.store'
import type { CommercialPreferredChannel, CommercialPropertyRelation } from '@/types/commercial-lead'

type CommercialCalculatorStoreValue = ReturnType<typeof useCommercialCalculatorStore.getState>

export function buildCommercialLeadPayload(s: CommercialCalculatorStoreValue) {
  const cd = s.companyDetails
  const ct = s.contactDetails
  const pi = s.projectIntent
  const addr = s.installationAddress
  const cons = s.consumption
  const selectedSegments = s.getSelectedSegments()

  const usableRoofAreaM2 = s.getUsableArea()
  const systemKwp = s.getSystemSizeKwp()
  const annualProd = s.getEstimatedProductionKwh()
  const investment = s.getTotalInvestment()
  const subsidy = s.getSubsidies()
  const netInvestment = s.getNetInvestment()
  const annualSavings = s.getAnnualSavings()
  const payback = s.getPaybackYears()
  const co2 = s.getCo2Savings()

  const utm = (() => {
    if (typeof window === 'undefined') return undefined
    const raw = window.sessionStorage.getItem('utm')
    return raw ? JSON.parse(raw) : undefined
  })()

  return {
    locale: (typeof window !== 'undefined' && document.documentElement.lang) || 'de',
    company: {
      companyName: cd.companyName.trim(),
      legalForm: cd.legalForm as Exclude<typeof cd.legalForm, ''>,
      uidNumber: cd.uidNumber.trim() || undefined,
      industry: cd.industry as Exclude<typeof cd.industry, ''>,
      employeeBracket: cd.employeeBracket,
      website: cd.website.trim() || undefined,
      numberOfSites: cd.numberOfSites,
    },
    contact: {
      firstName: ct.firstName.trim(),
      lastName: ct.lastName.trim(),
      role: ct.role as Exclude<typeof ct.role, ''>,
      email: ct.email.trim(),
      phone: ct.phone.trim(),
      isDecisionMaker: ct.isDecisionMaker,
      preferredChannel: ct.preferredChannel as CommercialPreferredChannel,
      preferredTime: ct.preferredTime.trim() || undefined,
    },
    address: {
      street: addr.street,
      number: addr.streetNumber || undefined,
      postalCode: addr.postalCode,
      city: addr.city,
      canton: addr.canton,
      country: addr.country || 'CH',
      lat: s.selectedLocation?.attrs?.lat ?? undefined,
      lng: s.selectedLocation?.attrs?.lon ?? undefined,
    },
    property: {
      relation: s.propertyRelation as CommercialPropertyRelation,
      ownerName: s.ownerContact.name || undefined,
      ownerEmail: s.ownerContact.email || undefined,
      ownerPhone: s.ownerContact.phone || undefined,
    },
    intent: {
      timeline: pi.timeline as Exclude<typeof pi.timeline, ''>,
      motivations: pi.motivations,
      financingPreferences: pi.financingPreferences,
      budgetBracket: pi.budgetBracket,
      existingPv: pi.existingPv,
      comments: pi.comments.trim() || undefined,
    },
    energy: {
      currentSupplier: cons.electricityProvider || undefined,
      annualElectricityCostChf: cons.annualElectricityCost || undefined,
      annualConsumptionKwh: cons.annualConsumptionKwh || undefined,
    },
    calculation: {
      roofAreaM2: s.selectedArea,
      usableRoofAreaM2,
      estimatedPanelCount: s.panelCount || s.estimatedPanelCount,
      estimatedSystemKwp: systemKwp,
      estimatedAnnualProductionKwh: annualProd,
      estimatedInvestmentChf: investment,
      estimatedSubsidyChf: subsidy,
      estimatedNetInvestmentChf: netInvestment,
      estimatedAnnualSavingsChf: annualSavings,
      estimatedPaybackYears: payback,
      estimatedCo2ReductionKg: co2,
      snapshot: {
        address: s.address,
        selectedLocation: s.selectedLocation,
        roofProperties: s.roofProperties,
        restrictedAreas: s.restrictedAreas,
        consumption: s.consumption,
        selectedPanel: s.selectedPanel,
        selectedInverter: s.selectedInverter,
        selectedSegments,
      },
    },
    consents: {
      privacy: s.consents.privacy,
      marketing: s.consents.marketing,
    },
    utm,
  }
}
