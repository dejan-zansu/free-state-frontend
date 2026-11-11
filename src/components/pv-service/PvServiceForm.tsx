'use client'

import { Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'
import { z } from 'zod'

import { normalizePhone } from '@/components/offer-request/phone'
import { ArrowButton } from '@/components/ui/arrow-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Link } from '@/i18n/navigation'
import { getAttribution, trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { COMPANY_MAIN_PHONE_DISPLAY } from '@/lib/company-contact'
import { cn } from '@/lib/utils'

import { PV_SERVICE_INVERTER_BRANDS } from './pv-service-api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const EMAIL_SCHEMA = z.string().email()
const POSTAL_CODE_PATTERN = /^\d{4}$/
const FIRST_PLANT_YEAR = 1980
const MAX_PLANT_KW = 100000

export type PvServicePlacement = 'estimator' | 'final'

const INSTALLER_STATUSES = ['active', 'gone', 'unknown'] as const
const INTERESTS = [
  'monitoring',
  'maintenance',
  'cleaning',
  'thermography',
  'fault',
  'sina',
] as const

type Interest = (typeof INTERESTS)[number]

type FieldName =
  | 'companyName'
  | 'contactName'
  | 'email'
  | 'phone'
  | 'street'
  | 'postalCode'
  | 'city'
  | 'plantKw'
  | 'commissioningYear'
type SelectName = 'inverterBrand' | 'installerStatus'

type Values = Record<FieldName, string>
type Selects = Record<SelectName, string>
type Errors = Partial<Record<FieldName | 'consent' | 'submit', string>>

const FIELD_ORDER: FieldName[] = [
  'companyName',
  'contactName',
  'email',
  'phone',
  'street',
  'postalCode',
  'city',
  'plantKw',
  'commissioningYear',
]

export type PvServicePrefill = {
  street?: string
  postalCode?: string
  city?: string
  plantKw?: number | null
  commissioningYear?: number | null
}

interface PvServiceFormProps {
  placement: PvServicePlacement
  prefill?: PvServicePrefill | null
  className?: string
}

function parseNumber(value: string): number | null {
  const text = value.trim().replace(/'/g, '').replace(',', '.')
  if (!text) return null
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

export default function PvServiceForm({
  placement,
  prefill,
  className,
}: PvServiceFormProps) {
  const t = useTranslations('pvService.form')
  const tErr = useTranslations('pvService.form.errors')
  const tBase = useTranslations('offerRequest.form')
  const locale = useLocale()
  const idBase = `pv-service-${useId().replace(/:/g, '')}`

  const [values, setValues] = useState<Values>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    street: prefill?.street ?? '',
    postalCode: prefill?.postalCode ?? '',
    city: prefill?.city ?? '',
    plantKw: prefill?.plantKw != null ? String(prefill.plantKw) : '',
    commissioningYear:
      prefill?.commissioningYear != null
        ? String(prefill.commissioningYear)
        : '',
  })
  const [selects, setSelects] = useState<Selects>({
    inverterBrand: '',
    installerStatus: '',
  })
  const [interests, setInterests] = useState<Interest[]>([])
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null)

  const viewedRef = useRef(false)
  const startedRef = useRef(false)
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>(
    {}
  )
  const consentRef = useRef<HTMLButtonElement | null>(null)
  const successRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!submittedPhone) return
    successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [submittedPhone])

  useEffect(() => {
    if (viewedRef.current) return
    viewedRef.current = true
    trackFunnelEvent('pv_service_viewed', { meta: { placement } })
  }, [placement])

  const handleFocus = (field: string) => {
    if (startedRef.current) return
    startedRef.current = true
    trackFunnelEvent('pv_service_started', { meta: { placement, field } })
  }

  const setValue = (field: FieldName, value: string) => {
    setValues(current => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors(current => ({ ...current, [field]: undefined }))
    }
  }

  const toggleInterest = (interest: Interest, checked: boolean) => {
    setInterests(current =>
      checked
        ? [...current.filter(item => item !== interest), interest]
        : current.filter(item => item !== interest)
    )
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (!values.companyName.trim()) next.companyName = tErr('required')
    if (!values.contactName.trim()) next.contactName = tErr('required')
    const email = values.email.trim()
    if (!email) {
      next.email = tErr('required')
    } else if (!EMAIL_SCHEMA.safeParse(email).success) {
      next.email = tErr('emailInvalid')
    }
    if (!values.phone.trim()) {
      next.phone = tErr('required')
    } else if (!normalizePhone(values.phone)) {
      next.phone = tErr('phoneInvalid')
    }
    if (!values.street.trim()) next.street = tErr('required')
    if (!values.postalCode.trim()) {
      next.postalCode = tErr('required')
    } else if (!POSTAL_CODE_PATTERN.test(values.postalCode.trim())) {
      next.postalCode = tErr('postalCodeInvalid')
    }
    if (!values.city.trim()) next.city = tErr('required')
    if (values.plantKw.trim()) {
      const kw = parseNumber(values.plantKw)
      if (kw == null || kw <= 0 || kw > MAX_PLANT_KW) {
        next.plantKw = tErr('kwInvalid')
      }
    }
    if (values.commissioningYear.trim()) {
      const year = parseNumber(values.commissioningYear)
      if (
        year == null ||
        !Number.isInteger(year) ||
        year < FIRST_PLANT_YEAR ||
        year > new Date().getFullYear()
      ) {
        next.commissioningYear = tErr('yearInvalid', {
          from: String(FIRST_PLANT_YEAR),
        })
      }
    }
    if (!consent) next.consent = tErr('consentRequired')
    return next
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    const firstInvalid = FIELD_ORDER.find(field => nextErrors[field])
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus()
      return
    }
    if (nextErrors.consent) {
      consentRef.current?.focus()
      return
    }

    const phone = values.phone.trim()
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/api/contact/pv-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: values.companyName.trim(),
          contactName: values.contactName.trim(),
          email: values.email.trim(),
          phone,
          street: values.street.trim(),
          postalCode: values.postalCode.trim(),
          city: values.city.trim(),
          plantKw: parseNumber(values.plantKw) ?? undefined,
          commissioningYear: parseNumber(values.commissioningYear) ?? undefined,
          inverterBrand: selects.inverterBrand || undefined,
          installerStatus: selects.installerStatus || undefined,
          interests,
          message: message.trim() || undefined,
          privacy: true,
          locale,
          placement,
          attribution: getAttribution(),
        }),
      })
      if (response.status === 429) {
        setErrors({
          submit: tErr('rateLimited', { phone: COMPANY_MAIN_PHONE_DISPLAY }),
        })
        return
      }
      if (response.status === 400) {
        setErrors({
          submit: tErr('invalid', { phone: COMPANY_MAIN_PHONE_DISPLAY }),
        })
        return
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      trackFunnelEvent('pv_service_submitted', {
        meta: { placement, interests: interests.length },
      })
      setSubmittedPhone(phone)
    } catch {
      setErrors({
        submit: tErr('submitFailed', { phone: COMPANY_MAIN_PHONE_DISPLAY }),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const cardClass = cn(
    'w-full rounded-[24px] bg-white p-5 sm:p-8 md:p-10 text-left text-[#062E25] shadow-[0_20px_60px_rgba(6,46,37,0.12)]',
    className
  )

  if (submittedPhone) {
    return (
      <div
        ref={successRef}
        className={cn(cardClass, 'scroll-mt-28')}
        data-hj-suppress
        data-cs-mask
        data-offer-request-form
      >
        <div role="status">
          <h2 className="text-xl font-medium tracking-tight sm:text-2xl">
            {t('successTitle')}
          </h2>
          <p className="mt-3 text-base tracking-tight">
            {t('successBody', { phone: submittedPhone })}
          </p>
        </div>
      </div>
    )
  }

  const inputClass = (field: FieldName) =>
    cn(
      'mt-1.5 h-12 rounded-xl border-[#062E25]/20 bg-white px-4 text-base md:text-base',
      errors[field] && 'border-red-600'
    )

  const renderField = (
    field: FieldName,
    options: {
      type?: string
      autoComplete: string
      inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
      placeholder?: string
      maxLength?: number
    }
  ) => {
    const id = `${idBase}-${field}`
    const errorId = `${id}-error`
    return (
      <div>
        <label htmlFor={id} className="text-base tracking-tight">
          {t(`fields.${field}`)}
        </label>
        <Input
          ref={element => {
            fieldRefs.current[field] = element
          }}
          id={id}
          name={field}
          type={options.type ?? 'text'}
          value={values[field]}
          onChange={event => setValue(field, event.target.value)}
          onFocus={() => handleFocus(field)}
          autoComplete={options.autoComplete}
          inputMode={options.inputMode}
          placeholder={options.placeholder}
          maxLength={options.maxLength}
          aria-invalid={!!errors[field]}
          aria-describedby={errors[field] ? errorId : undefined}
          className={inputClass(field)}
        />
        {errors[field] && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-base text-red-600"
          >
            {errors[field]}
          </p>
        )}
      </div>
    )
  }

  const renderSelect = (field: SelectName, options: readonly string[]) => {
    const id = `${idBase}-${field}`
    return (
      <div>
        <label htmlFor={id} className="text-base tracking-tight">
          {t(`${field}.label`)}
        </label>
        <Select
          name={field}
          value={selects[field]}
          onValueChange={value =>
            setSelects(current => ({ ...current, [field]: value }))
          }
          onOpenChange={isOpen => {
            if (isOpen) handleFocus(field)
          }}
        >
          <SelectTrigger
            id={id}
            className="mt-1.5 w-full rounded-xl border-[#062E25]/20 bg-white px-4 text-base text-[#062E25] shadow-none data-[placeholder]:text-[#062E25]/50 data-[size=default]:h-12 [&_svg:not([class*='text-'])]:text-[#062E25]"
          >
            <SelectValue placeholder={t('choose')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-[#062E25]/15 bg-white text-[#062E25] shadow-[0_20px_40px_rgba(6,46,37,0.16)]">
            {options.map(option => (
              <SelectItem
                key={option}
                value={option}
                className="rounded-lg py-2.5 pl-3 text-base focus:bg-[#EAEDDF] focus:text-[#062E25]"
              >
                {t(`${field}.options.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  const consentId = `${idBase}-consent`
  const messageId = `${idBase}-message`
  const checkboxClass =
    'mt-0.5 size-5 shrink-0 rounded-[4px] border-[#062E25]/40 data-[state=checked]:border-[#062E25] data-[state=checked]:bg-[#062E25] data-[state=checked]:text-white'

  return (
    <div
      className={cardClass}
      data-hj-suppress
      data-cs-mask
      data-offer-request-form
    >
      <h2 className="text-xl font-medium tracking-tight sm:text-2xl">
        {t(`heading.${placement}`)}
      </h2>
      <p className="mt-2 text-base tracking-tight text-[#062E25]/80">
        {t('intro')}
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          {renderField('companyName', {
            autoComplete: 'organization',
            maxLength: 200,
          })}
          {renderField('contactName', {
            autoComplete: 'name',
            placeholder: tBase('namePlaceholder'),
            maxLength: 200,
          })}
          {renderField('email', {
            type: 'email',
            autoComplete: 'email',
            inputMode: 'email',
            maxLength: 254,
          })}
          {renderField('phone', {
            type: 'tel',
            autoComplete: 'tel',
            inputMode: 'tel',
            placeholder: tBase('phonePlaceholder'),
            maxLength: 40,
          })}
        </div>

        <p className="mt-2 text-base font-medium tracking-tight">
          {t('plantTitle')}
        </p>

        {renderField('street', {
          autoComplete: 'street-address',
          maxLength: 200,
        })}

        <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-4">
          {renderField('postalCode', {
            autoComplete: 'postal-code',
            inputMode: 'numeric',
            maxLength: 4,
          })}
          {renderField('city', {
            autoComplete: 'address-level2',
            maxLength: 100,
          })}
        </div>

        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          {renderField('plantKw', {
            autoComplete: 'off',
            inputMode: 'decimal',
            maxLength: 10,
          })}
          {renderField('commissioningYear', {
            autoComplete: 'off',
            inputMode: 'numeric',
            maxLength: 4,
          })}
          {renderSelect('inverterBrand', PV_SERVICE_INVERTER_BRANDS)}
          {renderSelect('installerStatus', INSTALLER_STATUSES)}
        </div>

        <fieldset className="mt-2">
          <legend className="text-base font-medium tracking-tight">
            {t('interests.label')}
          </legend>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INTERESTS.map(interest => {
              const id = `${idBase}-interest-${interest}`
              return (
                <div key={interest} className="flex items-start gap-2.5">
                  <Checkbox
                    id={id}
                    checked={interests.includes(interest)}
                    onCheckedChange={checked =>
                      toggleInterest(interest, checked === true)
                    }
                    onFocus={() => handleFocus('interests')}
                    className={checkboxClass}
                  />
                  <label htmlFor={id} className="text-base tracking-tight">
                    {t(`interests.options.${interest}`)}
                  </label>
                </div>
              )
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor={messageId} className="text-base tracking-tight">
            {t('fields.message')}
          </label>
          <Textarea
            id={messageId}
            name="message"
            value={message}
            onChange={event => setMessage(event.target.value)}
            onFocus={() => handleFocus('message')}
            maxLength={5000}
            rows={4}
            placeholder={t('messagePlaceholder')}
            className="mt-1.5 min-h-28 rounded-xl border-[#062E25]/20 bg-white px-4 py-3 text-base text-[#062E25] placeholder:text-[#062E25]/50 md:text-base"
          />
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <Checkbox
              ref={consentRef}
              id={consentId}
              checked={consent}
              onCheckedChange={checked => {
                setConsent(checked === true)
                if (errors.consent) {
                  setErrors(current => ({ ...current, consent: undefined }))
                }
              }}
              onFocus={() => handleFocus('consent')}
              aria-invalid={!!errors.consent}
              aria-describedby={
                errors.consent ? `${consentId}-error` : undefined
              }
              className={checkboxClass}
            />
            <label htmlFor={consentId} className="text-base tracking-tight">
              {tBase.rich('consent', {
                privacyLink: chunks => (
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="underline underline-offset-2 text-[#062E25] hover:text-[#062E25]"
                    onClick={event => event.stopPropagation()}
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </label>
          </div>
          {errors.consent && (
            <p
              id={`${consentId}-error`}
              role="alert"
              className="mt-1.5 text-base text-red-600"
            >
              {errors.consent}
            </p>
          )}
        </div>

        {errors.submit && (
          <p role="alert" className="text-base text-red-600">
            {errors.submit}
          </p>
        )}

        <ArrowButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full text-base disabled:opacity-60"
        >
          {isSubmitting && (
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          )}
          {t('submit')}
        </ArrowButton>
      </form>
    </div>
  )
}
