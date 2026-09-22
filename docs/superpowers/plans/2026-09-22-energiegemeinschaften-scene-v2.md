# Energiegemeinschaften Scene v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hub scene explain the mechanism: look fixes, pulses coloured by meaning, focus mode with in-scene labels, a three-step walkthrough per zone, and a Draco-compressed GLB.

**Architecture:** `build_scene.py` gains a slope-mounted panel helper, three pulse materials by stage, a grid feed node and a `labels` block per zone in the JSON sidecar. `CommunityScene.tsx` dims inactive islands, renders label hotspots for the active zone and fades pulse materials per step through the scene-graph API. Copy for steps and labels lives in `src/data/energiegemeinschaften.ts`.

**Tech Stack:** as the first plan. Spec: `docs/superpowers/specs/2026-09-22-energiegemeinschaften-design.md` sections 7 and 8 still bind.

**Base plan:** `docs/superpowers/plans/2026-09-22-energiegemeinschaften.md` (Global Constraints apply unchanged: no comments, no `leading-*`, no em dash, `text-base` minimum, no commits, staged only, German copy rules).

## Interfaces added

`src/data/energiegemeinschaften-scene.json` gains per zone:

```json
"labels": [ { "id": "hak", "anchor": [x, y, z] }, ... ]
```

Label ids per zone: zev `hak`, `pv`; vzev `verteilkabine`, `meter`, `pv`; leg `trafo`, `meter`, `pv`, `netz`; praxismodell `vnbmeter`, `pv`. Anchors in glTF space like the zone anchors.

`src/lib/ratgeber/scene-zones.ts` gains:

```ts
export type SceneStepId = 'production' | 'distribution' | 'grid'
export const SCENE_STEP_IDS: readonly SceneStepId[] = ['production', 'distribution', 'grid']
export const PULSE_MATERIALS: Record<SceneStepId, string> = { production: 'pulse_production', distribution: 'pulse_distribution', grid: 'pulse_grid' }
export interface SceneLabelConfig { id: string; anchor: [number, number, number] }
export interface SceneZoneConfig { anchor; target; orbit; labels: SceneLabelConfig[] }
```

`src/data/energiegemeinschaften.ts` gains on `SceneZoneCopy`:

```ts
labels: Record<string, string>                      // label id to German text
steps: { id: SceneStepId; label: string; text: string }[]   // three per zone
```

and `CommunityScene` props gain `stepsTitle: string` and `allStepsLabel: string`.

---

### Task 1: Scene v2 in Blender

**Files:**
- Modify: `scripts/3d/energiegemeinschaften/build_scene.py`
- Modify: `scripts/3d/energiegemeinschaften/check-glb.mjs`
- Modify: `src/data/__tests__/energiegemeinschaften-scene.test.ts`
- Regenerates: GLB, JSON, five WebP renders

- [ ] **Step 1: Extend the JSON test first**

Add to the scene test: every zone has `labels` with at least two entries, each with a string `id` and a 3-number `anchor`, and the ids per zone are exactly those listed under Interfaces. Run it, expect failure.

- [ ] **Step 2: Look fixes**

In `build_scene.py`:
- Trees: default `r=1.4` becomes `2.6`, trunk box `(0.5, 0.5, 1.4)` becomes `(0.7, 0.7, 2.2)` and the crown sits at `loc.z + 2.2 + r * 0.8`. The per-call radii in the island builders scale the same way (`1.2` to `2.4`, `1.5` to `2.8`, `1.3` to `2.5`).
- Flow lines: `line()` default `width=0.5` becomes `0.9`, cross-island lines `width=0.7` become `1.3`. Material `flow` base colour `COLORS['lime']`, emission `lime`, strength 0.9. Cross-island lines get their own material `grid_line` `#9aa19c`, roughness 0.9, no emission (public grid).
- Roads: `COLORS['road']` becomes `#c3c7be`.
- Cabinets: `zev_hak` size `(2.6, 1.8, 2.6)`, `vzev_verteilkabine` `(2.8, 1.6, 2.4)`, `praxis_vnb_meter` `(2.4, 1.6, 2.6)`, `leg_trafo` `(4.5, 3.6, 3.6)`. Their flow-line endpoints stay where they are.
- Praxismodell MFH: `balcony_side=1` becomes `-1`.
- EFH panels on the slope: replace the `panels(...)` call inside `efh()` with a new helper

```python
def panels_on_slope(name, ridge_x, eave_x, y_centre, z_eave, z_ridge, nx, ny):
    ang = math.atan2(z_ridge - z_eave, abs(ridge_x - eave_x))
    direction = 1.0 if eave_x < ridge_x else -1.0
    mid_x = (ridge_x + eave_x) / 2.0
    mid_z = (z_ridge + z_eave) / 2.0
    grid_w = nx * 1.7 * 1.06
    grid_d = ny * 1.1 * 1.08
    frame, cell = panels(name, (0.0, 0.0, 0.0), nx, ny)
    for o in (frame, cell):
        o.location = (0.0, 0.0, 0.0)
    holder = bpy.data.objects.new(name + '_holder', None)
    link_obj(holder)
    holder.location = (mid_x, y_centre, mid_z + 0.12)
    holder.rotation_euler = (0.0, -direction * ang, 0.0)
    for o in (frame, cell):
        o.parent = holder
        o.location = (-grid_w / 2.0, -grid_d / 2.0, 0.0)
    return frame, cell
```

  and in `efh()` call `panels_on_slope(name + '_pv', ridge_x=loc[0], eave_x=loc[0] - (w + 0.8) / 2.0, y_centre=loc[1], z_eave=loc[2] + h, z_ridge=loc[2] + h + roof_h, nx=2, ny=int(d // 1.2))`. Verify in the preview render that the grid lies flat on the west slope of each EFH. If it sits above or below the roof, adjust the `+ 0.12` offset, if it tilts the wrong way flip `direction`.

- [ ] **Step 3: Pulses by meaning and the grid feed**

- Replace the single `pulse` material with three: `pulse_production` (lime, emission lime, strength 4.0), `pulse_distribution` (lime-soft `#cdea67`, emission lime-soft, strength 3.0), `pulse_grid` (`#5b7fa6`, emission `#5b7fa6`, strength 2.5). `pulses()` takes the material as today.
- Stage assignment: roof to cabinet paths use `pulse_production` (zev_a, zev_b, vzev_a, vzev_c, leg_hall, leg_office, praxis). Cabinet to units and cross-island solar paths use `pulse_distribution` (zev_c, vzev_b, leg_zev, leg_praxis, leg_vzev).
- Grid feed: add a `netz` substation box `(5.0, 4.0, 4.0)` at `(62.0, 44.0)` with material `primary`, a `grid_line` from `(62, 44, 0)` to `(12, 44, 0)` (the LEG trafo), and `pulses('netz', [(62, 44, 0.0), (12, 44, 0.0)], 3, pulse_grid)`. Also one grid pulse stream each from the trafo to the ZEV Hausanschluss and the vZEV Verteilkabine along the existing cross-island paths, 2 pulses each, `pulse_grid`, radius 0.42 (the `pulses()` radius stays 0.42, the solar cross-island streams get radius 0.6: add a `radius` parameter to `pulses()` defaulting to 0.42).
- Cross-island lines change to the `grid_line` material (Step 2).

- [ ] **Step 4: Labels in the JSON**

Add to `write_json()` a `labels` list per zone with glTF-space anchors 2.5 m above the object tops:

```
zev:           hak at zev_hak top, pv at the zev_mfh_b roof centre
vzev:          verteilkabine at vzev_verteilkabine top, meter at the vzev_efh_a facade midpoint, pv at the vzev_efh_a roof ridge
leg:           trafo at leg_trafo top, meter at the leg_office facade midpoint, pv at the hall roof centre, netz at the netz box top
praxismodell:  vnbmeter at praxis_vnb_meter top, pv at the praxis_mfh roof centre
```

Compute from the objects' bounding boxes (`obj.location` plus half the size) so a later resize moves the label with it.

- [ ] **Step 5: Draco**

In `export_glb()` add `export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6`. `check-glb.mjs` keeps its checks and additionally asserts `extensionsRequired` contains `KHR_draco_mesh_compression`. Size gate in both places drops to 700 kB.

- [ ] **Step 6: Build, check, test, preview**

Same commands as the first plan's Task 1 Step 5 to 7. Preview PNG to the scratchpad. Materials required by the checker now: the four `island_*` plus `pulse_production`, `pulse_distribution`, `pulse_grid`.

- [ ] **Step 7: Stage**

```bash
git add scripts/3d/energiegemeinschaften public/3d public/ratgeber src/data/energiegemeinschaften-scene.json src/data/__tests__/energiegemeinschaften-scene.test.ts
```

---

### Task 2: Types and copy

**Files:**
- Modify: `src/lib/ratgeber/scene-zones.ts` (types and constants from Interfaces)
- Modify: `src/data/energiegemeinschaften.ts` (`SceneZoneCopy` fields and content)
- Modify: `src/data/__tests__/energiegemeinschaften.test.ts`

- [ ] **Step 1: Test** Add: every `SCENE_ZONE_COPY` entry has exactly three steps with ids production, distribution, grid in that order, and `labels` covering exactly the ids listed under Interfaces for that zone. Run, expect failure.

- [ ] **Step 2: Types** as under Interfaces. `SceneZoneConfig.labels` is required.

- [ ] **Step 3: Copy** Add to each `SCENE_ZONE_COPY` entry:

zev
```ts
labels: { hak: 'Hausanschluss', pv: 'PV-Anlage' },
steps: [
  { id: 'production', label: 'Produktion', text: 'Die Anlage auf dem Dach liefert Solarstrom in die private Hausverteilung. Der Netzbetreiber sieht davon nichts.' },
  { id: 'distribution', label: 'Verteilung', text: 'Private Zähler messen jede Wohnung. Der ZEV rechnet den Solarstrom intern ab, ohne Netzkosten.' },
  { id: 'grid', label: 'Netzbezug', text: 'Was fehlt, kommt über den einen Hausanschluss aus dem Netz und wird 1:1 weitergegeben.' },
],
```
vzev
```ts
labels: { verteilkabine: 'Verteilkabine', meter: 'Smart Meter VNB', pv: 'PV-Anlage' },
steps: [
  { id: 'production', label: 'Produktion', text: 'Ein Dach produziert, die Nachbargebäude hängen an derselben Verteilkabine.' },
  { id: 'distribution', label: 'Verteilung', text: 'Der Solarstrom fliesst über die Anschlussleitungen zu den Nachbarn. Die Smart Meter des Netzbetreibers messen, ohne Netzkosten auf dem geteilten Strom.' },
  { id: 'grid', label: 'Netzbezug', text: 'Den Rest liefert der Netzbetreiber als Sammelrechnung an den vZEV.' },
],
```
leg
```ts
labels: { trafo: 'Trafostation', meter: 'Smart Meter VNB', pv: 'PV-Anlage', netz: 'Netz' },
steps: [
  { id: 'production', label: 'Produktion', text: 'Halle und Bürogebäude produzieren mehr, als sie brauchen.' },
  { id: 'distribution', label: 'Verteilung', text: 'Der Überschuss geht über das öffentliche Netz an die anderen Gebäude der Gemeinde. Auf diesem Anteil sinkt der Netznutzungstarif um 40 Prozent.' },
  { id: 'grid', label: 'Netzbezug', text: 'Reststrom kommt vom Netzbetreiber. Er misst alles, ordnet die internen Flüsse zu und stellt Netz und Reststrom in Rechnung.' },
],
```
praxismodell
```ts
labels: { vnbmeter: 'Zähler VNB', pv: 'PV-Anlage' },
steps: [
  { id: 'production', label: 'Produktion', text: 'Die Anlage auf dem Mehrfamilienhaus produziert für die Mieterschaft.' },
  { id: 'distribution', label: 'Verteilung', text: 'Die Zähler des Netzbetreibers bleiben. Er rechnet den Solaranteil auf seiner Rechnung ab, die Mieter bleiben seine Kunden.' },
  { id: 'grid', label: 'Netzbezug', text: 'Netzstrom und Solarstrom stehen auf derselben Rechnung, Netzkosten nur auf dem Netzanteil.' },
],
```

- [ ] **Step 4:** `npx vitest run src/data/__tests__/energiegemeinschaften.test.ts`, `npx tsc --noEmit` (errors only in `CommunityScene.tsx` until Task 3 are acceptable), stage the three files.

---

### Task 3: Viewer v2

**Files:**
- Modify: `src/components/ratgeber/CommunityScene.tsx`
- Modify: `src/app/[locale]/ratgeber/energiegemeinschaften/page.tsx` (pass `stepsTitle="Schritt für Schritt"` and `allStepsLabel="Alle Flüsse"`)

- [ ] **Step 1: Focus mode** When `active` is set, every island material except `island_<active>` gets base colour `[0.86, 0.87, 0.85, 1]`, the active one keeps its original. On reset all originals are restored. Reuse the `originals` map, capture on first touch. Hover tint keeps working on top and restores to the dimmed colour, not white, while a zone is active.

- [ ] **Step 2: Labels** For the active zone, render one hotspot per `scene.zones[active].labels` entry: `<div slot={`hotspot-label-${active}-${id}`} data-position data-normal="0 1 0">` containing a dark pill (`bg-[#062E25] text-white text-base px-3 py-1 rounded-full shadow`) with `SCENE_ZONE_COPY` label text passed through the `zones` prop (extend `SceneZoneContent` with `labels` and `steps`). Not interactive, `aria-hidden`.

- [ ] **Step 3: Steps** In the panel, under the summary, a row of four chips: `allStepsLabel` plus the zone's three steps. State `step: SceneStepId | null`. Selecting a step sets the alpha of the other two pulse materials to 0 and the selected one to 1 through `material.setAlphaMode('BLEND')` once and `pbrMetallicRoughness.setBaseColorFactor([r, g, b, alpha])`, using the material's original factor for r, g, b. `null` restores all three to alpha 1. Below the chips show the selected step's `text` (text-base). Closing the panel or switching zones resets `step` to null and restores alphas. If `setAlphaMode` is missing on the ambient type, add it to `ModelViewerMaterial` in `src/types/model-viewer.d.ts` (it exists in model-viewer 4.3.1: `setAlphaMode(alphaMode: 'OPAQUE' | 'MASK' | 'BLEND')`).

- [ ] **Step 4:** `npx tsc --noEmit`, `npx next lint --file` on both files, stage.

---

### Task 4: Verification

Same gates as the first plan's Task 12 Steps 1 and 2 (tsc, lint, tests, greps, build) plus GLB size under 700 kB and the browser check by the controller: EFH panels on the slope, pulses in three colours with grey grid lines between islands, click a zone dims the others and shows its labels, step chips fade pulses and show the step text, "Alle Flüsse" restores, Übersicht restores islands. Renders on the model pages still fine.
