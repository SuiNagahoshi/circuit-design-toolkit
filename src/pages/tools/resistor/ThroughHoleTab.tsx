import { useState, useMemo } from "react"
import { colorBands, calcThroughHole, type BandColor } from "./resistorUtils"
import ResistorVisual from "./ResistorVisual"

export default function ThroughHoleTab() {
  const [selected, setSelected] = useState<(BandColor | undefined)[]>(
    Array.from({ length: 6 }, () => undefined),
  )

  const handleBandChange = (idx: number, color: BandColor | undefined) => {
    const next = [...selected]
    next[idx] = color
    setSelected(next)
  }

  const handleClear = () => {
    setSelected(Array.from({ length: 6 }, () => undefined))
  }

  const detected = useMemo(() => {
    const filledCount = selected.findIndex((b) => b === undefined)
    const count = filledCount === -1 ? 6 : filledCount
    if (count < 4) return null
    return count as 4 | 5 | 6
  }, [selected])

  const result = detected ? calcThroughHole(selected, detected) : null

  const bandDefs =
    detected === 4
      ? ["1桁目", "2桁目", "乗数", "許容差", null, null]
      : detected === 5
        ? ["1桁目", "2桁目", "3桁目", "乗数", "許容差", null]
        : detected === 6
          ? ["1桁目", "2桁目", "3桁目", "乗数", "許容差", "温度係数"]
          : ["1桁目", "2桁目", "3桁目", "乗数", "許容差", "温度係数"]

  return (
    <div className="space-y-6">
      {/* hint */}
      <p className="text-sm text-gray-500">
        左から順にバンドの色をクリックで選択してください。選択したバンド数に応じて自動判定します
      </p>

      {/* resistor visual */}
      <ResistorVisual
        colors={selected.map((b) => b?.color)}
        bandCount={detected ?? 4}
      />

      {/* band selectors */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
        {bandDefs.map((label, idx) => {
          if (!label) {
            return <div key={idx} />
          }
          const isActive = selected[idx] !== undefined
          return (
            <div
              key={idx}
              className={`transition-opacity ${!isActive && idx > 0 && selected[idx - 1] === undefined ? "opacity-30 pointer-events-none" : ""}`}
            >
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {label}
              </label>
              <ColorPalette
                value={selected[idx]}
                onChange={(c) => handleBandChange(idx, c)}
              />
            </div>
          )
        })}
      </div>

      {/* clear button */}
      {selected.some(Boolean) && (
        <button
          onClick={handleClear}
          className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-500 hover:bg-gray-200"
        >
          クリア
        </button>
      )}

      {/* result */}
      {detected === null && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-400">
          左から4つ以上のバンドを選択すると抵抗値を表示します
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {detected}バンド
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">抵抗値</div>
          <div className="text-3xl font-bold text-gray-900">
            {result.formatted}
            <span className="ml-1 text-xl font-normal text-gray-500">Ω</span>
          </div>
          {(result.tolerance ?? result.tcr) && (
            <div className="mt-1 flex items-center justify-center gap-3 text-sm text-gray-600">
              {result.tolerance !== undefined && <span>許容差: ±{result.tolerance}%</span>}
              {result.tcr !== undefined && <span>温度係数: {result.tcr} ppm/K</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ---- Color palette ---- */
function ColorPalette({
  value,
  onChange,
}: {
  value: BandColor | undefined
  onChange: (c: BandColor | undefined) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {colorBands.map((b) => (
        <button
          key={b.name}
          onClick={() => onChange(b)}
          title={`${b.name}${b.val !== undefined ? ` (${b.val})` : ""}`}
          className={`h-7 w-7 rounded-full border-2 transition ${
            value?.name === b.name ? "border-blue-500 scale-110" : "border-gray-300"
          }`}
          style={{
            backgroundColor: b.color,
            ...(b.name === "白" ? { border: "2px solid #ccc" } : {}),
          }}
        />
      ))}
    </div>
  )
}
