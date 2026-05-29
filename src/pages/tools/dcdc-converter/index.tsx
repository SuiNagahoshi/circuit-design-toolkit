import { useState, useMemo, useCallback, useEffect } from "react"
import { type CircuitParams, type CircuitResults, PARTS, DEFAULT_PARAMS, calcCircuit, formatResistor, formatCapacitor, formatInductor } from "./dcdcUtils"
import CircuitDiagram from "./CircuitDiagram"

function Field({
  label, value, onChange, unit, desc,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  unit: string
  desc?: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="mt-0.5 flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
          className="w-full rounded border border-gray-300 px-2 py-0.5 text-sm font-bold text-gray-900"
          step="any"
        />
        <span className="shrink-0 text-xs text-gray-400">{unit}</span>
      </div>
      {desc && <div className="mt-0.5 text-[10px] text-gray-400 italic">{desc}</div>}
    </div>
  )
}

export default function DCDCPage() {
  const [p, setP] = useState<CircuitParams>(DEFAULT_PARAMS)
  const [lastEdited, setLastEdited] = useState<string>("Vout")

  const results = useMemo<CircuitResults | null>(() => {
    try {
      return calcCircuit(p, lastEdited)
    } catch {
      return null
    }
  }, [p, lastEdited])

  useEffect(() => {
    if (!results) return
    setP((prev) => {
      const next = { ...prev }
      let changed = false

      const floatFields: (keyof CircuitParams)[] = [
        "Vin", "Vout", "Iout", "Fsw",
        "L", "LIR", "ΔIL", "ILpeak", "Vripple", "Cout", "Cin",
        "R1", "R2", "RT", "D",
        "Irms_ind", "Irms_cout",
      ]
      for (const f of floatFields) {
        if (f === lastEdited) continue
        const rv = (results as unknown as Record<string, number>)[f]
        if (rv !== undefined && Math.abs(next[f] - rv) > 1e-8) {
          next[f] = rv
          changed = true
        }
      }

      const unionFields: [keyof CircuitParams, keyof CircuitResults][] = [
        ["R3", "R3"], ["R4", "R4"],
        ["R5", "R5"], ["C5", "C5"], ["C6", "C6"],
      ]
      for (const [pk, rk] of unionFields) {
        if (pk === lastEdited) continue
        const rv = results[rk]
        const nv = typeof rv === "number" ? rv : 0
        if (Math.abs(next[pk] - nv) > 1e-8) {
          next[pk] = nv
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [results, lastEdited])

  const update = useCallback((key: keyof CircuitParams, value: number) => {
    setP((prev) => ({ ...prev, [key]: value }))
    setLastEdited(key)
  }, [])

  const part = PARTS[p.partIndex]

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">降圧DCDCコンバータ 回路定数設計</h1>
        <p className="mt-1 text-sm text-gray-500">
          AP64xx0シリーズ用 / すべての定数を直接入力・編集可能
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <CircuitDiagram results={results} />
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">IC選択</label>
        <select
          value={p.partIndex}
          onChange={(e) => update("partIndex", Number.parseInt(e.target.value))}
          className="mt-1 block w-48 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
        >
          {PARTS.map((part, i) => (
            <option key={part.name} value={i}>{part.name} ({part.ioutMax}A max)</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-base font-semibold text-gray-800">設計条件</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="入力電圧 Vin" value={p.Vin} onChange={(v) => update("Vin", v)} unit="V" />
          <Field label="出力電圧 Vout" value={p.Vout} onChange={(v) => update("Vout", v)} unit="V" />
          <Field label="出力電流 Iout" value={p.Iout} onChange={(v) => update("Iout", v)} unit="A" />
          <Field label="スイッチング周波数" value={p.Fsw} onChange={(v) => update("Fsw", v)} unit="kHz" />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-base font-semibold text-gray-800">パワーステージ定数</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Duty比 D" value={p.D * 100} onChange={(v) => update("D", v / 100)} unit="%" desc={lastEdited === "D" ? "手動" : results ? `Vout/Vin = ${results.Vout.toFixed(1)}V / ${p.Vin}V` : undefined} />
          <Field label="リップル比 LIR" value={p.LIR} onChange={(v) => update("LIR", v)} unit="" />
          <Field label="出力リップル電圧" value={p.Vripple * 1000} onChange={(v) => update("Vripple", v / 1000)} unit="mV" />
          <Field label="RT" value={p.RT} onChange={(v) => update("RT", v)} unit="kΩ" />
          <Field label="インダクタ L" value={p.L} onChange={(v) => update("L", v)} unit="µH" />
          <Field label="出力コンデンサ Cout" value={p.Cout} onChange={(v) => update("Cout", v)} unit="µF" />
          <Field label="入力コンデンサ Cin" value={p.Cin} onChange={(v) => update("Cin", v)} unit="µF" />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-base font-semibold text-gray-800">インダクタ電流</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="ΔIL" value={p.ΔIL} onChange={(v) => update("ΔIL", v)} unit="A" />
          <Field label="ILpeak" value={p.ILpeak} onChange={(v) => update("ILpeak", v)} unit="A" />
          <Field label="ILrms" value={p.Irms_ind} onChange={(v) => update("Irms_ind", v)} unit="A" />
          <Field label="Coutリプル電流" value={p.Irms_cout} onChange={(v) => update("Irms_cout", v)} unit="A" />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-base font-semibold text-gray-800">帰還分圧抵抗</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="R1" value={p.R1} onChange={(v) => update("R1", v)} unit="Ω" />
          <Field label="R2" value={p.R2} onChange={(v) => update("R2", v)} unit="Ω" />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-base font-semibold text-gray-800">UVLO抵抗</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="R3" value={p.R3} onChange={(v) => update("R3", v)} unit="kΩ" desc={results && results.R3 === "Open" ? "不要（Open）" : undefined} />
          <Field label="R4" value={p.R4} onChange={(v) => update("R4", v)} unit="kΩ" desc={results && results.R4 === "Open" ? "不要（Open）" : undefined} />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-base font-semibold text-gray-800">補償回路</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="R5" value={p.R5} onChange={(v) => update("R5", v)} unit="Ω" desc={results && typeof results.R5 === "string" ? results.R5 : undefined} />
          <Field label="C5" value={p.C5} onChange={(v) => update("C5", v)} unit="µF" desc={results && typeof results.C5 === "string" ? results.C5 : undefined} />
          <Field label="C6" value={p.C6} onChange={(v) => update("C6", v)} unit="µF" desc={results && typeof results.C6 === "string" ? results.C6 : undefined} />
        </div>
      </div>

      {results && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-blue-800">部品選定のポイント</h3>
          <ul className="space-y-1 text-xs text-blue-700">
            <li>• {part.name}使用 / VFB = {part.vfb}V / Gm = {part.gm}µS</li>
            <li>• インダクタは <strong>{formatInductor(results.L)}</strong> 以上、飽和電流 <strong>{results.ILpeak.toFixed(2)}A</strong> 以上のものを選んでください</li>
            <li>• 出力コンデンサは <strong>{formatCapacitor(results.Cout)}</strong> 程度、リプル電流定格 <strong>{results.Irms_cout.toFixed(3)}Arms</strong> 以上</li>
            <li>• 入力コンデンサは <strong>{formatCapacitor(results.Cin)}</strong> 程度、セラミックコンデンサが推奨</li>
            <li>• 帰還抵抗 R1 = <strong>{formatResistor(results.R1)}</strong>、R2 = <strong>{formatResistor(results.R2)}</strong></li>
            <li>• スイッチング周波数 {results.Fsw}kHz を設定するには RT = <strong>{formatResistor(results.RT * 1000)}</strong> を接続</li>
            {typeof results.R5 === "number" && <li>• 補償回路: R5 = <strong>{formatResistor(results.R5)}</strong>, C5 = <strong>{formatCapacitor(results.C5 as number)}</strong>, C6 = <strong>{formatCapacitor(results.C6 as number)}</strong></li>}
          </ul>
        </div>
      )}
    </div>
  )
}