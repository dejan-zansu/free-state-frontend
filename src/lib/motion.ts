export const MOTION = {
  duration: 0.9,
  ease: 'power3.out',
  distance: 48,
  stagger: 0.1,
  start: 'top 85%',
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
