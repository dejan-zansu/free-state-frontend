# Energiegemeinschaften Guide Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/ratgeber`, `/ratgeber/energiegemeinschaften` (interactive 3D hub) and `/ratgeber/zev`, `/ratgeber/vzev`, `/ratgeber/leg` on freestate.ch, German content, with one scripted Blender scene feeding the GLB and all renders.

**Architecture:** A `bpy` script builds four low-poly islands, exports one GLB with a single `flow` animation clip, a JSON of zone anchors and camera presets, and WebP renders. A client `CommunityScene` component drives `@google/model-viewer` with hotspots, fly-to and a side panel. Content lives in a typed German data file (pattern: `src/data/foerderung-cantons.ts`), pages are server components composing small section components.

**Tech Stack:** Next.js app router, next-intl routing, `@google/model-viewer` 4.3.1, Blender 5.2.2 LTS (`/opt/homebrew/bin/blender`, bpy, EEVEE), vitest, Tailwind v4 tokens from `globals.css`.

**Spec:** `docs/superpowers/specs/2026-09-22-energiegemeinschaften-design.md`

## Global Constraints

- German content only, same slug in all four locales, canonical always the German URL, sitemap lists the German URL only (spec section 4).
- No em dash anywhere (spec section 12, global rule). No semicolons in prose. Hyphen `-` for empty cells.
- Minimum body text 16 px (`text-base`).
- "ZEV" spelled out as "Zusammenschluss zum Eigenverbrauch" on first use per page.
- Every legal number carries a `LegalRef` with `checked: '2026-09-22'` (spec section 11). Nothing else goes on a page.
- FSA role wording only from Ivan's mail (spec section 12): analysis, model proposal, coordination of EW, meters, registration, contracts, billing, battery. No prices, no "Plattform".
- References anonymised. No customer names.
- GLB under 1.5 MB. One animation clip. Materials `island_zev`, `island_vzev`, `island_leg`, `island_praxismodell`.
- Colour tokens: primary `#062e25`, lime `#b7fe1a`, lime-soft `#cdea67`, page background `#EAEDDF`, panel blue `#1f3a5f`.
- No comments in code and no `leading-*` Tailwind classes (`frontend/CLAUDE.md`). Where a code block in this plan shows a comment or a docstring, drop it when writing the file. The plan keeps them only to explain intent to the reader.
- Never run `git commit` or `git push`. Steps end with `git add`, the user commits.
- Verification before any success claim: `npx tsc --noEmit`, `npm run lint`, `npm test`.
- Working directory for every command: `/Users/dejanarsic/zansu/free-state-ag/app/frontend`.

## File Structure

Create:

| File | Responsibility |
|---|---|
| `scripts/3d/energiegemeinschaften/build_scene.py` | bpy script: builds the scene, exports GLB, JSON, renders |
| `scripts/3d/energiegemeinschaften/check-glb.mjs` | Node: validates GLB (size, one clip, material and anchor names) |
| `public/3d/energiegemeinschaften.glb` | generated scene |
| `public/ratgeber/energiegemeinschaften.webp`, `zev.webp`, `vzev.webp`, `leg.webp`, `praxismodell.webp` | generated renders |
| `src/data/energiegemeinschaften-scene.json` | generated zone anchors and camera presets |
| `src/data/energiegemeinschaften.ts` | all German content, typed |
| `src/data/__tests__/energiegemeinschaften.test.ts` | content invariants |
| `src/data/__tests__/energiegemeinschaften-scene.test.ts` | JSON shape |
| `src/lib/model-viewer.ts` | one-time `registerModelViewer()` loader (moved out of `ModelViewer.tsx`) |
| `src/lib/ratgeber/scene-zones.ts` | zone ids, hash helpers, scene config type |
| `src/lib/ratgeber/__tests__/scene-zones.test.ts` | hash helper tests |
| `src/lib/ratgeber/flow-layout.ts` | SVG path helper for the flow diagram |
| `src/lib/ratgeber/__tests__/flow-layout.test.ts` | path helper tests |
| `src/components/ratgeber/CommunityScene.tsx` | client viewer with hotspots, fly-to, panel |
| `src/components/ratgeber/FlowDiagram.tsx` | data-driven SVG |
| `src/components/ratgeber/Section.tsx` | section wrapper and heading |
| `src/components/ratgeber/ModelSections.tsx` | sections of a model page |
| `src/components/ratgeber/HubSections.tsx` | decision helper, comparison, cards, FSA steps, project notes |
| `src/components/ratgeber/RatgeberCta.tsx` | CTA block to `/gewerbe/rechner` |
| `src/app/[locale]/ratgeber/page.tsx` | index |
| `src/app/[locale]/ratgeber/energiegemeinschaften/page.tsx` | hub |
| `src/app/[locale]/ratgeber/[model]/page.tsx` | model pages |

Modify:

| File | Change |
|---|---|
| `src/types/model-viewer.d.ts` | camera target, animation, scene-graph types |
| `src/components/products/ModelViewer.tsx:9-19` | import `registerModelViewer` from `@/lib/model-viewer` |
| `src/i18n/routing.ts:72-83` | three new pathname entries |
| `src/app/sitemap.ts` | `availableLocales` on entries, five new URLs |
| `src/app/__tests__/sitemap.test.ts` | new assertions |
| `src/app/globals.css` | `.flow-edge` keyframes |
| `src/components/Footer.tsx:51-71` | link to the hub |
| `src/components/MobileNavLinks.tsx:23-36`, `src/components/HeroNav.tsx:25-34` | link to the hub in the commercial group |
| `messages/de.json`, `en.json`, `fr.json`, `it.json` | `footer.solarAbo.communities`, `home.hero.nav.communities`, `solarAboMulti.includes.items.zevBillingPlatform.title`, `solarAboMulti.communitiesLink.*` |
| `src/app/[locale]/commercial/solar-free/solar-free-multi-family/page.tsx` | link block to the hub |

---

### Task 1: Blender scene, GLB, JSON and renders

**Files:**
- Create: `scripts/3d/energiegemeinschaften/build_scene.py`
- Create: `scripts/3d/energiegemeinschaften/check-glb.mjs`
- Create: `src/data/__tests__/energiegemeinschaften-scene.test.ts`
- Generates: `public/3d/energiegemeinschaften.glb`, `src/data/energiegemeinschaften-scene.json`, `public/ratgeber/*.webp`

**Interfaces:**
- Produces `src/data/energiegemeinschaften-scene.json` with shape
  `{ "overview": { "target": string, "orbit": string }, "zones": { [id in 'zev'|'vzev'|'leg'|'praxismodell']: { "anchor": [x,y,z], "target": string, "orbit": string } } }`.
  `anchor` is in glTF space (metres, Y up). `target` is `"Xm Ym Zm"`, `orbit` is `"THETAdeg PHIdeg RADIUSm"`, both in model-viewer syntax.
- Produces GLB with materials `island_zev`, `island_vzev`, `island_leg`, `island_praxismodell`, nodes `anchor_<id>`, one animation clip.

- [ ] **Step 1: Write the failing JSON shape test**

`src/data/__tests__/energiegemeinschaften-scene.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ZONES = ['zev', 'vzev', 'leg', 'praxismodell'] as const
const ORBIT = /^-?\d+(\.\d+)?deg \d+(\.\d+)?deg \d+(\.\d+)?m$/
const TARGET = /^-?\d+(\.\d+)?m -?\d+(\.\d+)?m -?\d+(\.\d+)?m$/

function load() {
  const file = path.resolve(__dirname, '../energiegemeinschaften-scene.json')
  return JSON.parse(readFileSync(file, 'utf8')) as {
    overview: { target: string; orbit: string }
    zones: Record<string, { anchor: number[]; target: string; orbit: string }>
  }
}

describe('energiegemeinschaften scene config', () => {
  test('has exactly the four zones', () => {
    expect(Object.keys(load().zones).sort()).toEqual([...ZONES].sort())
  })

  test('every zone has a 3-number anchor and model-viewer camera strings', () => {
    const { zones } = load()
    for (const id of ZONES) {
      expect(zones[id].anchor).toHaveLength(3)
      for (const n of zones[id].anchor) expect(typeof n).toBe('number')
      expect(zones[id].target).toMatch(TARGET)
      expect(zones[id].orbit).toMatch(ORBIT)
    }
  })

  test('overview has camera strings', () => {
    const { overview } = load()
    expect(overview.target).toMatch(TARGET)
    expect(overview.orbit).toMatch(ORBIT)
  })
})
```

- [ ] **Step 2: Run the test, expect failure**

Run: `npx vitest run src/data/__tests__/energiegemeinschaften-scene.test.ts`
Expected: FAIL with `ENOENT ... energiegemeinschaften-scene.json`

- [ ] **Step 3: Write the Blender script**

`scripts/3d/energiegemeinschaften/build_scene.py` (the whole file):

```python
"""Builds the Energiegemeinschaften scene for /ratgeber/energiegemeinschaften.

Four low-poly islands (ZEV, vZEV, LEG, Praxismodell) on a white ground, glowing
flow lines with animated pulses. Exports one GLB, a JSON with zone anchors and
camera presets, and WebP renders.

Run from the frontend root:
  blender -b -P scripts/3d/energiegemeinschaften/build_scene.py -- --out . [--preview /tmp/preview.png]
"""
import json
import math
import os
import sys

import bpy
import bmesh
from mathutils import Euler, Vector

FPS = 24
FRAMES = 144  # 6 s loop

COLORS = {
    'primary': '#062e25',
    'lime': '#b7fe1a',
    'lime_soft': '#cdea67',
    'panel': '#1f3a5f',
    'panel_frame': '#5b7396',
    'facade': '#f4f2ec',
    'facade_shade': '#e6e3da',
    'ground': '#ffffff',
    'road': '#d9dbd4',
    'foliage_a': '#5f8f3e',
    'foliage_b': '#7fae4f',
    'trunk': '#8a6b4a',
    'glass': '#9fc3d3',
    'truck': '#f7f7f5',
    'truck_dark': '#3a3f44',
    'car': '#c9ced4',
}

# Island centres (Blender x, y) and slab sizes (w, d), metres
ISLANDS = {
    'zev': ((-38.0, 26.0), (46.0, 40.0)),
    'vzev': ((-40.0, -26.0), (48.0, 36.0)),
    'leg': ((34.0, 20.0), (60.0, 46.0)),
    'praxismodell': ((32.0, -30.0), (44.0, 30.0)),
}
SLAB = 0.8  # island thickness, ground plane sits at -SLAB


def parse_args():
    argv = sys.argv
    args = argv[argv.index('--') + 1:] if '--' in argv else []
    out, preview = None, None
    i = 0
    while i < len(args):
        if args[i] == '--out':
            out, i = args[i + 1], i + 2
        elif args[i] == '--preview':
            preview, i = args[i + 1], i + 2
        else:
            i += 1
    if not out:
        raise SystemExit('--out <frontend root> is required')
    return os.path.abspath(out), preview


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def srgb_to_linear(c):
    return tuple((v / 12.92) if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)


MATS = {}


def mat(name, hexcolor, roughness=0.85, emission=None, strength=0.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*srgb_to_linear(hex_to_rgb(hexcolor)), 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = 0.0
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*srgb_to_linear(hex_to_rgb(emission)), 1.0)
        bsdf.inputs['Emission Strength'].default_value = strength
    MATS[name] = m
    return m


def link_obj(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def apply_scale(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def box(name, size, loc, material, bevel=0.0, rot_z=0.0):
    """Axis aligned box. loc is the centre of the base (z = bottom)."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(loc[0], loc[1], loc[2] + size[2] / 2.0))
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    apply_scale(o)
    o.rotation_euler = (0.0, 0.0, rot_z)
    o.data.materials.append(material)
    if bevel > 0:
        m = o.modifiers.new('bevel', 'BEVEL')
        m.width = bevel
        m.segments = 3
        m.limit_method = 'ANGLE'
    return o


def slab(name, size, loc, material):
    """Rounded island slab, top face at z = 0."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(loc[0], loc[1], -SLAB / 2.0))
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0], size[1], SLAB)
    apply_scale(o)
    o.data.materials.append(material)
    m = o.modifiers.new('bevel', 'BEVEL')
    m.width = 1.6
    m.segments = 6
    m.limit_method = 'ANGLE'
    return o


def prism(name, w, d, h, loc, material, peak=0.5):
    """Gable or saw-tooth roof. peak is the ridge position across the width, 0..1."""
    bm = bmesh.new()
    x, y = w / 2.0, d / 2.0
    px = -x + w * peak
    v = [bm.verts.new(p) for p in [(-x, -y, 0), (x, -y, 0), (x, y, 0), (-x, y, 0), (px, -y, h), (px, y, h)]]
    bm.faces.new((v[3], v[2], v[1], v[0]))
    bm.faces.new((v[0], v[4], v[5], v[3]))
    bm.faces.new((v[1], v[2], v[5], v[4]))
    bm.faces.new((v[0], v[1], v[4]))
    bm.faces.new((v[3], v[5], v[2]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    o.location = loc
    o.data.materials.append(material)
    return link_obj(o)


def panels(name, loc, nx, ny, rot=(0.0, 0.0, 0.0)):
    """A grid of PV modules: dark cells on a lighter frame. loc is the grid origin corner."""
    frame = box(name + '_frame', (1.7, 1.1, 0.05), loc, mat('panel_frame', COLORS['panel_frame'], 0.6))
    cell = box(name + '_cell', (1.56, 0.96, 0.07), loc, mat('panel', COLORS['panel'], 0.35))
    for o in (frame, cell):
        ax = o.modifiers.new('ax', 'ARRAY')
        ax.count = nx
        ax.relative_offset_displace = (1.06, 0.0, 0.0)
        ay = o.modifiers.new('ay', 'ARRAY')
        ay.count = ny
        ay.relative_offset_displace = (0.0, 1.08, 0.0)
        o.rotation_euler = rot
    return frame, cell


def tree(name, loc, r=1.4, variant=0):
    trunk = box(name + '_trunk', (0.5, 0.5, 1.4), loc, mat('trunk', COLORS['trunk']))
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=r, location=(loc[0], loc[1], loc[2] + 1.4 + r * 0.8))
    crown = bpy.context.active_object
    crown.name = name + '_crown'
    crown.data.materials.append(mat('foliage_%d' % variant, COLORS['foliage_a' if variant == 0 else 'foliage_b']))
    return trunk, crown


def mfh(name, loc, w, d, h, floors, balcony_side=-1):
    body = box(name, (w, d, h), loc, mat('facade', COLORS['facade']), bevel=0.15)
    fh = h / floors
    for f in range(floors):
        z = loc[2] + fh * f + fh * 0.45
        for k in range(2):
            bx = loc[0] - w * 0.25 + k * w * 0.5
            box('%s_balcony_%d_%d' % (name, f, k), (2.8, 1.3, 0.22),
                (bx, loc[1] + balcony_side * (d / 2.0 + 0.65), z), mat('facade_shade', COLORS['facade_shade']))
    return body


def efh(name, loc, w, d, h, roof_h, with_panels=True):
    body = box(name, (w, d, h), loc, mat('facade', COLORS['facade']), bevel=0.12)
    roof = prism(name + '_roof', w + 0.8, d + 0.8, roof_h, (loc[0], loc[1], loc[2] + h), mat('facade_shade', COLORS['facade_shade']))
    if with_panels:
        ang = math.atan2(roof_h, (w + 0.8) / 2.0)
        panels(name + '_pv', (loc[0] - (w + 0.8) / 4.0 - 1.7, loc[1] - d / 2.0 + 0.6, loc[2] + h + roof_h * 0.5 + 0.08),
               2, int(d // 1.2), rot=(0.0, -ang, 0.0))
    return body, roof


def line(name, points, material, width=0.5, z=0.03):
    """Flat segments along a polyline, drawn on the ground."""
    objs = []
    for i in range(len(points) - 1):
        a, b = Vector(points[i]), Vector(points[i + 1])
        d = b - a
        length = d.length
        if length < 0.01:
            continue
        mid = (a + b) / 2.0
        o = box('%s_%d' % (name, i), (length, width, 0.06), (mid.x, mid.y, mid.z + z), material)
        o.rotation_euler = (0.0, 0.0, math.atan2(d.y, d.x))
        objs.append(o)
    return objs


def path_sampler(points):
    pts = [Vector(p) for p in points]
    seg = [(pts[i + 1] - pts[i]).length for i in range(len(pts) - 1)]
    total = sum(seg)

    def at(u):
        dist = (u % 1.0) * total
        for i, s in enumerate(seg):
            if dist <= s or i == len(seg) - 1:
                t = 0.0 if s == 0 else min(dist / s, 1.0)
                return pts[i].lerp(pts[i + 1], t)
            dist -= s
        return pts[-1]

    return at


def pulses(name, points, count, material, z=0.45):
    at = path_sampler(points)
    for k in range(count):
        phase = k / float(count)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.42, location=(0, 0, 0))
        o = bpy.context.active_object
        o.name = '%s_pulse_%d' % (name, k)
        o.data.materials.append(material)
        prev_u = None
        for f in range(1, FRAMES + 2, 2):
            u = (phase + (f - 1) / float(FRAMES)) % 1.0
            p = at(u)
            o.location = (p.x, p.y, p.z + z)
            o.keyframe_insert(data_path='location', frame=f)
            wrapped = prev_u is not None and u < prev_u
            o.scale = (0.0, 0.0, 0.0) if wrapped else (1.0, 1.0, 1.0)
            o.keyframe_insert(data_path='scale', frame=f)
            if wrapped:
                o.scale = (0.0, 0.0, 0.0)
                o.keyframe_insert(data_path='scale', frame=f - 2)
            prev_u = u
        for fc in o.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'


def build_islands():
    for zid, (c, s) in ISLANDS.items():
        slab('island_' + zid, s, (c[0], c[1]), mat('island_' + zid, COLORS['ground'], 0.9))
    ground = box('ground', (150.0, 120.0, 0.2), (0.0, 0.0, -SLAB - 0.2), mat('ground_plane', COLORS['ground'], 0.95))
    return ground


def build_zev():
    road = mat('road', COLORS['road'], 0.9)
    box('zev_road', (30.0, 3.0, 0.04), (-38.0, 8.0, 0.0), road)
    mfh('zev_mfh_a', (-52.0, 32.0, 0.0), 11.0, 15.0, 15.0, 5)
    mfh('zev_mfh_b', (-33.0, 36.0, 0.0), 11.0, 15.0, 18.0, 6, balcony_side=1)
    mfh('zev_mfh_c', (-40.0, 16.0, 0.0), 13.0, 12.0, 13.0, 4)
    panels('zev_pv_a', (-56.5, 26.0, 15.05), 5, 8)
    panels('zev_pv_b', (-37.5, 30.0, 18.05), 5, 8)
    panels('zev_pv_c', (-45.5, 11.0, 13.05), 6, 7)
    box('zev_hak', (1.4, 0.9, 1.7), (-19.0, 12.0, 0.0), mat('primary', COLORS['primary'], 0.6))
    for i, (x, y) in enumerate([(-58, 42), (-24, 44), (-27, 22), (-56, 12), (-45, 44)]):
        tree('zev_tree_%d' % i, (x, y, 0.0), variant=i % 2)
    line('zev_flow', [(-52, 32, 15.2), (-52, 24, 15.2), (-52, 24, 0.0), (-52, 12, 0.0), (-19, 12, 0.0)],
         mat('flow', COLORS['lime_soft'], 0.5, emission=COLORS['lime'], strength=0.6))
    line('zev_flow_b', [(-33, 36, 18.2), (-33, 28, 18.2), (-33, 28, 0.0), (-33, 12, 0.0), (-19, 12, 0.0)], MATS['flow'])
    line('zev_flow_c', [(-40, 16, 13.2), (-40, 12, 13.2), (-40, 12, 0.0), (-19, 12, 0.0)], MATS['flow'])
    pulse = mat('pulse', COLORS['lime'], 0.3, emission=COLORS['lime'], strength=4.0)
    pulses('zev_a', [(-52, 32, 15.2), (-52, 24, 15.2), (-52, 24, 0.0), (-52, 12, 0.0), (-19, 12, 0.0)], 3, pulse)
    pulses('zev_b', [(-33, 36, 18.2), (-33, 28, 18.2), (-33, 28, 0.0), (-33, 12, 0.0), (-19, 12, 0.0)], 3, pulse)
    pulses('zev_c', [(-19, 12, 0.0), (-40, 12, 0.0), (-40, 16, 0.0)], 2, pulse)


def build_vzev():
    road = MATS['road']
    box('vzev_road', (3.0, 30.0, 0.04), (-18.0, -26.0, 0.0), road)
    efh('vzev_efh_a', (-54.0, -18.0, 0.0), 9.0, 10.0, 6.5, 3.0)
    efh('vzev_efh_b', (-38.0, -33.0, 0.0), 9.0, 10.0, 6.5, 3.0, with_panels=False)
    efh('vzev_efh_c', (-28.0, -16.0, 0.0), 8.0, 9.0, 6.0, 2.8)
    box('vzev_carport', (5.0, 5.5, 0.15), (-45.0, -30.0, 2.4), mat('facade_shade', COLORS['facade_shade']))
    for i, (x, y) in enumerate([(-46, -12), (-46, -24), (-32, -26)]):
        box('vzev_hedge_%d' % i, (0.9, 10.0, 1.1), (x, y, 0.0), mat('foliage_0', COLORS['foliage_a']))
    box('vzev_verteilkabine', (1.6, 0.9, 1.5), (-18.0, -40.0, 0.0), MATS['primary'])
    for i, (x, y) in enumerate([(-60, -36), (-24, -40), (-60, -8), (-30, -8)]):
        tree('vzev_tree_%d' % i, (x, y, 0.0), r=1.2, variant=i % 2)
    flow = MATS['flow']
    line('vzev_flow_a', [(-54, -18, 9.6), (-54, -24, 9.6), (-54, -24, 0.0), (-54, -40, 0.0), (-18, -40, 0.0)], flow)
    line('vzev_flow_c', [(-28, -16, 9.0), (-28, -22, 9.0), (-28, -22, 0.0), (-28, -40, 0.0), (-18, -40, 0.0)], flow)
    line('vzev_flow_b', [(-18, -40, 0.0), (-38, -40, 0.0), (-38, -33, 0.0)], flow)
    pulse = MATS['pulse']
    pulses('vzev_a', [(-54, -18, 9.6), (-54, -24, 9.6), (-54, -24, 0.0), (-54, -40, 0.0), (-18, -40, 0.0)], 3, pulse)
    pulses('vzev_c', [(-28, -16, 9.0), (-28, -22, 9.0), (-28, -22, 0.0), (-28, -40, 0.0), (-18, -40, 0.0)], 2, pulse)
    pulses('vzev_b', [(-18, -40, 0.0), (-38, -40, 0.0), (-38, -33, 0.0)], 2, pulse)


def build_leg():
    road = MATS['road']
    box('leg_yard', (58.0, 12.0, 0.04), (34.0, 2.0, 0.0), road)
    box('leg_hall', (34.0, 18.0, 9.0), (24.0, 26.0, 0.0), mat('facade', COLORS['facade']), bevel=0.15)
    for k in range(4):
        prism('leg_saw_%d' % k, 8.5, 18.6, 3.2, (24.0 - 12.75 + k * 8.5, 26.0, 9.0), mat('facade_shade', COLORS['facade_shade']), peak=0.82)
        panels('leg_pv_%d' % k, (24.0 - 12.75 + k * 8.5 - 3.6, 18.2, 9.0 + 1.75), 3, 14, rot=(0.0, -math.atan2(3.2, 7.0), 0.0))
    box('leg_office', (14.0, 12.0, 12.0), (52.0, 10.0, 0.0), mat('facade', COLORS['facade']), bevel=0.15)
    for f in range(3):
        box('leg_office_glass_%d' % f, (14.2, 12.2, 1.2), (52.0, 10.0, 1.8 + f * 4.0), mat('glass', COLORS['glass'], 0.25))
    panels('leg_pv_office', (46.0, 5.0, 12.05), 6, 5)
    for i, x in enumerate([10.0, 18.0]):
        box('leg_truck_cab_%d' % i, (2.6, 2.4, 3.0), (x, 4.0, 0.0), mat('truck_dark', COLORS['truck_dark']))
        box('leg_truck_box_%d' % i, (2.6, 6.5, 3.4), (x, 8.6, 0.6), mat('truck', COLORS['truck']))
    box('leg_trafo', (3.2, 2.6, 2.8), (12.0, 44.0, 0.0), MATS['primary'])
    box('leg_silo_a', (2.4, 2.4, 11.0), (46.0, 30.0, 0.0), mat('facade_shade', COLORS['facade_shade']))
    box('leg_silo_b', (2.4, 2.4, 11.0), (50.0, 30.0, 0.0), MATS['facade_shade'])
    for i, (x, y) in enumerate([(6, 30), (60, 26), (58, -2), (8, -2)]):
        tree('leg_tree_%d' % i, (x, y, 0.0), r=1.5, variant=i % 2)
    flow = MATS['flow']
    line('leg_flow_hall', [(24, 26, 12.4), (24, 36, 12.4), (24, 36, 0.0), (24, 44, 0.0), (12, 44, 0.0)], flow)
    line('leg_flow_office', [(52, 10, 12.2), (52, 18, 12.2), (52, 18, 0.0), (52, 44, 0.0), (12, 44, 0.0)], flow)
    # Cross-island flows over the public grid. These are the only lines that leave an island.
    line('leg_flow_to_zev', [(12, 44, 0.0), (0, 44, -SLAB), (0, 12, -SLAB), (-19, 12, 0.0)], flow, width=0.7)
    line('leg_flow_to_praxis', [(12, 44, 0.0), (4, 44, -SLAB), (4, -20, -SLAB), (22, -20, 0.0)], flow, width=0.7)
    line('leg_flow_to_vzev', [(4, -20, -SLAB), (4, -44, -SLAB), (-18, -44, -SLAB), (-18, -40, 0.0)], flow, width=0.7)
    pulse = MATS['pulse']
    pulses('leg_hall', [(24, 26, 12.4), (24, 36, 12.4), (24, 36, 0.0), (24, 44, 0.0), (12, 44, 0.0)], 3, pulse)
    pulses('leg_office', [(52, 10, 12.2), (52, 18, 12.2), (52, 18, 0.0), (52, 44, 0.0), (12, 44, 0.0)], 3, pulse)
    pulses('leg_zev', [(12, 44, 0.0), (0, 44, -SLAB), (0, 12, -SLAB), (-19, 12, 0.0)], 4, pulse)
    pulses('leg_praxis', [(12, 44, 0.0), (4, 44, -SLAB), (4, -20, -SLAB), (22, -20, 0.0)], 4, pulse)
    pulses('leg_vzev', [(4, -20, -SLAB), (4, -44, -SLAB), (-18, -44, -SLAB), (-18, -40, 0.0)], 3, pulse)


def build_praxismodell():
    box('praxis_road', (3.0, 26.0, 0.04), (14.0, -30.0, 0.0), MATS['road'])
    mfh('praxis_mfh', (34.0, -30.0, 0.0), 14.0, 18.0, 15.0, 5, balcony_side=1)
    panels('praxis_pv', (28.0, -38.5, 15.05), 6, 9)
    box('praxis_vnb_meter', (1.4, 0.9, 1.8), (22.0, -20.0, 0.0), mat('lime_solid', COLORS['lime'], 0.5, emission=COLORS['lime'], strength=0.8))
    for i, (x, y) in enumerate([(48, -40), (48, -18), (20, -42)]):
        tree('praxis_tree_%d' % i, (x, y, 0.0), r=1.3, variant=i % 2)
    line('praxis_flow', [(34, -30, 15.2), (34, -22, 15.2), (34, -22, 0.0), (22, -22, 0.0), (22, -20, 0.0)], MATS['flow'])
    pulses('praxis', [(34, -30, 15.2), (34, -22, 15.2), (34, -22, 0.0), (22, -22, 0.0), (22, -20, 0.0)], 3, MATS['pulse'])


def add_anchors():
    heights = {'zev': 24.0, 'vzev': 14.0, 'leg': 18.0, 'praxismodell': 21.0}
    for zid, (c, _) in ISLANDS.items():
        e = bpy.data.objects.new('anchor_' + zid, None)
        e.empty_display_size = 1.0
        e.location = (c[0], c[1], heights[zid])
        link_obj(e)


def gltf_coords(v):
    """Blender Z-up to glTF Y-up."""
    return [round(v[0], 2), round(v[2], 2), round(-v[1], 2)]


def write_json(path):
    zones = {}
    for zid, (c, s) in ISLANDS.items():
        anchor = bpy.data.objects['anchor_' + zid].location
        g = gltf_coords(anchor)
        t = gltf_coords((c[0], c[1], 4.0))
        zones[zid] = {
            'anchor': g,
            'target': '%sm %sm %sm' % (t[0], t[1], t[2]),
            'orbit': '-40deg 58deg %sm' % round(max(s) * 2.1, 1),
        }
    data = {
        'overview': {'target': '0m 3m 0m', 'orbit': '-40deg 58deg 230m'},
        'zones': zones,
    }
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def setup_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'flow'
    sc.render.fps = FPS
    sc.frame_start = 1
    sc.frame_end = FRAMES
    sc.render.engine = 'BLENDER_EEVEE'
    sc.eevee.taa_render_samples = 64
    if hasattr(sc.eevee, 'use_shadows'):
        sc.eevee.use_shadows = True
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    world = bpy.data.worlds.new('World')
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (1.0, 1.0, 1.0, 1.0)
    bg.inputs['Strength'].default_value = 1.0
    sc.world = world
    sun_data = bpy.data.lights.new('sun', 'SUN')
    sun_data.energy = 3.0
    sun_data.angle = math.radians(8.0)
    sun = bpy.data.objects.new('sun', sun_data)
    sun.rotation_euler = (math.radians(48.0), 0.0, math.radians(30.0))
    link_obj(sun)
    return sc


def add_camera(sc):
    cam_data = bpy.data.cameras.new('cam')
    cam_data.type = 'ORTHO'
    cam = bpy.data.objects.new('cam', cam_data)
    link_obj(cam)
    sc.camera = cam
    return cam


def aim(cam, target, ortho_scale, dist=400.0):
    rot = Euler((math.radians(55.0), 0.0, math.radians(45.0)), 'XYZ')
    forward = rot.to_matrix() @ Vector((0.0, 0.0, -1.0))
    cam.rotation_euler = rot
    cam.location = Vector(target) - forward * dist
    cam.data.ortho_scale = ortho_scale


def render(sc, path, w, h, fmt='WEBP'):
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = fmt
    if fmt == 'WEBP':
        sc.render.image_settings.quality = 88
    sc.render.filepath = path
    sc.frame_set(30)
    bpy.ops.render.render(write_still=True)


def export_glb(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        export_apply=True,
        export_animations=True,
        export_animation_mode='SCENE',
        export_yup=True,
        export_materials='EXPORT',
        export_image_format='NONE',
        export_lights=False,
        export_cameras=False,
        export_extras=False,
    )


def main():
    out, preview = parse_args()
    sc = setup_scene()
    build_islands()
    build_zev()
    build_vzev()
    build_leg()
    build_praxismodell()
    add_anchors()

    glb_dir = os.path.join(out, 'public', '3d')
    img_dir = os.path.join(out, 'public', 'ratgeber')
    os.makedirs(glb_dir, exist_ok=True)
    os.makedirs(img_dir, exist_ok=True)

    export_glb(os.path.join(glb_dir, 'energiegemeinschaften.glb'))
    write_json(os.path.join(out, 'src', 'data', 'energiegemeinschaften-scene.json'))

    cam = add_camera(sc)
    aim(cam, (-2.0, -2.0, 4.0), 175.0)
    render(sc, os.path.join(img_dir, 'energiegemeinschaften.webp'), 2400, 1500)
    if preview:
        render(sc, preview, 1400, 875, fmt='PNG')
    for zid, (c, s) in ISLANDS.items():
        aim(cam, (c[0], c[1], 5.0), max(s) * 1.45)
        render(sc, os.path.join(img_dir, zid + '.webp'), 1600, 1200)

    size = os.path.getsize(os.path.join(glb_dir, 'energiegemeinschaften.glb'))
    print('GLB bytes:', size)
    if size > 1_500_000:
        raise SystemExit('GLB over 1.5 MB, reduce geometry')


if __name__ == '__main__':
    main()
```

- [ ] **Step 4: Write the GLB checker**

`scripts/3d/energiegemeinschaften/check-glb.mjs`:

```js
// Validates the exported GLB: header, one animation clip, island materials, anchor nodes, size.
import { readFileSync, statSync } from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('usage: node check-glb.mjs <file.glb>')
  process.exit(2)
}
const buf = readFileSync(file)
const magic = buf.toString('ascii', 0, 4)
const version = buf.readUInt32LE(4)
const chunkLength = buf.readUInt32LE(12)
const chunkType = buf.toString('ascii', 16, 20)
if (magic !== 'glTF' || version !== 2 || chunkType !== 'JSON') {
  console.error('not a glTF 2 binary')
  process.exit(1)
}
const json = JSON.parse(buf.toString('utf8', 20, 20 + chunkLength))
const problems = []

const animations = json.animations ?? []
if (animations.length !== 1) problems.push(`expected 1 animation, found ${animations.length}`)
else console.log('animation clip:', animations[0].name)

const materials = new Set((json.materials ?? []).map(m => m.name))
for (const id of ['zev', 'vzev', 'leg', 'praxismodell']) {
  if (!materials.has(`island_${id}`)) problems.push(`material island_${id} missing`)
}
const nodes = new Set((json.nodes ?? []).map(n => n.name))
for (const id of ['zev', 'vzev', 'leg', 'praxismodell']) {
  if (!nodes.has(`anchor_${id}`)) problems.push(`node anchor_${id} missing`)
}

const bytes = statSync(file).size
console.log('size bytes:', bytes)
if (bytes > 1_500_000) problems.push(`GLB is ${bytes} bytes, limit 1500000`)

if (problems.length) {
  for (const p of problems) console.error('FAIL', p)
  process.exit(1)
}
console.log('OK')
```

- [ ] **Step 5: Run the Blender build**

Run:

```bash
/opt/homebrew/bin/blender -b -P scripts/3d/energiegemeinschaften/build_scene.py -- --out . --preview /private/tmp/claude-502/-Users-dejanarsic-zansu-free-state-ag-app/3d43f569-c4f3-41b5-a831-a3a0526b9b4e/scratchpad/energiegemeinschaften-preview.png 2>&1 | grep -vE "^(Read|Fra:|Info|Time)" | tail -30
```

Expected: last lines contain `GLB bytes: <number under 1500000>` and no Python traceback. If `export_animation_mode='SCENE'` is rejected, print `bpy.ops.export_scene.gltf.get_rna_type().properties['export_animation_mode'].enum_items` and pick the option that bakes the scene into one clip.

- [ ] **Step 6: Check the GLB**

Run: `node scripts/3d/energiegemeinschaften/check-glb.mjs public/3d/energiegemeinschaften.glb`
Expected: `animation clip: <name>`, `size bytes: ...`, `OK`. Note the clip name. If it is not `flow`, Task 3 reads `availableAnimations[0]` anyway, nothing to change.

- [ ] **Step 7: Run the JSON test**

Run: `npx vitest run src/data/__tests__/energiegemeinschaften-scene.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 8: Look review**

Open the preview PNG with the Read tool and show it to Dejan together with `public/ratgeber/zev.webp`. Ask for one round of changes. Apply them in `build_scene.py` (positions, colours, counts), rerun Steps 5 to 7. Do not start Task 2 before Dejan accepts the look.

- [ ] **Step 9: Stage**

```bash
git add scripts/3d/energiegemeinschaften public/3d public/ratgeber src/data/energiegemeinschaften-scene.json src/data/__tests__/energiegemeinschaften-scene.test.ts
```

---

### Task 2: model-viewer loader and types

**Files:**
- Create: `src/lib/model-viewer.ts`
- Modify: `src/types/model-viewer.d.ts`
- Modify: `src/components/products/ModelViewer.tsx:9-19`

**Interfaces:**
- Produces `registerModelViewer(): Promise<unknown>` in `@/lib/model-viewer`.
- Produces global `ModelViewerElement` with `cameraTarget`, `interpolationDecay`, `animationName`, `availableAnimations`, `autoplay`, `play()`, `pause()`, `model`.

- [ ] **Step 1: Create the loader module**

`src/lib/model-viewer.ts`:

```ts
let registration: Promise<unknown> | null = null

/** Loads @google/model-viewer once, client side only. Safe to call from any client component. */
export function registerModelViewer(): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.customElements?.get('model-viewer')) return Promise.resolve()
  if (!registration) registration = import('@google/model-viewer')
  return registration
}
```

- [ ] **Step 2: Point ModelViewer.tsx at it**

In `src/components/products/ModelViewer.tsx` delete lines 9 to 19 (the `let registration` block and the local `registerModelViewer` function) and add to the imports:

```ts
import { registerModelViewer } from '@/lib/model-viewer'
```

- [ ] **Step 3: Extend the type declarations**

In `src/types/model-viewer.d.ts` add to `ModelViewerAttributes`:

```ts
  'animation-name'?: string
  autoplay?: boolean | ''
```

and replace the `ModelViewerElement` interface with:

```ts
  interface ModelViewerPbr {
    baseColorFactor: [number, number, number, number]
    setBaseColorFactor(rgba: [number, number, number, number] | string): void
  }
  interface ModelViewerMaterial {
    name: string
    pbrMetallicRoughness: ModelViewerPbr
  }
  interface ModelViewerModel {
    materials: ReadonlyArray<ModelViewerMaterial>
    getMaterialByName(name: string): ModelViewerMaterial | null
  }
  interface ModelViewerElement extends HTMLElement {
    src: string | null
    poster: string | null
    cameraOrbit: string
    cameraTarget: string
    fieldOfView: string
    minCameraOrbit: string
    maxCameraOrbit: string
    interpolationDecay: number
    animationName: string | undefined
    availableAnimations: string[]
    autoplay: boolean
    loaded: boolean
    model: ModelViewerModel | null
    play(options?: { repetitions?: number; pingpong?: boolean }): void
    pause(): void
    dismissPoster(): void
    resetTurntableRotation(theta?: number): void
    jumpCameraToGoal(): void
    getCameraOrbit(): { theta: number; phi: number; radius: number }
    toBlob(options?: { idealAspect?: boolean; mimeType?: string; qualityArgument?: number }): Promise<Blob>
  }
```

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`
Expected: no errors. `ModelViewer.tsx` compiles against the widened interface unchanged.

- [ ] **Step 5: Stage**

```bash
git add src/lib/model-viewer.ts src/types/model-viewer.d.ts src/components/products/ModelViewer.tsx
```

---

### Task 3: Scene zone helpers and the interactive viewer

**Files:**
- Create: `src/lib/ratgeber/scene-zones.ts`
- Create: `src/lib/ratgeber/__tests__/scene-zones.test.ts`
- Create: `src/components/ratgeber/CommunityScene.tsx`

**Interfaces:**
- Consumes `registerModelViewer` (Task 2), `src/data/energiegemeinschaften-scene.json` (Task 1).
- Produces:

```ts
export type SceneZoneId = 'zev' | 'vzev' | 'leg' | 'praxismodell'
export const SCENE_ZONE_IDS: readonly SceneZoneId[]
export interface SceneZoneConfig { anchor: [number, number, number]; target: string; orbit: string }
export interface SceneConfig { overview: { target: string; orbit: string }; zones: Record<SceneZoneId, SceneZoneConfig> }
export function parseZoneHash(hash: string): SceneZoneId | null
export function isSceneZoneId(value: string): value is SceneZoneId
```

and the component

```ts
export interface SceneZoneContent { id: SceneZoneId; label: string; summary: string; href: string; ctaLabel: string }
export default function CommunityScene(props: { zones: SceneZoneContent[]; poster: string; alt: string; overviewLabel: string; loadingLabel: string })
```

- [ ] **Step 1: Write the failing helper test**

`src/lib/ratgeber/__tests__/scene-zones.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { isSceneZoneId, parseZoneHash, SCENE_ZONE_IDS } from '../scene-zones'

describe('scene zones', () => {
  test('lists the four zones in display order', () => {
    expect(SCENE_ZONE_IDS).toEqual(['zev', 'vzev', 'leg', 'praxismodell'])
  })

  test('parses a zone hash with or without the hash sign', () => {
    expect(parseZoneHash('#zev')).toBe('zev')
    expect(parseZoneHash('vzev')).toBe('vzev')
    expect(parseZoneHash('#LEG')).toBe('leg')
  })

  test('returns null for anything else', () => {
    expect(parseZoneHash('')).toBeNull()
    expect(parseZoneHash('#kosten')).toBeNull()
    expect(isSceneZoneId('solar')).toBe(false)
  })
})
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/lib/ratgeber/__tests__/scene-zones.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the helpers**

`src/lib/ratgeber/scene-zones.ts`:

```ts
export type SceneZoneId = 'zev' | 'vzev' | 'leg' | 'praxismodell'

export const SCENE_ZONE_IDS: readonly SceneZoneId[] = ['zev', 'vzev', 'leg', 'praxismodell']

export interface SceneZoneConfig {
  anchor: [number, number, number]
  target: string
  orbit: string
}

export interface SceneConfig {
  overview: { target: string; orbit: string }
  zones: Record<SceneZoneId, SceneZoneConfig>
}

export function isSceneZoneId(value: string): value is SceneZoneId {
  return (SCENE_ZONE_IDS as readonly string[]).includes(value)
}

/** "#zev" or "zev" to the zone id, null for anything that is not a zone. */
export function parseZoneHash(hash: string): SceneZoneId | null {
  const value = hash.replace(/^#/, '').toLowerCase()
  return isSceneZoneId(value) ? value : null
}
```

- [ ] **Step 4: Run the test, expect pass**

Run: `npx vitest run src/lib/ratgeber/__tests__/scene-zones.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the viewer component**

`src/components/ratgeber/CommunityScene.tsx`:

```tsx
'use client'

import { ArrowUpRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import sceneJson from '@/data/energiegemeinschaften-scene.json'
import { registerModelViewer } from '@/lib/model-viewer'
import {
  parseZoneHash,
  SCENE_ZONE_IDS,
  type SceneConfig,
  type SceneZoneId,
} from '@/lib/ratgeber/scene-zones'
import { cn } from '@/lib/utils'

const scene = sceneJson as SceneConfig
const SRC = '/3d/energiegemeinschaften.glb'
const HIGHLIGHT: [number, number, number, number] = [0.72, 1.0, 0.1, 1]

export interface SceneZoneContent {
  id: SceneZoneId
  label: string
  summary: string
  href: string
  ctaLabel: string
}

interface Props {
  zones: SceneZoneContent[]
  poster: string
  alt: string
  overviewLabel: string
  loadingLabel: string
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function CommunityScene({ zones, poster, alt, overviewLabel, loadingLabel }: Props) {
  const ref = useRef<ModelViewerElement | null>(null)
  const originals = useRef<Map<SceneZoneId, [number, number, number, number]>>(new Map())
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState<SceneZoneId | null>(null)
  const [zoomArmed, setZoomArmed] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    let alive = true
    registerModelViewer()
      .then(() => alive && setReady(true))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  const moveCamera = useCallback(
    (target: string, orbit: string) => {
      const el = ref.current
      if (!el) return
      el.cameraTarget = target
      el.cameraOrbit = orbit
      if (reduced) el.jumpCameraToGoal()
    },
    [reduced]
  )

  const focusZone = useCallback(
    (id: SceneZoneId | null, pushHash = true) => {
      setActive(id)
      if (id) moveCamera(scene.zones[id].target, scene.zones[id].orbit)
      else moveCamera(scene.overview.target, scene.overview.orbit)
      if (pushHash && typeof window !== 'undefined') {
        const url = `${window.location.pathname}${window.location.search}${id ? `#${id}` : ''}`
        window.history.replaceState(null, '', url)
      }
    },
    [moveCamera]
  )

  // Load, error and the first animation clip
  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    const onLoad = () => {
      setLoaded(true)
      if (!reduced) {
        el.animationName = el.availableAnimations.includes('flow') ? 'flow' : el.availableAnimations[0]
        el.play()
      }
      const fromHash = parseZoneHash(window.location.hash)
      if (fromHash) focusZone(fromHash, false)
    }
    const onError = () => setFailed(true)
    el.addEventListener('load', onLoad)
    el.addEventListener('error', onError)
    if (el.loaded) onLoad()
    return () => {
      el.removeEventListener('load', onLoad)
      el.removeEventListener('error', onError)
    }
  }, [ready, reduced, focusZone])

  // Deep links while the page is open
  useEffect(() => {
    const onHash = () => focusZone(parseZoneHash(window.location.hash), false)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [focusZone])

  const tint = useCallback((id: SceneZoneId, on: boolean) => {
    const material = ref.current?.model?.getMaterialByName(`island_${id}`)
    if (!material) return
    const pbr = material.pbrMetallicRoughness
    if (on) {
      if (!originals.current.has(id)) originals.current.set(id, [...pbr.baseColorFactor] as [number, number, number, number])
      pbr.setBaseColorFactor(HIGHLIGHT)
    } else {
      const original = originals.current.get(id)
      if (original) pbr.setBaseColorFactor(original)
    }
  }, [])

  const activeZone = zones.find(z => z.id === active) ?? null
  const showViewer = ready && !failed

  return (
    <div className="relative">
      <div
        className={cn(
          'relative isolate overflow-hidden rounded-[24px] border border-[#062E25]/10 bg-white',
          'aspect-[4/3] md:aspect-[16/10]'
        )}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={() => setZoomArmed(true)}
        onMouseLeave={() => setZoomArmed(false)}
      >
        {showViewer ? (
          <model-viewer
            ref={ref as React.RefObject<HTMLElement>}
            src={SRC}
            poster={poster}
            alt={alt}
            loading="lazy"
            reveal="auto"
            camera-controls=""
            {...(zoomArmed ? {} : { 'disable-zoom': '' })}
            touch-action="pan-y"
            camera-target={scene.overview.target}
            camera-orbit={scene.overview.orbit}
            min-camera-orbit="auto 20deg 80m"
            max-camera-orbit="auto 70deg 320m"
            field-of-view="26deg"
            min-field-of-view="18deg"
            max-field-of-view="34deg"
            interpolation-decay="200"
            interaction-prompt="none"
            shadow-intensity="0.7"
            shadow-softness="0.9"
            exposure="1.0"
            tone-mapping="neutral"
            environment-image="neutral"
            className="block h-full w-full"
            style={
              {
                '--poster-color': 'transparent',
                '--progress-bar-color': 'transparent',
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
              } as React.CSSProperties
            }
          >
            {zones.map(zone => {
              const [x, y, z] = scene.zones[zone.id].anchor
              return (
                <button
                  key={zone.id}
                  type="button"
                  slot={`hotspot-${zone.id}`}
                  data-position={`${x}m ${y}m ${z}m`}
                  data-normal="0 1 0"
                  onClick={() => focusZone(zone.id)}
                  onMouseEnter={() => tint(zone.id, true)}
                  onMouseLeave={() => tint(zone.id, false)}
                  onFocus={() => tint(zone.id, true)}
                  onBlur={() => tint(zone.id, false)}
                  aria-pressed={active === zone.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-base font-semibold shadow-md transition-transform',
                    'hover:scale-105 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#062E25]',
                    zone.id === 'leg' ? 'bg-[#062E25] text-white' : 'bg-[#b7fe1a] text-[#062E25]'
                  )}
                >
                  {zone.label}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
              )
            })}
            <div slot="progress-bar" />
          </model-viewer>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={alt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        )}

        {showViewer && !loaded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-base text-[#062E25] shadow">{loadingLabel}</span>
          </div>
        )}

        {active && (
          <button
            type="button"
            onClick={() => focusZone(null)}
            className="absolute left-4 top-4 z-10 rounded-full border border-[#062E25]/15 bg-white/90 px-4 py-1.5 text-base font-medium text-[#062E25] shadow-sm backdrop-blur"
          >
            {overviewLabel}
          </button>
        )}

        {activeZone && (
          <aside
            className={cn(
              'absolute z-10 rounded-[20px] border border-[#062E25]/10 bg-white/95 p-5 text-[#062E25] shadow-xl backdrop-blur',
              'inset-x-3 bottom-3 md:inset-x-auto md:bottom-auto md:right-4 md:top-4 md:w-[340px]'
            )}
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold">{activeZone.label}</h3>
              <button
                type="button"
                onClick={() => focusZone(null)}
                aria-label={overviewLabel}
                className="rounded-full p-1 hover:bg-[#062E25]/5"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-base text-[#062E25]/85">{activeZone.summary}</p>
            <a
              href={activeZone.href}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#062E25] px-4 py-2 text-base font-medium text-white hover:bg-[#062E25]/90"
            >
              {activeZone.ctaLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </aside>
        )}
      </div>

      {/* Chip row for narrow screens and for the no-viewer fallback */}
      <div className={cn('mt-3 flex flex-wrap gap-2', showViewer ? 'sm:hidden' : '')}>
        {SCENE_ZONE_IDS.map(id => {
          const zone = zones.find(z => z.id === id)
          if (!zone) return null
          return showViewer ? (
            <button
              key={id}
              type="button"
              onClick={() => focusZone(id)}
              aria-pressed={active === id}
              className={cn(
                'rounded-full border px-4 py-1.5 text-base font-medium',
                active === id ? 'border-[#062E25] bg-[#062E25] text-white' : 'border-[#062E25]/20 bg-white text-[#062E25]'
              )}
            >
              {zone.label}
            </button>
          ) : (
            <a
              key={id}
              href={zone.href}
              className="rounded-full border border-[#062E25]/20 bg-white px-4 py-1.5 text-base font-medium text-[#062E25]"
            >
              {zone.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Type check and lint**

Run: `npx tsc --noEmit && npx next lint --file src/components/ratgeber/CommunityScene.tsx --file src/lib/ratgeber/scene-zones.ts`
Expected: no errors. The JSON import needs `resolveJsonModule`, already on in `tsconfig.json` (Next default). If tsc rejects the `sceneJson as SceneConfig` cast, cast through `unknown` first.

- [ ] **Step 7: Stage**

```bash
git add src/lib/ratgeber/scene-zones.ts src/lib/ratgeber/__tests__/scene-zones.test.ts src/components/ratgeber/CommunityScene.tsx
```

---

### Task 4: Flow diagram helper and component

**Files:**
- Create: `src/lib/ratgeber/flow-layout.ts`
- Create: `src/lib/ratgeber/__tests__/flow-layout.test.ts`
- Create: `src/components/ratgeber/FlowDiagram.tsx`
- Modify: `src/app/globals.css` (append at the end)

**Interfaces:**
- Produces:

```ts
export type FlowNodeKind = 'pv' | 'meter' | 'unit' | 'grid' | 'cabinet' | 'vnb' | 'battery'
export interface FlowNode { id: string; label: string; x: number; y: number; kind: FlowNodeKind }
export interface FlowEdge { from: string; to: string; internal: boolean }
export interface FlowSpec { nodes: FlowNode[]; edges: FlowEdge[] }
export function edgePath(a: { x: number; y: number }, b: { x: number; y: number }): string
export default function FlowDiagram(props: { spec: FlowSpec; title: string })
```

  Node coordinates are on a 100 x 60 grid (viewBox). Nodes render as 18 x 8 rounded rectangles centred on `(x, y)`.

- [ ] **Step 1: Write the failing path test**

`src/lib/ratgeber/__tests__/flow-layout.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { edgePath } from '../flow-layout'

describe('edgePath', () => {
  test('draws an elbow: horizontal first, then vertical', () => {
    expect(edgePath({ x: 10, y: 10 }, { x: 40, y: 30 })).toBe('M 10 10 H 40 V 30')
  })

  test('collapses to a straight line when aligned', () => {
    expect(edgePath({ x: 10, y: 10 }, { x: 40, y: 10 })).toBe('M 10 10 H 40')
    expect(edgePath({ x: 10, y: 10 }, { x: 10, y: 30 })).toBe('M 10 10 V 30')
  })
})
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/lib/ratgeber/__tests__/flow-layout.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the helper**

`src/lib/ratgeber/flow-layout.ts`:

```ts
export type FlowNodeKind = 'pv' | 'meter' | 'unit' | 'grid' | 'cabinet' | 'vnb' | 'battery'

export interface FlowNode {
  id: string
  label: string
  x: number
  y: number
  kind: FlowNodeKind
}

export interface FlowEdge {
  from: string
  to: string
  /** true: solar electricity inside the community, drawn in lime and animated */
  internal: boolean
}

export interface FlowSpec {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

/** Orthogonal elbow between two node centres: horizontal leg first, then vertical. */
export function edgePath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const parts = [`M ${a.x} ${a.y}`]
  if (a.x !== b.x) parts.push(`H ${b.x}`)
  if (a.y !== b.y) parts.push(`V ${b.y}`)
  return parts.join(' ')
}
```

- [ ] **Step 4: Run the test, expect pass**

Run: `npx vitest run src/lib/ratgeber/__tests__/flow-layout.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Write the component**

`src/components/ratgeber/FlowDiagram.tsx`:

```tsx
import { edgePath, type FlowNodeKind, type FlowSpec } from '@/lib/ratgeber/flow-layout'

const FILL: Record<FlowNodeKind, string> = {
  pv: '#1f3a5f',
  meter: '#062e25',
  unit: '#f4f2ec',
  grid: '#d9dbd4',
  cabinet: '#062e25',
  vnb: '#3d3858',
  battery: '#cdea67',
}

const TEXT: Record<FlowNodeKind, string> = {
  pv: '#ffffff',
  meter: '#ffffff',
  unit: '#062e25',
  grid: '#062e25',
  cabinet: '#ffffff',
  vnb: '#ffffff',
  battery: '#062e25',
}

interface Props {
  spec: FlowSpec
  title: string
}

/** Static SVG: nodes on a 100 x 60 grid, internal edges dashed lime and animated via .flow-edge. */
export default function FlowDiagram({ spec, title }: Props) {
  const byId = new Map(spec.nodes.map(n => [n.id, n]))
  return (
    <svg
      viewBox="0 0 100 60"
      role="img"
      aria-label={title}
      className="h-auto w-full max-w-[720px]"
    >
      <title>{title}</title>
      {spec.edges.map((edge, i) => {
        const a = byId.get(edge.from)
        const b = byId.get(edge.to)
        if (!a || !b) return null
        return (
          <path
            key={i}
            d={edgePath(a, b)}
            fill="none"
            stroke={edge.internal ? '#b7fe1a' : '#9aa19c'}
            strokeWidth={edge.internal ? 1.4 : 0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={edge.internal ? '2.4 2' : undefined}
            className={edge.internal ? 'flow-edge' : undefined}
          />
        )
      })}
      {spec.nodes.map(node => (
        <g key={node.id} transform={`translate(${node.x - 9} ${node.y - 4})`}>
          <rect width="18" height="8" rx="1.6" fill={FILL[node.kind]} stroke="#062e25" strokeOpacity="0.15" strokeWidth="0.3" />
          <text
            x="9"
            y="5.2"
            textAnchor="middle"
            fontSize="2.6"
            fontFamily="inherit"
            fontWeight="600"
            fill={TEXT[node.kind]}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
```

- [ ] **Step 6: Add the animation to globals.css**

Append to `src/app/globals.css`:

```css
/* Energiegemeinschaften flow diagram: moving dashes on internal solar edges */
@keyframes flow-dash {
  to {
    stroke-dashoffset: -8.8;
  }
}
.flow-edge {
  animation: flow-dash 1.2s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .flow-edge {
    animation: none;
  }
}
```

- [ ] **Step 7: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Stage**

```bash
git add src/lib/ratgeber/flow-layout.ts src/lib/ratgeber/__tests__/flow-layout.test.ts src/components/ratgeber/FlowDiagram.tsx src/app/globals.css
```

---

### Task 5: Content data file, types and the ZEV model

**Files:**
- Create: `src/data/energiegemeinschaften.ts`
- Create: `src/data/__tests__/energiegemeinschaften.test.ts`

**Interfaces:**
- Consumes `FlowSpec` from `@/lib/ratgeber/flow-layout` (Task 4), `SceneZoneId` from `@/lib/ratgeber/scene-zones` (Task 3).
- Produces (used by Tasks 6 to 9):

```ts
export type CommunityModelSlug = 'zev' | 'vzev' | 'leg'
export const COMMUNITY_MODEL_SLUGS: readonly CommunityModelSlug[]
export interface LegalRef { law: string; article: string; url: string; checked: string }
export interface TitledText { title: string; text: string }
export interface CommunityModel { ... }   // full shape below
export const COMMUNITY_MODELS: CommunityModel[]
export function getCommunityModel(slug: string): CommunityModel | null
export const RATGEBER_CHECKED = '2026-09-22'
```

- [ ] **Step 1: Write the failing content test**

`src/data/__tests__/energiegemeinschaften.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { COMMUNITY_MODELS, getCommunityModel } from '../energiegemeinschaften'

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach(v => strings(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach(v => strings(v, out))
  return out
}

describe('energiegemeinschaften content', () => {
  test('every model has a since date, checked legal refs and at least six FAQ items', () => {
    for (const m of COMMUNITY_MODELS) {
      expect(m.since).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(m.legal.refs.length).toBeGreaterThanOrEqual(1)
      for (const ref of m.legal.refs) {
        expect(ref.checked).toMatch(/^2026-\d{2}-\d{2}$/)
        expect(ref.url).toMatch(/^https:\/\//)
      }
      expect(m.faq.length).toBeGreaterThanOrEqual(6)
      expect(m.example.sourceDate).toMatch(/^2026-/)
    }
  })

  test('no string contains an em dash', () => {
    for (const s of strings(COMMUNITY_MODELS)) {
      expect(s.includes(String.fromCharCode(8212))).toBe(false)
    }
  })

  test('every model spells out ZEV on its page', () => {
    for (const m of COMMUNITY_MODELS) {
      expect(strings(m).join(' ')).toContain('Zusammenschluss zum Eigenverbrauch')
    }
  })

  test('getCommunityModel returns null for unknown slugs', () => {
    expect(getCommunityModel('kosten')).toBeNull()
    expect(getCommunityModel('zev')?.slug).toBe('zev')
  })
})
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/data/__tests__/energiegemeinschaften.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the data file with types and the ZEV model**

`src/data/energiegemeinschaften.ts`:

```ts
import type { FlowSpec } from '@/lib/ratgeber/flow-layout'

export type CommunityModelSlug = 'zev' | 'vzev' | 'leg'

export const COMMUNITY_MODEL_SLUGS: readonly CommunityModelSlug[] = ['zev', 'vzev', 'leg']

export const RATGEBER_CHECKED = '2026-09-22'

export interface LegalRef {
  law: string
  article: string
  url: string
  checked: string
}

export interface TitledText {
  title: string
  text: string
}

export interface CommunityActor {
  name: string
  bullets: string[]
  isFsa?: boolean
}

export interface WorkedExample {
  title: string
  assumptions: string[]
  rows: { label: string; value: string }[]
  source: string
  sourceDate: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface CommunityModel {
  slug: CommunityModelSlug
  name: string
  longName: string
  since: string
  seo: { title: string; description: string }
  hero: { title: string; lead: string; image: string; imageAlt: string }
  audience: { label: string; text: string }[]
  steps: TitledText[]
  flow: FlowSpec
  flowTitle: string
  legal: { summary: string; refs: LegalRef[] }
  requirements: TitledText[]
  actors: CommunityActor[]
  example: WorkedExample
  rightsTitle: string
  rights: TitledText[]
  scenarios: TitledText[]
  praxismodell?: TitledText[]
  fsaSteps: TitledText[]
  faq: FaqItem[]
}

const FEDLEX = {
  eng: 'https://www.fedlex.admin.ch/eli/cc/2017/762/de',
  env: 'https://www.fedlex.admin.ch/eli/cc/2017/763/de',
  stromvg: 'https://www.fedlex.admin.ch/eli/cc/2007/418/de',
  stromvv: 'https://www.fedlex.admin.ch/eli/cc/2008/224/de',
  leitfaden: 'https://pubdb.bfe.admin.ch/de/publication/download/9329',
  erlaeuterungen: 'https://www.newsd.admin.ch/newsd/message/attachments/91799.pdf',
}

export const FSA_STEPS: TitledText[] = [
  {
    title: 'Objektanalyse',
    text: 'Wir prüfen Dach, Netzanschluss und Verbrauchsprofil und klären mit dem Netzbetreiber, welches Modell an Ihrem Standort möglich ist.',
  },
  {
    title: 'Modellwahl',
    text: 'Wir zeigen mit Zahlen, ob ZEV, vZEV oder LEG für Ihr Objekt die beste Lösung ist.',
  },
  {
    title: 'Koordination mit dem Elektrizitätswerk',
    text: 'Anschlussgesuch, Netztopologie und Anmeldung laufen über uns.',
  },
  {
    title: 'Messkonzept und Zähler',
    text: 'Wir planen die Messung und koordinieren Zähler und, wo nötig, den Umbau der Elektroverteilung.',
  },
  {
    title: 'Verträge und Information',
    text: 'Wir bereiten Vertragszusatz und Vereinbarungen vor und begleiten die Information der Beteiligten.',
  },
  {
    title: 'Abrechnung und Betrieb',
    text: 'Wir koordinieren die laufende Abrechnung, das Monitoring und, wo es sich rechnet, einen Batteriespeicher.',
  },
]

const ZEV: CommunityModel = {
  slug: 'zev',
  name: 'ZEV',
  longName: 'Zusammenschluss zum Eigenverbrauch',
  since: '2018-01-01',
  seo: {
    title: 'ZEV: Zusammenschluss zum Eigenverbrauch erklärt | Free State AG',
    description:
      'Was ein ZEV ist, wer mitmachen darf, wie Mieter abgerechnet werden (80-Prozent-Regel) und wie Free State AG Ihr Mehrfamilienhaus vom Messkonzept bis zur Abrechnung begleitet.',
  },
  hero: {
    title: 'ZEV: Solarstrom im eigenen Gebäude an Mieter und Eigentümer verkaufen',
    lead: 'Der Zusammenschluss zum Eigenverbrauch (ZEV) erlaubt es, den Solarstrom vom Dach direkt an die Wohnungen und Gewerbeflächen im selben Gebäude zu liefern und intern abzurechnen. Der Netzbetreiber sieht den ZEV als einen einzigen Kunden. Das erhöht den Eigenverbrauch der Anlage und macht sie wirtschaftlicher, weil auf dem intern verbrauchten Strom keine Netzkosten anfallen.',
    image: '/ratgeber/zev.webp',
    imageAlt: 'Drei Mehrfamilienhäuser mit Solaranlagen hinter einem gemeinsamen Netzanschluss',
  },
  audience: [
    {
      label: 'Eigentümer von Mehrfamilienhäusern',
      text: 'Sie verkaufen den Solarstrom an die Mieterschaft und amortisieren die Anlage über den internen Stromtarif, ohne den Mietzins anzuheben.',
    },
    {
      label: 'Verwaltungen',
      text: 'Die Abrechnung läuft wie Nebenkosten mit, mit privaten Zählern pro Wohnung und einer Jahresabrechnung pro Partei.',
    },
    {
      label: 'Stockwerkeigentümergemeinschaften',
      text: 'Alle Eigentümer bilden gemeinsam den ZEV. Der Erlös fliesst in den Erneuerungsfonds oder senkt die Nebenkosten.',
    },
    {
      label: 'Wohnbaugenossenschaften',
      text: 'Günstiger Strom vom eigenen Dach für alle Mitglieder passt zum Genossenschaftsgedanken.',
    },
    {
      label: 'Gewerbe- und Mischbauten',
      text: 'Läden, Büros und Wohnungen hinter einem Netzanschluss teilen sich die Produktion. Das Gewerbe verbraucht tagsüber, wenn die Anlage am meisten liefert.',
    },
  ],
  steps: [
    {
      title: 'Netzanschluss prüfen',
      text: 'Alle Teilnehmenden müssen hinter demselben Netzanschlusspunkt liegen. Der Netzbetreiber gibt Auskunft über die Topologie.',
    },
    {
      title: 'Messkonzept festlegen',
      text: 'Die Zähler des Netzbetreibers werden durch private Zähler ersetzt. Ein Hauptzähler misst den Bezug aus dem Netz, private Zähler messen jede Partei.',
    },
    {
      title: 'Teilnahme regeln',
      text: 'Bestehende Mieter stimmen der Teilnahme zu, bei Neuvermietungen wird der ZEV im Mietvertrag festgehalten.',
    },
    {
      title: 'ZEV anmelden',
      text: 'Die Gründung wird dem Netzbetreiber mit dessen Formular gemeldet, meist zusammen mit dem Anschlussgesuch für die Anlage.',
    },
    {
      title: 'Intern abrechnen',
      text: 'Der Solarstrom wird pro Partei nach gemessenem Verbrauch verrechnet, der Netzstrom wird ohne Aufschlag weitergegeben.',
    },
    {
      title: 'Überschuss einspeisen',
      text: 'Was nicht im Gebäude verbraucht wird, geht ins Netz und wird vom Netzbetreiber vergütet.',
    },
  ],
  flowTitle: 'Stromfluss im ZEV: Solarstrom über die private Hausverteilung, Netzstrom über den Hauptzähler',
  flow: {
    nodes: [
      { id: 'pv', label: 'PV-Anlage', x: 28, y: 8, kind: 'pv' },
      { id: 'grid', label: 'Netz', x: 78, y: 8, kind: 'grid' },
      { id: 'meter', label: 'Hauptzähler', x: 78, y: 28, kind: 'meter' },
      { id: 'cabinet', label: 'Hausverteilung', x: 28, y: 28, kind: 'cabinet' },
      { id: 'u1', label: 'Wohnung 1', x: 12, y: 50, kind: 'unit' },
      { id: 'u2', label: 'Wohnung 2', x: 36, y: 50, kind: 'unit' },
      { id: 'u3', label: 'Gewerbe', x: 60, y: 50, kind: 'unit' },
    ],
    edges: [
      { from: 'pv', to: 'cabinet', internal: true },
      { from: 'cabinet', to: 'u1', internal: true },
      { from: 'cabinet', to: 'u2', internal: true },
      { from: 'cabinet', to: 'u3', internal: true },
      { from: 'grid', to: 'meter', internal: false },
      { from: 'meter', to: 'cabinet', internal: false },
    ],
  },
  legal: {
    summary:
      'Der ZEV ist seit 1. Januar 2018 im Energiegesetz verankert. Das Gesetz gibt den Anspruch auf Eigenverbrauch und den Zusammenschluss, die Energieverordnung regelt Voraussetzungen, Messung und die Kostenweitergabe an Mieter und Pächter.',
    refs: [
      { law: 'EnG', article: 'Art. 16 bis 18', url: FEDLEX.eng, checked: RATGEBER_CHECKED },
      { law: 'EnV', article: 'Art. 14 bis 17', url: FEDLEX.env, checked: RATGEBER_CHECKED },
      { law: 'EnergieSchweiz', article: 'Leitfaden Eigenverbrauch', url: FEDLEX.leitfaden, checked: RATGEBER_CHECKED },
    ],
  },
  requirements: [
    {
      title: 'Gleicher Netzanschlusspunkt',
      text: 'Alle Gebäude und Parteien hängen am selben Hausanschluss. Das öffentliche Verteilnetz darf für den internen Strom nicht genutzt werden.',
    },
    {
      title: 'Mindestens 10 Prozent Produktionsleistung',
      text: 'Die Leistung der Anlage muss mindestens 10 Prozent der Anschlussleistung aller teilnehmenden Verbraucher betragen (Art. 15 EnV).',
    },
    {
      title: 'Private Messung',
      text: 'Der ZEV misst intern mit eigenen Zählern. In Bestandesbauten wird dafür die Elektroverteilung angepasst, im Neubau plant der Elektroplaner die Zähler von Anfang an ein.',
    },
    {
      title: 'Ein Stromprodukt für alle',
      text: 'Der ZEV tritt gegenüber dem Netzbetreiber als ein Endverbraucher auf und wählt ein Stromprodukt für den Reststrom.',
    },
  ],
  actors: [
    {
      name: 'Verteilnetzbetreiber',
      bullets: [
        'Gibt Auskunft über die Netztopologie.',
        'Prüft bei der Anmeldung die Voraussetzungen.',
        'Stellt dem ZEV den Netzstrom in Rechnung.',
        'Vergütet den eingespeisten Überschuss.',
      ],
    },
    {
      name: 'Grundeigentümerschaft',
      bullets: [
        'Legt die Konditionen im Rahmen des Gesetzes fest und hält sie im Vertragszusatz fest.',
        'Holt die Zustimmung der Mieterschaft ein.',
        'Meldet Mutationen an den Netzbetreiber.',
        'Erhält den Erlös aus dem intern verkauften Strom.',
      ],
    },
    {
      name: 'ZEV-Teilnehmende',
      bullets: [
        'Stimmen der Teilnahme und der Datenweitergabe zu.',
        'Bezahlen Solarstrom und Netzstrom an den ZEV statt an den Netzbetreiber.',
        'Können bei fehlerhafter Abrechnung die Schlichtungsbehörde anrufen.',
      ],
    },
    {
      name: 'Free State AG',
      isFsa: true,
      bullets: [
        'Analysiert das Objekt und prüft mit dem Netzbetreiber, ob ein ZEV möglich ist.',
        'Erstellt das Messkonzept und koordiniert Zähler und Elektroverteilung.',
        'Begleitet Anmeldung, Vertragszusatz und Mieterinformation.',
        'Koordiniert die laufende Abrechnung und, wo sinnvoll, einen Batteriespeicher.',
      ],
    },
  ],
  example: {
    title: 'Rechenbeispiel für eine Wohnung im ZEV',
    assumptions: [
      'Verbrauch der Wohnung 4\'000 kWh pro Jahr',
      'Davon 2\'400 kWh Solarstrom aus dem ZEV und 1\'600 kWh Netzstrom',
      'Standardstromprodukt des Netzbetreibers 30 Rp./kWh inklusive Netz und Abgaben. Beispielwert, Ihr Tarif steht auf der Strompreiskarte der ElCom.',
    ],
    rows: [
      { label: 'Kosten ohne ZEV (4\'000 kWh x 30 Rp.)', value: 'CHF 1\'200' },
      { label: 'Solarstrom pauschal mit 80 Prozent (2\'400 kWh x 24 Rp.)', value: 'CHF 576' },
      { label: 'Netzstrom, 1:1 weitergegeben (1\'600 kWh x 30 Rp.)', value: 'CHF 480' },
      { label: 'Kosten im ZEV', value: 'CHF 1\'056' },
      { label: 'Ersparnis der Mieterschaft pro Jahr', value: 'CHF 144' },
      { label: 'Erlös der Eigentümerschaft aus dieser Wohnung pro Jahr', value: 'CHF 576' },
    ],
    source:
      'Pauschalmethode nach Art. 16 Abs. 1 Bst. b EnV, Leitfaden Eigenverbrauch von EnergieSchweiz. Der Tarif ist ein Beispielwert, aktuelle Tarife unter strompreis.elcom.admin.ch.',
    sourceDate: RATGEBER_CHECKED,
  },
  rightsTitle: 'Rechte der Mieterinnen und Mieter',
  rights: [
    {
      title: 'Teilnahme ist freiwillig',
      text: 'Bestehende Mieterinnen und Mieter können die Teilnahme ablehnen und weiter Strom vom Netzbetreiber beziehen. Die Kosten dafür dürfen ihnen nicht belastet werden.',
    },
    {
      title: 'Preisobergrenze',
      text: 'Pauschal dürfen höchstens 80 Prozent der Kosten des externen Standardstromprodukts verrechnet werden, inklusive aller Nebenkosten und der Kosten eines Dienstleisters. Bei effektiver Abrechnung gilt die Obergrenze von 100 Prozent, wobei höchstens die Hälfte der Einsparung zusätzlich verrechnet werden darf.',
    },
    {
      title: 'Kein Mietzinsaufschlag',
      text: 'Die Solaranlage wird über den internen Stromtarif amortisiert. Ein Aufschlag auf den Nettomietzins ist nicht zulässig.',
    },
    {
      title: 'Austritt und Schlichtung',
      text: 'Wird nicht oder falsch abgerechnet, kann die Mieterschaft mit drei Monaten Frist auf ein Monatsende austreten und die Schlichtungsbehörde in Mietsachen anrufen.',
    },
  ],
  scenarios: [
    {
      title: 'Mehrfamilienhaus mit acht Wohnungen',
      text: 'Die Eigentümerschaft baut eine Anlage auf das Dach und bildet mit allen Mietparteien einen ZEV. Die Verwaltung rechnet den Solarstrom über die Nebenkosten ab, den Reststrom liefert der Netzbetreiber an den ZEV.',
    },
    {
      title: 'Areal mit Tiefgarage',
      text: 'Drei Gebäude teilen sich einen Netzanschluss und eine Tiefgarage. Alle Dächer produzieren, die Ladestationen in der Garage laden tagsüber mit Solarstrom, ein Abrechnungsdienstleister verrechnet Strom, Wasser und Heizung in einer Rechnung.',
    },
    {
      title: 'Stockwerkeigentum',
      text: 'Die Eigentümer einigen sich auf einen tiefen Solartarif. Die Verwaltung rechnet über die privaten Zähler ab, der Erlös geht in den Erneuerungsfonds.',
    },
  ],
  fsaSteps: FSA_STEPS,
  faq: [
    {
      q: 'Was ist ein ZEV?',
      a: 'Ein Zusammenschluss zum Eigenverbrauch ist eine Gruppe von Verbrauchern hinter demselben Netzanschluss, die den lokal produzierten Solarstrom gemeinsam nutzt und intern abrechnet. Gegenüber dem Netzbetreiber tritt der ZEV als ein einziger Kunde auf.',
    },
    {
      q: 'Seit wann gibt es den ZEV?',
      a: 'Seit 1. Januar 2018 mit dem revidierten Energiegesetz. Seit 1. Januar 2025 gibt es zusätzlich den virtuellen ZEV, seit 1. Januar 2026 die lokale Elektrizitätsgemeinschaft.',
    },
    {
      q: 'Können Mieter zur Teilnahme verpflichtet werden?',
      a: 'Bestehende Mieter nicht, sie haben ein Wahlrecht. Bei Neuvermietungen kann die Teilnahme im Mietvertrag vorgesehen werden.',
    },
    {
      q: 'Wie wird der Solarstrom im ZEV verrechnet?',
      a: 'Entweder pauschal mit höchstens 80 Prozent des externen Standardstromprodukts oder nach effektiven Kosten mit einer Obergrenze von 100 Prozent. Der Netzstrom wird in beiden Fällen ohne Aufschlag weitergegeben.',
    },
    {
      q: 'Braucht es neue Zähler?',
      a: 'Ja. Der ZEV misst intern mit privaten Zählern. Im Bestandesbau wird die Elektroverteilung angepasst und die Zähler des Netzbetreibers werden ausgebaut.',
    },
    {
      q: 'Wer rechnet ab?',
      a: 'Verantwortlich ist die Grundeigentümerschaft. In der Praxis übernimmt die Verwaltung oder ein Dienstleister Messung, Abrechnung und Inkasso. Free State AG koordiniert diesen Ablauf.',
    },
    {
      q: 'Was passiert mit dem Überschuss?',
      a: 'Strom, der nicht im Gebäude verbraucht wird, geht ins Netz. Der Netzbetreiber vergütet ihn nach seinem Rückliefertarif. Ein Batteriespeicher kann den Abendverbrauch mit Solarstrom decken und den Eigenverbrauch weiter erhöhen.',
    },
    {
      q: 'Wann lohnt sich ein ZEV nicht?',
      a: 'Wenn die Anlage im Verhältnis zur Anschlussleistung klein ist, wenn viele Parteien nicht mitmachen wollen und elektrisch separiert werden müssten, oder wenn die Nachbargebäude besser über einen vZEV oder eine LEG einbezogen werden.',
    },
  ],
}

export const COMMUNITY_MODELS: CommunityModel[] = [ZEV]

export function getCommunityModel(slug: string): CommunityModel | null {
  return COMMUNITY_MODELS.find(m => m.slug === slug) ?? null
}
```

- [ ] **Step 4: Run the test, expect pass**

Run: `npx vitest run src/data/__tests__/energiegemeinschaften.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Verify the source URLs resolve**

Run:

```bash
for u in https://www.fedlex.admin.ch/eli/cc/2017/762/de https://www.fedlex.admin.ch/eli/cc/2017/763/de https://www.fedlex.admin.ch/eli/cc/2007/418/de https://www.fedlex.admin.ch/eli/cc/2008/224/de https://pubdb.bfe.admin.ch/de/publication/download/9329 https://www.newsd.admin.ch/newsd/message/attachments/91799.pdf; do printf '%s ' "$u"; curl -sL -o /dev/null -w '%{http_code}\n' "$u"; done
```

Expected: every line ends in `200`. If a Fedlex URL answers 404, open `https://www.fedlex.admin.ch/de/search?text=<SR number>` (EnG SR 730.0, EnV SR 730.01, StromVG SR 734.7, StromVV SR 734.71) and replace the URL in `FEDLEX` with the ELI URL shown there.

- [ ] **Step 6: Stage**

```bash
git add src/data/energiegemeinschaften.ts src/data/__tests__/energiegemeinschaften.test.ts
```

---

### Task 6: vZEV model content with the Praxismodell section

**Files:**
- Modify: `src/data/energiegemeinschaften.ts` (add `VZEV` before `COMMUNITY_MODELS`, extend the array)

**Interfaces:**
- Consumes `CommunityModel`, `FSA_STEPS`, `FEDLEX`, `RATGEBER_CHECKED` from Task 5.
- Produces `COMMUNITY_MODELS = [ZEV, VZEV]`.

- [ ] **Step 1: Add the vZEV model**

Insert before `export const COMMUNITY_MODELS`:

```ts
const VZEV: CommunityModel = {
  slug: 'vzev',
  name: 'vZEV',
  longName: 'Virtueller Zusammenschluss zum Eigenverbrauch',
  since: '2025-01-01',
  seo: {
    title: 'vZEV: Virtueller Zusammenschluss zum Eigenverbrauch | Free State AG',
    description:
      'Seit 2025 dürfen Nachbargebäude Solarstrom über die Anschlussleitung teilen, gemessen vom Netzbetreiber. Voraussetzungen, Abrechnung, Unterschied zum Praxismodell und zur LEG.',
  },
  hero: {
    title: 'vZEV: Solarstrom mit den Nachbargebäuden teilen, ohne eigene Zähler',
    lead: 'Der virtuelle Zusammenschluss zum Eigenverbrauch (vZEV) erweitert den Zusammenschluss zum Eigenverbrauch auf benachbarte Gebäude an derselben Verteilkabine oder Trafostation. Gemessen wird mit den Smart Metern des Netzbetreibers, die Elektroverteilung bleibt unangetastet. Auf dem intern verbrauchten Solarstrom fallen keine Netzkosten an.',
    image: '/ratgeber/vzev.webp',
    imageAlt: 'Drei Einfamilienhäuser auf benachbarten Parzellen, verbunden über eine gemeinsame Verteilkabine',
  },
  audience: [
    {
      label: 'Eigentümer mehrerer Gebäude',
      text: 'Eine grosse Anlage auf einem Dach versorgt auch die Nachbarliegenschaft, ohne dass Leitungen über die Parzellengrenze gezogen werden.',
    },
    {
      label: 'Verwaltungen und Siedlungen',
      text: 'Mehrere Mehrfamilienhäuser an derselben Verteilkabine bilden einen vZEV. Der Netzbetreiber liefert die Messdaten, die Verwaltung rechnet ab.',
    },
    {
      label: 'Nachbarn mit Einfamilienhäusern',
      text: 'Wer einen Überschuss hat, verkauft ihn an das Nachbarhaus statt zum Rückliefertarif ins Netz.',
    },
    {
      label: 'Gewerbe mit Nachbarbetrieben',
      text: 'Ein Betrieb mit grossem Dach beliefert den Nachbarbetrieb, der tagsüber Strom braucht.',
    },
    {
      label: 'Bestandesbauten',
      text: 'Weil die Zähler des Netzbetreibers bleiben, entfällt der Umbau der Elektroverteilung, der beim klassischen ZEV oft der grösste Kostenpunkt ist.',
    },
  ],
  steps: [
    {
      title: 'Netztopologie abfragen',
      text: 'Der Netzbetreiber gibt innert 15 Tagen Auskunft, ob die Gebäude an derselben Verteilkabine, Sammelschiene oder am selben Punkt des Stammkabels hängen.',
    },
    {
      title: 'Teilnehmende festlegen',
      text: 'Wer mitmacht, wird mit Zählernummer erfasst. Bestehende Mieter stimmen zu, neue Mieter werden über den Mietvertrag eingebunden.',
    },
    {
      title: 'vZEV anmelden',
      text: 'Die Anmeldung geht an den Netzbetreiber. Er prüft die Voraussetzungen und schaltet die Messung um.',
    },
    {
      title: 'Messdaten beziehen',
      text: 'Die Smart Meter des Netzbetreibers messen jede Partei im Viertelstundentakt. Die Daten gehen elektronisch an den Betreiber des vZEV.',
    },
    {
      title: 'Abrechnen',
      text: 'Der Betreiber verrechnet den Solarstrom nach den ZEV-Regeln, der Netzstrom kommt als Sammelrechnung vom Netzbetreiber und wird 1:1 weitergegeben.',
    },
  ],
  flowTitle: 'Stromfluss im vZEV: Solarstrom über die Anschlussleitungen zur Verteilkabine, Messung durch den Netzbetreiber',
  flow: {
    nodes: [
      { id: 'pv', label: 'PV Haus A', x: 20, y: 8, kind: 'pv' },
      { id: 'grid', label: 'Netz', x: 80, y: 8, kind: 'grid' },
      { id: 'vk', label: 'Verteilkabine', x: 50, y: 28, kind: 'cabinet' },
      { id: 'ma', label: 'Smart Meter A', x: 20, y: 28, kind: 'meter' },
      { id: 'mb', label: 'Smart Meter B', x: 50, y: 48, kind: 'meter' },
      { id: 'mc', label: 'Smart Meter C', x: 80, y: 28, kind: 'meter' },
      { id: 'a', label: 'Haus A', x: 20, y: 50, kind: 'unit' },
      { id: 'b', label: 'Haus B', x: 50, y: 56, kind: 'unit' },
      { id: 'c', label: 'Haus C', x: 80, y: 50, kind: 'unit' },
    ],
    edges: [
      { from: 'pv', to: 'ma', internal: true },
      { from: 'ma', to: 'vk', internal: true },
      { from: 'vk', to: 'mb', internal: true },
      { from: 'vk', to: 'mc', internal: true },
      { from: 'ma', to: 'a', internal: true },
      { from: 'mb', to: 'b', internal: true },
      { from: 'mc', to: 'c', internal: true },
      { from: 'grid', to: 'vk', internal: false },
    ],
  },
  legal: {
    summary:
      'Der vZEV ist seit 1. Januar 2025 möglich, eingeführt mit dem ersten Umsetzungspaket des Stromgesetzes. Er stützt sich auf dieselben Artikel im Energiegesetz und in der Energieverordnung wie der ZEV. Neu dürfen die Anschlussleitungen zwischen Gebäude und Verteilkabine für den Eigenverbrauch genutzt werden.',
    refs: [
      { law: 'EnG', article: 'Art. 17 und 18', url: FEDLEX.eng, checked: RATGEBER_CHECKED },
      { law: 'EnV', article: 'Art. 14 bis 17', url: FEDLEX.env, checked: RATGEBER_CHECKED },
      { law: 'EnergieSchweiz', article: 'Leitfaden Eigenverbrauch', url: FEDLEX.leitfaden, checked: RATGEBER_CHECKED },
    ],
  },
  requirements: [
    {
      title: 'Gemeinsame Verteilkabine oder Trafostation',
      text: 'Alle Gebäude hängen an derselben Verteilkabine, an derselben Sammelschiene einer Trafostation oder am selben Punkt des Stammkabels in einem Muffennetz.',
    },
    {
      title: 'Mindestens 10 Prozent Produktionsleistung',
      text: 'Wie beim ZEV muss die Anlagenleistung mindestens 10 Prozent der Anschlussleistung der Teilnehmenden betragen. Für Mehrfamilienhäuser gibt es Pauschalwerte im Handbuch Eigenverbrauchsregelung des VSE.',
    },
    {
      title: 'Smart Meter des Netzbetreibers',
      text: 'Gemessen wird mit den intelligenten Messsystemen des Netzbetreibers. Fehlen sie, baut er sie ein.',
    },
    {
      title: 'Ein Betreiber gegenüber dem Netzbetreiber',
      text: 'Der vZEV bestimmt, wer ihn vertritt. Meist ist das die Grundeigentümerschaft, die Aufgaben können an eine Verwaltung oder einen Dienstleister gehen.',
    },
  ],
  actors: [
    {
      name: 'Verteilnetzbetreiber',
      bullets: [
        'Gibt innert 15 Tagen Auskunft über die Netztopologie.',
        'Installiert fehlende Smart Meter und misst die internen Stromflüsse.',
        'Stellt die Sammelrechnung für den Netzstrom.',
        'Vergütet den eingespeisten Überschuss.',
      ],
    },
    {
      name: 'Betreiber des vZEV',
      bullets: [
        'Vertritt den vZEV gegenüber Netzbetreiber und Teilnehmenden.',
        'Wird zum Stromlieferanten der Teilnehmenden für Solar- und Netzstrom.',
        'Legt die Konditionen im Rahmen der ZEV-Regeln fest.',
        'Meldet Mutationen an den Netzbetreiber.',
      ],
    },
    {
      name: 'Teilnehmende',
      bullets: [
        'Stimmen der Teilnahme und der Datenweitergabe zu.',
        'Beziehen Solar- und Netzstrom vom Betreiber des vZEV.',
        'Haben dieselben Rechte wie im klassischen ZEV.',
      ],
    },
    {
      name: 'Free State AG',
      isFsa: true,
      bullets: [
        'Fragt die Netztopologie beim Netzbetreiber ab und prüft, welche Gebäude zusammen einen vZEV bilden können.',
        'Dimensioniert die Anlage auf den Verbrauch aller Teilnehmenden.',
        'Begleitet Anmeldung, Vereinbarungen und Datenbezug.',
        'Koordiniert Abrechnung, Monitoring und einen Batteriespeicher, wo er die Bilanz verbessert.',
      ],
    },
  ],
  example: {
    title: 'Rechenbeispiel für zwei Nachbarhäuser im vZEV',
    assumptions: [
      'Haus A hat eine Anlage und speist im Jahr 3\'000 kWh Überschuss aus, Haus B verbraucht diese Menge tagsüber',
      'Standardstromprodukt des Netzbetreibers 30 Rp./kWh inklusive Netz und Abgaben. Beispielwert, Ihr Tarif steht auf der Strompreiskarte der ElCom.',
      'Interner Tarif pauschal 80 Prozent, also 24 Rp./kWh',
    ],
    rows: [
      { label: 'Haus B ohne vZEV (3\'000 kWh x 30 Rp.)', value: 'CHF 900' },
      { label: 'Haus B im vZEV (3\'000 kWh x 24 Rp.)', value: 'CHF 720' },
      { label: 'Ersparnis Haus B pro Jahr', value: 'CHF 180' },
      { label: 'Erlös Haus A aus dem vZEV pro Jahr', value: 'CHF 720' },
      { label: 'Umbau der Elektroverteilung', value: 'Keiner, die Zähler des Netzbetreibers bleiben' },
    ],
    source:
      'Pauschalmethode nach Art. 16 Abs. 1 Bst. b EnV. Der Erlös von Haus A ersetzt die Rückliefervergütung des Netzbetreibers für dieselbe Menge. Aktuelle Tarife unter strompreis.elcom.admin.ch.',
    sourceDate: RATGEBER_CHECKED,
  },
  rightsTitle: 'Rechte der Mieterinnen und Mieter',
  rights: [
    {
      title: 'Wahlrecht bei Bestandesmiete',
      text: 'Bestehende Mieter können die Teilnahme ablehnen. Sie bleiben dann Kunden des Netzbetreibers in der Grundversorgung.',
    },
    {
      title: 'Gleiche Preisobergrenzen wie im ZEV',
      text: 'Pauschal höchstens 80 Prozent des externen Standardstromprodukts, bei effektiver Abrechnung höchstens 100 Prozent.',
    },
    {
      title: 'Datenweitergabe nur mit Zustimmung',
      text: 'Der Netzbetreiber gibt die Messdaten einer Partei nur an den Betreiber des vZEV weiter, wenn die Partei der Teilnahme zugestimmt hat.',
    },
    {
      title: 'Echtzeitdaten am Zähler',
      text: 'Die Kundenschnittstelle am Smart Meter muss der Netzbetreiber auf Anfrage innert 10 Arbeitstagen freischalten. Damit lässt sich der Eigenverbrauch steuern.',
    },
  ],
  scenarios: [
    {
      title: 'Zwei Mehrfamilienhäuser an einer Verteilkabine',
      text: 'Nur eines der beiden Dächer eignet sich für eine Anlage. Der vZEV versorgt beide Häuser, gemessen vom Netzbetreiber, abgerechnet von der Verwaltung.',
    },
    {
      title: 'Mehrere ZEV zu einem vZEV',
      text: 'Drei Gebäude mit je einem ZEV hängen an derselben Trafostation. Sie schliessen sich zu einem vZEV zusammen und gleichen Überschüsse untereinander aus.',
    },
    {
      title: 'Gewerbe und Wohnhaus',
      text: 'Die Halle produziert am Tag mehr als sie braucht, das Wohnhaus nebenan verbraucht abends. Mit einem Batteriespeicher im vZEV bleibt der Solarstrom in der Nachbarschaft.',
    },
  ],
  praxismodell: [
    {
      title: 'Was das Praxismodell VNB ist',
      text: 'Einige Netzbetreiber bieten für Mehrfamilienhäuser ein eigenes Modell an. Die Mieter bleiben Kunden des Netzbetreibers, er misst mit seinen Zählern und stellt Solarstrom und Netzstrom auf einer Rechnung dar. Das Praxismodell ist kein Zusammenschluss zum Eigenverbrauch nach Art. 17 EnG.',
    },
    {
      title: 'Was gleich bleibt',
      text: 'Die Mieter müssen zustimmen. Das Netznutzungsentgelt darf nur auf dem Strom aus dem Netz erhoben werden, und der Solaranteil muss auf der Rechnung transparent ausgewiesen sein.',
    },
    {
      title: 'Was anders ist',
      text: 'Es gibt keine Anmeldung als ZEV und keine private Messung. Die Konditionen legt der Netzbetreiber fest, nicht die Eigentümerschaft. Ob und zu welchen Bedingungen das Modell angeboten wird, entscheidet jeder Netzbetreiber selbst.',
    },
    {
      title: 'Wann es die einfachere Wahl ist',
      text: 'Bei einem einzelnen Mehrfamilienhaus, dessen Netzbetreiber das Modell anbietet und dessen Eigentümerschaft keinen eigenen Abrechnungsprozess will. Sobald Nachbargebäude dazukommen, führt der Weg über den vZEV oder die LEG.',
    },
  ],
  fsaSteps: FSA_STEPS,
  faq: [
    {
      q: 'Was ist ein vZEV?',
      a: 'Ein virtueller Zusammenschluss zum Eigenverbrauch. Mehrere Gebäude an derselben Verteilkabine oder Trafostation teilen sich den Solarstrom. Der Netzbetreiber misst mit seinen Smart Metern, der Betreiber des vZEV rechnet ab.',
    },
    {
      q: 'Seit wann ist der vZEV möglich?',
      a: 'Seit 1. Januar 2025. Netzbetreiber sind verpflichtet, einen vZEV zuzulassen, wenn die Voraussetzungen erfüllt sind.',
    },
    {
      q: 'Was ist der Unterschied zum klassischen ZEV?',
      a: 'Beim ZEV liegen alle Teilnehmenden hinter einem Netzanschluss und messen mit privaten Zählern. Beim vZEV dürfen es mehrere Gebäude an derselben Verteilkabine sein, gemessen wird mit den Zählern des Netzbetreibers.',
    },
    {
      q: 'Was ist der Unterschied zur LEG?',
      a: 'Der vZEV nutzt die Anschlussleitungen bis zur Verteilkabine, darauf fallen keine Netzkosten an. Die lokale Elektrizitätsgemeinschaft nutzt das öffentliche Verteilnetz bis auf Gemeindeebene und zahlt dafür ein reduziertes Netznutzungsentgelt.',
    },
    {
      q: 'Fallen Netzkosten auf dem geteilten Solarstrom an?',
      a: 'Nein. Der intern verbrauchte Solarstrom im vZEV gilt als Eigenverbrauch. Netzkosten fallen nur auf dem Strom an, der aus dem Netz bezogen wird.',
    },
    {
      q: 'Wie schnell antwortet der Netzbetreiber?',
      a: 'Auskünfte zur Netztopologie muss er innert 15 Tagen geben. Die Kundenschnittstelle am Smart Meter schaltet er innert 10 Arbeitstagen frei.',
    },
    {
      q: 'Kann ein vZEV Teil einer LEG werden?',
      a: 'Ja. Ein ZEV oder vZEV kann als ein Teilnehmer in eine lokale Elektrizitätsgemeinschaft eingebracht werden. Für die LEG zählt dann nur der Hauptzähler des Zusammenschlusses.',
    },
    {
      q: 'Wer eignet sich als Betreiber?',
      a: 'Meist die Grundeigentümerschaft. Sie kann Messung, Abrechnung und Inkasso an eine Verwaltung oder einen Dienstleister geben. Free State AG koordiniert diesen Ablauf von der Anmeldung bis zur Abrechnung.',
    },
  ],
}
```

Change the array to:

```ts
export const COMMUNITY_MODELS: CommunityModel[] = [ZEV, VZEV]
```

- [ ] **Step 2: Run the content test**

Run: `npx vitest run src/data/__tests__/energiegemeinschaften.test.ts`
Expected: PASS, 4 tests, now over two models.

- [ ] **Step 3: Stage**

```bash
git add src/data/energiegemeinschaften.ts
```

---

### Task 7: LEG model content and the hub content

**Files:**
- Modify: `src/data/energiegemeinschaften.ts` (add `LEG`, hub exports, extend the array)
- Modify: `src/data/__tests__/energiegemeinschaften.test.ts` (add the three-model and hub assertions)

**Interfaces:**
- Consumes types from Task 5, `SceneZoneId` from Task 3.
- Produces:

```ts
export const COMMUNITY_MODELS: CommunityModel[]   // [ZEV, VZEV, LEG]
export interface DecisionStep { question: string; answers: { label: string; zone: SceneZoneId; text: string }[] }
export interface ComparisonRow { label: string; zev: string; vzev: string; praxismodell: string; leg: string }
export interface HubContent {
  seo: { title: string; description: string }
  hero: { title: string; lead: string }
  sceneTitle: string
  decisionTitle: string
  decision: DecisionStep[]
  comparisonTitle: string
  comparison: ComparisonRow[]
  fsaTitle: string
  fsaSteps: TitledText[]
  projectNotesTitle: string
  projectNotes: TitledText[]
  faq: FaqItem[]
}
export const HUB: HubContent
export interface SceneZoneCopy { id: SceneZoneId; label: string; summary: string; ctaLabel: string }
export const SCENE_ZONE_COPY: SceneZoneCopy[]
export const RATGEBER_INDEX: { seo: { title: string; description: string }; title: string; lead: string; cards: { title: string; description: string; href: 'hub' | CommunityModelSlug }[] }
```

- [ ] **Step 1: Extend the test**

Add to `src/data/__tests__/energiegemeinschaften.test.ts` (import `HUB`, `SCENE_ZONE_COPY` too):

```ts
  test('ships the three models in order', () => {
    expect(COMMUNITY_MODELS.map(m => m.slug)).toEqual(['zev', 'vzev', 'leg'])
  })

  test('hub has a decision helper, a comparison with all four columns and no em dash', () => {
    expect(HUB.decision.length).toBeGreaterThanOrEqual(3)
    expect(HUB.comparison.length).toBeGreaterThanOrEqual(6)
    for (const row of HUB.comparison) {
      for (const cell of [row.zev, row.vzev, row.praxismodell, row.leg]) expect(cell.length).toBeGreaterThan(0)
    }
    for (const s of strings([HUB, SCENE_ZONE_COPY])) expect(s.includes(String.fromCharCode(8212))).toBe(false)
    expect(SCENE_ZONE_COPY.map(z => z.id)).toEqual(['zev', 'vzev', 'leg', 'praxismodell'])
  })
```

Run: `npx vitest run src/data/__tests__/energiegemeinschaften.test.ts`
Expected: FAIL on the two new tests (`HUB` undefined, only two models).

- [ ] **Step 2: Add the LEG model**

Insert before `export const COMMUNITY_MODELS`:

```ts
const LEG: CommunityModel = {
  slug: 'leg',
  name: 'LEG',
  longName: 'Lokale Elektrizitätsgemeinschaft',
  since: '2026-01-01',
  seo: {
    title: 'LEG: Lokale Elektrizitätsgemeinschaft ab 2026 erklärt | Free State AG',
    description:
      'Seit 2026 dürfen Betriebe und Liegenschaften Solarstrom über das öffentliche Netz im Quartier teilen, mit 40 Prozent Rabatt auf dem Netznutzungstarif. Voraussetzungen, Abrechnung, Beispiele.',
  },
  hero: {
    title: 'LEG: Solarstrom über das öffentliche Netz im Quartier verkaufen',
    lead: 'Die lokale Elektrizitätsgemeinschaft (LEG) ist seit 1. Januar 2026 möglich. Produzenten, Verbraucher und Speicher in derselben Gemeinde und beim selben Netzbetreiber handeln Solarstrom untereinander über das Verteilnetz. Für den intern gehandelten Strom sinkt der Netznutzungstarif um 40 Prozent. Wer bereits einen Zusammenschluss zum Eigenverbrauch betreibt, kann ihn als Ganzes einbringen.',
    image: '/ratgeber/leg.webp',
    imageAlt: 'Industriehalle und Bürogebäude mit Solaranlagen, verbunden über das Quartiernetz mit den Nachbargebäuden',
  },
  audience: [
    {
      label: 'Industrie und Gewerbe mit grossen Dächern',
      text: 'Die Halle produziert mehr, als der Betrieb braucht. Statt zum Rückliefertarif einzuspeisen, verkauft er den Strom an Nachbarbetriebe und Wohnhäuser im Quartier.',
    },
    {
      label: 'Benachbarte Betriebe',
      text: 'Zwei Firmen an derselben Strasse teilen sich Produktion, Speicher und Lastspitzen, ohne eigene Leitung zwischen den Grundstücken.',
    },
    {
      label: 'Eigentümer ohne geeignetes Dach',
      text: 'Wer keine eigene Anlage bauen kann, bezieht Solarstrom aus dem Quartier zu einem vereinbarten Preis.',
    },
    {
      label: 'Gemeinden und Genossenschaften',
      text: 'Schulhaus, Werkhof und Wohnsiedlung bilden eine Gemeinschaft, die den lokal produzierten Strom lokal verbraucht.',
    },
    {
      label: 'Betreiber von ZEV und vZEV',
      text: 'Ein bestehender Zusammenschluss kann als ein Teilnehmer in die LEG eintreten und seinen Überschuss im Quartier absetzen.',
    },
  ],
  steps: [
    {
      title: 'Teilnehmende und Netzgebiet klären',
      text: 'Alle Beteiligten liegen in derselben Gemeinde, beim selben Netzbetreiber und auf derselben Netzebene. Der Netzbetreiber gibt innert 15 Arbeitstagen Auskunft über die Netzsituation.',
    },
    {
      title: 'Gemeinschaft vereinbaren',
      text: 'Die Teilnehmenden halten schriftlich fest, wer die Gemeinschaft vertritt, wie der interne Strompreis zustande kommt und wer welche Kosten trägt.',
    },
    {
      title: 'LEG anmelden',
      text: 'Die Bildung wird dem Netzbetreiber drei Monate im Voraus auf ein Monatsende gemeldet. Er rüstet alle Messpunkte mit Smart Metern aus.',
    },
    {
      title: 'Interne Stromflüsse zuordnen',
      text: 'Der Netzbetreiber ermittelt viertelstündlich, wie viel Strom innerhalb der Gemeinschaft erzeugt und zeitgleich verbraucht wurde, und ordnet ihn den Teilnehmenden proportional zu.',
    },
    {
      title: 'Abrechnen',
      text: 'Der Netzbetreiber stellt Netznutzung, Messung und Reststrom in Rechnung, mit dem reduzierten Tarif auf dem internen Anteil. Die Gemeinschaft rechnet den Solarstrom selbst ab.',
    },
  ],
  flowTitle: 'Stromfluss in der LEG: Solarstrom über das öffentliche Verteilnetz, zugeordnet vom Netzbetreiber',
  flow: {
    nodes: [
      { id: 'pv', label: 'PV Halle', x: 15, y: 8, kind: 'pv' },
      { id: 'bat', label: 'Speicher', x: 40, y: 8, kind: 'battery' },
      { id: 'vnb', label: 'Verteilnetz', x: 50, y: 30, kind: 'vnb' },
      { id: 'grid', label: 'Reststrom', x: 85, y: 8, kind: 'grid' },
      { id: 'm1', label: 'Smart Meter', x: 15, y: 30, kind: 'meter' },
      { id: 'a', label: 'Betrieb', x: 15, y: 52, kind: 'unit' },
      { id: 'b', label: 'Nachbarbetrieb', x: 50, y: 52, kind: 'unit' },
      { id: 'c', label: 'Wohnhaus', x: 85, y: 52, kind: 'unit' },
    ],
    edges: [
      { from: 'pv', to: 'm1', internal: true },
      { from: 'm1', to: 'vnb', internal: true },
      { from: 'bat', to: 'vnb', internal: true },
      { from: 'vnb', to: 'b', internal: true },
      { from: 'vnb', to: 'c', internal: true },
      { from: 'm1', to: 'a', internal: true },
      { from: 'grid', to: 'vnb', internal: false },
    ],
  },
  legal: {
    summary:
      'Die LEG steht seit 1. Januar 2026 im Stromversorgungsgesetz. Die Stromversorgungsverordnung regelt Mindestgrösse, räumliche Grenze, das Verhältnis zum Netzbetreiber und die Reduktion des Netznutzungstarifs.',
    refs: [
      { law: 'StromVG', article: 'Art. 17d und 17e', url: FEDLEX.stromvg, checked: RATGEBER_CHECKED },
      { law: 'StromVV', article: 'Art. 19e bis 19h', url: FEDLEX.stromvv, checked: RATGEBER_CHECKED },
      { law: 'Bundesrat', article: 'Erläuterungen zur StromVV-Revision', url: FEDLEX.erlaeuterungen, checked: RATGEBER_CHECKED },
    ],
  },
  requirements: [
    {
      title: 'Gleiche Gemeinde, gleicher Netzbetreiber',
      text: 'Die Gemeinschaft darf sich höchstens über das Gebiet einer Gemeinde und eines Netzbetreibers erstrecken.',
    },
    {
      title: 'Gleiche Netzebene',
      text: 'Alle Teilnehmenden sind auf Netzebene 5 oder 7 angeschlossen, also bis 36 kV. Jede Anlage muss jeden Verbraucher erreichen können, ohne eine höhere Netzebene zu nutzen.',
    },
    {
      title: 'Mindestens 5 Prozent Produktionsleistung',
      text: 'Die Leistung aller Anlagen beträgt mindestens 5 Prozent der Anschlussleistung der Teilnehmenden (Art. 19e StromVV). Speicher zählen nicht zur Anschlussleistung.',
    },
    {
      title: 'Smart Meter überall',
      text: 'Jeder Messpunkt braucht ein intelligentes Messsystem des Netzbetreibers. Private Zähler sind in der LEG nicht zulässig.',
    },
  ],
  actors: [
    {
      name: 'Verteilnetzbetreiber',
      bullets: [
        'Gibt innert 15 Arbeitstagen Auskunft über die Netzsituation.',
        'Rüstet alle Teilnehmenden mit Smart Metern aus.',
        'Berechnet die internen und externen Stromflüsse und liefert die Daten an die Gemeinschaft.',
        'Stellt Netznutzung, Messung und Reststrom in Rechnung, mit dem reduzierten Tarif auf dem internen Anteil.',
      ],
    },
    {
      name: 'Vertretung der LEG',
      bullets: [
        'Vertritt die Gemeinschaft gegenüber dem Netzbetreiber.',
        'Meldet Bildung, Mutationen und Auflösung.',
        'Rechnet den intern gehandelten Solarstrom ab, selbst oder über einen Dienstleister.',
      ],
    },
    {
      name: 'Teilnehmende',
      bullets: [
        'Produzenten vereinbaren den Preis für die Einspeisung in die Gemeinschaft.',
        'Verbraucher vereinbaren den Preis für den Bezug und kaufen zuerst aus der LEG, dann Reststrom beim Netzbetreiber.',
        'Jede Verbrauchsstätte, Anlage oder Speicher gehört nur einer LEG an.',
      ],
    },
    {
      name: 'Free State AG',
      isFsa: true,
      bullets: [
        'Klärt mit dem Elektrizitätswerk, welche Gebäude im Quartier eine LEG bilden können.',
        'Dimensioniert Anlage und Speicher auf den Verbrauch der Gemeinschaft.',
        'Bereitet die schriftliche Vereinbarung vor und begleitet die Anmeldung.',
        'Koordiniert Abrechnung und Betrieb und übernimmt die Projektleitung von der Analyse bis zum laufenden System.',
      ],
    },
  ],
  example: {
    title: 'Rechenbeispiel für einen Betrieb, der Solarstrom aus der LEG bezieht',
    assumptions: [
      'Bezug aus der Gemeinschaft 20\'000 kWh pro Jahr',
      'Netznutzungstarif des Netzbetreibers 10 Rp./kWh. Beispielwert, der Netzanteil steht auf der Strompreiskarte der ElCom.',
      'Interner Solarstrompreis 15 Rp./kWh, frei vereinbart in der Gemeinschaft. Energieanteil des Standardprodukts 12 Rp./kWh als Vergleich, Beispielwert.',
      'Alle Teilnehmenden am selben Leitungsstrang, Abschlag 40 Prozent',
    ],
    rows: [
      { label: 'Netznutzung ohne LEG (20\'000 kWh x 10 Rp.)', value: 'CHF 2\'000' },
      { label: 'Netznutzung in der LEG mit 40 Prozent Abschlag (20\'000 kWh x 6 Rp.)', value: 'CHF 1\'200' },
      { label: 'Ersparnis auf der Netznutzung pro Jahr', value: 'CHF 800' },
      { label: 'Solarstrom aus der LEG (20\'000 kWh x 15 Rp.)', value: 'CHF 3\'000' },
      { label: 'Abgaben, Netzzuschlag und Messung', value: 'Unverändert, der Abschlag gilt nur für den Netznutzungstarif' },
      { label: 'Erlös des Produzenten aus der LEG pro Jahr', value: 'CHF 3\'000' },
    ],
    source:
      'Abschlag nach Art. 19h StromVV, 40 Prozent am selben Leitungsstrang, 20 Prozent mit Transformation. Der interne Preis ist frei vereinbar. Tarife sind Beispielwerte, aktuelle Werte unter strompreis.elcom.admin.ch.',
    sourceDate: RATGEBER_CHECKED,
  },
  rightsTitle: 'Rechte der Teilnehmenden',
  rights: [
    {
      title: 'Freier interner Preis',
      text: 'Die Gemeinschaft legt den Preis für den intern gehandelten Strom selbst fest. Die Vereinbarung untersteht dem Privatrecht, Streitigkeiten entscheiden die Zivilgerichte.',
    },
    {
      title: 'Grundversorgung bleibt',
      text: 'Wer nicht marktberechtigt ist, bezieht den Reststrom weiter vom Netzbetreiber in der Grundversorgung. Die LEG darf nicht zur Umgehung der Grundversorgung dienen.',
    },
    {
      title: 'Kundenbeziehung zum Netzbetreiber',
      text: 'Anders als im ZEV bleibt jeder Teilnehmende Kunde des Netzbetreibers für Netz, Messung und Reststrom.',
    },
    {
      title: 'Austritt mit Frist',
      text: 'Bildung und Auflösung werden dem Netzbetreiber drei Monate im Voraus auf ein Monatsende gemeldet. Fällt eine Voraussetzung weg, behandelt der Netzbetreiber alle wieder als Einzelkunden.',
    },
  ],
  scenarios: [
    {
      title: 'Zwei Betriebe an derselben Strasse',
      text: 'Die Halle des einen Betriebs produziert am Tag mehr als er braucht, der Nachbarbetrieb hat kein geeignetes Dach. Beide bilden mit dem Elektrizitätswerk eine LEG. Ein Speicher glättet die Mittagsspitze.',
    },
    {
      title: 'Landwirt mit fünf Einfamilienhäusern',
      text: 'Eine grosse Anlage auf dem Scheunendach versorgt fünf Häuser ohne eigene Anlage. Ein Dienstleister rechnet Solar- und Netzstrom für alle ab.',
    },
    {
      title: 'Mehrere ZEV im Quartier',
      text: 'Drei Mehrfamilienhäuser mit je einem ZEV liegen hinter derselben Trafostation. Als LEG gleichen sie ihre Überschüsse untereinander aus, statt sie einzuspeisen.',
    },
  ],
  fsaSteps: FSA_STEPS,
  faq: [
    {
      q: 'Was ist eine LEG?',
      a: 'Eine lokale Elektrizitätsgemeinschaft. Produzenten, Verbraucher und Speicher in derselben Gemeinde handeln lokal erzeugten Strom über das öffentliche Verteilnetz und zahlen dafür ein reduziertes Netznutzungsentgelt.',
    },
    {
      q: 'Seit wann gibt es die LEG?',
      a: 'Seit 1. Januar 2026. Die Netzbetreiber haben ab der Anmeldung drei Monate Zeit für die Umsetzung.',
    },
    {
      q: 'Wie hoch ist der Rabatt auf dem Netz?',
      a: 'Der Netznutzungstarif sinkt auf dem internen Anteil um 40 Prozent, wenn alle am selben Leitungsstrang hängen, und um 20 Prozent, wenn eine Transformation nötig ist. Das Gesetz erlaubt bis zu 60 Prozent. Abgaben, Netzzuschlag, Stromreserve und Messung bleiben unverändert.',
    },
    {
      q: 'Wer darf mitmachen?',
      a: 'Alle in derselben Gemeinde, beim selben Netzbetreiber und auf derselben Netzebene, bis 36 kV. Auch ein ZEV oder vZEV kann als ein Teilnehmer beitreten, ebenso Anlagen und Speicher von Energieversorgern.',
    },
    {
      q: 'Wie gross muss die Produktion sein?',
      a: 'Mindestens 5 Prozent der Anschlussleistung aller Teilnehmenden. Speicher zählen bei der Anschlussleistung nicht mit.',
    },
    {
      q: 'Wer misst und wer rechnet ab?',
      a: 'Der Netzbetreiber misst mit seinen Smart Metern, ordnet die internen Stromflüsse zu und stellt Netz, Messung und Reststrom in Rechnung. Den Solarstrom rechnet die Gemeinschaft selbst ab, oder sie lässt es einen Dienstleister tun.',
    },
    {
      q: 'Kann ich in mehreren LEG sein?',
      a: 'Eine Verbrauchsstätte, Anlage oder Speicher gehört nur einer LEG an. Wer mehrere Standorte hat, kann jeden in eine andere Gemeinschaft einbringen.',
    },
    {
      q: 'Lohnt sich eine LEG?',
      a: 'Sie lohnt sich, wenn ein Produzent grossen Überschuss hat und Verbraucher in der Nähe tagsüber Strom brauchen. Der Vorteil liegt im internen Preis zwischen Rückliefertarif und Bezugstarif plus dem Rabatt auf der Netznutzung. Ob es aufgeht, zeigt eine Rechnung mit den Lastprofilen der Beteiligten.',
    },
  ],
}
```

Change the array to:

```ts
export const COMMUNITY_MODELS: CommunityModel[] = [ZEV, VZEV, LEG]
```

- [ ] **Step 3: Add the hub content**

Append after `getCommunityModel`:

```ts
import type { SceneZoneId } from '@/lib/ratgeber/scene-zones'

export interface DecisionStep {
  question: string
  answers: { label: string; zone: SceneZoneId; text: string }[]
}

export interface ComparisonRow {
  label: string
  zev: string
  vzev: string
  praxismodell: string
  leg: string
}

export interface HubContent {
  seo: { title: string; description: string }
  hero: { title: string; lead: string }
  sceneTitle: string
  decisionTitle: string
  decision: DecisionStep[]
  comparisonTitle: string
  comparison: ComparisonRow[]
  fsaTitle: string
  fsaSteps: TitledText[]
  projectNotesTitle: string
  projectNotes: TitledText[]
  faq: FaqItem[]
}

export const HUB: HubContent = {
  seo: {
    title: 'ZEV, vZEV und LEG: Solarstrom teilen in der Schweiz | Free State AG',
    description:
      'Welches Modell passt zu Ihrem Gebäude, Ihrer Siedlung oder Ihrem Betrieb? ZEV, virtueller ZEV und lokale Elektrizitätsgemeinschaft im Vergleich, mit interaktiver Übersicht und Projektbegleitung durch Free State AG.',
  },
  hero: {
    title: 'ZEV, vZEV und LEG: Solarstrom im Gebäude, in der Nachbarschaft und im Quartier teilen',
    lead: 'Drei gesetzliche Modelle erlauben es, Solarstrom vom eigenen Dach an andere zu verkaufen. Der Zusammenschluss zum Eigenverbrauch (ZEV) bleibt hinter einem Netzanschluss, der virtuelle ZEV reicht bis zur Verteilkabine, die lokale Elektrizitätsgemeinschaft (LEG) nutzt das öffentliche Netz bis auf Gemeindeebene. Klicken Sie in der Übersicht auf ein Modell.',
  },
  sceneTitle: 'Vier Modelle, ein Quartier',
  decisionTitle: 'Welches Modell passt?',
  decision: [
    {
      question: 'Liegen alle Beteiligten hinter demselben Netzanschluss, zum Beispiel in einem Mehrfamilienhaus oder auf einem Areal mit einem Hausanschluss?',
      answers: [
        {
          label: 'Ja, ein Netzanschluss',
          zone: 'zev',
          text: 'Dann ist der ZEV das passende Modell. Private Zähler, keine Netzkosten auf dem Solarstrom, Abrechnung durch die Eigentümerschaft oder Verwaltung.',
        },
        {
          label: 'Ja, aber ohne eigene Zähler',
          zone: 'praxismodell',
          text: 'Wenn Ihr Netzbetreiber das Praxismodell anbietet, bleiben die Mieter seine Kunden und er rechnet den Solaranteil ab. Kein Umbau, dafür seine Konditionen.',
        },
      ],
    },
    {
      question: 'Sind es mehrere Gebäude auf benachbarten Parzellen, die an derselben Verteilkabine oder Trafostation hängen?',
      answers: [
        {
          label: 'Ja, direkte Nachbarn',
          zone: 'vzev',
          text: 'Dann bildet der virtuelle ZEV die Lösung. Der Netzbetreiber misst, die Anschlussleitungen bis zur Verteilkabine dürfen genutzt werden, ohne Netzkosten auf dem geteilten Strom.',
        },
      ],
    },
    {
      question: 'Liegen die Beteiligten weiter auseinander, im selben Quartier oder in derselben Gemeinde?',
      answers: [
        {
          label: 'Ja, im Quartier oder in der Gemeinde',
          zone: 'leg',
          text: 'Dann kommt die lokale Elektrizitätsgemeinschaft in Frage. Der Strom fliesst über das öffentliche Netz, mit 40 Prozent Rabatt auf dem Netznutzungstarif für den internen Anteil.',
        },
      ],
    },
  ],
  comparisonTitle: 'Die Modelle im Vergleich',
  comparison: [
    { label: 'Möglich seit', zev: '1. Januar 2018', vzev: '1. Januar 2025', praxismodell: 'Je nach Netzbetreiber', leg: '1. Januar 2026' },
    { label: 'Räumliche Grenze', zev: 'Ein Netzanschlusspunkt', vzev: 'Gleiche Verteilkabine oder Trafostation', praxismodell: 'Ein Gebäude', leg: 'Gleiche Gemeinde, gleicher Netzbetreiber, Netzebene 5 oder 7' },
    { label: 'Wer misst', zev: 'Private Zähler des ZEV', vzev: 'Smart Meter des Netzbetreibers', praxismodell: 'Zähler des Netzbetreibers', leg: 'Smart Meter des Netzbetreibers' },
    { label: 'Wer rechnet den Solarstrom ab', zev: 'Eigentümerschaft, Verwaltung oder Dienstleister', vzev: 'Betreiber des vZEV oder Dienstleister', praxismodell: 'Netzbetreiber', leg: 'Vertretung der LEG oder Dienstleister' },
    { label: 'Netznutzung auf dem Solarstrom', zev: 'Keine', vzev: 'Keine', praxismodell: 'Keine', leg: 'Reduziert um 40 Prozent, 20 Prozent mit Transformation' },
    { label: 'Mindestanteil Produktion', zev: '10 Prozent der Anschlussleistung', vzev: '10 Prozent der Anschlussleistung', praxismodell: 'Vorgabe des Netzbetreibers', leg: '5 Prozent der Anschlussleistung' },
    { label: 'Kundenbeziehung zum Netzbetreiber', zev: 'Nur der ZEV als Ganzes', vzev: 'Nur der vZEV als Ganzes', praxismodell: 'Jeder Mieter einzeln', leg: 'Jeder Teilnehmende einzeln' },
    { label: 'Mieter können ablehnen', zev: 'Ja, bei bestehender Miete', vzev: 'Ja, bei bestehender Miete', praxismodell: 'Ja', leg: 'Teilnahme ist freiwillig' },
    { label: 'Preisregel für Mieter', zev: 'Höchstens 80 Prozent pauschal oder effektive Kosten', vzev: 'Höchstens 80 Prozent pauschal oder effektive Kosten', praxismodell: 'Tarif des Netzbetreibers', leg: 'Frei vereinbart' },
    { label: 'Gesetz', zev: 'EnG Art. 17 und 18, EnV Art. 14 bis 17', vzev: 'EnG Art. 17 und 18, EnV Art. 14 bis 17', praxismodell: 'Kein ZEV nach EnG, Bedingungen der ElCom', leg: 'StromVG Art. 17d und 17e, StromVV Art. 19e bis 19h' },
  ],
  fsaTitle: 'So begleitet Free State AG Ihr Projekt',
  fsaSteps: FSA_STEPS,
  projectNotesTitle: 'Aus der Praxis',
  projectNotes: [
    {
      title: 'Ein Bowlingcenter in der Deutschschweiz',
      text: 'Grosses Dach, hoher Verbrauch am Abend. Wir haben Produktion und Verbrauch aufeinander abgestimmt und den Eigenverbrauch so organisiert, dass der Betrieb den grössten Teil seines Solarstroms selbst nutzt.',
    },
    {
      title: 'Zwei benachbarte Betriebe, in Vorbereitung',
      text: 'Zwei Firmen an derselben Strasse bereiten zusammen mit dem Elektrizitätswerk eine lokale Elektrizitätsgemeinschaft vor. Free State AG übernimmt die Koordination, den Batteriespeicher und die Gesamtlösung.',
    },
  ],
  faq: [
    {
      q: 'Was ist der Unterschied zwischen ZEV, vZEV und LEG?',
      a: 'Der ZEV bleibt hinter einem Netzanschluss und misst privat. Der vZEV reicht bis zur gemeinsamen Verteilkabine und misst mit den Zählern des Netzbetreibers. Die LEG nutzt das öffentliche Netz in der ganzen Gemeinde und zahlt dafür ein reduziertes Netznutzungsentgelt.',
    },
    {
      q: 'Fallen auf dem geteilten Solarstrom Netzkosten an?',
      a: 'Im ZEV und im vZEV nicht. In der LEG ja, aber reduziert um 40 Prozent, oder um 20 Prozent, wenn der Strom über eine Transformation fliesst.',
    },
    {
      q: 'Kann ich mit einem ZEV später in eine LEG?',
      a: 'Ja. Ein ZEV oder vZEV tritt als ein Teilnehmer in die LEG ein. Für die LEG zählt der Hauptzähler des Zusammenschlusses.',
    },
    {
      q: 'Was ist das Praxismodell VNB?',
      a: 'Ein Angebot einzelner Netzbetreiber für Mehrfamilienhäuser. Die Mieter bleiben Kunden des Netzbetreibers, er misst und rechnet den Solaranteil ab. Es ist kein ZEV nach Energiegesetz, und ob es angeboten wird, entscheidet der Netzbetreiber.',
    },
    {
      q: 'Was macht Free State AG in einem solchen Projekt?',
      a: 'Wir analysieren das Objekt, schlagen das passende Modell vor und koordinieren Elektrizitätswerk, Zähler, Anmeldung, Verträge und Abrechnung. Wo es sich rechnet, planen wir den Batteriespeicher gleich mit.',
    },
    {
      q: 'Wie lange dauert die Umsetzung?',
      a: 'Das hängt vom Netzbetreiber ab. Er beantwortet Anfragen zur Netzsituation innert 15 Tagen, eine LEG wird drei Monate im Voraus angemeldet. Die Anlage selbst planen und bauen wir parallel dazu.',
    },
  ],
}

export interface SceneZoneCopy {
  id: SceneZoneId
  label: string
  summary: string
  ctaLabel: string
}

export const SCENE_ZONE_COPY: SceneZoneCopy[] = [
  {
    id: 'zev',
    label: 'ZEV',
    summary: 'Zusammenschluss zum Eigenverbrauch. Alle Parteien hinter einem Netzanschluss, private Zähler, keine Netzkosten auf dem Solarstrom. Seit 2018.',
    ctaLabel: 'Mehr zum ZEV',
  },
  {
    id: 'vzev',
    label: 'vZEV',
    summary: 'Virtueller ZEV. Nachbargebäude an derselben Verteilkabine teilen Solarstrom, gemessen vom Netzbetreiber, ohne Umbau der Elektroverteilung. Seit 2025.',
    ctaLabel: 'Mehr zum vZEV',
  },
  {
    id: 'leg',
    label: 'LEG',
    summary: 'Lokale Elektrizitätsgemeinschaft. Betriebe und Liegenschaften in derselben Gemeinde handeln Strom über das öffentliche Netz, mit 40 Prozent Rabatt auf dem Netznutzungstarif. Seit 2026.',
    ctaLabel: 'Mehr zur LEG',
  },
  {
    id: 'praxismodell',
    label: 'Praxismodell',
    summary: 'Praxismodell VNB. Der Netzbetreiber misst und rechnet den Solaranteil im Mehrfamilienhaus ab, die Mieter bleiben seine Kunden. Kein ZEV nach Gesetz, Angebot je nach Netzbetreiber.',
    ctaLabel: 'Mehr zum Praxismodell',
  },
]

export const RATGEBER_INDEX = {
  seo: {
    title: 'Ratgeber: Solarstrom, Energiegemeinschaften und Recht | Free State AG',
    description:
      'Leitfäden von Free State AG zu Solarstrom in der Schweiz. Start mit ZEV, vZEV und LEG: Solarstrom im Gebäude, in der Nachbarschaft und im Quartier teilen.',
  },
  title: 'Ratgeber',
  lead: 'Verständlich erklärt, mit Gesetzesgrundlage und Rechenbeispiel. Wir beginnen mit den drei Modellen, um Solarstrom zu teilen.',
  cards: [
    { title: 'ZEV, vZEV und LEG im Überblick', description: 'Welches Modell passt zu Ihrem Objekt? Interaktive Übersicht und Vergleichstabelle.', href: 'hub' as const },
    { title: 'ZEV', description: 'Solarstrom im eigenen Gebäude an Mieter und Eigentümer verkaufen.', href: 'zev' as const },
    { title: 'vZEV', description: 'Solarstrom mit den Nachbargebäuden teilen, ohne eigene Zähler.', href: 'vzev' as const },
    { title: 'LEG', description: 'Solarstrom über das öffentliche Netz im Quartier verkaufen.', href: 'leg' as const },
  ],
}
```

Move the `import type { SceneZoneId }` line to the top of the file with the other import.

- [ ] **Step 4: Run the content test**

Run: `npx vitest run src/data/__tests__/energiegemeinschaften.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Stage**

```bash
git add src/data/energiegemeinschaften.ts src/data/__tests__/energiegemeinschaften.test.ts
```

---

### Task 8: Section components

**Files:**
- Create: `src/components/ratgeber/Section.tsx`
- Create: `src/components/ratgeber/ModelSections.tsx`
- Create: `src/components/ratgeber/HubSections.tsx`
- Create: `src/components/ratgeber/RatgeberCta.tsx`

**Interfaces:**
- Consumes `CommunityModel`, `HubContent`, `TitledText`, `CommunityActor`, `WorkedExample`, `SCENE_ZONE_COPY` (Tasks 5 to 7), `FlowDiagram` (Task 4), `Link` from `@/i18n/navigation`, `FAQAccordionSection` (`eyebrow`, `title`, `description`, `items: {question, answer}[]`), `JsonLd`, `buildFAQPageJsonLd`, `LinkButton` (`href`, `variant`).
- Produces the named exports listed in each file below. Pages in Task 9 import them by these names.

- [ ] **Step 1: Section wrapper**

`src/components/ratgeber/Section.tsx`:

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const TONES = {
  white: 'bg-white',
  sand: 'bg-[#EAEDDF]',
  light: 'bg-[#FDFFF5]',
} as const

interface SectionProps {
  id?: string
  eyebrow?: string
  title: string
  lead?: string
  tone?: keyof typeof TONES
  className?: string
  children: ReactNode
}

export default function Section({ id, eyebrow, title, lead, tone = 'white', className, children }: SectionProps) {
  return (
    <section id={id} className={cn(TONES[tone], 'text-[#062E25]', className)}>
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 md:py-20">
        {eyebrow && <p className="mb-2 text-base font-semibold uppercase tracking-wide text-[#062E25]/60">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold md:text-[38px]">{title}</h2>
        {lead && <p className="mt-3 max-w-3xl text-base text-[#062E25]/80 md:text-lg">{lead}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Model page sections**

`src/components/ratgeber/ModelSections.tsx`:

```tsx
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import Image from 'next/image'

import FAQAccordionSection from '@/components/faq/FAQAccordionSection'
import FlowDiagram from '@/components/ratgeber/FlowDiagram'
import Section from '@/components/ratgeber/Section'
import { JsonLd } from '@/components/seo/JsonLd'
import { LinkButton } from '@/components/ui/link-button'
import {
  COMMUNITY_MODELS,
  type CommunityActor,
  type CommunityModel,
  type FaqItem,
  type TitledText,
  type WorkedExample,
} from '@/data/energiegemeinschaften'
import { Link } from '@/i18n/navigation'
import { buildFAQPageJsonLd } from '@/lib/seo/structured-data'

export function ModelHero({ model }: { model: CommunityModel }) {
  return (
    <div className="bg-[#EAEDDF] text-[#062E25]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 pb-14 pt-28 sm:px-6 md:grid-cols-2 md:pb-20 md:pt-36">
        <div>
          <p className="mb-3 text-base font-semibold uppercase tracking-wide text-[#062E25]/60">
            {model.longName}, seit {new Date(model.since).getFullYear()}
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">{model.hero.title}</h1>
          <p className="mt-5 text-base text-[#062E25]/85 md:text-lg">{model.hero.lead}</p>
          <div className="mt-8">
            <LinkButton href="/commercial/calculator" variant="primary">
              Objekt prüfen lassen
            </LinkButton>
          </div>
        </div>
        <Image
          src={model.hero.image}
          alt={model.hero.imageAlt}
          width={1600}
          height={1200}
          priority
          className="h-auto w-full rounded-[24px]"
        />
      </div>
    </div>
  )
}

export function AudienceSection({ items }: { items: { label: string; text: string }[] }) {
  return (
    <Section title="Für wen sich das Modell eignet">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <li key={item.label} className="rounded-[20px] border border-[#062E25]/10 bg-white p-5">
            <h3 className="text-lg font-semibold">{item.label}</h3>
            <p className="mt-2 text-base text-[#062E25]/80">{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function StepsSection({ title, steps, tone = 'light' }: { title: string; steps: TitledText[]; tone?: 'white' | 'sand' | 'light' }) {
  return (
    <Section title={title} tone={tone}>
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-[20px] bg-white p-5 shadow-sm">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#b7fe1a] text-base font-bold">{i + 1}</span>
            <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-base text-[#062E25]/80">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function FlowSection({ model }: { model: CommunityModel }) {
  return (
    <Section title="So fliesst der Strom" lead={model.flowTitle}>
      <div className="rounded-[24px] border border-[#062E25]/10 bg-white p-4 md:p-8">
        <FlowDiagram spec={model.flow} title={model.flowTitle} />
      </div>
    </Section>
  )
}

export function LegalSection({ model }: { model: CommunityModel }) {
  return (
    <Section title="Gesetzliche Grundlage" tone="sand" lead={model.legal.summary}>
      <ul className="flex flex-wrap gap-3">
        {model.legal.refs.map(ref => (
          <li key={ref.url + ref.article}>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#062E25]/20 bg-white px-4 py-2 text-base font-medium hover:bg-[#062E25]/5"
            >
              {ref.law} {ref.article}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-base text-[#062E25]/70">Geprüft am {formatDate(model.legal.refs[0].checked)}.</p>
    </Section>
  )
}

export function RequirementsSection({ items }: { items: TitledText[] }) {
  return (
    <Section title="Voraussetzungen">
      <TitledGrid items={items} />
    </Section>
  )
}

export function ActorsSection({ actors }: { actors: CommunityActor[] }) {
  return (
    <Section title="Wer macht was" tone="light">
      <div className="grid gap-4 md:grid-cols-2">
        {actors.map(actor => (
          <div
            key={actor.name}
            className={
              actor.isFsa
                ? 'rounded-[20px] bg-[#062E25] p-6 text-white'
                : 'rounded-[20px] border border-[#062E25]/10 bg-white p-6'
            }
          >
            <h3 className="text-lg font-semibold">{actor.name}</h3>
            <ul className="mt-3 space-y-2 text-base">
              {actor.bullets.map(b => (
                <li key={b} className="flex gap-2">
                  <span aria-hidden className={actor.isFsa ? 'text-[#b7fe1a]' : 'text-[#062E25]/50'}>
                    -
                  </span>
                  <span className={actor.isFsa ? 'text-white/90' : 'text-[#062E25]/80'}>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function ExampleSection({ example }: { example: WorkedExample }) {
  return (
    <Section title={example.title} tone="sand">
      <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h3 className="text-lg font-semibold">Annahmen</h3>
          <ul className="mt-3 space-y-2 text-base text-[#062E25]/80">
            {example.assumptions.map(a => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-[20px] border border-[#062E25]/10 bg-white">
          <table className="w-full text-base">
            <tbody>
              {example.rows.map(row => (
                <tr key={row.label} className="border-b border-[#062E25]/10 last:border-0">
                  <th scope="row" className="px-4 py-3 text-left font-medium">{row.label}</th>
                  <td className="px-4 py-3 text-right font-semibold">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-5 text-base text-[#062E25]/70">
        Quelle: {example.source} Stand {formatDate(example.sourceDate)}.
      </p>
    </Section>
  )
}

export function RightsSection({ title, items }: { title: string; items: TitledText[] }) {
  return (
    <Section title={title}>
      <TitledGrid items={items} />
    </Section>
  )
}

export function ScenariosSection({ items }: { items: TitledText[] }) {
  return (
    <Section title="Typische Situationen" tone="light">
      <TitledGrid items={items} />
    </Section>
  )
}

export function PraxismodellSection({ items }: { items: TitledText[] }) {
  return (
    <Section id="praxismodell" title="Alternative: Praxismodell VNB" tone="sand">
      <TitledGrid items={items} />
    </Section>
  )
}

export function FsaStepsSection({ title, steps }: { title: string; steps: TitledText[] }) {
  return (
    <Section title={title} tone="white">
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-[20px] bg-[#062E25] p-5 text-white">
            <span className="text-base font-bold text-[#b7fe1a]">0{i + 1}</span>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-base text-white/85">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function FaqSection({ eyebrow, title, description, items }: { eyebrow: string; title: string; description: string; items: FaqItem[] }) {
  const mapped = items.map(i => ({ question: i.q, answer: i.a }))
  return (
    <div className="bg-[#FDFFF5]">
      <JsonLd data={buildFAQPageJsonLd(mapped)} />
      <FAQAccordionSection eyebrow={eyebrow} title={title} description={description} items={mapped} />
    </div>
  )
}

export function RelatedModelsSection({ current }: { current: CommunityModel['slug'] }) {
  const others = COMMUNITY_MODELS.filter(m => m.slug !== current)
  return (
    <Section title="Die anderen Modelle" tone="sand">
      <div className="grid gap-4 md:grid-cols-3">
        {others.map(m => (
          <Link
            key={m.slug}
            href={{ pathname: '/ratgeber/[model]', params: { model: m.slug } }}
            className="group rounded-[20px] border border-[#062E25]/10 bg-white p-5 hover:border-[#062E25]/30"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              {m.name}
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </h3>
            <p className="mt-2 text-base text-[#062E25]/80">{m.longName}</p>
          </Link>
        ))}
        <Link
          href="/ratgeber/energiegemeinschaften"
          className="group rounded-[20px] border border-[#062E25]/10 bg-white p-5 hover:border-[#062E25]/30"
        >
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            Übersicht
            <ArrowUpRight className="h-5 w-5" aria-hidden />
          </h3>
          <p className="mt-2 text-base text-[#062E25]/80">Alle Modelle im Vergleich, mit interaktiver Quartieransicht.</p>
        </Link>
      </div>
    </Section>
  )
}

function TitledGrid({ items }: { items: TitledText[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(item => (
        <div key={item.title} className="rounded-[20px] border border-[#062E25]/10 bg-white p-5">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="mt-2 text-base text-[#062E25]/80">{item.text}</p>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
```

If `LinkButton` does not accept `href` and `variant` as shown, read `src/components/ui/link-button.tsx` and match its props. The visible variants include `primary`.

- [ ] **Step 3: Hub sections**

`src/components/ratgeber/HubSections.tsx`:

```tsx
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

import Section from '@/components/ratgeber/Section'
import { COMMUNITY_MODELS, type ComparisonRow, type DecisionStep, type TitledText } from '@/data/energiegemeinschaften'
import { Link } from '@/i18n/navigation'

const ZONE_HREF = {
  zev: { pathname: '/ratgeber/[model]', params: { model: 'zev' } },
  vzev: { pathname: '/ratgeber/[model]', params: { model: 'vzev' } },
  leg: { pathname: '/ratgeber/[model]', params: { model: 'leg' } },
} as const

export function HubHero({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="bg-[#EAEDDF] text-[#062E25]">
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-28 sm:px-6 md:pt-36">
        <h1 className="max-w-4xl text-3xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base text-[#062E25]/85 md:text-lg">{lead}</p>
      </div>
    </div>
  )
}

export function DecisionSection({ title, steps }: { title: string; steps: DecisionStep[] }) {
  return (
    <Section title={title} tone="light">
      <ol className="space-y-6">
        {steps.map((step, i) => (
          <li key={step.question} className="rounded-[24px] border border-[#062E25]/10 bg-white p-6">
            <p className="text-lg font-semibold">
              {i + 1}. {step.question}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {step.answers.map(answer => (
                <div key={answer.label} className="rounded-[20px] bg-[#EAEDDF] p-5">
                  <p className="text-base font-semibold">{answer.label}</p>
                  <p className="mt-2 text-base text-[#062E25]/80">{answer.text}</p>
                  {answer.zone === 'praxismodell' ? (
                    <Link
                      href={{ pathname: '/ratgeber/[model]', params: { model: 'vzev' } }}
                      className="mt-3 inline-flex items-center gap-1 text-base font-medium underline hover:no-underline"
                    >
                      Zum Praxismodell auf der vZEV-Seite
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <Link
                      href={ZONE_HREF[answer.zone]}
                      className="mt-3 inline-flex items-center gap-1 text-base font-medium underline hover:no-underline"
                    >
                      Mehr zum {answer.zone === 'leg' ? 'LEG' : answer.zone === 'vzev' ? 'vZEV' : 'ZEV'}
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function ComparisonSection({ title, rows }: { title: string; rows: ComparisonRow[] }) {
  return (
    <Section title={title}>
      <div className="overflow-x-auto rounded-[24px] border border-[#062E25]/10 bg-white">
        <table className="w-full min-w-[820px] text-base">
          <thead>
            <tr className="bg-[#EAEDDF] text-left">
              <th scope="col" className="px-4 py-3 font-semibold">Kriterium</th>
              <th scope="col" className="px-4 py-3 font-semibold">ZEV</th>
              <th scope="col" className="px-4 py-3 font-semibold">vZEV</th>
              <th scope="col" className="px-4 py-3 font-semibold">Praxismodell VNB</th>
              <th scope="col" className="px-4 py-3 font-semibold">LEG</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.label} className="border-t border-[#062E25]/10 align-top">
                <th scope="row" className="px-4 py-3 text-left font-medium">{row.label}</th>
                <td className="px-4 py-3 text-[#062E25]/85">{row.zev}</td>
                <td className="px-4 py-3 text-[#062E25]/85">{row.vzev}</td>
                <td className="px-4 py-3 text-[#062E25]/85">{row.praxismodell}</td>
                <td className="px-4 py-3 text-[#062E25]/85">{row.leg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

export function ModelCardsSection() {
  return (
    <Section title="Die drei Modelle" tone="sand">
      <div className="grid gap-4 md:grid-cols-3">
        {COMMUNITY_MODELS.map(m => (
          <Link
            key={m.slug}
            href={{ pathname: '/ratgeber/[model]', params: { model: m.slug } }}
            className="group overflow-hidden rounded-[24px] border border-[#062E25]/10 bg-white hover:border-[#062E25]/30"
          >
            <Image src={m.hero.image} alt={m.hero.imageAlt} width={1600} height={1200} className="h-auto w-full" />
            <div className="p-5">
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                {m.name}
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </h3>
              <p className="mt-1 text-base font-medium text-[#062E25]/70">{m.longName}</p>
              <p className="mt-3 text-base text-[#062E25]/85">{m.hero.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}

export function ProjectNotesSection({ title, notes }: { title: string; notes: TitledText[] }) {
  return (
    <Section title={title} tone="light">
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map(n => (
          <div key={n.title} className="rounded-[20px] border border-[#062E25]/10 bg-white p-6">
            <h3 className="text-lg font-semibold">{n.title}</h3>
            <p className="mt-2 text-base text-[#062E25]/80">{n.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 4: CTA block**

`src/components/ratgeber/RatgeberCta.tsx`:

```tsx
import { LinkButton } from '@/components/ui/link-button'

export default function RatgeberCta() {
  return (
    <section className="bg-[#062E25] text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between md:py-20">
        <div>
          <h2 className="text-2xl font-semibold md:text-[38px]">Passt ein ZEV, vZEV oder eine LEG zu Ihrem Objekt?</h2>
          <p className="mt-3 max-w-2xl text-base text-white/85 md:text-lg">
            Adresse eingeben, Dach und Verbrauch angeben. Wir prüfen mit dem Netzbetreiber, welches Modell möglich ist, und melden uns mit einem Vorschlag.
          </p>
        </div>
        <LinkButton href="/commercial/calculator" variant="primary">
          Objekt prüfen lassen
        </LinkButton>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: errors only about `'/ratgeber/[model]'` and `'/ratgeber/energiegemeinschaften'` not being pathname keys. Task 9 adds them. Anything else must be fixed here.

- [ ] **Step 6: Stage**

```bash
git add src/components/ratgeber
```

---

### Task 9: Routes and pages

**Files:**
- Modify: `src/i18n/routing.ts:72-83` (insert after the `/foerderung/[kanton]` entry)
- Create: `src/app/[locale]/ratgeber/page.tsx`
- Create: `src/app/[locale]/ratgeber/energiegemeinschaften/page.tsx`
- Create: `src/app/[locale]/ratgeber/[model]/page.tsx`

**Interfaces:**
- Consumes everything from Tasks 3 to 8, `generateSEOMetadata({ locale, pathname, title, description, ogImage?, availableLocales? })` from `@/lib/seo/metadata`, `siteConfig` from `@/lib/seo/site-config`, `getPathname` from `@/i18n/navigation`, `LatestPostsSection` (`topic`, `className`).
- Produces the three routes. `availableLocales: ['de']` makes the canonical German for every locale.

- [ ] **Step 1: Add the pathnames**

In `src/i18n/routing.ts`, directly after the `'/foerderung/[kanton]'` block, add:

```ts
    '/ratgeber': {
      en: '/ratgeber',
      de: '/ratgeber',
      fr: '/ratgeber',
      it: '/ratgeber',
    },
    '/ratgeber/energiegemeinschaften': {
      en: '/ratgeber/energiegemeinschaften',
      de: '/ratgeber/energiegemeinschaften',
      fr: '/ratgeber/energiegemeinschaften',
      it: '/ratgeber/energiegemeinschaften',
    },
    '/ratgeber/[model]': {
      en: '/ratgeber/[model]',
      de: '/ratgeber/[model]',
      fr: '/ratgeber/[model]',
      it: '/ratgeber/[model]',
    },
```

Run: `npx tsc --noEmit`
Expected: the Task 8 pathname errors are gone.

- [ ] **Step 2: Index page**

`src/app/[locale]/ratgeber/page.tsx`:

```tsx
import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'

import RatgeberCta from '@/components/ratgeber/RatgeberCta'
import { JsonLd } from '@/components/seo/JsonLd'
import { RATGEBER_INDEX } from '@/data/energiegemeinschaften'
import { Link } from '@/i18n/navigation'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'

const DE_ONLY = ['de'] as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/ratgeber',
    title: RATGEBER_INDEX.seo.title,
    description: RATGEBER_INDEX.seo.description,
    availableLocales: DE_ONLY,
  })
}

export default async function RatgeberIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const prefix = locale === 'de' ? '' : `/${locale}`
  return (
    <div className="bg-[#EAEDDF] text-[#062E25]">
      <JsonLd
        data={buildBreadcrumbsFromPath([
          { name: 'Home', href: prefix || '/' },
          { name: 'Ratgeber', href: `${prefix}/ratgeber` },
        ])}
      />
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-28 sm:px-6 md:pt-36">
        <h1 className="text-3xl font-bold md:text-5xl">{RATGEBER_INDEX.title}</h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg">{RATGEBER_INDEX.lead}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {RATGEBER_INDEX.cards.map(card => (
            <Link
              key={card.href}
              href={
                card.href === 'hub'
                  ? '/ratgeber/energiegemeinschaften'
                  : { pathname: '/ratgeber/[model]', params: { model: card.href } }
              }
              className="group rounded-[24px] border border-[#062E25]/10 bg-white p-6 hover:border-[#062E25]/30"
            >
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                {card.title}
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </h2>
              <p className="mt-2 text-base text-[#062E25]/80">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
      <RatgeberCta />
    </div>
  )
}
```

- [ ] **Step 3: Hub page**

`src/app/[locale]/ratgeber/energiegemeinschaften/page.tsx`:

```tsx
import type { Metadata } from 'next'

import LatestPostsSection from '@/components/blog/LatestPostsSection'
import CommunityScene from '@/components/ratgeber/CommunityScene'
import {
  ComparisonSection,
  DecisionSection,
  HubHero,
  ModelCardsSection,
  ProjectNotesSection,
} from '@/components/ratgeber/HubSections'
import { FaqSection, FsaStepsSection } from '@/components/ratgeber/ModelSections'
import RatgeberCta from '@/components/ratgeber/RatgeberCta'
import Section from '@/components/ratgeber/Section'
import { JsonLd } from '@/components/seo/JsonLd'
import { HUB, SCENE_ZONE_COPY } from '@/data/energiegemeinschaften'
import { getPathname } from '@/i18n/navigation'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'

const DE_ONLY = ['de'] as const
const POSTER = '/ratgeber/energiegemeinschaften.webp'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/ratgeber/energiegemeinschaften',
    title: HUB.seo.title,
    description: HUB.seo.description,
    ogImage: { url: `${siteConfig.url}${POSTER}`, width: 2400, height: 1500, alt: HUB.sceneTitle },
    availableLocales: DE_ONLY,
  })
}

export default async function HubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const typedLocale = locale as SiteLocale
  const prefix = locale === 'de' ? '' : `/${locale}`
  const zones = SCENE_ZONE_COPY.map(zone => {
    const model = zone.id === 'praxismodell' ? 'vzev' : zone.id
    const base = getPathname({ locale: typedLocale, href: { pathname: '/ratgeber/[model]', params: { model } } })
    return { ...zone, href: zone.id === 'praxismodell' ? `${base}#praxismodell` : base }
  })
  return (
    <div>
      <JsonLd
        data={buildBreadcrumbsFromPath([
          { name: 'Home', href: prefix || '/' },
          { name: 'Ratgeber', href: `${prefix}/ratgeber` },
          { name: 'Energiegemeinschaften', href: `${prefix}/ratgeber/energiegemeinschaften` },
        ])}
      />
      <HubHero title={HUB.hero.title} lead={HUB.hero.lead} />
      <Section title={HUB.sceneTitle} tone="sand" className="pt-0">
        <CommunityScene
          zones={zones}
          poster={POSTER}
          alt="Isometrische Ansicht eines Quartiers mit vier Modellen, ZEV, vZEV, LEG und Praxismodell"
          overviewLabel="Übersicht"
          loadingLabel="3D-Ansicht wird geladen"
        />
      </Section>
      <DecisionSection title={HUB.decisionTitle} steps={HUB.decision} />
      <ComparisonSection title={HUB.comparisonTitle} rows={HUB.comparison} />
      <ModelCardsSection />
      <FsaStepsSection title={HUB.fsaTitle} steps={HUB.fsaSteps} />
      <ProjectNotesSection title={HUB.projectNotesTitle} notes={HUB.projectNotes} />
      <FaqSection
        eyebrow="FAQ"
        title="Häufige Fragen zu ZEV, vZEV und LEG"
        description="Die kurzen Antworten. Die Details stehen auf den drei Modellseiten."
        items={HUB.faq}
      />
      <LatestPostsSection topic="communities" className="bg-[#EAEDDF] px-4 sm:px-6 pt-16 md:pt-[70px]" />
      <RatgeberCta />
    </div>
  )
}
```

If `getPathname` rejects the `locale` argument shape, check `node_modules/next-intl/dist/types/navigation/react-server/createNavigation.d.ts` for its signature and adapt. It must return the localized path string.

- [ ] **Step 4: Model page**

`src/app/[locale]/ratgeber/[model]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import LatestPostsSection from '@/components/blog/LatestPostsSection'
import {
  ActorsSection,
  AudienceSection,
  ExampleSection,
  FaqSection,
  FlowSection,
  FsaStepsSection,
  LegalSection,
  ModelHero,
  PraxismodellSection,
  RelatedModelsSection,
  RequirementsSection,
  RightsSection,
  ScenariosSection,
  StepsSection,
} from '@/components/ratgeber/ModelSections'
import RatgeberCta from '@/components/ratgeber/RatgeberCta'
import { JsonLd } from '@/components/seo/JsonLd'
import { COMMUNITY_MODEL_SLUGS, getCommunityModel } from '@/data/energiegemeinschaften'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'

const DE_ONLY = ['de'] as const

export function generateStaticParams() {
  return COMMUNITY_MODEL_SLUGS.map(model => ({ model }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; model: string }> }): Promise<Metadata> {
  const { locale, model } = await params
  const m = getCommunityModel(model)
  if (!m) return { robots: { index: false, follow: false }, title: 'Ratgeber | Free State AG' }
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: `/ratgeber/${m.slug}`,
    title: m.seo.title,
    description: m.seo.description,
    ogImage: { url: `${siteConfig.url}${m.hero.image}`, width: 1600, height: 1200, alt: m.hero.imageAlt },
    availableLocales: DE_ONLY,
  })
}

export default async function ModelPage({ params }: { params: Promise<{ locale: string; model: string }> }) {
  const { locale, model } = await params
  const m = getCommunityModel(model)
  if (!m) notFound()
  const prefix = locale === 'de' ? '' : `/${locale}`
  return (
    <div>
      <JsonLd
        data={buildBreadcrumbsFromPath([
          { name: 'Home', href: prefix || '/' },
          { name: 'Ratgeber', href: `${prefix}/ratgeber` },
          { name: 'Energiegemeinschaften', href: `${prefix}/ratgeber/energiegemeinschaften` },
          { name: m.name, href: `${prefix}/ratgeber/${m.slug}` },
        ])}
      />
      <ModelHero model={m} />
      <AudienceSection items={m.audience} />
      <StepsSection title="So funktioniert es" steps={m.steps} />
      <FlowSection model={m} />
      <LegalSection model={m} />
      <RequirementsSection items={m.requirements} />
      <ActorsSection actors={m.actors} />
      <ExampleSection example={m.example} />
      <RightsSection title={m.rightsTitle} items={m.rights} />
      <ScenariosSection items={m.scenarios} />
      {m.praxismodell && <PraxismodellSection items={m.praxismodell} />}
      <FsaStepsSection title="So läuft es mit Free State AG" steps={m.fsaSteps} />
      <FaqSection
        eyebrow="FAQ"
        title={`Häufige Fragen zum ${m.name}`}
        description={`Kurz beantwortet, mit Verweis auf ${m.legal.refs[0].law} ${m.legal.refs[0].article}.`}
        items={m.faq}
      />
      <RelatedModelsSection current={m.slug} />
      <LatestPostsSection topic="communities" className="bg-[#EAEDDF] px-4 sm:px-6 pt-16 md:pt-[70px]" />
      <RatgeberCta />
    </div>
  )
}
```

`Häufige Fragen zum LEG` reads wrong in German because LEG is feminine. Use `title={m.slug === 'leg' ? 'Häufige Fragen zur LEG' : `Häufige Fragen zum ${m.name}`}`.

- [ ] **Step 5: Type check, lint, dev smoke**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Run: `npm run dev` in the background, then `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/ratgeber/zev http://localhost:3001/ratgeber/energiegemeinschaften http://localhost:3001/ratgeber http://localhost:3001/fr/ratgeber/leg http://localhost:3001/ratgeber/kosten`
Expected: `200 200 200 200 404`.

Run: `curl -s http://localhost:3001/fr/ratgeber/zev | grep -o '<link rel="canonical" href="[^"]*"'`
Expected: `href="https://www.freestate.ch/ratgeber/zev"` (German canonical under the French prefix).

- [ ] **Step 6: Stage**

```bash
git add src/i18n/routing.ts "src/app/[locale]/ratgeber"
```

---

### Task 10: Sitemap

**Files:**
- Modify: `src/app/sitemap.ts` (`StaticEntry`, `STATIC_ENTRIES`, the static loop)
- Modify: `src/app/__tests__/sitemap.test.ts`

**Interfaces:**
- Consumes `COMMUNITY_MODEL_SLUGS` from Task 5, `SiteLocale`.

- [ ] **Step 1: Write the failing sitemap test**

Append inside the `describe('sitemap', ...)` block of `src/app/__tests__/sitemap.test.ts`:

```ts
  it('lists the German-only Ratgeber pages with de and x-default alternates only', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    for (const path of ['/ratgeber', '/ratgeber/energiegemeinschaften', '/ratgeber/zev', '/ratgeber/vzev', '/ratgeber/leg']) {
      expect(urls).toContain(`https://www.freestate.ch${path}`)
    }
    const zev = entries.find(e => e.url === 'https://www.freestate.ch/ratgeber/zev')
    expect(Object.keys(zev!.alternates!.languages!).sort()).toEqual(['de', 'x-default'])
    expect(urls.filter(u => u.includes('/ratgeber/zev'))).toHaveLength(1)
  })
```

Run: `npx vitest run src/app/__tests__/sitemap.test.ts`
Expected: FAIL, the Ratgeber URLs are missing.

- [ ] **Step 2: Extend the sitemap**

In `src/app/sitemap.ts`:

1. Add to the imports: `import { COMMUNITY_MODEL_SLUGS } from '@/data/energiegemeinschaften'`
2. Add a refresh constant next to the others: `const REFRESH_2026_09_22 = new Date('2026-09-22')` and, above `StaticEntry`, `const DE_ONLY: readonly SiteLocale[] = ['de']`
3. Add `availableLocales?: readonly SiteLocale[]` to the `StaticEntry` type.
4. Append to `STATIC_ENTRIES` after the `/foerderung` entry:

```ts
  {
    pathname: '/ratgeber',
    lastModified: REFRESH_2026_09_22,
    priority: 0.7,
    availableLocales: DE_ONLY,
  },
  {
    pathname: '/ratgeber/energiegemeinschaften',
    lastModified: REFRESH_2026_09_22,
    changeFrequency: 'monthly',
    priority: 0.8,
    availableLocales: DE_ONLY,
  },
  ...COMMUNITY_MODEL_SLUGS.map(slug => ({
    pathname: `/ratgeber/${slug}`,
    lastModified: REFRESH_2026_09_22,
    priority: 0.8,
    availableLocales: DE_ONLY,
  })),
```

5. In the static loop change the alternates line to:

```ts
      alternates: {
        languages: buildHreflangAlternates(entry.pathname, entry.availableLocales),
      },
```

- [ ] **Step 3: Run the test**

Run: `npx vitest run src/app/__tests__/sitemap.test.ts`
Expected: PASS, all sitemap tests including the new one.

- [ ] **Step 4: Stage**

```bash
git add src/app/sitemap.ts src/app/__tests__/sitemap.test.ts
```

---

### Task 11: Entry points, message keys and the SolarFree MFH page

**Files:**
- Modify: `messages/de.json`, `messages/en.json`, `messages/fr.json`, `messages/it.json`
- Modify: `src/components/Footer.tsx:51-71`
- Modify: `src/components/MobileNavLinks.tsx:23-36`
- Modify: `src/components/HeroNav.tsx:25-40`
- Modify: `src/app/[locale]/commercial/solar-free/solar-free-multi-family/page.tsx`

**Interfaces:**
- Consumes the `/ratgeber/energiegemeinschaften` pathname key (Task 9).
- Produces message keys `footer.solarAbo.communities`, `home.hero.nav.communities`, `solarAboMulti.communitiesLink.{title,text,cta}` and the changed `solarAboMulti.includes.items.zevBillingPlatform.title` in all four locales.

- [ ] **Step 1: Add the message keys with a script**

Save as `/private/tmp/claude-502/-Users-dejanarsic-zansu-free-state-ag-app/3d43f569-c4f3-41b5-a831-a3a0526b9b4e/scratchpad/add-keys.py` and run with `python3` from the frontend root:

```python
import json

STRINGS = {
    'de': {
        'nav': 'ZEV, vZEV und LEG erklärt',
        'billing': 'ZEV-Abrechnung und Koordination',
        'link': {
            'title': 'ZEV, vZEV oder LEG?',
            'text': 'Welches Modell zu Ihrem Mehrfamilienhaus passt, wer misst und wer abrechnet, erklären wir im Ratgeber.',
            'cta': 'Zum Ratgeber Energiegemeinschaften',
        },
    },
    'en': {
        'nav': 'ZEV, vZEV and LEG explained',
        'billing': 'ZEV billing and coordination',
        'link': {
            'title': 'ZEV, vZEV or LEG?',
            'text': 'Which model fits your building, who meters and who bills, explained in our guide (in German).',
            'cta': 'Read the guide',
        },
    },
    'fr': {
        'nav': 'RCP, RCPv et CEL expliqués',
        'billing': 'Facturation et coordination RCP',
        'link': {
            'title': 'RCP, RCPv ou CEL ?',
            'text': 'Quel modèle convient à votre immeuble, qui mesure et qui facture, expliqué dans notre guide (en allemand).',
            'cta': 'Lire le guide',
        },
    },
    'it': {
        'nav': 'RCP, RCPv e CLE spiegati',
        'billing': 'Fatturazione e coordinamento RCP',
        'link': {
            'title': 'RCP, RCPv o CLE?',
            'text': 'Quale modello si adatta al vostro condominio, chi misura e chi fattura, spiegato nella nostra guida (in tedesco).',
            'cta': 'Leggi la guida',
        },
    },
}

for locale, s in STRINGS.items():
    path = f'messages/{locale}.json'
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    data['footer']['solarAbo']['communities'] = s['nav']
    data['home']['hero']['nav']['communities'] = s['nav']
    data['solarAboMulti']['includes']['items']['zevBillingPlatform']['title'] = s['billing']
    data['solarAboMulti']['communitiesLink'] = s['link']
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(locale, 'ok')
```

Then run: `git diff --stat messages/`
Expected: each file changes by a handful of lines. If a file shows hundreds of changed lines, the dump reformatted it. Run `git checkout messages/` and add the four keys by hand with the Edit tool instead.

- [ ] **Step 2: Footer link**

In `src/components/Footer.tsx`, append to the `solarAboLinks` array (after the `publicBuildings` entry):

```ts
    {
      label: t('solarAbo.communities'),
      href: '/ratgeber/energiegemeinschaften' as const,
    },
```

- [ ] **Step 3: Mobile nav and HeroNav**

In `src/components/MobileNavLinks.tsx`, append to the commercial branch of `solarAboLinks` (after the `solarAboPublic` entry):

```ts
        {
          label: t('hero.nav.communities'),
          href: '/ratgeber/energiegemeinschaften' as const,
        },
```

In `src/components/HeroNav.tsx`, do the same in the commercial branch of its `solarAboLinks` array (the array starting at line 25, after the `solarAboPublic` entry).

Run: `npx tsc --noEmit`
Expected: clean. If a `LinkColumn` or nav item type narrows `href` to a union of literals, add `'/ratgeber/energiegemeinschaften'` to that union where it is declared.

- [ ] **Step 4: Link block on the SolarFree MFH page**

In `src/app/[locale]/commercial/solar-free/solar-free-multi-family/page.tsx`, add `import { Link } from '@/i18n/navigation'` and `import { ArrowUpRight } from 'lucide-react'`, then place this block directly after the component that renders the `includes` array (the `t` used for `includes.items` is already in scope):

```tsx
      <section className="bg-[#EAEDDF] px-4 py-14 text-[#062E25] sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 rounded-[24px] border border-[#062E25]/10 bg-white p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{t('communitiesLink.title')}</h2>
            <p className="mt-2 max-w-2xl text-base text-[#062E25]/80">{t('communitiesLink.text')}</p>
          </div>
          <Link
            href="/ratgeber/energiegemeinschaften"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#062E25] px-5 py-2.5 text-base font-medium text-white hover:bg-[#062E25]/90"
          >
            {t('communitiesLink.cta')}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run lint && python3 -c "import json;[json.load(open(f'messages/{l}.json')) for l in ['de','en','fr','it']];print('json ok')"`
Expected: clean, `json ok`.

Run: `grep -rn "Abrechnungsplattform\|billing platform\|Plateforme de facturation\|Piattaforma di fatturazione" messages/`
Expected: no output.

- [ ] **Step 6: Stage**

```bash
git add messages src/components/Footer.tsx src/components/MobileNavLinks.tsx src/components/HeroNav.tsx "src/app/[locale]/commercial/solar-free/solar-free-multi-family/page.tsx"
```

---

### Task 12: Verification

**Files:** none created. This task runs the checks from spec section 14 and fixes what they find.

- [ ] **Step 1: Static checks**

Run, each must be clean:

```bash
npx tsc --noEmit
npm run lint
npm test
node scripts/3d/energiegemeinschaften/check-glb.mjs public/3d/energiegemeinschaften.glb
grep -rn $'\xe2\x80\x94' src/data/energiegemeinschaften.ts src/components/ratgeber "src/app/[locale]/ratgeber" messages/ || echo "no em dash"
grep -rnE "leading-" src/components/ratgeber "src/app/[locale]/ratgeber" || echo "no leading classes"
grep -rnE "^\s*//|/\*\*?|^\s*#" src/components/ratgeber "src/app/[locale]/ratgeber" src/lib/ratgeber src/lib/model-viewer.ts src/data/energiegemeinschaften.ts scripts/3d/energiegemeinschaften/build_scene.py scripts/3d/energiegemeinschaften/check-glb.mjs || echo "no comments"
```

Expected: `no em dash`, `no leading classes`, `no comments`. The Python shebang and docstring count as comments, remove them too.

- [ ] **Step 2: Production build**

Run: `npm run build 2>&1 | tail -40; echo "exit: ${PIPESTATUS[0]}"`
Expected: `exit: 0`, and the route table lists `/[locale]/ratgeber`, `/[locale]/ratgeber/energiegemeinschaften` and `/[locale]/ratgeber/[model]` with the three model params prerendered.

- [ ] **Step 3: Browser check of the hub**

Start `npm run dev`, open `http://localhost:3001/ratgeber/energiegemeinschaften` in Chrome through the Claude in Chrome tools and confirm each item, taking a screenshot for the ones marked (shot):

1. Poster visible before the GLB finishes, no layout jump when the scene appears (shot).
2. Pulses move along the lines.
3. Hover on the ZEV pill tints the ZEV island (shot).
4. Click on LEG: camera flies to the LEG island, side panel opens with the LEG summary, URL hash becomes `#leg`, "Übersicht" button appears (shot).
5. "Übersicht" returns to the overview and clears the hash.
6. Load `.../energiegemeinschaften#vzev` directly: the vZEV panel is open after load.
7. Praxismodell panel link goes to `/ratgeber/vzev#praxismodell` and the page lands on the Praxismodell section.
8. Scroll the page with the wheel while the pointer is over the scene without clicking first: the page scrolls, the scene does not zoom.
9. Resize to 390 px width: the chip row is visible under the canvas, the panel is a bottom sheet (shot).
10. Emulate `prefers-reduced-motion: reduce` in DevTools rendering settings and reload: no pulses, click jumps without a flight.
11. Keyboard: Tab reaches the four pills, Enter opens a panel, the panel close button is reachable.
12. Read the console: no errors from model-viewer or React.

Then open `/ratgeber/zev`, `/ratgeber/vzev`, `/ratgeber/leg` and confirm the hero image, the flow diagram animation, the Praxismodell anchor on vZEV, the FAQ accordion and the related links (one shot per page).

- [ ] **Step 4: Lighthouse on the hub**

Run: `npx lighthouse@latest http://localhost:3001/ratgeber/energiegemeinschaften --preset=desktop --only-categories=performance --quiet --chrome-flags="--headless=new" --output=json --output-path=/private/tmp/claude-502/-Users-dejanarsic-zansu-free-state-ag-app/3d43f569-c4f3-41b5-a831-a3a0526b9b4e/scratchpad/lh-hub.json && python3 -c "import json;d=json.load(open('/private/tmp/claude-502/-Users-dejanarsic-zansu-free-state-ag-app/3d43f569-c4f3-41b5-a831-a3a0526b9b4e/scratchpad/lh-hub.json'));a=d['audits'];print('perf',d['categories']['performance']['score'],'CLS',a['cumulative-layout-shift']['numericValue'],'LCP',a['largest-contentful-paint']['displayValue'])"`
Expected: CLS under 0.05. Report the performance score and LCP as measured, do not tune blindly. Dev mode numbers are lower than production, say so in the report.

- [ ] **Step 5: i18n parity and prod safety**

Run the `i18n-parity-checker` agent on the diff. Expected findings: German strings in `src/data/energiegemeinschaften.ts`, `src/components/ratgeber/*` and `src/app/[locale]/ratgeber/*`, which are the accepted exception (spec section 13). Any finding in `messages/*.json` parity or in a touched shared component (Footer, MobileNavLinks, HeroNav, MFH page) must be fixed.

Run the `prod-safety-reviewer` agent on the diff. Expected: no migrations, no env vars, no R2 writes. Fix anything it flags.

- [ ] **Step 6: Report**

Report to Dejan: what is staged, the GLB size, the Lighthouse numbers, the screenshots, and the two open items for Ivan from spec section 16 (Praxismodell as an FSA offering, reference consent). Do not commit, do not push.
