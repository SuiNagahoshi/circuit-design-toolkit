/* ---- Color code tables ---- */

export const colorBands = [
  { name: "黒", color: "#000000", val: 0, mult: 1, tol: undefined, tcr: 250 },
  { name: "茶", color: "#8B4513", val: 1, mult: 10, tol: 1, tcr: 100 },
  { name: "赤", color: "#DC143C", val: 2, mult: 100, tol: 2, tcr: 50 },
  { name: "橙", color: "#FF8C00", val: 3, mult: 1_000, tol: undefined, tcr: 15 },
  { name: "黄", color: "#FFD700", val: 4, mult: 10_000, tol: undefined, tcr: 25 },
  { name: "緑", color: "#2E8B57", val: 5, mult: 100_000, tol: 0.5, tcr: 20 },
  { name: "青", color: "#4169E1", val: 6, mult: 1_000_000, tol: 0.25, tcr: 10 },
  { name: "紫", color: "#8B008B", val: 7, mult: 10_000_000, tol: 0.1, tcr: 5 },
  { name: "灰", color: "#808080", val: 8, mult: 100_000_000, tol: 0.05, tcr: 1 },
  { name: "白", color: "#EEEEEE", val: 9, mult: 1_000_000_000, tol: undefined, tcr: 1 },
  { name: "金", color: "#DAA520", val: undefined, mult: 0.1, tol: 5, tcr: undefined },
  { name: "銀", color: "#C0C0C0", val: undefined, mult: 0.01, tol: 10, tcr: undefined },
] as const

export type BandColor = (typeof colorBands)[number]

export interface ResistorResult {
  value: number
  formatted: string
  tolerance: number | undefined
  tcr: number | undefined
}

/* ---- Through-hole calculation ---- */

export function calcThroughHole(bands: (BandColor | undefined)[], bandCount: 4 | 5 | 6): ResistorResult | null {
  const filled = bands.filter(Boolean) as BandColor[]
  if (filled.length < bandCount) return null

  const digitCount = bandCount === 4 ? 2 : 3
  const digits = filled.slice(0, digitCount)
  const multiplier = filled[digitCount]
  const tolerance = filled[digitCount + 1]
  const tcrBand = bandCount === 6 ? filled[digitCount + 2] : undefined

  const value = digits.reduce((acc, d) => acc * 10 + (d.val ?? 0), 0) * (multiplier?.mult ?? 1)
  const toleranceVal = tolerance?.tol
  const tcrVal = tcrBand?.tcr

  return { value, formatted: formatValue(value), tolerance: toleranceVal, tcr: tcrVal }
}

/* ---- SMD 3-digit / 4-digit ---- */

export function calcSMDNumeric(digits: string): ResistorResult | null {
  const len = digits.length
  if (len < 2) return null
  const significant = Number(digits.slice(0, len - 1))
  const exponent = Number(digits[len - 1])
  if (isNaN(significant) || isNaN(exponent)) return null
  const value = significant * 10 ** exponent
  return { value, formatted: formatValue(value), tolerance: undefined, tcr: undefined }
}

/* ---- EIA-96 ---- */

const eia96Table: Record<string, number> = {
  "01": 100, "02": 102, "03": 105, "04": 107, "05": 110, "06": 113, "07": 115,
  "08": 118, "09": 121, "10": 124, "11": 127, "12": 130, "13": 133, "14": 137,
  "15": 140, "16": 143, "17": 147, "18": 150, "19": 154, "20": 158, "21": 162,
  "22": 165, "23": 169, "24": 174, "25": 178, "26": 182, "27": 187, "28": 191,
  "29": 196, "30": 200, "31": 205, "32": 210, "33": 215, "34": 221, "35": 226,
  "36": 232, "37": 237, "38": 243, "39": 249, "40": 255, "41": 261, "42": 267,
  "43": 274, "44": 280, "45": 287, "46": 294, "47": 301, "48": 309, "49": 316,
  "50": 324, "51": 332, "52": 340, "53": 348, "54": 357, "55": 365, "56": 374,
  "57": 383, "58": 392, "59": 402, "60": 412, "61": 422, "62": 432, "63": 442,
  "64": 453, "65": 464, "66": 475, "67": 487, "68": 499, "69": 511, "70": 523,
  "71": 536, "72": 549, "73": 562, "74": 576, "75": 590, "76": 604, "77": 619,
  "78": 634, "79": 649, "80": 665, "81": 681, "82": 698, "83": 715, "84": 732,
  "85": 750, "86": 768, "87": 787, "88": 806, "89": 825, "90": 845, "91": 866,
  "92": 887, "93": 909, "94": 931, "95": 953, "96": 976,
}

const eia96Mult: Record<string, number> = {
  Z: 0.001, Y: 0.01, R: 0.01, S: 0.1, A: 1, B: 10, C: 100, D: 1000, E: 10000, F: 100000,
}

export function calcSMD_EIA96(code: string): ResistorResult | null {
  if (code.length !== 3) return null
  const digits = code.slice(0, 2)
  const multCode = code[2].toUpperCase()
  const base = eia96Table[digits]
  const mult = eia96Mult[multCode]
  if (base === undefined || mult === undefined) return null
  const value = base * mult
  return { value, formatted: formatValue(value), tolerance: 1, tcr: undefined }
}

/* ---- Helpers ---- */

export function formatValue(v: number): string {
  if (v >= 1_000_000) return `${v / 1_000_000}M`
  if (v >= 1_000) return `${v / 1_000}k`
  return `${v}`
}

export const smdDigitLabels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
export const eia96CodeLabels = Object.keys(eia96Table)
export const eia96MultLabels = Object.keys(eia96Mult)
