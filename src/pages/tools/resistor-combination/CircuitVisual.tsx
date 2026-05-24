import { formatValue } from "./combinationUtils"

interface Props {
  topology: string
  resistors: number[]
}

interface Layout {
  res: { x: number; y: number }[]
  wires: string[]
}

const LW = 10
const RW = 310

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
  const lx = x - 18
  const rx = x + 18
  return {
    res: ys.map((y) => ({ x, y })),
    wires: [
      `M ${LW},90 L ${lx},90 L ${lx},${minY - 7}`,
      `M ${lx},${maxY + 7} L ${lx},${minY - 7}`,
      `M ${rx},${minY - 7} L ${rx},${maxY + 7}`,
      `M ${rx},${maxY + 7} L ${rx},90 L ${RW},90`,
      ...ys.map((y) => `M ${lx},${y} L ${rx},${y}`),
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
      `M ${ll},${leftMaxY + 7} L ${ll},${leftMinY - 7}`,
      `M ${lr},${leftMinY - 7} L ${lr},${leftMaxY + 7}`,
      `M ${lr},${leftMaxY + 7} L ${lr},90 L ${rl},90 L ${rl},${rightMinY - 7}`,
      `M ${rl},${rightMaxY + 7} L ${rl},${rightMinY - 7}`,
      `M ${rr},${rightMinY - 7} L ${rr},${rightMaxY + 7}`,
      `M ${rr},${rightMaxY + 7} L ${rr},90 L ${RW},90`,
      ...left.ys.map((y) => `M ${ll},${y} L ${lr},${y}`),
      ...right.ys.map((y) => `M ${rl},${y} L ${rr},${y}`),
    ],
  }
}

function spLayout(
  t: { x1: number; x2: number; y: number },
  bottom: { x: number; y: number },
): Layout {
  const topL = t.x1 - 18
  const topR = t.x2 + 18
  const lr = t.x1 + 18
  const rl = t.x2 - 18
  const bL = bottom.x - 18
  const bR = bottom.x + 18
  return {
    res: [
      { x: t.x1, y: t.y },
      { x: t.x2, y: t.y },
      { x: bottom.x, y: bottom.y },
    ],
    wires: [
      `M ${LW},90 L ${topL},90 L ${topL},${bottom.y + 7}`,
      `M ${topL},${bottom.y + 7} L ${topL},${t.y - 7}`,
      `M ${topL},${bottom.y} L ${bL},${bottom.y}`,
      `M ${lr},${t.y} L ${rl},${t.y}`,
      `M ${topR},${t.y - 7} L ${topR},${bottom.y + 7}`,
      `M ${topR},${bottom.y + 7} L ${topR},90 L ${RW},90`,
      `M ${bR},${bottom.y} L ${topR},${bottom.y}`,
      `M ${topL},${t.y} L ${lr},${t.y}`,
      `M ${rl},${t.y} L ${topR},${t.y}`,
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
  const rL = right.x - 18
  const rR = right.x + 18
  return {
    res: [
      ...left.ys.map((y) => ({ x: left.x, y })),
      { x: right.x, y: right.y },
    ],
    wires: [
      `M ${LW},90 L ${ll},90 L ${ll},${minY - 7}`,
      `M ${ll},${maxY + 7} L ${ll},${minY - 7}`,
      `M ${lr},${minY - 7} L ${lr},${maxY + 7}`,
      `M ${lr},${maxY + 7} L ${lr},90 L ${rL},${right.y}`,
      `M ${rR},${right.y} L ${RW},90`,
      ...left.ys.map((y) => `M ${ll},${y} L ${lr},${y}`),
      `M ${rL},${right.y} L ${rR},${right.y}`,
    ],
  }
}

function tspLayout(
  t3: { x1: number; x2: number; x3: number; y: number },
  bottom: { x: number; y: number },
): Layout {
  const topL = t3.x1 - 18
  const topR = t3.x3 + 18
  const lr1 = t3.x1 + 18
  const rl2 = t3.x2 - 18
  const lr2 = t3.x2 + 18
  const rl3 = t3.x3 - 18
  const bL = bottom.x - 18
  const bR = bottom.x + 18
  return {
    res: [
      { x: t3.x1, y: t3.y },
      { x: t3.x2, y: t3.y },
      { x: t3.x3, y: t3.y },
      { x: bottom.x, y: bottom.y },
    ],
    wires: [
      `M ${LW},90 L ${topL},90 L ${topL},${bottom.y + 7}`,
      `M ${topL},${bottom.y + 7} L ${topL},${t3.y - 7}`,
      `M ${topL},${bottom.y} L ${bL},${bottom.y}`,
      `M ${lr1},${t3.y} L ${rl2},${t3.y}`,
      `M ${lr2},${t3.y} L ${rl3},${t3.y}`,
      `M ${topR},${t3.y - 7} L ${topR},${bottom.y + 7}`,
      `M ${topR},${bottom.y + 7} L ${topR},90 L ${RW},90`,
      `M ${bR},${bottom.y} L ${topR},${bottom.y}`,
      `M ${topL},${t3.y} L ${lr1},${t3.y}`,
      `M ${rl2},${t3.y} L ${lr2},${t3.y}`,
      `M ${rl3},${t3.y} L ${topR},${t3.y}`,
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
  const rL = right.x - 18
  const rR = right.x + 18
  return {
    res: [
      ...left.ys.map((y) => ({ x: left.x, y })),
      { x: right.x, y: right.y },
    ],
    wires: [
      `M ${LW},90 L ${ll},90 L ${ll},${minY - 7}`,
      `M ${ll},${maxY + 7} L ${ll},${minY - 7}`,
      `M ${lr},${minY - 7} L ${lr},${maxY + 7}`,
      `M ${lr},${maxY + 7} L ${lr},90 L ${rL},${right.y}`,
      `M ${rR},${right.y} L ${RW},90`,
      ...left.ys.map((y) => `M ${ll},${y} L ${lr},${y}`),
      `M ${rL},${right.y} L ${rR},${right.y}`,
    ],
  }
}

function getLayout(topology: string): Layout {
  switch (topology) {
    case "single":
      return seriesLayout([160], 90)
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
      return mixedLayout2({ x: 100, ys: [60, 120] }, { x: 230, ys: [60, 120] })
    case "tsp4":
      return tspLayout({ x1: 80, x2: 150, x3: 220, y: 60 }, { x: 150, y: 130 })
    case "tps4":
      return tpsLayout({ x: 110, ys: [50, 90, 130] }, { x: 230, y: 90 })
    default:
      return seriesLayout([85, 205])
  }
}

export default function CircuitVisual({ topology, resistors }: Props) {
  const layout = getLayout(topology)
  const f = (v: number) => formatValue(v)

  return (
    <svg viewBox="0 0 320 180" className="mx-auto w-full max-w-sm">
      {layout.wires.map((d, i) => (
        <path key={i} d={d} stroke="#4b5563" strokeWidth={1.8} fill="none" />
      ))}
      <circle cx={10} cy={90} r={3.5} fill="#4b5563" />
      <circle cx={310} cy={90} r={3.5} fill="#4b5563" />
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
      <text x={5} y={20} fontSize={9} fill="#9ca3af">IN</text>
      <text x={305} y={20} fontSize={9} textAnchor="end" fill="#9ca3af">OUT</text>
    </svg>
  )
}
