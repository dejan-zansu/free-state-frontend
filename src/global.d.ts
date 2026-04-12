/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google?: typeof google
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    hj?: ((...args: unknown[]) => void) & { q?: unknown[] }
    _hjSettings?: { hjid: number; hjsv: number }
  }
}

// Export empty object to make this a module
export {}
