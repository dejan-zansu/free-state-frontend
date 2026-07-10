import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Reveal, RevealStagger } from './Reveal'
import gsap from 'gsap'

vi.mock('@gsap/react', () => ({
  useGSAP: (cb: () => void) => {
    queueMicrotask(cb)
  },
}))

vi.mock('gsap', () => {
  const gsap = {
    registerPlugin: () => {},
    set: vi.fn(),
    from: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
  }
  return { default: gsap, gsap }
})

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }))

function setMatchMedia(matches: boolean) {
  window.matchMedia = ((q: string) => ({
    matches,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
}

describe('Reveal', () => {
  beforeEach(() => {
    setMatchMedia(false)
    vi.clearAllMocks()
  })

  it('renders its children (content always present)', () => {
    render(
      <Reveal>
        <p>Solar for everyone</p>
      </Reveal>
    )
    expect(screen.getByText('Solar for everyone')).toBeInTheDocument()
  })

  it('renders the element chosen via `as`', () => {
    render(
      <Reveal as="section" className="my-section">
        <span>x</span>
      </Reveal>
    )
    expect(document.querySelector('section.my-section')).not.toBeNull()
  })

  it('respects reduced motion by jumping to the final state without animating', async () => {
    setMatchMedia(true)
    render(
      <Reveal>
        <p>content</p>
      </Reveal>
    )
    await Promise.resolve()
    expect(gsap.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ opacity: 1 })
    )
    expect(gsap.fromTo).not.toHaveBeenCalled()
  })

  it('animates on scroll by default with a once-only scrollTrigger', async () => {
    render(
      <Reveal>
        <p>content</p>
      </Reveal>
    )
    await Promise.resolve()
    expect(gsap.fromTo).toHaveBeenCalled()
    const [, fromVars, toVars] = vi.mocked(gsap.fromTo).mock.calls[0]
    expect(fromVars).toEqual(expect.objectContaining({ opacity: 0 }))
    expect(toVars).toEqual(
      expect.objectContaining({
        scrollTrigger: expect.objectContaining({ start: 'top 85%', once: true }),
      })
    )
  })

  it('animates on load without a scrollTrigger', async () => {
    render(
      <Reveal on="load">
        <p>content</p>
      </Reveal>
    )
    await Promise.resolve()
    expect(gsap.fromTo).toHaveBeenCalled()
    const [, , toVars] = vi.mocked(gsap.fromTo).mock.calls[0]
    expect(toVars).not.toHaveProperty('scrollTrigger')
  })
})

describe('RevealStagger', () => {
  it('renders all children visibly', () => {
    render(
      <RevealStagger>
        <div>one</div>
        <div>two</div>
        <div>three</div>
      </RevealStagger>
    )
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
    expect(screen.getByText('three')).toBeInTheDocument()
  })
})
