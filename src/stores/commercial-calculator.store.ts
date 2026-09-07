import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { getAttribution } from '@/lib/analytics/funnel-events'
import {
  computeCommercialEstimate,
  tariffCategoryForConsumption,
  type BuildingUse,
  type CommercialEstimate,
  type SubsidyTiers,
  type TariffCategory,
} from '@/lib/commercial-estimate'
import {
  COMMERCIAL_TOTAL_STEPS,
  clampToAllowedCommercialStep,
} from '@/lib/commercial-calculator-flow'
import { PERIOD_FACTOR, type BillPeriod } from '@/lib/consumption-cost'
import {
  commercialLeadService,
  type CommercialLeadPayload,
  type CommercialManualCheckSource,
} from '@/services/commercial-lead.service'
import { electricityPriceService } from '@/services/electricity-price.service'
import { subsidyService } from '@/services/subsidy.service'
import type {
  CommercialIndustry,
  CreateCommercialLeadResponse,
} from '@/types/commercial-lead'
import type { RoofSegment, SonnendachBuilding } from '@/types/sonnendach'

export type { BuildingUse }

export const BUILDING_USE_TO_INDUSTRY: Record<BuildingUse, CommercialIndustry> =
  {
    office_trade: 'GEWERBE',
    industry: 'INDUSTRIE',
    agriculture: 'LANDWIRTSCHAFT',
    retail_gastro: 'HANDEL',
    public: 'OEFFENTLICHE_HAND',
    multi_family: 'DIENSTLEISTUNG',
    other: 'ANDERE',
  }

export type BuildingMissReason = 'no_building' | 'no_segments' | 'error'

export interface CommercialTariff {
  rpKwh: number
  chfKwh: number
  category: string
  municipality: string
  year: number
  fallback: boolean
  plz: string
}

export type SubmissionErrorCode = 'rate_limited' | 'server' | 'network'

export interface CommercialContact {
  companyName: string
  name: string
  email: string
  phone: string
}

interface SubmissionState {
  status: 'idle' | 'submitting' | 'done' | 'error'
  errorCode: SubmissionErrorCode | null
  result: CreateCommercialLeadResponse | null
}

export interface CommercialCalculatorState {
  currentStep: number

  address: string
  street: string
  streetNumber: string
  postalCode: string
  city: string
  canton: string
  lat: number | null
  lng: number | null

  building: SonnendachBuilding | null
  selectedSegmentIds: string[]
  isFetchingBuilding: boolean
  buildingMissReason: BuildingMissReason | null
  roofImage: string | null

  buildingUse: BuildingUse | null
  consumptionInputMode: 'kwh' | 'chf'
  consumptionKwh: number | null
  consumptionBillChf: number | null
  consumptionBillPeriod: BillPeriod
  hasExistingPv: boolean

  tariff: CommercialTariff | null
  tariffLoading: boolean
  subsidyRate: SubsidyTiers | null
  subsidyLoading: boolean

  contact: CommercialContact
  consent: boolean
  submission: SubmissionState
  manualCheckRequested: CommercialManualCheckSource | null
  partialCaptured: boolean

  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  setResolvedAddress: (a: {
    formatted: string
    street: string
    streetNumber: string
    postalCode: string
    city: string
    canton: string
    lat: number
    lng: number
  }) => void
  setAddressFallback: (a: { postalCode?: string; city?: string }) => void
  clearAddress: () => void

  setBuilding: (building: SonnendachBuilding | null) => void
  setSelectedSegmentIds: (ids: string[]) => void
  toggleSegment: (id: string) => void
  setIsFetchingBuilding: (v: boolean) => void
  setBuildingMissReason: (r: BuildingMissReason | null) => void
  setRoofImage: (dataUrl: string | null) => void

  setBuildingUse: (use: BuildingUse | null) => void
  setConsumptionInputMode: (mode: 'kwh' | 'chf') => void
  setConsumptionKwh: (kwh: number | null) => void
  setConsumptionBill: (chf: number | null, period: BillPeriod) => void
  setHasExistingPv: (v: boolean) => void

  fetchTariff: () => Promise<void>
  fetchSubsidyRate: () => Promise<void>

  setContact: (patch: Partial<CommercialContact>) => void
  setConsent: (v: boolean) => void
  setManualCheckRequested: (source: CommercialManualCheckSource | null) => void
  setPartialCaptured: (v: boolean) => void
  submitLead: (locale: string) => Promise<CreateCommercialLeadResponse | null>
  reset: () => void

  getSelectedSegments: () => RoofSegment[]
  getConsumptionKwh: () => number | null
  getTariffCategory: () => TariffCategory
  getEstimate: () => CommercialEstimate
}

const initialContact: CommercialContact = {
  companyName: '',
  name: '',
  email: '',
  phone: '',
}

const initialSubmission: SubmissionState = {
  status: 'idle',
  errorCode: null,
  result: null,
}

const initialState = {
  currentStep: 1,
  address: '',
  street: '',
  streetNumber: '',
  postalCode: '',
  city: '',
  canton: '',
  lat: null,
  lng: null,
  building: null,
  selectedSegmentIds: [],
  isFetchingBuilding: false,
  buildingMissReason: null,
  roofImage: null,
  buildingUse: null,
  consumptionInputMode: 'kwh' as const,
  consumptionKwh: null,
  consumptionBillChf: null,
  consumptionBillPeriod: 'year' as BillPeriod,
  hasExistingPv: false,
  tariff: null,
  tariffLoading: false,
  subsidyRate: null,
  subsidyLoading: false,
  contact: initialContact,
  consent: false,
  submission: initialSubmission,
  manualCheckRequested: null,
  partialCaptured: false,
}

export function splitName(full: string): {
  firstName: string
  lastName: string
} {
  const trimmed = full.trim().replace(/\s+/g, ' ')
  const idx = trimmed.indexOf(' ')
  if (idx === -1) return { firstName: trimmed, lastName: '' }
  return { firstName: trimmed.slice(0, idx), lastName: trimmed.slice(idx + 1) }
}

export const useCommercialCalculatorStore = create<CommercialCalculatorState>()(
  persist(
    (set, get) => ({
      ...initialState,

      goToStep: step => {
        const s = get()
        const target = clampToAllowedCommercialStep(step, {
          address: s.address,
          building: s.building,
          selectedSegmentIds: s.selectedSegmentIds,
          submissionDone: s.submission.status === 'done',
        })
        set({ currentStep: target })
      },
      nextStep: () => {
        const { currentStep } = get()
        if (currentStep < COMMERCIAL_TOTAL_STEPS)
          get().goToStep(currentStep + 1)
      },
      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) get().goToStep(currentStep - 1)
      },

      setResolvedAddress: a => {
        set({
          address: a.formatted,
          street: a.street,
          streetNumber: a.streetNumber,
          postalCode: a.postalCode,
          city: a.city,
          canton: a.canton,
          lat: a.lat,
          lng: a.lng,
          building: null,
          selectedSegmentIds: [],
          buildingMissReason: null,
          roofImage: null,
          tariff: null,
        })
        void get().fetchTariff()
      },
      setAddressFallback: a => {
        set(state => ({
          postalCode: a.postalCode ?? state.postalCode,
          city: a.city ?? state.city,
        }))
        void get().fetchTariff()
      },
      clearAddress: () =>
        set({
          address: '',
          street: '',
          streetNumber: '',
          postalCode: '',
          city: '',
          canton: '',
          lat: null,
          lng: null,
          building: null,
          selectedSegmentIds: [],
          buildingMissReason: null,
          roofImage: null,
          tariff: null,
          manualCheckRequested: null,
          currentStep: 1,
        }),

      setBuilding: building =>
        set({ building, selectedSegmentIds: [], buildingMissReason: null }),
      setSelectedSegmentIds: ids => set({ selectedSegmentIds: ids }),
      toggleSegment: id =>
        set(state => ({
          selectedSegmentIds: state.selectedSegmentIds.includes(id)
            ? state.selectedSegmentIds.filter(x => x !== id)
            : [...state.selectedSegmentIds, id],
        })),
      setIsFetchingBuilding: v => set({ isFetchingBuilding: v }),
      setBuildingMissReason: r => set({ buildingMissReason: r }),
      setRoofImage: dataUrl => set({ roofImage: dataUrl }),

      setBuildingUse: use => set({ buildingUse: use }),
      setConsumptionInputMode: mode => set({ consumptionInputMode: mode }),
      setConsumptionKwh: kwh => set({ consumptionKwh: kwh }),
      setConsumptionBill: (chf, period) =>
        set({ consumptionBillChf: chf, consumptionBillPeriod: period }),
      setHasExistingPv: v => set({ hasExistingPv: v }),

      fetchTariff: async () => {
        const { postalCode, city, tariffLoading } = get()
        if (!postalCode || tariffLoading) return
        const category = get().getTariffCategory()
        const existing = get().tariff
        if (
          existing &&
          existing.plz === postalCode &&
          existing.category === category
        )
          return
        set({ tariffLoading: true })
        try {
          const year = new Date().getFullYear()
          const data = await electricityPriceService.getSwissTariff(
            postalCode,
            year,
            category
          )
          set({
            tariff: {
              rpKwh: data.averageRpKwh,
              chfKwh: data.averageChfKwh,
              category: data.category,
              municipality: data.municipalityName || city,
              year: data.tariffYear,
              fallback: data.fallback,
              plz: postalCode,
            },
            tariffLoading: false,
          })
        } catch {
          set({ tariffLoading: false })
        }
      },

      fetchSubsidyRate: async () => {
        if (get().subsidyRate || get().subsidyLoading) return
        set({ subsidyLoading: true })
        try {
          const data = await subsidyService.getCurrentRate()
          set({
            subsidyRate: {
              tier1MaxKwp: data.tier1MaxKwp,
              tier1ChfPerKwp: data.tier1ChfPerKwp,
              tier2MaxKwp: data.tier2MaxKwp,
              tier2ChfPerKwp: data.tier2ChfPerKwp,
            },
            subsidyLoading: false,
          })
        } catch {
          set({ subsidyLoading: false })
        }
      },

      setContact: patch =>
        set(state => ({ contact: { ...state.contact, ...patch } })),
      setConsent: v => set({ consent: v }),
      setManualCheckRequested: source => set({ manualCheckRequested: source }),
      setPartialCaptured: v => set({ partialCaptured: v }),

      submitLead: async locale => {
        const s = get()
        if (s.submission.status === 'done' && s.submission.result)
          return s.submission.result
        if (s.submission.status === 'submitting') return null
        set({
          submission: { status: 'submitting', errorCode: null, result: null },
        })
        const estimate = s.getEstimate()
        const { firstName, lastName } = splitName(s.contact.name)
        const payload: CommercialLeadPayload = {
          locale,
          company: {
            companyName: s.contact.companyName.trim(),
            industry: s.buildingUse
              ? BUILDING_USE_TO_INDUSTRY[s.buildingUse]
              : null,
          },
          contact: {
            firstName,
            lastName,
            email: s.contact.email.trim().toLowerCase(),
            phone: s.contact.phone.trim(),
          },
          address: {
            street: s.street || s.address,
            number: s.streetNumber || undefined,
            postalCode: s.postalCode,
            city: s.city,
            canton: /^[A-Za-z]{2}$/.test(s.canton)
              ? s.canton.toUpperCase()
              : undefined,
            country: 'CH',
            lat: s.lat ?? undefined,
            lng: s.lng ?? undefined,
          },
          energy: { annualConsumptionKwh: estimate.consumptionKwh },
          intent: {
            existingPv: s.hasExistingPv ? 'EXISTING_EXPANSION' : 'NONE',
          },
          calculation: {
            roofAreaM2: Math.round(estimate.grossAreaM2 * 100) / 100,
            usableRoofAreaM2: Math.round(estimate.usableAreaM2 * 100) / 100,
            estimatedPanelCount: estimate.panelCount,
            estimatedSystemKwp: Math.round(estimate.systemSizeKwp * 100) / 100,
            estimatedAnnualProductionKwh: Math.round(estimate.productionKwh),
            estimatedCo2ReductionKg: estimate.co2Kg,
            estimatedSubsidyChf: estimate.subsidyChf,
            estimatedAnnualSavingsChf: estimate.selfConsumptionValueChf,
            snapshot: {
              version: 2,
              buildingUse: s.buildingUse,
              consumption: {
                kwh: estimate.consumptionKwh,
                assumed: estimate.consumptionAssumed,
                inputMode: s.consumptionInputMode,
                billChf: s.consumptionBillChf,
                billPeriod: s.consumptionBillPeriod,
              },
              tariff: s.tariff,
              selfConsumption: {
                kwh: Math.round(estimate.selfConsumedKwh),
                share: Math.round(estimate.selfConsumptionShare * 100) / 100,
                ppaSavingsChf: estimate.ppaSavingsChf,
              },
              subsidyAboveTiers: estimate.subsidyAboveTiers,
              subsidyTierMaxKwp: s.subsidyRate?.tier2MaxKwp ?? null,
              lowResult: estimate.isLowResult,
              segments: s.getSelectedSegments().map(seg => ({
                id: seg.id,
                area: seg.area,
                tilt: seg.tilt,
                azimuth: seg.azimuth,
                electricityYield: seg.electricityYield,
                suitabilityClass: seg.suitability?.class ?? null,
              })),
              buildingId: s.building?.buildingId ?? null,
              roofImage: false,
            },
          },
          consents: { privacy: true, marketing: false },
          attribution: getAttribution(),
        }
        try {
          const result = await commercialLeadService.create(payload)
          set({ submission: { status: 'done', errorCode: null, result } })
          return result
        } catch (err) {
          const status = (err as { response?: { status?: number } })?.response
            ?.status
          const errorCode: SubmissionErrorCode =
            status === 429 ? 'rate_limited' : status ? 'server' : 'network'
          set({ submission: { status: 'error', errorCode, result: null } })
          return null
        }
      },
      reset: () => set({ ...initialState }),

      getSelectedSegments: () => {
        const { building, selectedSegmentIds } = get()
        if (!building?.roofSegments) return []
        return building.roofSegments.filter(s =>
          selectedSegmentIds.includes(s.id)
        )
      },

      getConsumptionKwh: () => {
        const s = get()
        if (s.consumptionInputMode === 'kwh') {
          return s.consumptionKwh && s.consumptionKwh > 0
            ? s.consumptionKwh
            : null
        }
        if (!s.consumptionBillChf || s.consumptionBillChf <= 0) return null
        const rate = s.tariff?.chfKwh
        if (!rate || rate <= 0) return null
        const annualChf =
          s.consumptionBillChf * PERIOD_FACTOR[s.consumptionBillPeriod]
        return Math.round(annualChf / rate)
      },

      getTariffCategory: () =>
        tariffCategoryForConsumption(get().getConsumptionKwh()),

      getEstimate: () => {
        const s = get()
        return computeCommercialEstimate({
          segments: s.getSelectedSegments(),
          buildingUse: s.buildingUse,
          consumptionKwh: s.getConsumptionKwh(),
          tariffChfKwh: s.tariff?.chfKwh ?? null,
          subsidyTiers: s.subsidyRate,
        })
      },
    }),
    {
      name: 'commercial-calculator-v2',
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<CommercialCalculatorState>
        const hasValidBuilding =
          !!p.building &&
          Array.isArray((p.building as SonnendachBuilding).roofSegments)
        return {
          ...current,
          ...p,
          building: hasValidBuilding ? p.building! : null,
          selectedSegmentIds: hasValidBuilding
            ? (p.selectedSegmentIds ?? [])
            : [],
          submission:
            p.submission?.status === 'done' && p.submission.result
              ? p.submission
              : initialSubmission,
        }
      },
      partialize: state => ({
        address: state.address,
        street: state.street,
        streetNumber: state.streetNumber,
        postalCode: state.postalCode,
        city: state.city,
        canton: state.canton,
        lat: state.lat,
        lng: state.lng,
        building: state.building,
        selectedSegmentIds: state.selectedSegmentIds,
        roofImage: state.roofImage,
        buildingUse: state.buildingUse,
        consumptionInputMode: state.consumptionInputMode,
        consumptionKwh: state.consumptionKwh,
        consumptionBillChf: state.consumptionBillChf,
        consumptionBillPeriod: state.consumptionBillPeriod,
        hasExistingPv: state.hasExistingPv,
        tariff: state.tariff,
        subsidyRate: state.subsidyRate,
        contact: state.contact,
        consent: state.consent,
        submission: state.submission,
        manualCheckRequested: state.manualCheckRequested,
        partialCaptured: state.partialCaptured,
      }),
    }
  )
)
