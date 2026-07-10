import { describe, it, expect, afterEach, vi } from 'vitest'
import { MOTION, prefersReducedMotion } from './motion'

describe('MOTION tokens', () => {
  it('exposes the shared motion language', () => {
    expect(MOTION.duration).toBe(0.9)
    expect(MOTION.ease).toBe('power3.out')
    expect(MOTION.distance).toBe(48)
    expect(MOTION.stagger).toBe(0.1)
    expect(MOTION.start).toBe('top 85%')
  })
})

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    expect(prefersReducedMotion()).toBe(true)
  })

  it('returns false when motion is allowed', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    expect(prefersReducedMotion()).toBe(false)
  })
})
