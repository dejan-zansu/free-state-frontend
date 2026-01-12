/**
 * Country configuration types and utilities
 *
 * IMPORTANT: All actual values come from the backend API.
 * This file only contains:
 * - Type definitions
 * - Formatting utilities
 * - Country detection helpers
 *
 * NO HARDCODED BUSINESS VALUES - those are fetched from backend.
 */

export interface CountryConfig {
  code: string // ISO 3166-1 alpha-2
  name: string
  currency: string
  currencySymbol: string

  // Electricity prices (per kWh in local currency)
  electricityPrice: number
  feedInTariff: number

  // Tax
  vatRate: number // As decimal (0.081 = 8.1%)

  // Subsidies
  subsidyBase: number
  subsidyPerKw: number
  subsidyCapKw: number

  // Environmental
  co2FactorKgPerKwh: number

  // Solar parameters
  optimalTilt: number

  // Default consumption
  averageHouseholdConsumption: number

  // Installation costs
  installationCostPerKwp: number
}

// Locale mapping for number/currency formatting
const LOCALE_MAP: Record<string, string> = {
  CH: 'de-CH',
  DE: 'de-DE',
  AT: 'de-AT',
  FR: 'fr-FR',
  IT: 'it-IT',
  ES: 'es-ES',
  NL: 'nl-NL',
  BE: 'nl-BE',
  GB: 'en-GB',
  RS: 'sr-RS',
}

/**
 * Get locale for country (for number/currency formatting)
 */
export function getLocaleForCountry(countryCode: string): string {
  return LOCALE_MAP[countryCode.toUpperCase()] || 'de-CH'
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string,
  countryCode: string,
  decimals: number = 0
): string {
  return new Intl.NumberFormat(getLocaleForCountry(countryCode), {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Detect country from coordinates
 * For Switzerland: checks if coordinates are within Swiss boundaries
 * For other countries: returns null (not yet supported)
 */
export function detectCountryFromCoordinates(
  lat: number,
  lng: number
): string | null {
  // Switzerland boundaries (approximate)
  if (lat >= 45.8 && lat <= 47.8 && lng >= 5.9 && lng <= 10.5) {
    return 'CH'
  }

  // Other countries - return null, let backend handle or show error
  // Will be expanded when other countries are added
  return null
}
