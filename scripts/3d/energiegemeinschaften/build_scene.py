import json
import math
import os
import sys

import bpy
import bmesh
from mathutils import Euler, Vector

FPS = 24
FRAMES = 144

COLORS = {
    'primary': '#062e25',
    'lime': '#b7fe1a',
    'lime_soft': '#cdea67',
    'panel': '#1f3a5f',
    'panel_frame': '#5b7396',
    'facade': '#e9e6dd',
    'facade_shade': '#d8d4c9',
    'ground': '#ffffff',
    'island': '#f4f4f0',
    'road': '#c3c7be',
    'foliage_a': '#5f8f3e',
    'foliage_b': '#7fae4f',
    'trunk': '#8a6b4a',
    'glass': '#9fc3d3',
    'truck': '#ededea',
    'truck_dark': '#3a3f44',
    'car': '#c9ced4',
}

ISLANDS = {
    'zev': ((-38.0, 26.0), (46.0, 40.0)),
    'vzev': ((-40.0, -26.0), (48.0, 36.0)),
    'leg': ((34.0, 20.0), (60.0, 46.0)),
    'praxismodell': ((32.0, -30.0), (44.0, 30.0)),
}
SLAB = 0.8


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


def action_fcurves(action):
    for layer in action.layers:
        for strip in layer.strips:
            for channelbag in strip.channelbags:
                for fc in channelbag.fcurves:
                    yield fc


def apply_scale(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def box(name, size, loc, material, bevel=0.0, rot_z=0.0):
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


def tree(name, loc, r=2.6, variant=0):
    trunk = box(name + '_trunk', (0.7, 0.7, 2.2), loc, mat('trunk', COLORS['trunk']))
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=r, location=(loc[0], loc[1], loc[2] + 2.2 + r * 0.8))
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


def efh(name, loc, w, d, h, roof_h, with_panels=True):
    body = box(name, (w, d, h), loc, mat('facade', COLORS['facade']), bevel=0.12)
    roof = prism(name + '_roof', w + 0.8, d + 0.8, roof_h, (loc[0], loc[1], loc[2] + h), mat('facade_shade', COLORS['facade_shade']))
    if with_panels:
        panels_on_slope(name + '_pv', ridge_x=loc[0], eave_x=loc[0] - (w + 0.8) / 2.0, y_centre=loc[1],
                         z_eave=loc[2] + h, z_ridge=loc[2] + h + roof_h, nx=2, ny=int(d // 1.2))
    return body, roof


def line(name, points, material, width=0.9, z=0.03):
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


def pulses(name, points, count, material, z=0.45, radius=0.42):
    at = path_sampler(points)
    for k in range(count):
        phase = k / float(count)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=radius, location=(0, 0, 0))
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
        for fc in action_fcurves(o.animation_data.action):
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'


def build_islands():
    for zid, (c, s) in ISLANDS.items():
        slab('island_' + zid, s, (c[0], c[1]), mat('island_' + zid, COLORS['island'], 0.9))
    ground = box('ground', (150.0, 120.0, 0.2), (0.0, 0.0, -SLAB - 0.2), mat('ground_plane', COLORS['ground'], 0.95))
    ground.hide_render = True
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
    box('zev_hak', (2.6, 1.8, 2.6), (-19.0, 12.0, 0.0), mat('primary', COLORS['primary'], 0.6))
    for i, (x, y) in enumerate([(-58, 42), (-24, 44), (-27, 22), (-56, 12), (-45, 44)]):
        tree('zev_tree_%d' % i, (x, y, 0.0), variant=i % 2)
    line('zev_flow', [(-52, 32, 15.2), (-52, 24, 15.2), (-52, 24, 0.0), (-52, 12, 0.0), (-19, 12, 0.0)],
         mat('flow', COLORS['lime'], 0.5, emission=COLORS['lime'], strength=0.9))
    line('zev_flow_b', [(-33, 36, 18.2), (-33, 28, 18.2), (-33, 28, 0.0), (-33, 12, 0.0), (-19, 12, 0.0)], MATS['flow'])
    line('zev_flow_c', [(-40, 16, 13.2), (-40, 12, 13.2), (-40, 12, 0.0), (-19, 12, 0.0)], MATS['flow'])
    pulse_production = mat('pulse_production', COLORS['lime'], 0.3, emission=COLORS['lime'], strength=4.0)
    pulse_distribution = mat('pulse_distribution', COLORS['lime_soft'], 0.3, emission=COLORS['lime_soft'], strength=3.0)
    mat('pulse_grid', '#5b7fa6', 0.3, emission='#5b7fa6', strength=2.5)
    pulses('zev_a', [(-52, 32, 15.2), (-52, 24, 15.2), (-52, 24, 0.0), (-52, 12, 0.0), (-19, 12, 0.0)], 3, pulse_production)
    pulses('zev_b', [(-33, 36, 18.2), (-33, 28, 18.2), (-33, 28, 0.0), (-33, 12, 0.0), (-19, 12, 0.0)], 3, pulse_production)
    pulses('zev_c', [(-19, 12, 0.0), (-40, 12, 0.0), (-40, 16, 0.0)], 2, pulse_distribution)


def build_vzev():
    road = MATS['road']
    box('vzev_road', (3.0, 30.0, 0.04), (-18.0, -26.0, 0.0), road)
    efh('vzev_efh_a', (-54.0, -18.0, 0.0), 9.0, 10.0, 6.5, 3.0)
    efh('vzev_efh_b', (-38.0, -33.0, 0.0), 9.0, 10.0, 6.5, 3.0, with_panels=False)
    efh('vzev_efh_c', (-28.0, -16.0, 0.0), 8.0, 9.0, 6.0, 2.8)
    box('vzev_carport', (5.0, 5.5, 0.15), (-45.0, -30.0, 2.4), mat('facade_shade', COLORS['facade_shade']))
    for i, (x, y) in enumerate([(-46, -12), (-46, -24), (-32, -26)]):
        box('vzev_hedge_%d' % i, (0.9, 10.0, 1.1), (x, y, 0.0), mat('foliage_0', COLORS['foliage_a']))
    box('vzev_verteilkabine', (2.8, 1.6, 2.4), (-18.0, -40.0, 0.0), MATS['primary'])
    for i, (x, y) in enumerate([(-60, -36), (-24, -40), (-60, -8), (-30, -8)]):
        tree('vzev_tree_%d' % i, (x, y, 0.0), r=2.4, variant=i % 2)
    flow = MATS['flow']
    line('vzev_flow_a', [(-54, -18, 9.6), (-54, -24, 9.6), (-54, -24, 0.0), (-54, -40, 0.0), (-18, -40, 0.0)], flow)
    line('vzev_flow_c', [(-28, -16, 9.0), (-28, -22, 9.0), (-28, -22, 0.0), (-28, -40, 0.0), (-18, -40, 0.0)], flow)
    line('vzev_flow_b', [(-18, -40, 0.0), (-38, -40, 0.0), (-38, -33, 0.0)], flow)
    pulse_production = MATS['pulse_production']
    pulse_distribution = MATS['pulse_distribution']
    pulses('vzev_a', [(-54, -18, 9.6), (-54, -24, 9.6), (-54, -24, 0.0), (-54, -40, 0.0), (-18, -40, 0.0)], 3, pulse_production)
    pulses('vzev_c', [(-28, -16, 9.0), (-28, -22, 9.0), (-28, -22, 0.0), (-28, -40, 0.0), (-18, -40, 0.0)], 2, pulse_production)
    pulses('vzev_b', [(-18, -40, 0.0), (-38, -40, 0.0), (-38, -33, 0.0)], 2, pulse_distribution)


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
    box('leg_trafo', (4.5, 3.6, 3.6), (12.0, 44.0, 0.0), MATS['primary'])
    box('netz', (5.0, 4.0, 4.0), (62.0, 44.0, 0.0), MATS['primary'])
    box('leg_silo_a', (2.4, 2.4, 11.0), (46.0, 30.0, 0.0), mat('facade_shade', COLORS['facade_shade']))
    box('leg_silo_b', (2.4, 2.4, 11.0), (50.0, 30.0, 0.0), MATS['facade_shade'])
    for i, (x, y) in enumerate([(6, 30), (60, 26), (58, -2), (8, -2)]):
        tree('leg_tree_%d' % i, (x, y, 0.0), r=2.8, variant=i % 2)
    flow = MATS['flow']
    grid_line = mat('grid_line', '#9aa19c', 0.9)
    line('leg_flow_hall', [(24, 26, 12.4), (24, 36, 12.4), (24, 36, 0.0), (24, 44, 0.0), (12, 44, 0.0)], flow)
    line('leg_flow_office', [(52, 10, 12.2), (52, 18, 12.2), (52, 18, 0.0), (52, 44, 0.0), (12, 44, 0.0)], flow)
    line('leg_flow_to_zev', [(12, 44, 0.0), (0, 44, -SLAB), (0, 12, -SLAB), (-19, 12, 0.0)], grid_line, width=1.3)
    line('leg_flow_to_praxis', [(12, 44, 0.0), (4, 44, -SLAB), (4, -20, -SLAB), (22, -20, 0.0)], grid_line, width=1.3)
    line('leg_flow_to_vzev', [(4, -20, -SLAB), (4, -44, -SLAB), (-18, -44, -SLAB), (-18, -40, 0.0)], grid_line, width=1.3)
    line('netz_flow', [(62, 44, 0.0), (12, 44, 0.0)], grid_line, width=1.3)
    pulse_production = MATS['pulse_production']
    pulse_distribution = MATS['pulse_distribution']
    pulse_grid = MATS['pulse_grid']
    pulses('leg_hall', [(24, 26, 12.4), (24, 36, 12.4), (24, 36, 0.0), (24, 44, 0.0), (12, 44, 0.0)], 3, pulse_production)
    pulses('leg_office', [(52, 10, 12.2), (52, 18, 12.2), (52, 18, 0.0), (52, 44, 0.0), (12, 44, 0.0)], 3, pulse_production)
    pulses('leg_zev', [(12, 44, 0.0), (0, 44, -SLAB), (0, 12, -SLAB), (-19, 12, 0.0)], 4, pulse_distribution, radius=0.6)
    pulses('leg_praxis', [(12, 44, 0.0), (4, 44, -SLAB), (4, -20, -SLAB), (22, -20, 0.0)], 4, pulse_distribution, radius=0.6)
    pulses('leg_vzev', [(4, -20, -SLAB), (4, -44, -SLAB), (-18, -44, -SLAB), (-18, -40, 0.0)], 3, pulse_distribution, radius=0.6)
    pulses('netz', [(62, 44, 0.0), (12, 44, 0.0)], 3, pulse_grid)
    pulses('leg_grid_zev', [(12, 44, 0.0), (0, 44, -SLAB), (0, 12, -SLAB), (-19, 12, 0.0)], 2, pulse_grid)
    pulses('leg_grid_vzev', [(12, 44, 0.0), (4, 44, -SLAB), (4, -20, -SLAB), (4, -44, -SLAB), (-18, -44, -SLAB), (-18, -40, 0.0)], 2, pulse_grid)


def build_praxismodell():
    box('praxis_road', (3.0, 26.0, 0.04), (14.0, -30.0, 0.0), MATS['road'])
    mfh('praxis_mfh', (34.0, -30.0, 0.0), 14.0, 18.0, 15.0, 5, balcony_side=-1)
    panels('praxis_pv', (28.0, -38.5, 15.05), 6, 9)
    box('praxis_vnb_meter', (2.4, 1.6, 2.6), (22.0, -20.0, 0.0), mat('lime_solid', COLORS['lime'], 0.5, emission=COLORS['lime'], strength=0.8))
    for i, (x, y) in enumerate([(48, -40), (48, -18), (20, -42)]):
        tree('praxis_tree_%d' % i, (x, y, 0.0), r=2.5, variant=i % 2)
    line('praxis_flow', [(34, -30, 15.2), (34, -22, 15.2), (34, -22, 0.0), (22, -22, 0.0), (22, -20, 0.0)], MATS['flow'])
    pulses('praxis', [(34, -30, 15.2), (34, -22, 15.2), (34, -22, 0.0), (22, -22, 0.0), (22, -20, 0.0)], 3, MATS['pulse_production'])


def add_anchors():
    heights = {'zev': 24.0, 'vzev': 14.0, 'leg': 18.0, 'praxismodell': 21.0}
    for zid, (c, _) in ISLANDS.items():
        e = bpy.data.objects.new('anchor_' + zid, None)
        e.empty_display_size = 1.0
        e.location = (c[0], c[1], heights[zid])
        link_obj(e)


def gltf_coords(v):
    return [round(v[0], 2), round(v[2], 2), round(-v[1], 2)]


def bbox_top(name):
    o = bpy.data.objects[name]
    return Vector((o.location.x, o.location.y, o.location.z + o.dimensions.z / 2.0))


def facade_mid(name, face_dir=(0.0, -1.0)):
    o = bpy.data.objects[name]
    return Vector((o.location.x + face_dir[0] * o.dimensions.x / 2.0,
                   o.location.y + face_dir[1] * o.dimensions.y / 2.0,
                   o.location.z))


def roof_ridge(body_name, roof_name):
    body = bpy.data.objects[body_name]
    roof = bpy.data.objects[roof_name]
    return Vector((body.location.x, body.location.y, body.location.z + body.dimensions.z / 2.0 + roof.dimensions.z))


def label_anchor(point):
    return gltf_coords((point.x, point.y, point.z + 2.5))


ZONE_LABELS = {
    'zev': [
        ('hak', lambda: bbox_top('zev_hak')),
        ('pv', lambda: bbox_top('zev_mfh_b')),
    ],
    'vzev': [
        ('verteilkabine', lambda: bbox_top('vzev_verteilkabine')),
        ('meter', lambda: facade_mid('vzev_efh_a')),
        ('pv', lambda: roof_ridge('vzev_efh_a', 'vzev_efh_a_roof')),
    ],
    'leg': [
        ('trafo', lambda: bbox_top('leg_trafo')),
        ('meter', lambda: facade_mid('leg_office')),
        ('pv', lambda: bbox_top('leg_hall')),
        ('netz', lambda: bbox_top('netz')),
    ],
    'praxismodell': [
        ('vnbmeter', lambda: bbox_top('praxis_vnb_meter')),
        ('pv', lambda: bbox_top('praxis_mfh')),
    ],
}


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
            'labels': [{'id': lid, 'anchor': label_anchor(fn())} for lid, fn in ZONE_LABELS[zid]],
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
    sc.view_settings.exposure = 0.0
    world = bpy.data.worlds.new('World')
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (1.0, 1.0, 1.0, 1.0)
    bg.inputs['Strength'].default_value = 0.6
    sc.world = world
    sun_data = bpy.data.lights.new('sun', 'SUN')
    sun_data.energy = 2.2
    sun_data.angle = math.radians(6.0)
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
    sc.render.film_transparent = True
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = fmt
    sc.render.image_settings.color_mode = 'RGBA'
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
        export_anim_scene_split_object=False,
        export_yup=True,
        export_materials='EXPORT',
        export_image_format='NONE',
        export_lights=False,
        export_cameras=False,
        export_extras=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
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

    body_count = len([o for o in bpy.data.objects if o.name.startswith(('zev_mfh', 'vzev_efh', 'leg_hall', 'praxis_mfh'))])
    print('body count:', body_count)
    if body_count < 6:
        raise SystemExit('body count too low, check that box() sets materials')

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
    if size > 700_000:
        raise SystemExit('GLB over 700 kB, reduce geometry')


if __name__ == '__main__':
    main()
