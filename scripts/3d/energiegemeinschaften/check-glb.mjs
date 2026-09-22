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
for (const id of ['pulse_production', 'pulse_distribution', 'pulse_grid']) {
  if (!materials.has(id)) problems.push(`material ${id} missing`)
}
const nodes = new Set((json.nodes ?? []).map(n => n.name))
for (const id of ['zev', 'vzev', 'leg', 'praxismodell']) {
  if (!nodes.has(`anchor_${id}`)) problems.push(`node anchor_${id} missing`)
}

const extensionsRequired = json.extensionsRequired ?? []
if (!extensionsRequired.includes('KHR_draco_mesh_compression')) problems.push('extensionsRequired missing KHR_draco_mesh_compression')

const bytes = statSync(file).size
console.log('size bytes:', bytes)
if (bytes > 700_000) problems.push(`GLB is ${bytes} bytes, limit 700000`)

if (problems.length) {
  for (const p of problems) console.error('FAIL', p)
  process.exit(1)
}
console.log('OK')
