/* ---- E-series ---- */

const E24_BASE = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
]

const E48_BASE = [
  1.00, 1.05, 1.10, 1.15, 1.21, 1.27, 1.33, 1.40, 1.47, 1.54,
  1.62, 1.69, 1.78, 1.87, 1.96, 2.05, 2.15, 2.26, 2.37, 2.49,
  2.61, 2.74, 2.87, 3.01, 3.16, 3.32, 3.48, 3.65, 3.83, 4.02,
  4.22, 4.42, 4.64, 4.87, 5.11, 5.36, 5.62, 5.90, 6.19, 6.49,
  6.81, 7.15, 7.50, 7.87, 8.25, 8.66, 9.09, 9.53,
]

function buildSeries(base: number[], minDecade: number, maxDecade: number): number[] {
  const r: number[] = []
  for (let e = minDecade; e <= maxDecade; e++) {
    const f = 10 ** e
    for (const v of base) {
      r.push(Number((v * f).toPrecision(6)))
    }
  }
  return r
}

function findClosest(v: number, arr: number[]): number | null {
  if (!arr.length) return null
  if (v <= arr[0]) return arr[0]
  if (v >= arr[arr.length - 1]) return arr[arr.length - 1]
  let lo = 0, hi = arr.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >>> 1
    if (arr[mid] === v) return arr[mid]
    if (arr[mid] < v) lo = mid
    else hi = mid
  }
  return v - arr[lo] <= arr[hi] - v ? arr[lo] : arr[hi]
}

/* ---- Pre-computed pair helpers ---- */

interface PairResult { sum: number; a: number; b: number }

function buildPairs(series: number[]): PairResult[] {
  const m = new Map<string, PairResult>()
  for (let i = 0; i < series.length; i++) {
    for (let j = i; j < series.length; j++) {
      const a = series[i], b = series[j]
      const sum = a + b
      const key = `${sum}|${a}|${b}`
      if (!m.has(key)) m.set(key, { sum, a, b })
    }
  }
  return [...m.values()].sort((x, y) => x.sum - y.sum)
}

interface ParResult { val: number; a: number; b: number }

function buildPars(series: number[]): ParResult[] {
  const m = new Map<string, ParResult>()
  for (let i = 0; i < series.length; i++) {
    for (let j = i; j < series.length; j++) {
      const a = series[i], b = series[j]
      const val = (a * b) / (a + b)
      const key = `${val.toPrecision(6)}|${a}|${b}`
      if (!m.has(key)) m.set(key, { val, a, b })
    }
  }
  return [...m.values()].sort((x, y) => x.val - y.val)
}

function findClosestPair(v: number, arr: PairResult[]): PairResult | null {
  if (!arr.length) return null
  if (v <= arr[0].sum) return arr[0]
  if (v >= arr[arr.length - 1].sum) return arr[arr.length - 1]
  let lo = 0, hi = arr.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >>> 1
    if (arr[mid].sum === v) return arr[mid]
    if (arr[mid].sum < v) lo = mid
    else hi = mid
  }
  return v - arr[lo].sum <= arr[hi].sum - v ? arr[lo] : arr[hi]
}

function findClosestPar(v: number, arr: ParResult[]): ParResult | null {
  if (!arr.length) return null
  if (v <= arr[0].val) return arr[0]
  if (v >= arr[arr.length - 1].val) return arr[arr.length - 1]
  let lo = 0, hi = arr.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >>> 1
    if (arr[mid].val === v) return arr[mid]
    if (arr[mid].val < v) lo = mid
    else hi = mid
  }
  return v - arr[lo].val <= arr[hi].val - v ? arr[lo] : arr[hi]
}

/* ---- Result type ---- */

export interface SearchResult {
  topology: string
  label: string
  resistors: number[]
  total: number
  errorPercent: number
}

/* ---- Topology labels ---- */

export const TOPOLOGY_LABELS: Record<string, string> = {
  series2: "R1 + R2",
  parallel2: "R1 ∥ R2",
  series3: "R1 + R2 + R3",
  parallel3: "R1 ∥ R2 ∥ R3",
  sp3: "(R1 + R2) ∥ R3",
  ps3: "(R1 ∥ R2) + R3",
  series4: "R1 + R2 + R3 + R4",
  parallel4: "R1 ∥ R2 ∥ R3 ∥ R4",
  sspp4: "(R1 + R2) ∥ (R3 + R4)",
  ppss4: "(R1 ∥ R2) + (R3 ∥ R4)",
  tsp4: "(R1 + R2 + R3) ∥ R4",
  tps4: "(R1 ∥ R2 ∥ R3) + R4",
}

/* ---- Calculate total from topology + resistors ---- */

export function calcTotal(topology: string, resistors: number[]): number {
  switch (topology) {
    case "series2":
    case "series3":
    case "series4":
      return resistors.reduce((s, r) => s + r, 0)
    case "parallel2":
    case "parallel3":
    case "parallel4":
      return 1 / resistors.reduce((s, r) => s + 1 / r, 0)
    case "sp3":
      return ((resistors[0] + resistors[1]) * resistors[2]) / (resistors[0] + resistors[1] + resistors[2])
    case "ps3":
      return (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]) + resistors[2]
    case "sspp4":
      return ((resistors[0] + resistors[1]) * (resistors[2] + resistors[3])) / (resistors[0] + resistors[1] + resistors[2] + resistors[3])
    case "ppss4":
      return (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]) + (resistors[2] * resistors[3]) / (resistors[2] + resistors[3])
    case "tsp4":
      return ((resistors[0] + resistors[1] + resistors[2]) * resistors[3]) / (resistors[0] + resistors[1] + resistors[2] + resistors[3])
    case "tps4": {
      const p = 1 / (1 / resistors[0] + 1 / resistors[1] + 1 / resistors[2])
      return p + resistors[3]
    }
    default:
      return resistors.reduce((s, r) => s + r, 0)
  }
}

/* ---- Format ---- */

export function formatValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toPrecision(4)}M`
  if (v >= 1_000) return `${(v / 1_000).toPrecision(4)}k`
  if (v >= 1) return `${v.toPrecision(4)}`
  return `${(v * 1000).toPrecision(3)}m`
}

function makeResult(topology: string, resistors: number[], total: number, target: number): SearchResult {
  return {
    topology,
    label: TOPOLOGY_LABELS[topology],
    resistors,
    total,
    errorPercent: Math.abs((total - target) / target) * 100,
  }
}

/* ---- Search functions ---- */

const DECADE_MIN = -1, DECADE_MAX = 7
const E24 = buildSeries(E24_BASE, DECADE_MIN, DECADE_MAX)
const E24E48 = buildSeries([...new Set([...E24_BASE, ...E48_BASE])], DECADE_MIN, DECADE_MAX)

function dedupKey(topology: string, resistors: number[]): string {
  const sorted = [...resistors].sort((a, b) => a - b)
  return `${topology}|${sorted.join(",")}`
}

/* 2-resistor */
function searchSeries2(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const r1 of E24E48) {
    if (r1 >= target) break
    const r2 = findClosest(target - r1, E24E48)
    if (r2 === null) continue
    const total = r1 + r2
    const key = dedupKey("series2", [r1, r2])
    if (seen.has(key)) continue; seen.add(key)
    r.push(makeResult("series2", [r1, r2], total, target))
  }
  return r
}

function searchParallel2(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const r1 of E24E48) {
    if (r1 <= target) continue
    const r2t = (r1 * target) / (r1 - target)
    if (r2t < 0) continue
    const r2 = findClosest(r2t, E24E48)
    if (r2 === null) continue
    const total = (r1 * r2) / (r1 + r2)
    const key = dedupKey("parallel2", [r1, r2])
    if (seen.has(key)) continue; seen.add(key)
    r.push(makeResult("parallel2", [r1, r2], total, target))
  }
  return r
}

/* 3-resistor */
function searchSeries3(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const r1 of E24E48) {
    if (r1 >= target) break
    for (const r2 of E24E48) {
      if (r1 + r2 >= target) break
      const r3 = findClosest(target - r1 - r2, E24E48)
      if (r3 === null) continue
      const total = r1 + r2 + r3
      const key = dedupKey("series3", [r1, r2, r3])
      if (seen.has(key)) continue; seen.add(key)
      r.push(makeResult("series3", [r1, r2, r3], total, target))
    }
  }
  return r
}

function searchParallel3(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  const invT = 1 / target
  for (const r1 of E24E48) {
    if (r1 <= target) continue
    const inv1 = 1 / r1
    for (const r2 of E24E48) {
      if (r2 <= target) continue
      const inv12 = inv1 + 1 / r2
      if (inv12 >= invT) continue
      const r3t = 1 / (invT - inv12)
      if (r3t < 0) continue
      const r3 = findClosest(r3t, E24E48)
      if (r3 === null) continue
      const total = 1 / (inv1 + 1 / r2 + 1 / r3)
      const key = dedupKey("parallel3", [r1, r2, r3])
      if (seen.has(key)) continue; seen.add(key)
      r.push(makeResult("parallel3", [r1, r2, r3], total, target))
    }
  }
  return r
}

function searchSP3(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const r1 of E24E48) {
    for (const r2 of E24E48) {
      const a = r1 + r2
      if (a <= target) continue
      const r3t = (a * target) / (a - target)
      if (r3t < 0) continue
      const r3 = findClosest(r3t, E24E48)
      if (r3 === null) continue
      const total = (a * r3) / (a + r3)
      const key = dedupKey("sp3", [r1, r2, r3])
      if (seen.has(key)) continue; seen.add(key)
      r.push(makeResult("sp3", [r1, r2, r3], total, target))
    }
  }
  return r
}

function searchPS3(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const r1 of E24E48) {
    for (const r2 of E24E48) {
      const a = (r1 * r2) / (r1 + r2)
      if (a >= target) continue
      const r3t = target - a
      const r3 = findClosest(r3t, E24E48)
      if (r3 === null) continue
      const total = a + r3
      const key = dedupKey("ps3", [r1, r2, r3])
      if (seen.has(key)) continue; seen.add(key)
      r.push(makeResult("ps3", [r1, r2, r3], total, target))
    }
  }
  return r
}

/* 4-resistor – use pre-computed pairs */
const pairSums = buildPairs(E24E48)
const pairPars = buildPars(E24E48)

function searchSSPP4(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const b of pairSums) {
    if (b.sum <= target) continue
    const aTarget = (b.sum * target) / (b.sum - target)
    const a = findClosestPair(aTarget, pairSums)
    if (a === null) continue
    const total = (a.sum * b.sum) / (a.sum + b.sum)
    const key = dedupKey("sspp4", [a.a, a.b, b.a, b.b])
    if (seen.has(key)) continue; seen.add(key)
    r.push(makeResult("sspp4", [a.a, a.b, b.a, b.b], total, target))
  }
  return r
}

function searchPPSS4(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const b of pairPars) {
    if (b.val >= target) continue
    const aTarget = target - b.val
    const a = findClosestPar(aTarget, pairPars)
    if (a === null) continue
    const total = a.val + b.val
    const key = dedupKey("ppss4", [a.a, a.b, b.a, b.b])
    if (seen.has(key)) continue; seen.add(key)
    r.push(makeResult("ppss4", [a.a, a.b, b.a, b.b], total, target))
  }
  return r
}

function searchTSP4(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const r4 of E24E48) {
    if (r4 <= target) continue
    const aTarget = (r4 * target) / (r4 - target)
    for (const r1 of E24E48) {
      if (r1 >= aTarget) break
      const remaining = aTarget - r1
      if (remaining <= 0) continue
      const pair = findClosestPair(remaining, pairSums)
      if (pair === null) continue
      const a = r1 + pair.sum
      const total = (a * r4) / (a + r4)
      const key = dedupKey("tsp4", [r1, pair.a, pair.b, r4])
      if (seen.has(key)) continue; seen.add(key)
      r.push(makeResult("tsp4", [r1, pair.a, pair.b, r4], total, target))
    }
  }
  return r
}

function searchTPS4(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const r4 of E24E48) {
    if (r4 >= target) continue
    const aTarget = target - r4
    if (aTarget <= 0) continue
    for (const r1 of E24E48) {
      if (r1 <= aTarget) continue
      const inv1 = 1 / r1
      for (const r2 of E24E48) {
        if (r2 <= aTarget) continue
        const inv12 = inv1 + 1 / r2
        if (1 / inv12 <= aTarget) continue // parallel of r1,r2 must be > aTarget... actually need r1∥r2 > aTarget
        const r3t = 1 / (1 / aTarget - inv12)
        if (r3t < 0) continue
        const r3 = findClosest(r3t, E24E48)
        if (r3 === null) continue
        const p = 1 / (inv1 + 1 / r2 + 1 / r3)
        const total = p + r4
        const key = dedupKey("tps4", [r1, r2, r3, r4])
        if (seen.has(key)) continue; seen.add(key)
        r.push(makeResult("tps4", [r1, r2, r3, r4], total, target))
      }
    }
  }
  return r
}

/* 4-resistor pure – use E24 subset for perf */
function searchSeries4(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  for (const r1 of E24) {
    if (r1 >= target) break
    for (const r2 of E24) {
      if (r1 + r2 >= target) break
      for (const r3 of E24) {
        if (r1 + r2 + r3 >= target) break
        const r4 = findClosest(target - r1 - r2 - r3, E24)
        if (r4 === null) continue
        const total = r1 + r2 + r3 + r4
        const key = dedupKey("series4", [r1, r2, r3, r4])
        if (seen.has(key)) continue; seen.add(key)
        r.push(makeResult("series4", [r1, r2, r3, r4], total, target))
      }
    }
  }
  return r
}

function searchParallel4(target: number): SearchResult[] {
  const r: SearchResult[] = [], seen = new Set<string>()
  const invT = 1 / target
  for (const r1 of E24) {
    if (r1 <= target) continue
    const inv1 = 1 / r1
    for (const r2 of E24) {
      if (r2 <= target) continue
      const inv12 = inv1 + 1 / r2
      if (inv12 >= invT) continue
      for (const r3 of E24) {
        if (r3 <= target) continue
        const inv123 = inv12 + 1 / r3
        if (inv123 >= invT) continue
        const r4t = 1 / (invT - inv123)
        if (r4t < 0) continue
        const r4 = findClosest(r4t, E24)
        if (r4 === null) continue
        const total = 1 / (inv1 + 1 / r2 + 1 / r3 + 1 / r4)
        const key = dedupKey("parallel4", [r1, r2, r3, r4])
        if (seen.has(key)) continue; seen.add(key)
        r.push(makeResult("parallel4", [r1, r2, r3, r4], total, target))
      }
    }
  }
  return r
}

/* ---- Public search API ---- */

export type MaxResistors = 2 | 3 | 4

export function searchCombinations(target: number, maxResistors: MaxResistors): SearchResult[] {
  const all: SearchResult[] = []

  all.push(...searchSeries2(target))
  all.push(...searchParallel2(target))

  if (maxResistors >= 3) {
    all.push(...searchSeries3(target))
    all.push(...searchParallel3(target))
    all.push(...searchSP3(target))
    all.push(...searchPS3(target))
  }

  if (maxResistors >= 4) {
    all.push(...searchSeries4(target))
    all.push(...searchParallel4(target))
    all.push(...searchSSPP4(target))
    all.push(...searchPPSS4(target))
    all.push(...searchTSP4(target))
    all.push(...searchTPS4(target))
  }

  all.sort((a, b) => a.errorPercent - b.errorPercent)
  return all.slice(0, 10)
}

/* ---- E-series access for editor dropdown ---- */

export function getESeries(): number[] {
  return E24E48
}

export { E24, E24E48 }
