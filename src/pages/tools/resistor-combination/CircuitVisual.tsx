import { formatValue } from "./combinationUtils"

interface Props {
  topology: string
  resistors: number[]
}

/* ---- Layout definitions ---- */

interface Layout {
  res: { x: number; y: number }[]
  wires: string[]
}

const LW = 10 // left wire edge
const RW = 310 // right wire edge

function seriesLayout(xs: number[], y = 90): Layout {
  return {
    res: xs.map((x) => ({ x, y })),
    wires: [
      `M ${LW},${y} L ${xs[0] - 18},${y}`,
      ...xs.slice(0, -1).map((x, i) => `M ${x + 18},${y} L ${xs[i + 1] - 18},${y}`),
      `M ${xs[xs.length - 1] + 18},${y} L ${RW},${y}`,
    ],
  }
}

function parLayout(x: number, ys: number[]): Layout {
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const leftX = x - 18
  const rightX = x + 18
  return {
    res: ys.map((y) => ({ x, y })),
    wires: [
      `M ${LW},90 L ${leftX},90 L ${leftX},${minY - 7}`,
      `M ${leftX},${maxY + 7} L ${leftX},90 L ${RW},90`,
      ...ys.map((y) => `M ${leftX},${y} L ${rightX},${y}`),
    ],
  }
}

function mixedLayout2(
  left: { x: number; ys: number[] },
  right: { x: number; ys: number[] },
): Layout {
  const leftMinY = Math.min(...left.ys)
  const leftMaxY = Math.max(...left.ys)
  const rightMinY = Math.min(...right.ys)
  const rightMaxY = Math.max(...right.ys)
  const ll = left.x - 18
  const lr = left.x + 18
  const rl = right.x - 18
  const rr = right.x + 18
  return {
    res: [
      ...left.ys.map((y) => ({ x: left.x, y })),
      ...right.ys.map((y) => ({ x: right.x, y })),
    ],
    wires: [
      `M ${LW},90 L ${ll},90 L ${ll},${leftMinY - 7}`,
      `M ${ll},${leftMaxY + 7} L ${ll},90 L ${rl},90 L ${rl},${rightMinY - 7}`,
      `M ${rl},${rightMaxY + 7} L ${rl},90 L ${RW},90`,
      ...left.ys.map((y) => `M ${ll},${y} L ${lr},${y}`),
      ...right.ys.map((y) => `M ${rl},${y} L ${rr},${y}`),
    ],
  }
}

function spLayout(
  top: { x1: number; x2: number; y: number },
  bottom: { x: number; y: number },
): Layout {
  const topL = top.x1 - 18
  const topR = top.x2 + 18
  const midX = (topL + bottom.x) / 2
  const joinX = (topR + bottom.x + 18) / 2
  return {
    res: [
      { x: top.x1, y: top.y },
      { x: top.x2, y: top.y },
      { x: bottom.x, y: bottom.y },
    ],
    wires: [
      `M ${LW},90 L ${midX},90 L ${midX},${top.y} L ${topL},${top.y}`,
      `M ${midX},90 L ${midX},${bottom.y} L ${bottom.x - 18},${bottom.y}`,
      `M ${topR},${top.y} L ${topR},90 L ${RW},90`,
      `M ${bottom.x + 18},${bottom.y} L ${joinX},${bottom.y} L ${joinX},90 L ${RW},90`,
      `M ${top.x1 + 18},${top.y} L ${top.x2 - 18},${top.y}`,
    ],
  }
}

function psLayout(
  left: { x: number; ys: number[] },
  right: { x: number; y: number },
): Layout {
  const minY = Math.min(...left.ys)
  const maxY = Math.max(...left.ys)
  const ll = left.x - 18
  const lr = left.x + 18
  return {
    res: [
      ...left.ys.map((y) => ({ x: left.x, y })),
      { x: right.x, y: right.y },
    ],
    wires: [
      `M ${LW},90 L ${ll},90 L ${ll},${minY - 7}`,
      `M ${ll},${maxY + 7} L ${ll},90`,
      `M ${lr},${minY - 7} L ${lr},90 L ${right.x - 18},${right.y}`,
      `M ${lr},${maxY + 7} L ${lr},90`,
      `M ${right.x + 18},${right.y} L ${RW},90`,
      ...left.ys.map((y) => `M ${ll},${y} L ${lr},${y}`),
    ],
  }
}

function tspLayout(
  top3: { x1: number; x2: number; x3: number; y: number },
  bottom: { x: number; y: number },
): Layout {
  const topL = top3.x1 - 18
  const topR = top3.x3 + 18
  const midX = (topL + bottom.x) / 2
  return {
    res: [
      { x: top3.x1, y: top3.y },
      { x: top3.x2, y: top3.y },
      { x: top3.x3, y: top3.y },
      { x: bottom.x, y: bottom.y },
    ],
    wires: [
      `M ${LW},90 L ${midX},90 L ${midX},${top3.y} L ${topL},${top3.y}`,
      `M ${midX},90 L ${midX},${bottom.y} L ${bottom.x - 18},${bottom.y}`,
      `M ${topR},${top3.y} L ${topR},90 L ${RW},90`,
      `M ${bottom.x + 18},${bottom.y} L ${bottom.x + 18},90 L ${RW},90`,
      `M ${top3.x1 + 18},${top3.y} L ${top3.x2 - 18},${top3.y}`,
      `M ${top3.x2 + 18},${top3.y} L ${top3.x3 - 18},${top3.y}`,
    ],
  }
}

function tpsLayout(
  left: { x: number; ys: number[] },
  right: { x: number; y: number },
): Layout {
  const minY = Math.min(...left.ys)
  const maxY = Math.max(...left.ys)
  const ll = left.x - 18
  const lr = left.x + 18
  return {
    res: [
      ...left.ys.map((y) => ({ x: left.x, y })),
      { x: right.x, y: right.y },
    ],
    wires: [
      `M ${LW},90 L ${ll},90 L ${ll},${minY - 7}`,
      `M ${ll},${maxY + 7} L ${ll},90 L ${right.x - 18},${right.y}`,
      `M ${lr},${minY - 7} L ${lr},90`,
      `M ${lr},${maxY + 7} L ${lr},90`,
      `M ${right.x + 18},${right.y} L ${RW},90`,
      ...left.ys.map((y) => `M ${ll},${y} L ${lr},${y}`),
    ],
  }
}

function getLayout(topology: string): Layout {
  switch (topology) {
    case "series2":
      return seriesLayout([85, 205])
    case "series3":
      return seriesLayout([60, 140, 220])
    case "series4":
      return seriesLayout([45, 110, 175, 240])
    case "parallel2":
      return parLayout(160, [65, 115])
    case "parallel3":
      return parLayout(160, [50, 90, 130])
    case "parallel4":
      return parLayout(160, [40, 73, 107, 140])
    case "sp3":
      return spLayout({ x1: 100, x2: 200, y: 65 }, { x: 150, y: 130 })
    case "ps3":
      return psLayout({ x: 100, ys: [60, 120] }, { x: 220, y: 90 })
    case "sspp4":
      return mixedLayout2({ x: 110, ys: [60, 120] }, { x: 230, ys: [60, 120] })
    case "ppss4":
      return mixedLayout2({ x: 100, ys: [55, 95, 135] }, { x: 230, ys: [55, 95, 135] })
    case "tsp4":
      return tspLayout({ x1: 80, x2: 150, x3: 220, y: 60 }, { x: 150, y: 130 })
    case "tps4":
      return tpsLayout({ x: 110, ys: [50, 90, 130] }, { x: 230, y: 90 })
    default:
      return seriesLayout([85, 205])
  }
}

/* ---- SVG component ---- */
export default function CircuitVisual({ topology, resistors }: Props) {
  const layout = getLayout(topology)
  const f = (v: number) => formatValue(v)

  return (
    <svg viewBox="0 0 320 180" className="mx-auto w-full max-w-sm">
      {/* wires */}
      {layout.wires.map((d, i) => (
        <path key={i} d={d} stroke="#4b5563" strokeWidth={1.8} fill="none" />
      ))}
      {/* terminal dots */}
      <circle cx={10} cy={90} r={3.5} fill="#4b5563" />
      <circle cx={310} cy={90} r={3.5} fill="#4b5563" />
      {/* resistors */}
      {layout.res.map((r, i) => (
        <g key={i} transform={`translate(${r.x},${r.y})`}>
          <rect x={-18} y={-8} width={36} height={16} rx={2} fill="#1a1a1a" />
          <rect x={-18} y={-8} width={7} height={16} fill="#c0c0c0" />
          <rect x={11} y={-8} width={7} height={16} fill="#c0c0c0" />
          <text
            x={0}
            y={20}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize={8}
            fill="#6b7280"
          >
            {f(resistors[i] ?? 0)}
          </text>
        </g>
      ))}
      {/* labels */}
      <text x={5} y={20} fontSize={9} fill="#9ca3af">
        IN
      </text>
      <text x={305} y={20} fontSize={9} textAnchor="end" fill="#9ca3af">
        OUT
      </text>
    </svg>
  )
}
