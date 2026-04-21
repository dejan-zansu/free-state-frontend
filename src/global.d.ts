/// <reference types="@types/google.maps" />

declare global {
  namespace google.accounts.oauth2 {
    interface CodeResponse {
      code: string
      scope?: string
      authuser?: string
      prompt?: string
    }

    interface CodeClientConfig {
      client_id: string
      scope: string
      ux_mode?: 'popup' | 'redirect'
      redirect_uri?: string
      callback: (response: CodeResponse) => void
      error_callback?: (error: { type: string; message?: string }) => void
    }

    interface CodeClient {
      requestCode: () => void
    }

    function initCodeClient(config: CodeClientConfig): CodeClient
  }

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
