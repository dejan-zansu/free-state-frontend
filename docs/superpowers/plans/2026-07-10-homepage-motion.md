# Homepage Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subtle, premium scroll-reveal animations and a hero entrance to the homepage, driven by one reusable `<Reveal>` component and a single shared motion config.

**Architecture:** A pure config module defines the motion "tokens" (duration, easing, distance, stagger, start position) and a reduced-motion check. A thin `'use client'` `<Reveal>` component (plus `<Reveal.Stagger>`) uses the existing `useGSAP` + ScrollTrigger convention to fade + rise elements on scroll-in (once) or on load. Homepage sections stay server components and simply wrap their markup in `<Reveal>`. Hover polish is applied as shared Tailwind utility patterns.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, GSAP 3 + `@gsap/react` (`useGSAP`) + ScrollTrigger (already installed), Tailwind v4, Vitest + Testing Library (jsdom).

## Global Constraints

- No new dependencies. Use existing `gsap`, `@gsap/react`, `gsap/ScrollTrigger`.
- Do NOT run `git commit`. Stage changes with `git add` and stop; the user runs every commit themselves. (Project/global rule.)
- No code comments anywhere (project rule).
- No Tailwind `leading-*` utilities (project rule).
- Alignment must be consistent across breakpoints — do not swap `text-center sm:text-left` / `items-center md:items-start` for animation purposes.
- Homepage sections stay server components; only motion wrappers are `'use client'`.
- Content must be visible without JS and with `prefers-reduced-motion: reduce` — no permanently-hidden content, no CLS.
- Follow the existing GSAP pattern from `src/components/SolarSystemsQualityTimeline.tsx`: `gsap.registerPlugin(ScrollTrigger)`, `useGSAP(() => {...}, { scope: ref })`.
- Reveals play ONCE (no reverse on scroll-up).
- Import alias `@` maps to `src/`.

---

## File Structure

- **Create** `src/lib/motion.ts` — motion tokens + `prefersReducedMotion()` helper. Pure, testable.
- **Create** `src/lib/motion.test.ts` — unit tests for the config/helper.
- **Create** `src/components/motion/Reveal.tsx` — `<Reveal>` client component with `Reveal.Stagger` compound export; handles scroll + load triggers, reduced motion, no-flash guard.
- **Create** `src/components/motion/Reveal.test.tsx` — render tests (content present, reduced-motion path).
- **Modify** homepage section components to wrap markup in `<Reveal>` (Tasks 5–7).
- **Modify** card/button markup for hover polish (Task 8).

### The wrapping recipe (used in Tasks 4–7)

Every section edit follows the same shape. Import at top of the (server) section file:

```tsx
import { Reveal } from '@/components/motion/Reveal'
```

Then wrap a single block (fades + rises as one unit):

```tsx
<Reveal>
  {/* existing heading / block markup, unchanged */}
</Reveal>
```

Or wrap a group whose direct children should sequence in:

```tsx
<Reveal.Stagger>
  {/* existing grid/list; its DIRECT children each animate in order */}
</Reveal.Stagger>
```

`<Reveal>` renders a `<div>` by default; pass `as="section"`/`as="ol"` etc. to preserve semantics where the wrapped element is not a plain div. Passing `className` is forwarded to the rendered element.

---

## Task 1: Motion config module

**Files:**
- Create: `src/lib/motion.ts`
- Test: `src/lib/motion.test.ts`

**Interfaces:**
- Produces:
  - `MOTION` — `{ duration: number; ease: string; distance: number; stagger: number; start: string }`
  - `prefersReducedMotion(): boolean`

- [ ] **Step 1: Write the failing test**

```tsx
// src/lib/motion.test.ts
import { describe, it, expect, afterEach, vi } from 'vitest'
import { MOTION, prefersReducedMotion } from './motion'

describe('MOTION tokens', () => {
  it('exposes the shared motion language', () => {
    expect(MOTION.duration).toBe(0.6)
    expect(MOTION.ease).toBe('power2.out')
    expect(MOTION.distance).toBe(24)
    expect(MOTION.stagger).toBe(0.08)
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/motion.test.ts`
Expected: FAIL — cannot resolve `./motion`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/motion.ts
export const MOTION = {
  duration: 0.6,
  ease: 'power2.out',
  distance: 24,
  stagger: 0.08,
  start: 'top 85%',
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/motion.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Stage**

```bash
git add src/lib/motion.ts src/lib/motion.test.ts
```

---

## Task 2: `<Reveal>` component (single-block scroll reveal)

**Files:**
- Create: `src/components/motion/Reveal.tsx`
- Test: `src/components/motion/Reveal.test.tsx`

**Interfaces:**
- Consumes: `MOTION`, `prefersReducedMotion` from `@/lib/motion`.
- Produces: `Reveal` — a React component with props:
  - `children: React.ReactNode`
  - `as?: keyof JSX.IntrinsicElements` (default `'div'`)
  - `className?: string`
  - `delay?: number` (seconds, default `0`)
  - `distance?: number` (px, default `MOTION.distance`)
  - `on?: 'scroll' | 'load'` (default `'scroll'`)
  - `stagger?: boolean` (default `false`) — animate direct children in sequence
  - Later extended by `Reveal.Stagger` in Task 3.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/motion/Reveal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Reveal } from './Reveal'

vi.mock('@gsap/react', () => ({
  useGSAP: (cb: () => void) => cb(),
}))

vi.mock('gsap', () => {
  const gsap = {
    registerPlugin: () => {},
    set: vi.fn(),
    from: vi.fn(),
    to: vi.fn(),
  }
  return { default: gsap, gsap }
})

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }))

describe('Reveal', () => {
  beforeEach(() => {
    window.matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
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
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/motion/Reveal.test.tsx`
Expected: FAIL — cannot resolve `./Reveal`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/motion/Reveal.tsx
'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ElementType, type ReactNode } from 'react'
import { MOTION, prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  delay?: number
  distance?: number
  on?: 'scroll' | 'load'
  stagger?: boolean
}

export function Reveal({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  distance = MOTION.distance,
  on = 'scroll',
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const targets = stagger ? Array.from(el.children) : el
      const fromVars: gsap.TweenVars = { opacity: 0, y: distance }
      const toVars: gsap.TweenVars = {
        opacity: 1,
        y: 0,
        duration: MOTION.duration,
        ease: MOTION.ease,
        delay,
        stagger: stagger ? MOTION.stagger : 0,
      }

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      if (on === 'load') {
        gsap.fromTo(targets, fromVars, toVars)
        return
      }

      gsap.fromTo(targets, fromVars, {
        ...toVars,
        scrollTrigger: { trigger: el, start: MOTION.start, once: true },
      })
    },
    { scope: ref }
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/motion/Reveal.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors from `Reveal.tsx` / `motion.ts`.

- [ ] **Step 6: Stage**

```bash
git add src/components/motion/Reveal.tsx src/components/motion/Reveal.test.tsx
```

---

## Task 3: `Reveal.Stagger` sugar + no-flash guard

**Files:**
- Modify: `src/components/motion/Reveal.tsx`
- Modify: `src/components/motion/Reveal.test.tsx`

**Interfaces:**
- Produces: `Reveal.Stagger` — same props as `Reveal` minus `stagger`, always staggers direct children.
- Behavior: before mount/animation, initial hidden state is applied by GSAP inside `useGSAP` (which runs after render). Content is rendered visible in the DOM (SSR-safe); GSAP sets `opacity:0` then animates in. Under reduced motion or no-JS, content stays visible.

- [ ] **Step 1: Add the failing test**

Append to `src/components/motion/Reveal.test.tsx`:

```tsx
describe('Reveal.Stagger', () => {
  it('renders all children visibly', () => {
    render(
      <Reveal.Stagger>
        <div>one</div>
        <div>two</div>
        <div>three</div>
      </Reveal.Stagger>
    )
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
    expect(screen.getByText('three')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/motion/Reveal.test.tsx`
Expected: FAIL — `Reveal.Stagger is undefined`.

- [ ] **Step 3: Implement the compound component**

Add to the bottom of `src/components/motion/Reveal.tsx`, before/after the `Reveal` function as appropriate:

```tsx
function Stagger(props: Omit<RevealProps, 'stagger'>) {
  return <Reveal {...props} stagger />
}

Reveal.Stagger = Stagger
```

Note: because `Reveal` is a named function declaration, attaching `Reveal.Stagger` after it is valid. Keep the `export function Reveal` as-is.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/motion/Reveal.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors. If TS complains about `Reveal.Stagger` assignment, type it:

```tsx
export const Reveal = Object.assign(RevealBase, { Stagger })
```

where `RevealBase` is the function body renamed. Prefer the simple attach first; only switch to `Object.assign` if the compiler requires it.

- [ ] **Step 6: Stage**

```bash
git add src/components/motion/Reveal.tsx src/components/motion/Reveal.test.tsx
```

---

## Task 4: Hero entrance on load

**Files:**
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `Reveal` (`on="load"`, `stagger`, `delay`).
- Hero is an `async` server component. `<Reveal>` is a client component receiving server-rendered children — this is allowed; do not convert Hero to a client component.

- [ ] **Step 1: Open the file and identify the entrance group**

Read `src/components/Hero.tsx`. Locate the inner content block containing, in order: headline (`h1`), subtext (`p`), CTA button, and the pill list. These are the elements that should rise in sequence.

- [ ] **Step 2: Wrap the entrance group**

Add the import:

```tsx
import { Reveal } from '@/components/motion/Reveal'
```

Wrap the vertical stack of hero text elements (the flex column that holds headline → subtext → CTA → pills) so its direct children sequence in on load:

```tsx
<Reveal.Stagger on="load" className={/* keep the existing wrapper classes */}>
  {/* existing: headline, subtext, CTA, pills — unchanged, in order */}
</Reveal.Stagger>
```

Requirements:
- Move the existing wrapper `className` onto `<Reveal.Stagger>` and remove the now-redundant intermediate wrapper div if one existed solely for layout, OR keep the wrapper div and place `<Reveal.Stagger>` around its children — choose whichever preserves the current layout exactly. Do not change alignment classes.
- The pill list should be ONE direct child of the stagger group (so pills rise together as the final beat), not spread as many children — if pills are siblings of the text, wrap them in their existing container so the sequence is headline → subtext → CTA → pill-group.

- [ ] **Step 3: Verify build + no layout change**

Run: `npx tsc --noEmit`
Expected: no errors.

Run the dev server: `npm run dev` (port 3001). Open `http://localhost:3001/en` (or the default locale). Expected: hero text rises in sequence once on load; final layout identical to before.

- [ ] **Step 4: Stage**

```bash
git add src/components/Hero.tsx
```

---

## Task 5: Reveals for grid sections (batch A)

**Files:**
- Modify: `src/components/ExperienceTimeline.tsx`
- Modify: `src/components/home/PromoSection.tsx`
- Modify: `src/components/SolarModels.tsx`
- Modify: `src/components/home/PackageCatalogSection.tsx`

**Interfaces:**
- Consumes: `Reveal`, `Reveal.Stagger`.

**Worked example — `ExperienceTimeline.tsx` (heading reveal + staggered cards + line-draw):**

Current structure: a centered heading block (`h2` + `p`), then an `<ol>` grid of 4 `<li>` cards with an absolutely-positioned connector `<div>` line.

- [ ] **Step 1: Import Reveal**

```tsx
import { Reveal } from '@/components/motion/Reveal'
```

- [ ] **Step 2: Wrap the heading block**

Wrap the `div` that holds the `h2` + `p`:

```tsx
<Reveal className="flex flex-col items-center gap-5 text-center mb-12 md:mb-16">
  <h2 ...>{t('sectionHeading')}</h2>
  <p ...>{t('subheading')}</p>
</Reveal>
```

(Move the existing wrapper classes onto `<Reveal>`; delete the old wrapper div so markup nesting is unchanged.)

- [ ] **Step 3: Stagger the cards**

Wrap the card list. Preserve the `<ol>` semantics with `as="ol"`, keep its grid classes, and keep the connector line as the first child (the line is `aria-hidden` and will also fade — acceptable, it reads as "drawing in" with the cards):

```tsx
<Reveal.Stagger as="ol" className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-[30px] relative">
  <div className="hidden md:block absolute top-6 left-12 right-12 h-px bg-foreground/20" aria-hidden />
  {NODES.map(n => (
    <li key={n.titleKey} className="relative bg-[#FDFEFA] rounded-xl border border-[#546963]/50 p-6">
      {/* unchanged */}
    </li>
  ))}
</Reveal.Stagger>
```

Note: the connector `<div>` becomes the first staggered child and fades with the group. This satisfies the "line draws in as cards appear" intent without a bespoke timeline. Do not add a separate line-height tween here (keep it simple; a dedicated line-draw is out of scope for v1 if it requires extra refs).

- [ ] **Step 4: Apply the same pattern to the other three files**

For each of `home/PromoSection.tsx`, `SolarModels.tsx`, `home/PackageCatalogSection.tsx`:
- Import `Reveal`.
- Wrap the section's heading block (the container holding the section `h2`/`h3` title + any subtitle) in `<Reveal>...</Reveal>`, moving that container's classes onto `<Reveal>`.
- Wrap the primary card grid/list container in `<Reveal.Stagger as="..." className="...">`, using the existing element tag via `as` and preserving all existing classes, so the cards (its direct children) sequence in.
- Touch nothing else. Do not alter alignment classes across breakpoints.

`PackageCatalogSection.tsx` is already a client component — wrapping still works; no `'use client'` change needed.

- [ ] **Step 5: Verify each section in the browser**

With `npm run dev` running, scroll the homepage. Expected: each section's heading fades+rises once, then its cards stagger in. No layout shift; content visible before animation if you disable JS.

- [ ] **Step 6: Typecheck + stage**

```bash
npx tsc --noEmit
git add src/components/ExperienceTimeline.tsx src/components/home/PromoSection.tsx src/components/SolarModels.tsx src/components/home/PackageCatalogSection.tsx
```

---

## Task 6: Reveals for content sections (batch B)

**Files:**
- Modify: `src/components/WhyFreeState.tsx`
- Modify: `src/components/PathToEnergy.tsx`
- Modify: `src/components/FusionSolarApp.tsx`
- Modify: `src/components/ProductShowcase.tsx` (covers Battery, HeatPumpsViessmann, EvCharging)
- Modify: `src/components/YourBenefits.tsx`

**Interfaces:**
- Consumes: `Reveal`, `Reveal.Stagger`.

- [ ] **Step 1: `WhyFreeState.tsx`**

Import `Reveal`. Wrap the centered heading+CTA block (the `div` with `h2` + `p` + `LinkButton`) in `<Reveal>` (move its classes onto `<Reveal>`). Wrap the 3-column features grid (`<div className="w-full grid grid-cols-1 md:grid-cols-3 ...">`) in `<Reveal.Stagger>` using `as="div"` and preserving its classes, so the three feature columns sequence in.

- [ ] **Step 2: `PathToEnergy.tsx`**

Import `Reveal`. Wrap the heading block in `<Reveal>`. Wrap the steps container in `<Reveal.Stagger>` (preserve tag via `as` and classes) so each step rises in sequence.

- [ ] **Step 3: `FusionSolarApp.tsx`**

Import `Reveal`. Wrap the text column in `<Reveal>` and the app imagery block in `<Reveal>` (two separate single-block reveals so text and image fade in together as they enter). Preserve all layout classes.

- [ ] **Step 4: `ProductShowcase.tsx` (shared by 3 sections)**

Import `Reveal`. This component renders a text column (title, subtitle, numbered steps, CTA) and an image, positioned left/right via `imagePosition`. Wrap:
- The text column in `<Reveal.Stagger>` so title → subtitle → steps → CTA sequence in (preserve the column's tag/classes via `as`/`className`).
- The image container in a single `<Reveal>` (fades + rises from its side).

Because Battery, HeatPumpsViessmann, and EvCharging all render `ProductShowcase`, this one edit animates all three homepage sections consistently. Verify the same edit still looks correct for the `imagePosition="left"` and `"right"` variants.

- [ ] **Step 5: `YourBenefits.tsx`**

Import `Reveal`. Wrap the heading block in `<Reveal>`. Wrap the benefits grid/list in `<Reveal.Stagger>` (preserve tag/classes) so benefit items sequence in.

- [ ] **Step 6: Verify in the browser**

Scroll the homepage with `npm run dev` running. Expected: WhyFreeState columns, PathToEnergy steps, FusionSolar text/image, all three ProductShowcase sections, and YourBenefits items each reveal correctly, once. Confirm `imagePosition` left/right both animate.

- [ ] **Step 7: Typecheck + stage**

```bash
npx tsc --noEmit
git add src/components/WhyFreeState.tsx src/components/PathToEnergy.tsx src/components/FusionSolarApp.tsx src/components/ProductShowcase.tsx src/components/YourBenefits.tsx
```

---

## Task 7: Heading reveals for carousel/logo sections (batch C)

**Files:**
- Modify: `src/components/CustomerStories.tsx`
- Modify: `src/components/Reviews.tsx`
- Modify: `src/components/OurPartners.tsx`

**Interfaces:**
- Consumes: `Reveal`, `Reveal.Stagger`.

- [ ] **Step 1: `CustomerStories.tsx` and `Reviews.tsx`**

Both are client components with Embla carousels. Import `Reveal`. Wrap ONLY the section heading block (title + subtitle) in `<Reveal>`. Do NOT wrap the carousel track or slides — leave Embla's own motion untouched to avoid conflicts.

- [ ] **Step 2: `OurPartners.tsx`**

Import `Reveal`. Wrap the heading block in `<Reveal>`. Wrap the logos container in `<Reveal.Stagger>` (preserve tag/classes) so logos fade in as a soft group.

- [ ] **Step 3: Verify in the browser**

Scroll to the bottom sections. Expected: headings reveal once; carousels still drag/autoplay normally; partner logos fade in as a group.

- [ ] **Step 4: Typecheck + stage**

```bash
npx tsc --noEmit
git add src/components/CustomerStories.tsx src/components/Reviews.tsx src/components/OurPartners.tsx
```

---

## Task 8: Hover polish

**Files:**
- Modify: the card and CTA markup within homepage section components that render cards (e.g. `ExperienceTimeline.tsx` cards, `SolarModels.tsx` model cards, `home/PromoSection.tsx` promo cards, `WhyFreeState.tsx` feature columns if card-like).

**Interfaces:** none (pure Tailwind).

- [ ] **Step 1: Define the shared hover pattern**

Card containers get (desktop pointer only, no motion for touch/reduced-motion via `motion-reduce:`):

```
transition-transform transition-shadow duration-300 ease-out
hover:-translate-y-1 hover:shadow-lg
motion-reduce:transition-none motion-reduce:hover:translate-y-0
```

Card image wrappers get `overflow-hidden`, and the inner `<Image>`/`<img>` gets:

```
transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100
```

(Add `group` to the card container and `group-hover:` on the image only where a card wraps an image. Do not introduce `leading-*` classes.)

- [ ] **Step 2: Apply to card containers**

For each card container in the listed section files, append the card hover classes to the existing `className`. For image-bearing cards, add `group` to the container, `overflow-hidden` to the image frame, and the image hover classes to the image. Change nothing else.

- [ ] **Step 3: Verify in the browser**

With `npm run dev` running, hover cards on desktop. Expected: subtle lift + shadow, and image zoom within its frame (no layout shift). Emulate reduced motion (DevTools → Rendering → prefers-reduced-motion: reduce) and confirm hover transforms are disabled.

- [ ] **Step 4: Typecheck + stage**

```bash
npx tsc --noEmit
git add -A
```

---

## Task 9: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the test suite**

Run: `npx vitest run src/lib/motion.test.ts src/components/motion/Reveal.test.tsx`
Expected: all PASS.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Reduced-motion audit (browser)**

With `npm run dev` running and DevTools emulating `prefers-reduced-motion: reduce`, reload the homepage and scroll top to bottom. Expected: all content visible immediately, no transforms, no delays, no hover motion.

- [ ] **Step 4: Motion audit (browser)**

Disable reduced-motion emulation, reload, scroll top to bottom. Expected: hero entrance on load; every section reveals once with fade+rise (+ stagger where grouped); carousels unaffected; no console errors; no layout shift (watch for jump on reveal).

- [ ] **Step 5: No-JS / SSR check**

In DevTools, disable JavaScript, reload. Expected: full homepage content visible (nothing stuck hidden).

- [ ] **Step 6: Stage any final changes**

```bash
git add -A
```

Report results to the user (tests, typecheck, lint, and browser observations). Do not commit — the user commits.

---

## Self-Review

- **Spec coverage:** motion language → Task 1; `<Reveal>`/`Stagger` → Tasks 2–3; hero entrance → Task 4; all 14 sections → Tasks 4–7 (ProductShowcase covers Battery/HeatPumps/EvCharging); hover polish → Task 8; reduced-motion + no-CLS + SSR + live browser verification → Tasks 2, 9; out-of-scope items (Lenis, wipes, parallax, count-up) not introduced. Covered.
- **Placeholders:** none — config, component, and tests contain full code; section edits give exact targets + a worked example.
- **Type consistency:** `MOTION`, `prefersReducedMotion`, `Reveal`, `Reveal.Stagger` names/signatures are consistent across Tasks 1–7.
- **Commit policy:** every task ends in `git add` only; no `git commit`, per global rule.
