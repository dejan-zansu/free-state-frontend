/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google?: typeof google
    dataLayer?: unknown[]
    hj?: ((...args: unknown[]) => void) & { q?: unknown[] }
    _hjSettings?: { hjid: number; hjsv: number }
    gtag?: (...args: unknown[]) => void
  }
}

// Export empty object to make this a module
export {}
