export type CircuitMode = "single" | "series" | "parallel" | "series-parallel"

export interface CircuitConfig {
  mode: CircuitMode
  Vcc: number
  Vf: number
  If: number
  brightness: number
  seriesCount: number
  parallelCount: number
  ledColor: string
}

export interface CalcResult {
  resistor: number
  nearestE12: number
  nearestE24: number
  power: number
  powerRating: PowerRating
  totalCurrent: number
  colorBands: ColorBand[]
  ledColor: string
  effectiveCurrent: number
  error?: string
}

export interface ColorBand {
  color: string
  label: string
}

export type PowerRating = "1/8W" | "1/4W" | "1/2W" | "1W" | "2W+"

export interface PowerRatingInfo {
  rating: PowerRating
  level: "safe" | "caution" | "warn" | "danger"
}

export const LED_COLORS = [
  { label: "赤 (Red)", value: "#ff1744", typicalVf: 2.0 },
  { label: "橙 (Orange)", value: "#ff9100", typicalVf: 2.1 },
  { label: "黄 (Yellow)", value: "#ffea00", typicalVf: 2.2 },
  { label: "黄緑 (Yellow-Green)", value: "#c6ff00", typicalVf: 2.4 },
  { label: "緑 (Green)", value: "#00e676", typicalVf: 3.0 },
  { label: "青 (Blue)", value: "#2979ff", typicalVf: 3.2 },
  { label: "白 (White)", value: "#ffffff", typicalVf: 3.4 },
  { label: "紫 (Purple)", value: "#d500f9", typicalVf: 3.0 },
  { label: "橙赤 (Amber)", value: "#ff6d00", typicalVf: 2.0 },
] as const

const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2]
const E24 = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0,
  2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3,
  4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
]

const BAND_COLORS: Record<string, [string, string]> = {
  "0": ["#212121", "黒"],
  "1": ["#795548", "茶"],
  "2": ["#f44336", "赤"],
  "3": ["#ff6f00", "橙"],
  "4": ["#fdd835", "黄"],
  "5": ["#7cb342", "緑"],
  "6": ["#1565c0", "青"],
  "7": ["#7b1fa2", "紫"],
  "8": ["#9e9e9e", "灰"],
  "9": ["#f5f5f5", "白"],
  gold: ["#ffd54f", "金"],
  silver: ["#bdbdbd", "銀"],
}

function nearestInSeries(value: number, series: number[]): number {
  const decade = Math.pow(10, Math.floor(Math.log10(value)))
  const normalized = value / decade
  let best = series[0]
  let bestDiff = Math.abs(normalized - best)
  for (const s of series) {
    const diff = Math.abs(normalized - s)
    if (diff < bestDiff) {
      bestDiff = diff
      best = s
    }
  }
  return Math.round(best * decade * 1e6) / 1e6
}

export function nearestE12(value: number): number {
  return nearestInSeries(value, E12)
}

export function nearestE24(value: number): number {
  return nearestInSeries(value, E24)
}

export function calcResistor(config: CircuitConfig): CalcResult {
  const { Vcc, Vf, If, brightness, seriesCount, parallelCount, ledColor } = config
  const effectiveCurrent = If * (brightness / 100)
  const totalVf = Vf * seriesCount

  if (totalVf >= Vcc) {
    return {
      resistor: 0,
      nearestE12: 0,
      nearestE24: 0,
      power: 0,
      powerRating: "1/8W",
      totalCurrent: 0,
      colorBands: [],
      ledColor,
      effectiveCurrent: 0,
      error: `順電圧合計 (${totalVf.toFixed(1)}V) が電源電圧 (${Vcc.toFixed(1)}V) 以上です。直列数を減らすか電源電圧を上げてください。`,
    }
  }

  if (effectiveCurrent <= 0) {
    return {
      resistor: 0,
      nearestE12: 0,
      nearestE24: 0,
      power: 0,
      powerRating: "1/8W",
      totalCurrent: 0,
      colorBands: [],
      ledColor,
      effectiveCurrent: 0,
      error: "順方向電流が0です。輝度またはIfを設定してください。",
    }
  }

  const IfA = effectiveCurrent / 1000
  const R = (Vcc - totalVf) / IfA
  const nearest12 = nearestE12(R)
  const nearest24 = nearestE24(R)
  const power = IfA * IfA * R
  const totalCurrent = IfA * 1000 * parallelCount

  const result: CalcResult = {
    resistor: Math.round(R * 100) / 100,
    nearestE12: Math.round(nearest12 * 100) / 100,
    nearestE24: Math.round(nearest24 * 100) / 100,
    power,
    powerRating: getPowerRating(power).rating,
    totalCurrent: Math.round(totalCurrent * 100) / 100,
    colorBands: toColorBands(R),
    ledColor,
    effectiveCurrent: Math.round(effectiveCurrent * 100) / 100,
  }

  return result
}

export function getPowerRating(power: number): PowerRatingInfo {
  if (power < 0.125) return { rating: "1/8W", level: "safe" }
  if (power < 0.25) return { rating: "1/4W", level: "caution" }
  if (power < 0.5) return { rating: "1/2W", level: "warn" }
  return { rating: "2W+", level: "danger" }
}

export function toColorBands(ohm: number): ColorBand[] {
  if (ohm <= 0 || !isFinite(ohm)) return []

  let value = Math.round(ohm * 100) / 100

  let multiplier = 0
  while (value >= 100) {
    value /= 10
    multiplier++
  }
  while (value < 10) {
    value *= 10
    multiplier--
  }

  if (multiplier < -2) multiplier = -2

  const digits = [
    Math.floor(value / 10) % 10,
    Math.floor(value) % 10,
  ]

  const multStr = (multiplier + 2).toString()

  const bands: ColorBand[] = [
    { color: BAND_COLORS[digits[0].toString()]?.[0] ?? "#212121", label: BAND_COLORS[digits[0].toString()]?.[1] ?? "?" },
    { color: BAND_COLORS[digits[1].toString()]?.[0] ?? "#212121", label: BAND_COLORS[digits[1].toString()]?.[1] ?? "?" },
    { color: BAND_COLORS[multStr]?.[0] ?? "#212121", label: BAND_COLORS[multStr]?.[1] ?? "?" },
    { color: BAND_COLORS["gold"]![0], label: "金" },
  ]

  return bands
}

export function estimateLEDColor(Vf: number): string {
  if (Vf < 1.8) return "#757575"
  if (Vf < 2.1) return "#ff1744"
  if (Vf < 2.3) return "#ff9100"
  if (Vf < 2.6) return "#ffea00"
  if (Vf < 2.9) return "#c6ff00"
  if (Vf < 3.2) return "#00e676"
  if (Vf < 3.5) return "#2979ff"
  return "#ffffff"
}

export function formatResistor(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + " MΩ"
  if (value >= 1_000) return (value / 1_000).toFixed(2) + " kΩ"
  return value.toFixed(1) + " Ω"
}

export function formatCurrent(mA: number): string {
  if (mA >= 1000) return (mA / 1000).toFixed(2) + " A"
  return mA.toFixed(1) + " mA"
}

export function formatPower(W: number): string {
  if (W >= 1) return W.toFixed(2) + " W"
  if (W >= 0.001) return (W * 1000).toFixed(1) + " mW"
  return (W * 1_000_000).toFixed(0) + " µW"
}
