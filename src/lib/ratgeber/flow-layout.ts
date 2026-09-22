export type FlowNodeKind =
  | 'pv'
  | 'meter'
  | 'unit'
  | 'grid'
  | 'cabinet'
  | 'vnb'
  | 'battery'

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
  internal: boolean
}

export interface FlowSpec {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export function edgePath(
  a: { x: number; y: number },
  b: { x: number; y: number }
): string {
  const parts = [`M ${a.x} ${a.y}`]
  if (a.x !== b.x) parts.push(`H ${b.x}`)
  if (a.y !== b.y) parts.push(`V ${b.y}`)
  return parts.join(' ')
}
