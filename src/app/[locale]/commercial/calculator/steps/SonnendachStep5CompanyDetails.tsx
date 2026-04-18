'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useCommercialCalculatorStore } from '@/stores/commercial-calculator.store'
import {
  legalFormLabel, industryLabel, contactRoleLabel, employeeBracketLabel,
  timelineLabel, budgetLabel, motivationLabel, financingLabel, existingPvLabel,
  channelLabel, propertyRelationLabel,
} from '@/lib/commercial-lead-labels'
import type {
  CommercialLegalForm, CommercialIndustry, CommercialContactRole,
  CommercialEmployeeBracket, CommercialTimeline, CommercialBudgetBracket,
  CommercialMotivation, CommercialFinancingPreference, CommercialExistingPv,
  CommercialPreferredChannel, CommercialPropertyRelation,
} from '@/types/commercial-lead'

const SWISS_CANTONS = [
  'AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE',
  'NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH',
]

const UID_REGEX = /^CHE-\d{3}\.\d{3}\.\d{3}$/
const PHONE_REGEX = /^\+?[\d\s\-()]{7,}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POSTAL_REGEX = /^\d{4}$/

export default function SonnendachStep5CompanyDetails() {
  const t = useTranslations('sonnendach.step5Company')
  const tNav = useTranslations('sonnendach.navigation')

  const companyDetails = useCommercialCalculatorStore((s) => s.companyDetails)
  const setCompanyDetails = useCommercialCalculatorStore((s) => s.setCompanyDetails)
  const contactDetails = useCommercialCalculatorStore((s) => s.contactDetails)
  const setContactDetails = useCommercialCalculatorStore((s) => s.setContactDetails)
  const projectIntent = useCommercialCalculatorStore((s) => s.projectIntent)
  const setProjectIntent = useCommercialCalculatorStore((s) => s.setProjectIntent)
  const installationAddress = useCommercialCalculatorStore((s) => s.installationAddress)
  const setInstallationAddress = useCommercialCalculatorStore((s) => s.setInstallationAddress)
  const propertyRelation = useCommercialCalculatorStore((s) => s.propertyRelation)
  const setPropertyRelation = useCommercialCalculatorStore((s) => s.setPropertyRelation)
  const ownerContact = useCommercialCalculatorStore((s) => s.ownerContact)
  const setOwnerContact = useCommercialCalculatorStore((s) => s.setOwnerContact)
  const consents = useCommercialCalculatorStore((s) => s.consents)
  const setConsents = useCommercialCalculatorStore((s) => s.setConsents)
  const prevStep = useCommercialCalculatorStore((s) => s.prevStep)
  const nextStep = useCommercialCalculatorStore((s) => s.nextStep)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const req = (v: unknown) => (v === '' || v == null || (Array.isArray(v) && v.length === 0))

  const validate = () => {
    const e: Record<string, string> = {}
    if (req(companyDetails.companyName)) e.companyName = t('required')
    if (!companyDetails.legalForm) e.legalForm = t('required')
    if (!companyDetails.industry) e.industry = t('required')
    if (companyDetails.uidNumber && !UID_REGEX.test(companyDetails.uidNumber))
      e.uidNumber = t('invalidUid')
    if (companyDetails.website && !/^https?:\/\//.test(companyDetails.website))
      e.website = t('invalidUrl')
    if (!companyDetails.numberOfSites || companyDetails.numberOfSites < 1) e.numberOfSites = t('required')

    if (req(contactDetails.firstName)) e.firstName = t('required')
    if (req(contactDetails.lastName)) e.lastName = t('required')
    if (!contactDetails.role) e.role = t('required')
    if (req(contactDetails.email)) e.email = t('required')
    else if (!EMAIL_REGEX.test(contactDetails.email)) e.email = t('invalidEmail')
    if (req(contactDetails.phone)) e.phone = t('required')
    else if (!PHONE_REGEX.test(contactDetails.phone)) e.phone = t('invalidPhone')

    if (req(installationAddress.street)) e.street = t('required')
    if (req(installationAddress.postalCode)) e.postalCode = t('required')
    else if (!POSTAL_REGEX.test(installationAddress.postalCode)) e.postalCode = t('invalidPostalCode')
    if (req(installationAddress.city)) e.city = t('required')
    if (req(installationAddress.canton)) e.canton = t('required')
    if (!propertyRelation) e.propertyRelation = t('required')

    if (!projectIntent.timeline) e.timeline = t('required')
    if (projectIntent.motivations.length === 0) e.motivations = t('required')
    if (projectIntent.financingPreferences.length === 0) e.financing = t('required')

    if (!consents.privacy) e.privacy = t('required')

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validate()) nextStep()
    else if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleInArray = <T extends string>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]

  return (
    <div className="container mx-auto px-4 pt-8 pb-24 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-medium text-[#062E25]">{t('title')}</h1>
      <p className="mt-2 text-base text-[#062E25]/60">{t('subtitle')}</p>

      {Object.keys(errors).length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {t('errorBannerTitle')}
        </div>
      )}

      <section className="mt-8 space-y-4">
        <h2 className="text-base font-semibold text-[#062E25]">{t('sectionCompany')}</h2>

        <div>
          <Label>{t('legalForm')}</Label>
          <Select
            value={companyDetails.legalForm}
            onValueChange={(v) => setCompanyDetails({ legalForm: v as CommercialLegalForm })}
          >
            <SelectTrigger className="mt-1"><SelectValue placeholder={t('select')} /></SelectTrigger>
            <SelectContent>
              {(Object.keys(legalFormLabel) as CommercialLegalForm[]).map((v) => (
                <SelectItem key={v} value={v}>{legalFormLabel[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.legalForm && <p className="text-sm text-red-600 mt-1">{errors.legalForm}</p>}
        </div>

        <div>
          <Label>{t('companyName')}</Label>
          <Input
            value={companyDetails.companyName}
            onChange={(e) => setCompanyDetails({ companyName: e.target.value })}
            className="mt-1"
          />
          {errors.companyName && <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <Label>{t('uidNumber')}</Label>
          <Input
            placeholder="CHE-xxx.xxx.xxx"
            value={companyDetails.uidNumber}
            onChange={(e) => setCompanyDetails({ uidNumber: e.target.value })}
            className="mt-1"
          />
          <p className="text-sm text-[#062E25]/60 mt-1">{t('uidHelp')}</p>
          {errors.uidNumber && <p className="text-sm text-red-600 mt-1">{errors.uidNumber}</p>}
        </div>

        <div>
          <Label>{t('industry')}</Label>
          <Select
            value={companyDetails.industry}
            onValueChange={(v) => setCompanyDetails({ industry: v as CommercialIndustry })}
          >
            <SelectTrigger className="mt-1"><SelectValue placeholder={t('select')} /></SelectTrigger>
            <SelectContent>
              {(Object.keys(industryLabel) as CommercialIndustry[]).map((v) => (
                <SelectItem key={v} value={v}>{industryLabel[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-sm text-red-600 mt-1">{errors.industry}</p>}
        </div>

        <div>
          <Label>{t('employees')}</Label>
          <Select
            value={companyDetails.employeeBracket}
            onValueChange={(v) =>
              setCompanyDetails({ employeeBracket: v as CommercialEmployeeBracket })
            }
          >
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(employeeBracketLabel) as CommercialEmployeeBracket[]).map((v) => (
                <SelectItem key={v} value={v}>{employeeBracketLabel[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t('website')}</Label>
          <Input
            placeholder="https://"
            value={companyDetails.website}
            onChange={(e) => setCompanyDetails({ website: e.target.value })}
            className="mt-1"
          />
          {errors.website && <p className="text-sm text-red-600 mt-1">{errors.website}</p>}
        </div>

        <div>
          <Label>{t('numberOfSites')}</Label>
          <Input
            type="number" min={1}
            value={companyDetails.numberOfSites}
            onChange={(e) => setCompanyDetails({ numberOfSites: Math.max(1, Number(e.target.value) || 1) })}
            className="mt-1 w-32"
          />
          {errors.numberOfSites && <p className="text-sm text-red-600 mt-1">{errors.numberOfSites}</p>}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-semibold text-[#062E25]">{t('sectionContact')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('firstName')}</Label>
            <Input value={contactDetails.firstName}
                   onChange={(e) => setContactDetails({ firstName: e.target.value })} className="mt-1" />
            {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <Label>{t('lastName')}</Label>
            <Input value={contactDetails.lastName}
                   onChange={(e) => setContactDetails({ lastName: e.target.value })} className="mt-1" />
            {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <Label>{t('role')}</Label>
          <Select value={contactDetails.role}
                  onValueChange={(v) => setContactDetails({ role: v as CommercialContactRole })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder={t('select')} /></SelectTrigger>
            <SelectContent>
              {(Object.keys(contactRoleLabel) as CommercialContactRole[]).map((v) => (
                <SelectItem key={v} value={v}>{contactRoleLabel[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('email')}</Label>
            <Input type="email" value={contactDetails.email}
                   onChange={(e) => setContactDetails({ email: e.target.value })} className="mt-1" />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label>{t('phone')}</Label>
            <Input value={contactDetails.phone}
                   onChange={(e) => setContactDetails({ phone: e.target.value })} className="mt-1" />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <Label>{t('decisionMaker')}</Label>
          <RadioGroup
            value={contactDetails.isDecisionMaker ? 'yes' : 'no'}
            onValueChange={(v) => setContactDetails({ isDecisionMaker: v === 'yes' })}
            className="mt-2 flex flex-col gap-2"
          >
            <label className="flex items-center gap-2"><RadioGroupItem value="yes" />{t('decisionYes')}</label>
            <label className="flex items-center gap-2"><RadioGroupItem value="no" />{t('decisionNo')}</label>
          </RadioGroup>
        </div>

        <div>
          <Label>{t('preferredChannel')}</Label>
          <RadioGroup
            value={contactDetails.preferredChannel}
            onValueChange={(v) => setContactDetails({ preferredChannel: v as CommercialPreferredChannel })}
            className="mt-2 flex gap-4"
          >
            {(Object.keys(channelLabel) as CommercialPreferredChannel[]).map((v) => (
              <label key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} />{channelLabel[v]}
              </label>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label>{t('preferredTime')}</Label>
          <Select
            value={contactDetails.preferredTime || 'none'}
            onValueChange={(v) => setContactDetails({ preferredTime: v === 'none' ? '' : v })}
          >
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('noPreference')}</SelectItem>
              <SelectItem value="morning">{t('morning')}</SelectItem>
              <SelectItem value="afternoon">{t('afternoon')}</SelectItem>
              <SelectItem value="evening">{t('evening')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-semibold text-[#062E25]">{t('sectionAddress')}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>{t('street')}</Label>
            <Input value={installationAddress.street}
                   onChange={(e) => setInstallationAddress({ ...installationAddress, street: e.target.value })}
                   className="mt-1" />
            {errors.street && <p className="text-sm text-red-600 mt-1">{errors.street}</p>}
          </div>
          <div>
            <Label>{t('postalCode')}</Label>
            <Input value={installationAddress.postalCode}
                   onChange={(e) => setInstallationAddress({ ...installationAddress, postalCode: e.target.value })}
                   className="mt-1" />
            {errors.postalCode && <p className="text-sm text-red-600 mt-1">{errors.postalCode}</p>}
          </div>
          <div>
            <Label>{t('city')}</Label>
            <Input value={installationAddress.city}
                   onChange={(e) => setInstallationAddress({ ...installationAddress, city: e.target.value })}
                   className="mt-1" />
            {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
          </div>
          <div>
            <Label>{t('canton')}</Label>
            <Select value={installationAddress.canton}
                    onValueChange={(v) => setInstallationAddress({ ...installationAddress, canton: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SWISS_CANTONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.canton && <p className="text-sm text-red-600 mt-1">{errors.canton}</p>}
          </div>
        </div>

        <div>
          <Label>{t('propertyRelation')}</Label>
          <RadioGroup
            value={propertyRelation}
            onValueChange={(v) => setPropertyRelation(v as CommercialPropertyRelation)}
            className="mt-2 flex flex-col gap-2"
          >
            {(Object.keys(propertyRelationLabel) as CommercialPropertyRelation[]).map((v) => (
              <label key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} />{propertyRelationLabel[v]}
              </label>
            ))}
          </RadioGroup>
          {errors.propertyRelation && <p className="text-sm text-red-600 mt-1">{errors.propertyRelation}</p>}
        </div>

        {propertyRelation && propertyRelation !== 'OWNER' && (
          <div className="space-y-4 pl-4 border-l-2 border-[#062E25]/10">
            <p className="text-sm text-[#062E25]/60">{t('ownerHelp')}</p>
            <div>
              <Label>{t('ownerName')}</Label>
              <Input value={ownerContact.name}
                     onChange={(e) => setOwnerContact({ name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>{t('ownerEmail')}</Label>
              <Input type="email" value={ownerContact.email}
                     onChange={(e) => setOwnerContact({ email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>{t('ownerPhone')}</Label>
              <Input value={ownerContact.phone}
                     onChange={(e) => setOwnerContact({ phone: e.target.value })} className="mt-1" />
            </div>
          </div>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-semibold text-[#062E25]">{t('sectionIntent')}</h2>

        <div>
          <Label>{t('timeline')}</Label>
          <Select value={projectIntent.timeline}
                  onValueChange={(v) => setProjectIntent({ timeline: v as CommercialTimeline })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder={t('select')} /></SelectTrigger>
            <SelectContent>
              {(Object.keys(timelineLabel) as CommercialTimeline[]).map((v) => (
                <SelectItem key={v} value={v}>{timelineLabel[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timeline && <p className="text-sm text-red-600 mt-1">{errors.timeline}</p>}
        </div>

        <div>
          <Label>{t('motivations')}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(motivationLabel) as CommercialMotivation[]).map((v) => {
              const on = projectIntent.motivations.includes(v)
              return (
                <button
                  key={v} type="button"
                  onClick={() => setProjectIntent({ motivations: toggleInArray(projectIntent.motivations, v) })}
                  className={`px-3 py-1.5 rounded-full text-sm border ${on
                    ? 'bg-[#B7FE1A] border-[#062E25] text-[#062E25]'
                    : 'bg-white border-[#062E25]/20 text-[#062E25]/60 hover:border-[#062E25]/40'}`}
                >
                  {motivationLabel[v]}
                </button>
              )
            })}
          </div>
          {errors.motivations && <p className="text-sm text-red-600 mt-1">{errors.motivations}</p>}
        </div>

        <div>
          <Label>{t('financing')}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(financingLabel) as CommercialFinancingPreference[]).map((v) => {
              const on = projectIntent.financingPreferences.includes(v)
              return (
                <button
                  key={v} type="button"
                  onClick={() => setProjectIntent({ financingPreferences: toggleInArray(projectIntent.financingPreferences, v) })}
                  className={`px-3 py-1.5 rounded-full text-sm border ${on
                    ? 'bg-[#B7FE1A] border-[#062E25] text-[#062E25]'
                    : 'bg-white border-[#062E25]/20 text-[#062E25]/60 hover:border-[#062E25]/40'}`}
                >
                  {financingLabel[v]}
                </button>
              )
            })}
          </div>
          {errors.financing && <p className="text-sm text-red-600 mt-1">{errors.financing}</p>}
        </div>

        <div>
          <Label>{t('budget')}</Label>
          <Select
            value={projectIntent.budgetBracket}
            onValueChange={(v) => setProjectIntent({ budgetBracket: v as CommercialBudgetBracket })}
          >
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(budgetLabel) as CommercialBudgetBracket[]).map((v) => (
                <SelectItem key={v} value={v}>{budgetLabel[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t('existingPv')}</Label>
          <RadioGroup
            value={projectIntent.existingPv}
            onValueChange={(v) => setProjectIntent({ existingPv: v as CommercialExistingPv })}
            className="mt-2 flex flex-col gap-2"
          >
            {(Object.keys(existingPvLabel) as CommercialExistingPv[]).map((v) => (
              <label key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} />{existingPvLabel[v]}
              </label>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label>{t('comments')}</Label>
          <Textarea
            value={projectIntent.comments}
            onChange={(e) => setProjectIntent({ comments: e.target.value.slice(0, 500) })}
            maxLength={500}
            rows={3}
            className="mt-1"
          />
          <p className="text-sm text-[#062E25]/60 mt-1">{projectIntent.comments.length} / 500</p>
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox id="privacy"
                    checked={consents.privacy}
                    onCheckedChange={(v) => setConsents({ privacy: v === true })} />
          <Label htmlFor="privacy" className="text-sm text-[#062E25]/70">{t('privacyConsent')}</Label>
        </div>
        {errors.privacy && <p className="text-sm text-red-600">{errors.privacy}</p>}

        <div className="flex items-start gap-3">
          <Checkbox id="marketing"
                    checked={consents.marketing}
                    onCheckedChange={(v) => setConsents({ marketing: v === true })} />
          <Label htmlFor="marketing" className="text-sm text-[#062E25]/70">{t('marketingConsent')}</Label>
        </div>
      </section>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-3 px-6 py-4"
        style={{ background: 'rgba(234, 237, 223, 0.85)', backdropFilter: 'blur(12px)' }}
      >
        <Button variant="outline" onClick={prevStep}
                style={{ borderColor: '#062E25', color: '#062E25' }}>{tNav('back')}</Button>
        <Button onClick={handleNext} className="bg-[#062E25] text-white hover:bg-[#062E25]/90">
          {tNav('next')}
        </Button>
      </div>
    </div>
  )
}
