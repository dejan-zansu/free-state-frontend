import {
  edgePath,
  type FlowNodeKind,
  type FlowSpec,
} from '@/lib/ratgeber/flow-layout'

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

export default function FlowDiagram({ spec, title }: Props) {
  const byId = new Map(spec.nodes.map(n => [n.id, n]))
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 100 60"
        role="img"
        aria-label={title}
        className="h-auto w-full min-w-[560px] max-w-[720px]"
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
          <g
            key={node.id}
            transform={`translate(${node.x - 12} ${node.y - 4})`}
          >
            <rect
              width="24"
              height="8"
              rx="1.6"
              fill={FILL[node.kind]}
              stroke="#062e25"
              strokeOpacity="0.15"
              strokeWidth="0.3"
            />
            <text
              x="12"
              y="5.2"
              textAnchor="middle"
              fontSize="3"
              fontFamily="inherit"
              fontWeight="600"
              fill={TEXT[node.kind]}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
