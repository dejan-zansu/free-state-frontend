'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Home,
  FileText,
  Shield,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

// Swiss cantons
const SWISS_CANTONS = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH',
]

export default function SonnendachStep6PersonalInfo() {
  const t = useTranslations('sonnendach.step6PersonalInfo')
  const tCommon = useTranslations('common')

  const {
    personalInfo,
    setPersonalInfo,
    installationAddress,
    setInstallationAddress,
    billingAddress,
    setBillingAddress,
    sameAsInstallation,
    setSameAsInstallation,
    propertyOwnership,
    setPropertyOwnership,
    consents,
    setConsents,
    address,
    goToStep,
    nextStep,
    isLoading,
    error,
  } = useSonnendachCalculatorStore()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Parse installation address from calculator address
  const parseAddress = (fullAddress: string) => {
    // Try to extract postal code and city from address like "Bahnhofstrasse 1, 8001 Zürich"
    const postalMatch = fullAddress.match(/(\d{4})\s+([^,]+)/)
    if (postalMatch) {
      return {
        postalCode: postalMatch[1],
        city: postalMatch[2].trim(),
      }
    }
    return { postalCode: '', city: '' }
  }

  // Initialize installation address from calculator address if empty
  if (!installationAddress.street && address) {
    const parsed = parseAddress(address)
    const streetMatch = address.match(/^([^,]+)/)
    setInstallationAddress({
      street: streetMatch ? streetMatch[1] : address,
      streetNumber: '',
      postalCode: parsed.postalCode,
      city: parsed.city,
      canton: '',
      country: 'CH',
    })
  }

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Personal info validation
    if (!personalInfo.firstName.trim()) {
      errors.firstName = t('validation.firstNameRequired')
    }
    if (!personalInfo.lastName.trim()) {
      errors.lastName = t('validation.lastNameRequired')
    }
    if (!personalInfo.email.trim()) {
      errors.email = t('validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      errors.email = t('validation.emailInvalid')
    }
    if (!personalInfo.phone.trim()) {
      errors.phone = t('validation.phoneRequired')
    } else if (!/^\+41\s?7[5-9]\s?\d{3}\s?\d{2}\s?\d{2}$/.test(personalInfo.phone.replace(/\s/g, ''))) {
      errors.phone = t('validation.phoneInvalid')
    }
    if (!personalInfo.password) {
      errors.password = t('validation.passwordRequired')
    } else if (personalInfo.password.length < 8) {
      errors.password = t('validation.passwordTooShort')
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(personalInfo.password)) {
      errors.password = t('validation.passwordWeak')
    }
    if (personalInfo.password !== confirmPassword) {
      errors.confirmPassword = t('validation.passwordMismatch')
    }

    // Installation address validation
    if (!installationAddress.street.trim()) {
      errors.installStreet = t('validation.streetRequired')
    }
    if (!installationAddress.postalCode.trim()) {
      errors.installPostalCode = t('validation.postalCodeRequired')
    }
    if (!installationAddress.city.trim()) {
      errors.installCity = t('validation.cityRequired')
    }
    if (!installationAddress.canton) {
      errors.installCanton = t('validation.cantonRequired')
    }

    // Billing address validation (if different)
    if (!sameAsInstallation) {
      if (!billingAddress.street.trim()) {
        errors.billStreet = t('validation.streetRequired')
      }
      if (!billingAddress.postalCode.trim()) {
        errors.billPostalCode = t('validation.postalCodeRequired')
      }
      if (!billingAddress.city.trim()) {
        errors.billCity = t('validation.cityRequired')
      }
      if (!billingAddress.canton) {
        errors.billCanton = t('validation.cantonRequired')
      }
    }

    // Property ownership validation
    if (!propertyOwnership.isPropertyOwner && !propertyOwnership.propertyOwnerName?.trim()) {
      errors.ownerName = t('validation.ownerNameRequired')
    }

    // Consents validation
    if (!consents.terms) {
      errors.terms = t('validation.termsRequired')
    }
    if (!consents.privacy) {
      errors.privacy = t('validation.privacyRequired')
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      nextStep()
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-energy" />
                {t('contactDetails.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('contactDetails.firstName')} *</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ firstName: e.target.value })}
                    placeholder={t('contactDetails.firstNamePlaceholder')}
                    className={validationErrors.firstName ? 'border-destructive' : ''}
                  />
                  {validationErrors.firstName && (
                    <p className="text-xs text-destructive">{validationErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('contactDetails.lastName')} *</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ lastName: e.target.value })}
                    placeholder={t('contactDetails.lastNamePlaceholder')}
                    className={validationErrors.lastName ? 'border-destructive' : ''}
                  />
                  {validationErrors.lastName && (
                    <p className="text-xs text-destructive">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contactDetails.email')} *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ email: e.target.value })}
                      placeholder={t('contactDetails.emailPlaceholder')}
                      className={`pl-10 ${validationErrors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-destructive">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('contactDetails.phone')} *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ phone: e.target.value })}
                      placeholder="+41 79 123 45 67"
                      className={`pl-10 ${validationErrors.phone ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-xs text-destructive">{validationErrors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{t('contactDetails.phoneHint')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installation Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-energy" />
                {t('installationAddress.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="installStreet">{t('installationAddress.street')} *</Label>
                  <Input
                    id="installStreet"
                    value={installationAddress.street}
                    onChange={(e) => setInstallationAddress({ ...installationAddress, street: e.target.value })}
                    placeholder={t('installationAddress.streetPlaceholder')}
                    className={validationErrors.installStreet ? 'border-destructive' : ''}
                  />
                  {validationErrors.installStreet && (
                    <p className="text-xs text-destructive">{validationErrors.installStreet}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installNumber">{t('installationAddress.number')}</Label>
                  <Input
                    id="installNumber"
                    value={installationAddress.streetNumber || ''}
                    onChange={(e) => setInstallationAddress({ ...installationAddress, streetNumber: e.target.value })}
                    placeholder="1a"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installPostalCode">{t('installationAddress.postalCode')} *</Label>
                  <Input
                    id="installPostalCode"
                    value={installationAddress.postalCode}
                    onChange={(e) => setInstallationAddress({ ...installationAddress, postalCode: e.target.value })}
                    placeholder="8001"
                    maxLength={4}
                    className={validationErrors.installPostalCode ? 'border-destructive' : ''}
                  />
                  {validationErrors.installPostalCode && (
                    <p className="text-xs text-destructive">{validationErrors.installPostalCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installCity">{t('installationAddress.city')} *</Label>
                  <Input
                    id="installCity"
                    value={installationAddress.city}
                    onChange={(e) => setInstallationAddress({ ...installationAddress, city: e.target.value })}
                    placeholder="Zürich"
                    className={validationErrors.installCity ? 'border-destructive' : ''}
                  />
                  {validationErrors.installCity && (
                    <p className="text-xs text-destructive">{validationErrors.installCity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installCanton">{t('installationAddress.canton')} *</Label>
                  <Select
                    value={installationAddress.canton}
                    onValueChange={(value) => setInstallationAddress({ ...installationAddress, canton: value })}
                  >
                    <SelectTrigger className={validationErrors.installCanton ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('installationAddress.selectCanton')} />
                    </SelectTrigger>
                    <SelectContent>
                      {SWISS_CANTONS.map((canton) => (
                        <SelectItem key={canton} value={canton}>
                          {canton}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.installCanton && (
                    <p className="text-xs text-destructive">{validationErrors.installCanton}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="sameAddress"
                  checked={sameAsInstallation}
                  onCheckedChange={(checked) => setSameAsInstallation(checked === true)}
                />
                <Label htmlFor="sameAddress" className="text-sm font-normal cursor-pointer">
                  {t('installationAddress.sameAsBilling')}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address (if different) */}
          {!sameAsInstallation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-energy" />
                  {t('billingAddress.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="billStreet">{t('billingAddress.street')} *</Label>
                    <Input
                      id="billStreet"
                      value={billingAddress.street}
                      onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                      placeholder={t('billingAddress.streetPlaceholder')}
                      className={validationErrors.billStreet ? 'border-destructive' : ''}
                    />
                    {validationErrors.billStreet && (
                      <p className="text-xs text-destructive">{validationErrors.billStreet}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billNumber">{t('billingAddress.number')}</Label>
                    <Input
                      id="billNumber"
                      value={billingAddress.streetNumber || ''}
                      onChange={(e) => setBillingAddress({ ...billingAddress, streetNumber: e.target.value })}
                      placeholder="1a"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billPostalCode">{t('billingAddress.postalCode')} *</Label>
                    <Input
                      id="billPostalCode"
                      value={billingAddress.postalCode}
                      onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                      placeholder="8001"
                      maxLength={4}
                      className={validationErrors.billPostalCode ? 'border-destructive' : ''}
                    />
                    {validationErrors.billPostalCode && (
                      <p className="text-xs text-destructive">{validationErrors.billPostalCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billCity">{t('billingAddress.city')} *</Label>
                    <Input
                      id="billCity"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      placeholder="Zürich"
                      className={validationErrors.billCity ? 'border-destructive' : ''}
                    />
                    {validationErrors.billCity && (
                      <p className="text-xs text-destructive">{validationErrors.billCity}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billCanton">{t('billingAddress.canton')} *</Label>
                    <Select
                      value={billingAddress.canton}
                      onValueChange={(value) => setBillingAddress({ ...billingAddress, canton: value })}
                    >
                      <SelectTrigger className={validationErrors.billCanton ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('billingAddress.selectCanton')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SWISS_CANTONS.map((canton) => (
                          <SelectItem key={canton} value={canton}>
                            {canton}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.billCanton && (
                      <p className="text-xs text-destructive">{validationErrors.billCanton}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Ownership */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-energy" />
                {t('propertyOwnership.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={propertyOwnership.isPropertyOwner ? 'owner' : 'authorized'}
                onValueChange={(value) => setPropertyOwnership({ isPropertyOwner: value === 'owner' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="owner" id="owner" />
                  <Label htmlFor="owner" className="font-normal cursor-pointer">
                    {t('propertyOwnership.isOwner')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="authorized" id="authorized" />
                  <Label htmlFor="authorized" className="font-normal cursor-pointer">
                    {t('propertyOwnership.isAuthorized')}
                  </Label>
                </div>
              </RadioGroup>

              {!propertyOwnership.isPropertyOwner && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">{t('propertyOwnership.ownerName')} *</Label>
                    <Input
                      id="ownerName"
                      value={propertyOwnership.propertyOwnerName || ''}
                      onChange={(e) => setPropertyOwnership({ propertyOwnerName: e.target.value })}
                      placeholder={t('propertyOwnership.ownerNamePlaceholder')}
                      className={validationErrors.ownerName ? 'border-destructive' : ''}
                    />
                    {validationErrors.ownerName && (
                      <p className="text-xs text-destructive">{validationErrors.ownerName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">{t('propertyOwnership.ownerEmail')}</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={propertyOwnership.propertyOwnerEmail || ''}
                      onChange={(e) => setPropertyOwnership({ propertyOwnerEmail: e.target.value })}
                      placeholder={t('propertyOwnership.ownerEmailPlaceholder')}
                    />
                    <p className="text-xs text-muted-foreground">{t('propertyOwnership.ownerEmailHint')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-energy" />
                {t('accountSetup.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('accountSetup.description')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('accountSetup.password')} *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={personalInfo.password}
                      onChange={(e) => setPersonalInfo({ password: e.target.value })}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-destructive">{validationErrors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{t('accountSetup.passwordHint')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('accountSetup.confirmPassword')} *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('accountSetup.language')}</Label>
                <Select
                  value={personalInfo.preferredLanguage}
                  onValueChange={(value: 'de' | 'fr' | 'it' | 'en') => setPersonalInfo({ preferredLanguage: value })}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Consents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-energy" />
                {t('consents.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={consents.terms}
                    onCheckedChange={(checked) => setConsents({ terms: checked === true })}
                    className={validationErrors.terms ? 'border-destructive' : ''}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                      {t('consents.termsLabel')} *
                    </Label>
                    {validationErrors.terms && (
                      <p className="text-xs text-destructive">{validationErrors.terms}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={consents.privacy}
                    onCheckedChange={(checked) => setConsents({ privacy: checked === true })}
                    className={validationErrors.privacy ? 'border-destructive' : ''}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="privacy" className="text-sm font-normal cursor-pointer leading-relaxed">
                      {t('consents.privacyLabel')} *
                    </Label>
                    {validationErrors.privacy && (
                      <p className="text-xs text-destructive">{validationErrors.privacy}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={consents.marketing}
                    onCheckedChange={(checked) => setConsents({ marketing: checked === true })}
                  />
                  <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer leading-relaxed">
                    {t('consents.marketingLabel')}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button variant="outline" onClick={() => goToStep(5)} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            {tCommon('back')}
          </Button>

          <Button onClick={handleNext} disabled={isLoading} className="gap-2 bg-energy hover:bg-energy/90">
            {t('continueToQuote')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
