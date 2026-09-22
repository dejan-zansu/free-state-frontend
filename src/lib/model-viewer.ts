let registration: Promise<unknown> | null = null

export function registerModelViewer(): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.customElements?.get('model-viewer')) return Promise.resolve()
  if (!registration) registration = import('@google/model-viewer')
  return registration
}
