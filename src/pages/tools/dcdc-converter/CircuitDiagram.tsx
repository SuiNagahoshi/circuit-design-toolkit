import { useMemo } from "react"
import { type CircuitResults, formatResistor, formatCapacitor, formatInductor, formatCurrent } from "./dcdcUtils"

interface Props {
  results: CircuitResults | null
}

const W = 1300, H = 670
const IC_W = 320, IC_H = 350
const IX = 420, IY = 120

const PIN = {
  VIN:  { x: IX,        y: IY + 60  },
  EN:   { x: IX,        y: IY + 150 },
  RT:   { x: IX,        y: IY + 270 },
  BST:  { x: IX + IC_W, y: IY + 60  },
  SW:   { x: IX + IC_W, y: IY + 150 },
  FB:   { x: IX + IC_W, y: IY + 230 },
  COMP: { x: IX + IC_W, y: IY + 300 },
  GND:  { x: IX + IC_W / 2, y: IY + IC_H },
}

const VIN_Y = PIN.VIN.y
const C1_X = 140
const EN_X = 270
const BST_X = 830
const VOUT_X = 1150
const VOUT_END = 1180
const RT_X = 300
const COMP_X = 870

function Wire({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
}

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={5} fill="#111827" />
}

function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke="#111827" strokeWidth={2.5} />
      <line x1={x - 8} y1={y + 8} x2={x + 8} y2={y + 8} stroke="#111827" strokeWidth={2.5} />
      <line x1={x - 4} y1={y + 16} x2={x + 4} y2={y + 16} stroke="#111827" strokeWidth={2.5} />
    </g>
  )
}

const RES_H = 36
const CAP_H = 24
const IND_W = 50
const IND_H = 20

function SMDResistor({ x, y, label, value }: { x: number; y: number; label: string; value: string | null }) {
  return (
    <g>
      <rect x={x - 7} y={y - RES_H / 2} width={14} height={RES_H} rx={2} fill="#2d2d2d" />
      <rect x={x - 7} y={y - RES_H / 2} width={14} height={6} rx={1} fill="#c0c0c0" />
      <rect x={x - 7} y={y + RES_H / 2 - 6} width={14} height={6} rx={1} fill="#c0c0c0" />
      <CL x={x + 16} y={y - 4} text={label} />
      {value && <SL x={x + 16} y={y + 10} text={value} />}
    </g>
  )
}

function SMDCap({ x, y, label, value }: { x: number; y: number; label: string; value: string | null }) {
  return (
    <g>
      <rect x={x - 6} y={y - CAP_H / 2} width={12} height={CAP_H} rx={1.5} fill="#E8C4A0" />
      <rect x={x - 6} y={y - CAP_H / 2} width={12} height={5} rx={1} fill="#c0c0c0" />
      <rect x={x - 6} y={y + CAP_H / 2 - 5} width={12} height={5} rx={1} fill="#c0c0c0" />
      <CL x={x + 14} y={y - 4} text={label} />
      {value && <SL x={x + 14} y={y + 10} text={value} />}
    </g>
  )
}

function SMDInductor({ x, y, label, value }: { x: number; y: number; label: string; value: string | null }) {
  return (
    <g>
      <rect x={x - IND_W / 2} y={y - IND_H / 2} width={IND_W} height={IND_H} rx={3} fill="#4a4a4a" />
      <rect x={x - IND_W / 2} y={y - IND_H / 2} width={5} height={IND_H} rx={1} fill="#c0c0c0" />
      <rect x={x + IND_W / 2 - 5} y={y - IND_H / 2} width={5} height={IND_H} rx={1} fill="#c0c0c0" />
      <text x={x} y={y - IND_H / 2 - 6} fontSize={16} fill="#111827" textAnchor="middle" fontWeight="bold">{label}</text>
      {value && <text x={x} y={y + IND_H / 2 + 14} fontSize={13} fill="#374151" textAnchor="middle">{value}</text>}
    </g>
  )
}

function CL({ x, y, text }: { x: number; y: number; text: string }) {
  return <text x={x} y={y} fontSize={16} fill="#111827" fontWeight="bold">{text}</text>
}

function SL({ x, y, text }: { x: number; y: number; text: string | null }) {
  if (text === null) return null
  return <text x={x} y={y} fontSize={13} fill="#374151">{text}</text>
}

export default function CircuitDiagram({ results }: Props) {
  const r = results
  const ann = useMemo(() => {
    if (!r) return null
    return {
      L: formatInductor(r.L),
      Cout: formatCapacitor(r.Cout),
      Cin: formatCapacitor(r.Cin),
      R1: formatResistor(r.R1),
      R2: formatResistor(r.R2),
      RT: formatResistor(r.RT * 1000),
      ILpeak: formatCurrent(r.ILpeak),
      D: (r.D * 100).toFixed(1) + "%",
      Vout: r.Vout.toFixed(1) + "V",
      Iout: r.Irms_ind.toFixed(2) + "A",
      Fsw: r.Fsw + "kHz",
      R5: typeof r.R5 === "number" ? formatResistor(r.R5) : null,
      C5: typeof r.C5 === "number" ? formatCapacitor(r.C5) : null,
      C6: typeof r.C6 === "number" ? formatCapacitor(r.C6) : null,
      R3: r.R3 !== "Open" ? formatResistor(r.R3 * 1000) : null,
      R4: r.R4 !== "Open" ? formatResistor(r.R4 * 1000) : null,
    }
  }, [r])

  const swY = PIN.SW.y
  const C4_X = 960
  const FB_X = 1030
  const C2_X = 1100
  const FB_Ymid = swY + 102

  // GND levels
  const GND_C1 = 420       // C1
  const GND_R4 = 470       // R4 (50px down from C1 GND)
  const GND_C4 = 430       // C4
  const GND_R2 = 560       // R2 (50px up from previous 510)
  const GND_C2 = 510       // C2
  const GND_RT = 610       // RT (50px down from 560)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-4xl">
        {/* ===== IC CHIP ===== */}
        <rect x={IX} y={IY} width={IC_W} height={IC_H} rx={12} fill="#e0f2fe" stroke="#0369a1" strokeWidth={3} />
        <text x={IX + IC_W / 2} y={IY + 150} textAnchor="middle" fontSize={52} fill="#111827" fontWeight="bold">AP64xx0</text>
        <text x={IX + IC_W / 2} y={IY + 215} textAnchor="middle" fontSize={18} fill="#374151">降圧DCDCコントローラ</text>

        {/* Pin labels INSIDE the chip */}
        <text x={IX + 16} y={PIN.VIN.y + 5} fontSize={14} fill="#111827" fontWeight="bold">2</text>
        <text x={IX + 30} y={PIN.VIN.y + 5} fontSize={15} fill="#111827">VIN</text>

        <text x={IX + 16} y={PIN.EN.y + 5} fontSize={14} fill="#111827" fontWeight="bold">3</text>
        <text x={IX + 30} y={PIN.EN.y + 5} fontSize={15} fill="#111827">EN</text>

        <text x={IX + 16} y={PIN.RT.y + 5} fontSize={14} fill="#111827" fontWeight="bold">4</text>
        <text x={IX + 30} y={PIN.RT.y + 5} fontSize={15} fill="#111827">RT/CLK</text>

        <text x={IX + IC_W - 16} y={PIN.BST.y + 5} fontSize={14} fill="#111827" textAnchor="end" fontWeight="bold">1</text>
        <text x={IX + IC_W - 16} y={PIN.BST.y + 23} fontSize={15} fill="#111827" textAnchor="end">BST</text>

        <text x={IX + IC_W - 16} y={PIN.SW.y + 5} fontSize={14} fill="#111827" textAnchor="end" fontWeight="bold">8</text>
        <text x={IX + IC_W - 16} y={PIN.SW.y + 23} fontSize={15} fill="#111827" textAnchor="end">SW</text>

        <text x={IX + IC_W - 16} y={PIN.FB.y + 5} fontSize={14} fill="#111827" textAnchor="end" fontWeight="bold">5</text>
        <text x={IX + IC_W - 16} y={PIN.FB.y + 23} fontSize={15} fill="#111827" textAnchor="end">FB</text>

        <text x={IX + IC_W - 16} y={PIN.COMP.y + 5} fontSize={14} fill="#111827" textAnchor="end" fontWeight="bold">6</text>
        <text x={IX + IC_W - 16} y={PIN.COMP.y + 23} fontSize={15} fill="#111827" textAnchor="end">COMP</text>

        <text x={PIN.GND.x} y={PIN.GND.y - 8} fontSize={14} fill="#111827" textAnchor="middle" fontWeight="bold">7 GND</text>
        <Wire x1={PIN.GND.x} y1={PIN.GND.y} x2={PIN.GND.x} y2={PIN.GND.y + 40} />
        <Gnd x={PIN.GND.x} y={PIN.GND.y + 40} />

        {/* ===== VIN SECTION ===== */}
        <text x={50} y={VIN_Y - 12} fontSize={16} fill="#111827" fontWeight="bold">VIN: 3.8V – 40V</text>

        <Wire x1={80} y1={VIN_Y} x2={PIN.VIN.x} y2={VIN_Y} />
        <Dot x={C1_X} y={VIN_Y} />
        <Dot x={EN_X} y={VIN_Y} />

        <Wire x1={PIN.VIN.x} y1={VIN_Y} x2={PIN.VIN.x} y2={PIN.VIN.y} />

        {/* C1 (Cin) */}
        <Wire x1={C1_X} y1={VIN_Y} x2={C1_X} y2={VIN_Y + 81 - CAP_H / 2} />
        <SMDCap x={C1_X} y={VIN_Y + 81} label="C1" value={ann?.Cin ?? null} />
        <Wire x1={C1_X} y1={VIN_Y + 81 + CAP_H / 2} x2={C1_X} y2={GND_C1} />
        <Gnd x={C1_X} y={GND_C1} />

        {/* EN DIVIDER (R3/R4) */}
        <Wire x1={EN_X} y1={VIN_Y} x2={EN_X} y2={VIN_Y + 42 - RES_H / 2} />
        <SMDResistor x={EN_X} y={VIN_Y + 42} label="R3" value={ann?.R3 ?? null} />
        <Wire x1={EN_X} y1={VIN_Y + 42 + RES_H / 2} x2={EN_X} y2={VIN_Y + 90} />
        <Dot x={EN_X} y={VIN_Y + 90} />

        <Wire x1={EN_X} y1={VIN_Y + 90} x2={PIN.EN.x} y2={VIN_Y + 90} />
        <Wire x1={PIN.EN.x} y1={VIN_Y + 90} x2={PIN.EN.x} y2={PIN.EN.y} />

        <Wire x1={EN_X} y1={VIN_Y + 90} x2={EN_X} y2={VIN_Y + 176 - RES_H / 2} />
        <SMDResistor x={EN_X} y={VIN_Y + 176} label="R4" value={ann?.R4 ?? null} />
        <Wire x1={EN_X} y1={VIN_Y + 176 + RES_H / 2} x2={EN_X} y2={GND_R4} />
        <Gnd x={EN_X} y={GND_R4} />

        {/* RT RESISTOR */}
        <Wire x1={PIN.RT.x} y1={PIN.RT.y} x2={RT_X} y2={PIN.RT.y} />
        <Wire x1={RT_X} y1={PIN.RT.y} x2={RT_X} y2={PIN.RT.y + 92 - RES_H / 2} />
        <SMDResistor x={RT_X} y={PIN.RT.y + 92} label="RT" value={ann?.RT ?? null} />
        <Wire x1={RT_X} y1={PIN.RT.y + 92 + RES_H / 2} x2={RT_X} y2={GND_RT} />
        <Gnd x={RT_X} y={GND_RT} />

        {/* BST CAPACITOR */}
        <Wire x1={PIN.BST.x} y1={PIN.BST.y} x2={BST_X} y2={PIN.BST.y} />
        <Wire x1={BST_X} y1={PIN.BST.y} x2={BST_X} y2={swY - 44 - CAP_H / 2} />
        <SMDCap x={BST_X} y={swY - 44} label="C3" value="100nF" />
        <Wire x1={BST_X} y1={swY - 44 + CAP_H / 2} x2={BST_X} y2={swY} />

        {/* SW / INDUCTOR */}
        <Wire x1={PIN.SW.x} y1={PIN.SW.y} x2={BST_X} y2={swY} />
        <Dot x={BST_X} y={swY} />
        <Wire x1={BST_X} y1={swY} x2={BST_X + 61 - IND_W / 2} y2={swY} />

        <SMDInductor x={BST_X + 61} y={swY} label="L" value={ann?.L ?? null} />
        <Wire x1={BST_X + 61 + IND_W / 2} y1={swY} x2={VOUT_X} y2={swY} />

        {/* VOUT RAIL */}
        <Wire x1={VOUT_X} y1={swY} x2={VOUT_END} y2={swY} />
        <Dot x={C4_X} y={swY} />
        <Dot x={FB_X} y={swY} />
        <Dot x={C2_X} y={swY} />
        <text x={VOUT_X + 8} y={swY - 8} fontSize={16} fill="#111827" fontWeight="bold">VOUT</text>
        {ann && <text x={VOUT_X + 8} y={swY + 14} fontSize={14} fill="#374151">{ann.Vout} / {ann.Iout}</text>}
        <Dot x={VOUT_X} y={swY} />

        {/* C4 (Cout) */}
        <Wire x1={C4_X} y1={swY} x2={C4_X} y2={swY + 71 - CAP_H / 2} />
        <SMDCap x={C4_X} y={swY + 71} label="C4" value={ann?.Cout ?? null} />
        <Wire x1={C4_X} y1={swY + 71 + CAP_H / 2} x2={C4_X} y2={GND_C4} />
        <Gnd x={C4_X} y={GND_C4} />

        {/* FB DIVIDER (R1/R2) */}
        <Wire x1={FB_X} y1={swY} x2={FB_X} y2={swY + 42 - RES_H / 2} />
        <SMDResistor x={FB_X} y={swY + 42} label="R1" value={ann?.R1 ?? null} />
        <Wire x1={FB_X} y1={swY + 42 + RES_H / 2} x2={FB_X} y2={FB_Ymid} />
        <Dot x={FB_X} y={FB_Ymid} />

        <Wire x1={FB_X} y1={FB_Ymid} x2={PIN.FB.x} y2={FB_Ymid} />
        <Wire x1={PIN.FB.x} y1={FB_Ymid} x2={PIN.FB.x} y2={PIN.FB.y} />
        <text x={PIN.FB.x - 50} y={FB_Ymid + 5} fontSize={14} fill="#0369a1" fontWeight="bold">FB</text>

        <Wire x1={FB_X} y1={FB_Ymid} x2={FB_X} y2={FB_Ymid + 86 - RES_H / 2} />
        <SMDResistor x={FB_X} y={FB_Ymid + 86} label="R2" value={ann?.R2 ?? null} />
        <Wire x1={FB_X} y1={FB_Ymid + 86 + RES_H / 2} x2={FB_X} y2={GND_R2} />
        <Gnd x={FB_X} y={GND_R2} />

        {/* C2 (output cap) */}
        <Wire x1={C2_X} y1={swY} x2={C2_X} y2={swY + 101 - CAP_H / 2} />
        <SMDCap x={C2_X} y={swY + 101} label="C2" value="22µF" />
        <Wire x1={C2_X} y1={swY + 101 + CAP_H / 2} x2={C2_X} y2={GND_C2} />
        <Gnd x={C2_X} y={GND_C2} />

        {/* COMP NETWORK (R5/C5/C6) */}
        <Wire x1={PIN.COMP.x} y1={PIN.COMP.y} x2={COMP_X} y2={PIN.COMP.y} />
        <Dot x={COMP_X} y={PIN.COMP.y} />

        <Wire x1={COMP_X} y1={PIN.COMP.y} x2={COMP_X} y2={PIN.COMP.y + 42 - RES_H / 2} />
        <SMDResistor x={COMP_X} y={PIN.COMP.y + 42} label="R5" value={ann?.R5 ?? null} />
        <Wire x1={COMP_X} y1={PIN.COMP.y + 42 + RES_H / 2} x2={COMP_X} y2={PIN.COMP.y + 106 - CAP_H / 2} />
        <SMDCap x={COMP_X} y={PIN.COMP.y + 106} label="C5" value={ann?.C5 ?? null} />
        <Wire x1={COMP_X} y1={PIN.COMP.y + 106 + CAP_H / 2} x2={COMP_X} y2={PIN.COMP.y + 140} />
        <Gnd x={COMP_X} y={PIN.COMP.y + 140} />

        <Wire x1={COMP_X} y1={PIN.COMP.y} x2={COMP_X + 80} y2={PIN.COMP.y} />
        <Wire x1={COMP_X + 80} y1={PIN.COMP.y} x2={COMP_X + 80} y2={PIN.COMP.y + 86 - CAP_H / 2} />
        <SMDCap x={COMP_X + 80} y={PIN.COMP.y + 86} label="C6" value={ann?.C6 ?? null} />
        <Wire x1={COMP_X + 80} y1={PIN.COMP.y + 86 + CAP_H / 2} x2={COMP_X + 80} y2={PIN.COMP.y + 140} />
        <Gnd x={COMP_X + 80} y={PIN.COMP.y + 140} />
      </svg>
    </div>
  )
}
