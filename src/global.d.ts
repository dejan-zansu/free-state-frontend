/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google?: typeof google
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

// Export empty object to make this a module
export {}
