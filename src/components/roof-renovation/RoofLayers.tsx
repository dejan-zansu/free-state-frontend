'use client'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type RoofKind = 'steep' | 'flat'
type LayerKey =
  | 'solar'
  | 'cover'
  | 'battens'
  | 'underlay'
  | 'insulation'
  | 'structure'
  | 'flashing'
  | 'protection'
  | 'sealing'
  | 'vapour'
  | 'deck'

type Point = readonly [number, number]
type Faces = readonly [string, string, string]

const WIDTH = 420
const DEPTH = 180
const COS = 0.866
const SIN = 0.5
const CENTER_X = 176
const BASE_Y = 600
const PITCH: Record<RoofKind, number> = { steep: 0.42, flat: 0 }
const VIEW_BOX: Record<RoofKind, string> = {
  steep: '0 0 560 640',
  flat: '0 100 560 540',
}
const EXPLODE = 20

const MATERIAL: Record<string, Faces> = {
  tile: ['#C4623F', '#9C4A2E', '#7E3B25'],
  wood: ['#C99C69', '#A87E50', '#8C6840'],
  batten: ['#DDBD90', '#B99A6C', '#9E8259'],
  insulation: ['#EFCB4F', '#D4AE37', '#B8962C'],
  membrane: ['#8FB5AA', '#6F9489', '#5A7A70'],
  foil: ['#BFD9D2', '#9ABDB4', '#84A79E'],
  sealing: ['#34423F', '#232E2B', '#1B2422'],
  gravel: ['#B9B19F', '#968E7D', '#7F7869'],
  concrete: ['#BCC0B8', '#9DA199', '#878B83'],
  zinc: ['#D5DAD7', '#AEB5B1', '#949B97'],
  module: ['#16324F', '#0E2237', '#0A1A2B'],
}

const SWATCH: Record<LayerKey, string> = {
  solar: MATERIAL.module[0],
  cover: MATERIAL.tile[0],
  battens: MATERIAL.batten[0],
  underlay: MATERIAL.membrane[0],
  insulation: MATERIAL.insulation[0],
  structure: MATERIAL.wood[0],
  flashing: MATERIAL.zinc[0],
  protection: MATERIAL.gravel[0],
  sealing: MATERIAL.sealing[0],
  vapour: MATERIAL.foil[0],
  deck: MATERIAL.concrete[0],
}

const LIST_ORDER: Record<RoofKind, readonly LayerKey[]> = {
  steep: [
    'solar',
    'cover',
    'flashing',
    'battens',
    'underlay',
    'insulation',
    'structure',
  ],
  flat: [
    'solar',
    'protection',
    'sealing',
    'flashing',
    'insulation',
    'vapour',
    'deck',
  ],
}

const DEFAULT_LAYER: Record<RoofKind, LayerKey> = {
  steep: 'cover',
  flat: 'sealing',
}

const project = (x: number, y: number, z: number): Point => [
  CENTER_X + (x - y) * COS,
  BASE_Y - (x + y) * SIN - z,
]

const toPoints = (points: readonly Point[]) =>
  points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

const box = (
  id: string,
  [x0, x1]: readonly [number, number],
  [y0, y1]: readonly [number, number],
  z: number,
  height: number,
  pitch: number,
  faces: Faces
): ReactNode => {
  const lift = (y: number) => z + pitch * y
  return (
    <g key={id}>
      <polygon
        points={toPoints([
          project(x0, y0, lift(y0)),
          project(x1, y0, lift(y0)),
          project(x1, y0, lift(y0) + height),
          project(x0, y0, lift(y0) + height),
        ])}
        fill={faces[1]}
      />
      <polygon
        points={toPoints([
          project(x0, y0, lift(y0)),
          project(x0, y1, lift(y1)),
          project(x0, y1, lift(y1) + height),
          project(x0, y0, lift(y0) + height),
        ])}
        fill={faces[2]}
      />
      <polygon
        points={toPoints([
          project(x0, y0, lift(y0) + height),
          project(x1, y0, lift(y0) + height),
          project(x1, y1, lift(y1) + height),
          project(x0, y1, lift(y1) + height),
        ])}
        fill={faces[0]}
      />
    </g>
  )
}

const line = (
  id: string,
  from: readonly [number, number],
  to: readonly [number, number],
  top: number,
  pitch: number,
  stroke: string,
  width = 1
) => {
  const [x1, y1] = project(from[0], from[1], top + pitch * from[1])
  const [x2, y2] = project(to[0], to[1], top + pitch * to[1])
  return (
    <line
      key={id}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={width}
    />
  )
}

const range = (count: number) => Array.from({ length: count }, (_, i) => i)

const seamedSlab = (
  x0: number,
  z: number,
  height: number,
  pitch: number,
  faces: Faces,
  seam: string,
  xSeams: number,
  ySeams: number
) => [
  box('slab', [x0, WIDTH], [0, DEPTH], z, height, pitch, faces),
  ...range(xSeams).map(i => {
    const x = x0 + ((WIDTH - x0) / (xSeams + 1)) * (i + 1)
    return line(`x${i}`, [x, 0], [x, DEPTH], z + height, pitch, seam)
  }),
  ...range(ySeams).map(i => {
    const y = (DEPTH / (ySeams + 1)) * (i + 1)
    return line(`y${i}`, [x0, y], [WIDTH, y], z + height, pitch, seam)
  }),
]

const tiles = (x0: number, z: number, height: number, pitch: number) => {
  const rows = 9
  const tileW = 20
  const cols = Math.ceil((WIDTH - x0) / tileW)
  const tileD = DEPTH / rows
  const top = z + height
  const shades = ['#C4623F', '#B3573A', '#CB6C47', '#BA5D3B']
  const parts: ReactNode[] = [
    box('base', [x0, WIDTH], [0, DEPTH], z, height, pitch, MATERIAL.tile),
  ]
  for (const row of range(rows).reverse()) {
    const y0 = row * tileD
    const y1 = y0 + tileD
    const offset = row % 2 ? tileW / 2 : 0
    for (const col of range(cols + 1)) {
      const left = Math.max(x0, x0 + col * tileW - offset)
      const right = Math.min(WIDTH, x0 + col * tileW - offset + tileW)
      if (right - left < 2) continue
      const lift = (y: number) => top + pitch * y
      parts.push(
        <polygon
          key={`t${row}-${col}`}
          points={toPoints([
            project(left + 0.6, y0, lift(y0) + 1.6),
            project(right - 0.6, y0, lift(y0) + 1.6),
            project(right - 0.6, y1, lift(y1)),
            project(left + 0.6, y1, lift(y1)),
          ])}
          fill={shades[(row * 5 + col * 3) % shades.length]}
          stroke="#7E3B25"
          strokeWidth={0.5}
        />
      )
    }
  }
  return parts
}

const battens = (x0: number, z: number, pitch: number) => {
  const parts: ReactNode[] = []
  const counterCount = Math.max(2, Math.round((WIDTH - x0) / 42))
  for (const i of range(counterCount).reverse()) {
    const x = x0 + 6 + ((WIDTH - x0 - 20) / (counterCount - 1)) * i
    parts.push(box(`c${i}`, [x, x + 8], [0, DEPTH], z, 5, pitch, MATERIAL.wood))
  }
  const rowCount = 8
  for (const i of range(rowCount).reverse()) {
    const y = 4 + ((DEPTH - 14) / (rowCount - 1)) * i
    parts.push(
      box(`b${i}`, [x0, WIDTH], [y, y + 6], z + 5, 5, pitch, MATERIAL.batten)
    )
  }
  return parts
}

const rafters = (z: number, height: number, pitch: number) => {
  const count = 9
  const parts: ReactNode[] = []
  for (const i of range(count).reverse()) {
    const x = 4 + ((WIDTH - 24) / (count - 1)) * i
    parts.push(
      box(`r${i}`, [x, x + 16], [0, DEPTH], z, height, pitch, MATERIAL.wood)
    )
  }
  return parts
}

const gravel = (x0: number, z: number, height: number) => {
  const parts: ReactNode[] = [
    box('base', [x0, WIDTH], [0, DEPTH], z, height, 0, MATERIAL.gravel),
  ]
  let seed = 41
  const next = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const shades = ['#A69E8D', '#CFC8B7', '#8E8778', '#DAD4C5']
  for (const i of range(460)) {
    const [cx, cy] = project(
      x0 + next() * (WIDTH - x0),
      next() * DEPTH,
      z + height
    )
    parts.push(
      <ellipse
        key={`g${i}`}
        cx={cx}
        cy={cy}
        rx={1 + next() * 1.3}
        ry={0.7 + next() * 0.7}
        fill={shades[i % shades.length]}
      />
    )
  }
  return parts
}

const modules = (x0: number, z: number, pitch: number) => {
  const cols = 2
  const rows = 2
  const marginX = 6
  const marginY = 8
  const gap = 5
  const moduleW = (WIDTH - x0 - marginX * 2 - gap * (cols - 1)) / cols
  const moduleD = (DEPTH - marginY * 2 - gap * (rows - 1)) / rows
  const parts: ReactNode[] = []
  for (const row of range(rows).reverse()) {
    for (const col of range(cols).reverse()) {
      const left = x0 + marginX + col * (moduleW + gap)
      const front = marginY + row * (moduleD + gap)
      const right = left + moduleW
      const back = front + moduleD
      const top = z + 5
      parts.push(
        box(
          `m${row}-${col}`,
          [left, right],
          [front, back],
          z,
          5,
          pitch,
          MATERIAL.module
        ),
        <polygon
          key={`f${row}-${col}`}
          points={toPoints([
            project(left, front, top + pitch * front),
            project(right, front, top + pitch * front),
            project(right, back, top + pitch * back),
            project(left, back, top + pitch * back),
          ])}
          fill="none"
          stroke="#C8D1CD"
          strokeWidth={1.4}
        />,
        ...range(3).map(i => {
          const x = left + (moduleW / 4) * (i + 1)
          return line(
            `v${row}-${col}-${i}`,
            [x, front],
            [x, back],
            top,
            pitch,
            '#3A6A97',
            0.6
          )
        }),
        ...range(5).map(i => {
          const y = front + (moduleD / 6) * (i + 1)
          return line(
            `h${row}-${col}-${i}`,
            [left, y],
            [right, y],
            top,
            pitch,
            '#3A6A97',
            0.6
          )
        })
      )
    }
  }
  return parts
}

const gutter = () => [
  box('pipe', [WIDTH - 26, WIDTH - 18], [-14, -6], -34, 44, 0, MATERIAL.zinc),
  box('gutter', [-4, WIDTH + 4], [-16, -2], 8, 10, 0, MATERIAL.zinc),
  box('lip', [-4, WIDTH + 4], [-16, -13], 18, 2, 0, MATERIAL.zinc),
]

const parapet = (x0: number, z: number) => [
  box('back', [x0, WIDTH + 6], [DEPTH, DEPTH + 6], z, 10, 0, MATERIAL.zinc),
  box('right', [WIDTH, WIDTH + 6], [0, DEPTH], z, 10, 0, MATERIAL.zinc),
  box('front', [x0, WIDTH + 6], [-6, 0], z - 14, 20, 0, MATERIAL.zinc),
]

interface LayerShape {
  key: LayerKey
  level: number
  x0: number
  top: number | null
  parts: ReactNode[]
}

const buildSteep = (): LayerShape[] => {
  const pitch = PITCH.steep
  return [
    {
      key: 'structure',
      level: 0,
      x0: 0,
      top: 24,
      parts: rafters(0, 24, pitch),
    },
    { key: 'flashing', level: 0, x0: 0, top: null, parts: gutter() },
    {
      key: 'insulation',
      level: 1,
      x0: 60,
      top: 52,
      parts: seamedSlab(
        60,
        24,
        28,
        pitch,
        MATERIAL.insulation,
        '#C9A531',
        5,
        3
      ),
    },
    {
      key: 'underlay',
      level: 2,
      x0: 110,
      top: 55,
      parts: seamedSlab(110, 52, 3, pitch, MATERIAL.membrane, '#6F9489', 0, 4),
    },
    {
      key: 'battens',
      level: 3,
      x0: 160,
      top: 65,
      parts: battens(160, 55, pitch),
    },
    {
      key: 'cover',
      level: 4,
      x0: 212,
      top: 71,
      parts: tiles(212, 65, 6, pitch),
    },
    {
      key: 'solar',
      level: 5,
      x0: 306,
      top: 79,
      parts: modules(306, 74, pitch),
    },
  ]
}

const buildFlat = (): LayerShape[] => [
  {
    key: 'deck',
    level: 0,
    x0: 0,
    top: 30,
    parts: seamedSlab(0, 0, 30, 0, MATERIAL.concrete, '#A5A9A1', 0, 0),
  },
  {
    key: 'vapour',
    level: 1,
    x0: 60,
    top: 33,
    parts: seamedSlab(60, 30, 3, 0, MATERIAL.foil, '#9ABDB4', 0, 3),
  },
  {
    key: 'insulation',
    level: 2,
    x0: 106,
    top: 69,
    parts: seamedSlab(106, 33, 36, 0, MATERIAL.insulation, '#C9A531', 5, 3),
  },
  {
    key: 'sealing',
    level: 3,
    x0: 172,
    top: 75,
    parts: seamedSlab(172, 69, 6, 0, MATERIAL.sealing, '#4A5A56', 0, 5),
  },
  { key: 'flashing', level: 3, x0: 172, top: null, parts: parapet(172, 75) },
  { key: 'protection', level: 4, x0: 226, top: 87, parts: gravel(226, 75, 12) },
  { key: 'solar', level: 5, x0: 306, top: 95, parts: modules(306, 90, 0) },
]

const SHAPES: Record<RoofKind, LayerShape[]> = {
  steep: buildSteep(),
  flat: buildFlat(),
}

const HIGHLIGHT = {
  dark: {
    stroke: '#B7FE1A',
    glow: '[filter:drop-shadow(0_0_6px_rgba(183,254,26,0.75))]',
  },
  light: {
    stroke: '#036B53',
    glow: '[filter:drop-shadow(0_0_8px_rgba(3,107,83,0.45))]',
  },
} as const

const RoofDiagram = ({
  kind,
  active,
  onSelect,
  open,
  label,
  tone = 'dark',
}: {
  kind: RoofKind
  active: LayerKey
  onSelect: (layer: LayerKey) => void
  open: boolean
  label: string
  tone?: keyof typeof HIGHLIGHT
}) => (
  <svg
    viewBox={VIEW_BOX[kind]}
    role="img"
    aria-label={label}
    className="mx-auto h-auto w-full max-w-[620px]"
  >
    {SHAPES[kind].map(shape => {
      const isActive = shape.key === active
      const offset = shape.level * (open ? EXPLODE : 3) + (isActive ? 8 : 0)
      return (
        <g
          key={shape.key}
          onClick={() => onSelect(shape.key)}
          style={{ transform: `translateY(${-offset}px)` }}
          className={cn(
            'cursor-pointer transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
            isActive ? HIGHLIGHT[tone].glow : 'opacity-85 hover:opacity-100'
          )}
        >
          {shape.parts}
          {isActive && shape.top !== null && (
            <polygon
              points={toPoints([
                project(shape.x0, 0, shape.top),
                project(WIDTH, 0, shape.top),
                project(WIDTH, DEPTH, shape.top + PITCH[kind] * DEPTH),
                project(shape.x0, DEPTH, shape.top + PITCH[kind] * DEPTH),
              ])}
              fill="none"
              stroke={HIGHLIGHT[tone].stroke}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          )}
        </g>
      )
    })}
  </svg>
)

const useOpenOnView = () => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = rootRef.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setOpen(true)
      return
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setOpen(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { open, rootRef }
}

const RoofLayers = () => {
  const t = useTranslations('roofRenovation.services')
  const [kind, setKind] = useState<RoofKind>('steep')
  const [active, setActive] = useState<LayerKey>(DEFAULT_LAYER.steep)
  const { open, rootRef } = useOpenOnView()

  const chooseKind = (next: RoofKind) => {
    setKind(next)
    setActive(DEFAULT_LAYER[next])
  }

  const bodyFor = (layer: LayerKey) => {
    if (layer === 'cover') {
      return [t('items.steep.body'), t('items.asbestos.body')]
    }
    if (layer === 'sealing') return [t('items.flat.body')]
    if (layer === 'flashing') return [t('items.spengler.body')]
    if (layer === 'insulation') return [t('items.insulation.body')]
    if (layer === 'solar') return [t('items.solar.body')]
    return [t(`layers.${layer}.body`)]
  }

  return (
    <div
      ref={rootRef}
      className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16"
    >
      <div className="order-2 lg:order-1">
        <RoofDiagram
          kind={kind}
          active={active}
          onSelect={setActive}
          open={open}
          label={t(`items.${kind}.title`)}
        />
      </div>
      <div className="order-1 lg:order-2">
        <div
          role="group"
          aria-label={t('layersLabel')}
          className="inline-flex rounded-full bg-white/10 p-1"
        >
          {(['steep', 'flat'] as const).map(option => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              onClick={() => chooseKind(option)}
              className={cn(
                'rounded-full px-5 py-2.5 text-base font-medium transition-colors',
                kind === option
                  ? 'bg-solar text-solar-foreground'
                  : 'text-white hover:bg-white/10'
              )}
            >
              {t(`items.${option}.title`)}
            </button>
          ))}
        </div>
        <ul className="mt-6 border-b border-white/15">
          {LIST_ORDER[kind].map(layer => {
            const isActive = layer === active
            return (
              <li key={layer} className="border-t border-white/15">
                <button
                  type="button"
                  aria-expanded={isActive}
                  onClick={() => setActive(layer)}
                  className="flex w-full items-center gap-3 py-3.5 text-left text-lg font-medium tracking-tight"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-4 shrink-0 rounded-[4px] ring-1 ring-white/30',
                      isActive && 'ring-2 ring-solar'
                    )}
                    style={{ backgroundColor: SWATCH[layer] }}
                  />
                  <span className="flex-1">{t(`layers.${layer}.title`)}</span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-white/60 transition-transform',
                      isActive && 'rotate-180'
                    )}
                  />
                </button>
                {isActive && (
                  <div className="flex flex-col gap-2 pb-4 pl-7">
                    {bodyFor(layer).map(body => (
                      <p key={body} className="text-base text-white/80">
                        {body}
                      </p>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

type OfferKey = 'roof' | 'insulation' | 'solar'

const OFFER_LAYER: Record<OfferKey, LayerKey> = {
  roof: 'cover',
  insulation: 'insulation',
  solar: 'solar',
}

export const RoofOfferLayers = ({
  label,
  items,
  children,
}: {
  label: string
  items: readonly { key: OfferKey; title: string; body: string }[]
  children?: ReactNode
}) => {
  const [active, setActive] = useState<OfferKey>('solar')
  const { open, rootRef } = useOpenOnView()

  const selectLayer = (layer: LayerKey) => {
    const match = items.find(item => OFFER_LAYER[item.key] === layer)
    if (match) setActive(match.key)
  }

  return (
    <div
      ref={rootRef}
      className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
    >
      <div className="mx-auto w-full max-w-[520px]">
        <RoofDiagram
          kind="steep"
          active={OFFER_LAYER[active]}
          onSelect={selectLayer}
          open={open}
          label={label}
          tone="light"
        />
      </div>
      <div>
        <ul className="flex flex-col gap-3">
          {items.map(item => {
            const isActive = item.key === active
            return (
              <li key={item.key}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(item.key)}
                  onMouseEnter={() => setActive(item.key)}
                  className={cn(
                    'flex w-full items-start gap-4 rounded-[20px] border p-5 text-left transition-colors md:p-6',
                    isActive
                      ? 'border-[#036B53] bg-white shadow-[0_8px_24px_rgba(6,46,37,0.08)]'
                      : 'border-transparent bg-white/60 hover:bg-white'
                  )}
                >
                  <span
                    aria-hidden
                    className="mt-1 size-5 shrink-0 rounded-[5px]"
                    style={{ backgroundColor: SWATCH[OFFER_LAYER[item.key]] }}
                  />
                  <span>
                    <span className="block text-xl font-medium tracking-tight">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-base text-[#062E25]/80">
                      {item.body}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {children}
      </div>
    </div>
  )
}

export default RoofLayers
