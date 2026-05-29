export interface PartSpec {
  name: string
  ioutMax: number
  vinMin: number
  vinMax: number
  vfb: number
  gm: number
  hasExternalCompensation: boolean
}

export const PARTS: PartSpec[] = [
  { name: "AP64060", ioutMax: 0.6, vinMin: 4.5, vinMax: 40, vfb: 0.8, gm: 200, hasExternalCompensation: false },
  { name: "AP64100", ioutMax: 1.0, vinMin: 3.8, vinMax: 40, vfb: 0.8, gm: 250, hasExternalCompensation: true },
  { name: "AP64200", ioutMax: 2.0, vinMin: 3.8, vinMax: 40, vfb: 0.8, gm: 300, hasExternalCompensation: true },
  { name: "AP64350", ioutMax: 3.5, vinMin: 3.8, vinMax: 40, vfb: 0.8, gm: 350, hasExternalCompensation: true },
  { name: "AP64500", ioutMax: 5.0, vinMin: 3.8, vinMax: 40, vfb: 0.8, gm: 400, hasExternalCompensation: true },
]

export interface CircuitParams {
  partIndex: number
  Vin: number; Vout: number; Iout: number; Fsw: number
  LIR: number; Vripple: number
  L: number; Cout: number; RT: number; R1: number; R2: number
  D: number
  ΔIL: number; ILpeak: number
  Cin: number; Irms_ind: number; Irms_cout: number
  R3: number; R4: number
  R5: number; C5: number; C6: number
}

export interface CircuitResults {
  D: number; L: number; LIR: number
  ILpeak: number; ΔIL: number
  Vripple: number; Cout: number; Cin: number
  R1: number; R2: number; RT: number; Vout: number; Fsw: number
  R3: number | "Open"; R4: number | "Open"
  R5: number | "内部補償"; C5: number | "内部補償"; C6: number | "内部補償"
  Irms_ind: number; Irms_cout: number
}

export const DEFAULT_PARAMS: CircuitParams = {
  partIndex: 2,
  Vin: 24, Vout: 5, Iout: 2, Fsw: 500,
  LIR: 0.4, Vripple: 0.05,
  L: 10, Cout: 22, RT: 200, R1: 53000, R2: 10000,
  D: 0.208,
  ΔIL: 0.8, ILpeak: 2.4,
  Cin: 2.2, Irms_ind: 2.02, Irms_cout: 0.231,
  R3: 240, R4: 24,
  R5: 22000, C5: 0.00001, C6: 0.00001,
}

export function calcCircuit(p: CircuitParams, lastEdited: string): CircuitResults {
  const part = PARTS[p.partIndex]

  let Vout: number
  let D_val: number
  let R1: number
  const R2 = p.R2 > 0 ? p.R2 : 10000

  if (lastEdited === "R1") {
    R1 = p.R1
    Vout = (R1 / R2 + 1) * part.vfb
    D_val = Math.min(Vout / p.Vin, 1)
  } else if (lastEdited === "D") {
    D_val = Math.max(0.01, Math.min(0.99, p.D))
    Vout = D_val * p.Vin
    R1 = Math.round(R2 * (Vout / part.vfb - 1))
  } else {
    Vout = p.Vout
    D_val = Math.min(Vout / p.Vin, 1)
    R1 = Math.round(R2 * (Vout / part.vfb - 1))
  }

  const Fsw = lastEdited === "RT"
    ? Math.max(1, Math.min(100000, 100000 / p.RT))
    : p.Fsw

  let LIR: number; let L: number; let ΔIL: number; let ILpeak: number
  if (lastEdited === "L") {
    L = Math.max(0.01, p.L)
    ΔIL = ((p.Vin - Vout) * D_val) / (Fsw * 1000 * L) * 1e6
    LIR = Math.max(0.001, Math.min(10, ΔIL / Math.max(0.001, p.Iout)))
    ILpeak = p.Iout + ΔIL / 2
  } else if (lastEdited === "ΔIL") {
    ΔIL = Math.max(0.001, p.ΔIL)
    LIR = Math.max(0.001, Math.min(10, ΔIL / Math.max(0.001, p.Iout)))
    L = ((p.Vin - Vout) * D_val) / (Fsw * 1000 * ΔIL) * 1e6
    ILpeak = p.Iout + ΔIL / 2
  } else if (lastEdited === "ILpeak") {
    ILpeak = Math.max(p.Iout, p.ILpeak)
    ΔIL = 2 * (ILpeak - p.Iout)
    LIR = Math.max(0.001, Math.min(10, ΔIL / Math.max(0.001, p.Iout)))
    L = ((p.Vin - Vout) * D_val) / (Fsw * 1000 * ΔIL) * 1e6
  } else {
    LIR = p.LIR
    ΔIL = LIR * p.Iout
    L = ((p.Vin - Vout) * D_val) / (Fsw * 1000 * ΔIL) * 1e6
    ILpeak = p.Iout + ΔIL / 2
  }

  let Vripple: number; let Cout: number
  if (lastEdited === "Cout") {
    Cout = Math.max(0.00001, p.Cout)
    Vripple = ΔIL / (8 * Fsw * 1000 * Cout)
  } else {
    Vripple = p.Vripple
    Cout = ΔIL / (8 * Fsw * 1000 * Vripple) * 1e6
  }

  const Cin = lastEdited === "Cin"
    ? p.Cin
    : p.Iout * D_val * (1 - D_val) / (Fsw * 1000 * Vripple / 10) * 1e6

  const Irms_ind = lastEdited === "Irms_ind"
    ? p.Irms_ind
    : p.Iout * Math.sqrt(1 + (ΔIL / Math.max(0.001, p.Iout)) ** 2 / 12)

  const Irms_cout = lastEdited === "Irms_cout"
    ? p.Irms_cout
    : ΔIL / Math.sqrt(12)

  const RT = Fsw > 0 ? 100000 / Fsw : 0

  let R3_val: number | "Open" = "Open"
  let R4_val: number | "Open" = "Open"
  if (lastEdited === "R3" || lastEdited === "R4") {
    if (p.R3 > 0) R3_val = p.R3
    if (p.R4 > 0) R4_val = p.R4
  } else {
    const VON = p.Vin * 0.85
    const VOFF = p.Vin * 0.75
    if (VON > VOFF && VOFF > 0) {
      const r3 = (0.924 * VON - VOFF) / 0.0041
      const denom = VOFF - 1.09 + 0.0055 * r3
      if (r3 > 0 && denom > 0) {
        const r4 = 1.09 * r3 / denom
        R3_val = Math.round(r3 * 100) / 100
        R4_val = Math.round(r4 * 100) / 100
      }
    }
  }

  let R5_val: number | "内部補償" = "内部補償"
  let C5_val: number | "内部補償" = "内部補償"
  let C6_val: number | "内部補償" = "内部補償"
  if (lastEdited === "R5" || lastEdited === "C5" || lastEdited === "C6") {
    if (p.R5 > 0) R5_val = p.R5
    if (p.C5 > 0) C5_val = p.C5
    if (p.C6 > 0) C6_val = p.C6
  } else if (part.hasExternalCompensation) {
    const Gm_S = part.gm * 1e-6
    const Fsw_Hz = Fsw * 1000
    const Fcross = Fsw_Hz / 10
    const Cout_F = Cout / 1e6
    let r5 = 0; let c5 = 0; let c6 = 0
    if (Cout_F > 0 && Gm_S > 0 && part.vfb > 0) {
      r5 = (2 * Math.PI * Fcross * Vout * Cout_F) / (Gm_S * part.vfb)
      const Fp = p.Iout / (2 * Math.PI * Vout * Cout_F)
      if (Fp > 0 && r5 > 0) c5 = 1 / (2 * Math.PI * r5 * Fp)
      if (r5 > 0 && Fsw_Hz > 0) c6 = 1 / (Math.PI * r5 * Fsw_Hz)
    }
    R5_val = Math.round(r5 * 100) / 100
    C5_val = Math.round(c5 * 1e6 * 1e9) / 1e9
    C6_val = Math.round(c6 * 1e6 * 1e9) / 1e9
  }

  return {
    D: D_val,
    L: Math.round(L * 100) / 100,
    LIR: Math.round(LIR * 1000) / 1000,
    ILpeak: Math.round(ILpeak * 1000) / 1000,
    ΔIL: Math.round(ΔIL * 1000) / 1000,
    Vripple: Math.round(Vripple * 10000) / 10000,
    Cout: Math.round(Cout * 100) / 100,
    Cin: Math.round(Cin * 100) / 100,
    R1,
    R2,
    RT: Math.round(RT * 100) / 100,
    R3: R3_val,
    R4: R4_val,
    R5: R5_val,
    C5: C5_val,
    C6: C6_val,
    Irms_ind: Math.round(Irms_ind * 1000) / 1000,
    Irms_cout: Math.round(Irms_cout * 1000) / 1000,
    Vout: Math.round(Vout * 100) / 100,
    Fsw: Math.round(Fsw * 100) / 100,
  }
}

export function formatResistor(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + " MΩ"
  if (value >= 1_000) return (value / 1_000).toFixed(2) + " kΩ"
  return value.toFixed(1) + " Ω"
}

export function formatCapacitor(value: number): string {
  if (value >= 10_000) return (value / 1_000_000).toFixed(2) + " mF"
  if (value >= 10) return value.toFixed(1) + " µF"
  if (value >= 0.01) return (value * 1000).toFixed(1) + " nF"
  return (value * 1_000_000).toFixed(1) + " pF"
}

export function formatInductor(value: number): string {
  if (value >= 1000) return (value / 1000).toFixed(2) + " mH"
  return value.toFixed(1) + " µH"
}

export function formatCurrent(value: number): string {
  if (value >= 1) return value.toFixed(2) + " A"
  return (value * 1000).toFixed(1) + " mA"
}
