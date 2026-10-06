'use client'

import { Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { getAttribution, trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { trackLead } from '@/lib/analytics/track-lead'
import { COMPANY_MAIN_PHONE_DISPLAY } from '@/lib/company-contact'
import { cn } from '@/lib/utils'

import { normalizePhone } from './phone'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const POSTAL_CODE_PATTERN = /^\d{4}$/

export type OfferRequestPlacement = 'page' | 'kosten' | 'calculator'

type FieldName = 'name' | 'phone' | 'street' | 'postalCode' | 'city' | 'email'

type Values = Record<FieldName, string>

type Errors = Partial<Record<FieldName | 'consent' | 'submit', string>>

const FIELD_ORDER: FieldName[] = [
  'name',
  'phone',
  'street',
  'postalCode',
  'city',
  'email',
]

const EMPTY_VALUES: Values = {
  name: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
  email: '',
}

interface OfferRequestFormProps {
  placement: OfferRequestPlacement
  className?: string
}

export default function OfferRequestForm({
  placement,
  className,
}: OfferRequestFormProps) {
  const t = useTranslations('offerRequest.form')
  const tErr = useTranslations('offerRequest.form.errors')
  const locale = useLocale()
  const idBase = `offer-request-${useId().replace(/:/g, '')}`

  const [values, setValues] = useState<Values>(EMPTY_VALUES)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null)

  const viewedRef = useRef(false)
  const startedRef = useRef(false)
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>(
    {}
  )
  const consentRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (viewedRef.current) return
    viewedRef.current = true
    trackFunnelEvent('offer_request_viewed', { meta: { placement } })
  }, [placement])

  const handleFocus = (field: FieldName | 'consent') => {
    if (startedRef.current) return
    startedRef.current = true
    trackFunnelEvent('offer_request_started', { meta: { placement, field } })
  }

  const setValue = (field: FieldName, value: string) => {
    setValues(current => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors(current => ({ ...current, [field]: undefined }))
    }
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (!values.name.trim()) next.name = tErr('required')
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
    const email = values.email.trim()
    if (email && !EMAIL_PATTERN.test(email)) {
      next.email = tErr('emailInvalid')
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
      const response = await fetch(`${API_URL}/api/contact/offer-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          phone,
          street: values.street.trim(),
          postalCode: values.postalCode.trim(),
          city: values.city.trim(),
          email: values.email.trim(),
          privacy: true,
          placement,
          locale,
          attribution: getAttribution(),
        }),
      })
      if (response.status === 429) {
        setErrors({
          submit: tErr('rateLimited', { phone: COMPANY_MAIN_PHONE_DISPLAY }),
        })
        return
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      trackFunnelEvent('offer_request_submitted', { meta: { placement } })
      trackLead({ form: 'offer_request', source: placement, locale })
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
    'w-full rounded-[24px] bg-white p-5 sm:p-8 text-left text-[#062E25] shadow-[0_20px_60px_rgba(6,46,37,0.18)]',
    className
  )

  if (submittedPhone) {
    return (
      <div className={cardClass} data-hj-suppress data-cs-mask data-offer-request-form>
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
      hint?: string
    }
  ) => {
    const id = `${idBase}-${field}`
    const errorId = `${id}-error`
    const hintId = `${id}-hint`
    const describedBy =
      [errors[field] ? errorId : null, options.hint ? hintId : null]
        .filter(Boolean)
        .join(' ') || undefined
    return (
      <div>
        <label htmlFor={id} className="text-base tracking-tight">
          {t(field)}
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
          aria-describedby={describedBy}
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
        {options.hint && (
          <p id={hintId} className="mt-1.5 text-base text-[#062E25]/70">
            {options.hint}
          </p>
        )}
      </div>
    )
  }

  const consentId = `${idBase}-consent`

  return (
    <div className={cardClass} data-hj-suppress data-cs-mask data-offer-request-form>
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
          {renderField('name', {
            autoComplete: 'name',
            placeholder: t('namePlaceholder'),
            maxLength: 200,
          })}
          {renderField('phone', {
            type: 'tel',
            autoComplete: 'tel',
            inputMode: 'tel',
            placeholder: t('phonePlaceholder'),
            maxLength: 40,
            hint: t('phoneHint'),
          })}
        </div>

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

        {renderField('email', {
          type: 'email',
          autoComplete: 'email',
          inputMode: 'email',
          maxLength: 254,
        })}

        <div>
          <div className="flex items-start gap-2.5">
            <input
              ref={consentRef}
              id={consentId}
              type="checkbox"
              checked={consent}
              onChange={event => {
                setConsent(event.target.checked)
                if (errors.consent) {
                  setErrors(current => ({ ...current, consent: undefined }))
                }
              }}
              onFocus={() => handleFocus('consent')}
              aria-invalid={!!errors.consent}
              aria-describedby={
                errors.consent ? `${consentId}-error` : undefined
              }
              className="mt-1 h-5 w-5 shrink-0 rounded-[4px] border-[#062E25]/40 accent-[#062E25]"
            />
            <label htmlFor={consentId} className="text-base tracking-tight">
              {t.rich('consent', {
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('submit')}
        </Button>
      </form>
    </div>
  )
}
