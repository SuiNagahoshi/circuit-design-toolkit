import { useState, useCallback, useMemo } from "react"
import {
  calcResistor,
  formatPower,
  formatResistor,
  formatCurrent,
  getPowerRating,
  type CircuitMode,
  type CalcResult,
  LED_COLORS,
} from "./ledUtils"
import LEDCircuitVisual from "./LEDCircuitVisual"

const MODES: { value: CircuitMode; label: string }[] = [
  { value: "single", label: "単体" },
  { value: "series", label: "直列" },
  { value: "parallel", label: "並列" },
  { value: "series-parallel", label: "直並列" },
]

function ColorBandBar({ bands }: { bands: CalcResult["colorBands"] }) {
  if (bands.length === 0) return null
  return (
    <div className="flex items-center gap-0.5">
      {bands.map((b, i) => (
        <div
          key={i}
          className="h-6 w-5 rounded-sm border border-gray-300"
          style={{ backgroundColor: b.color }}
          title={b.label}
        />
      ))}
      <span className="ml-2 text-xs text-gray-500">
        {bands.map((b) => b.label).join("-")}
      </span>
    </div>
  )
}

function PowerBadge({ power }: { power: number }) {
  const { rating, level } = getPowerRating(power)
  const colors: Record<string, string> = {
    safe: "bg-green-100 text-green-800 border-green-300",
    caution: "bg-yellow-100 text-yellow-800 border-yellow-300",
    warn: "bg-orange-100 text-orange-800 border-orange-300",
    danger: "bg-red-100 text-red-800 border-red-300",
  }
  const labels: Record<string, string> = {
    safe: "低消費電力",
    caution: "注意",
    warn: "ワット数超過注意",
    danger: "大電力警告",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[level]}`}
    >
      <span>{rating}推奨</span>
      <span className="opacity-60">·</span>
      <span>{labels[level]}</span>
    </span>
  )
}

export default function LEDResistorPage() {
  const [mode, setMode] = useState<CircuitMode>("single")
  const [Vcc, setVcc] = useState("5")
  const [Vf, setVf] = useState("2.0")
  const [If, setIf] = useState("20")
  const [brightness, setBrightness] = useState(100)
  const [seriesCount, setSeriesCount] = useState("1")
  const [parallelCount, setParallelCount] = useState("1")
  const [ledColorIdx, setLedColorIdx] = useState(0)
  const [calculated, setCalculated] = useState(false)

  const selectedColor = LED_COLORS[ledColorIdx]?.value ?? "#ff1744"

  const config = useMemo(
    () => ({
      mode,
      Vcc: Number.parseFloat(Vcc) || 0,
      Vf: Number.parseFloat(Vf) || 0,
      If: Number.parseFloat(If) || 0,
      brightness,
      seriesCount: Number.parseInt(seriesCount) || 1,
      parallelCount: Number.parseInt(parallelCount) || 1,
      ledColor: selectedColor,
    }),
    [mode, Vcc, Vf, If, brightness, seriesCount, parallelCount, selectedColor],
  )

  const result = useMemo(() => {
    if (!calculated) return null
    return calcResistor(config)
  }, [config, calculated])

  const handleCalculate = useCallback(() => {
    setCalculated(true)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleCalculate()
    },
    [handleCalculate],
  )

  const modeLabel =
    mode === "single"
      ? "単体"
      : mode === "series"
        ? `直列 ${seriesCount}個`
        : mode === "parallel"
          ? `並列 ${parallelCount}枝`
          : `直列${seriesCount}個 × 並列${parallelCount}枝`

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">LED抵抗計算</h1>
        <p className="mt-1 text-sm text-gray-500">
          SMD部品を使った直並列回路の抵抗値を計算。LEDの発光色と輝度もシミュレート
        </p>
      </div>

      <div className="space-y-4">
        {/* Mode selector */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">回路構成</label>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setMode(m.value)
                  setCalculated(false)
                }}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  mode === m.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                電源電圧 V<sub>cc</sub>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={Vcc}
                  onChange={(e) => { setVcc(e.target.value); setCalculated(false) }}
                  onKeyDown={handleKeyDown}
                  step="0.1"
                  min="0"
                  className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
                <span className="text-sm text-gray-500">V</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                順電圧 V<sub>f</sub>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={Vf}
                  onChange={(e) => { setVf(e.target.value); setCalculated(false) }}
                  onKeyDown={handleKeyDown}
                  step="0.1"
                  min="0"
                  className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
                <span className="text-sm text-gray-500">V</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                順方向電流 I<sub>f</sub>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={If}
                  onChange={(e) => { setIf(e.target.value); setCalculated(false) }}
                  onKeyDown={handleKeyDown}
                  step="1"
                  min="0"
                  className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
                <span className="text-sm text-gray-500">mA</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">LED色</label>
              <select
                value={ledColorIdx}
                onChange={(e) => { setLedColorIdx(Number(e.target.value)); setCalculated(false) }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              >
                {LED_COLORS.map((c, i) => (
                  <option key={i} value={i}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {(mode === "series" || mode === "series-parallel") && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">直列数 N</label>
                <input
                  type="number"
                  value={seriesCount}
                  onChange={(e) => { setSeriesCount(e.target.value); setCalculated(false) }}
                  onKeyDown={handleKeyDown}
                  min="1"
                  max="10"
                  className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            )}

            {(mode === "parallel" || mode === "series-parallel") && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">並列数 M</label>
                <input
                  type="number"
                  value={parallelCount}
                  onChange={(e) => { setParallelCount(e.target.value); setCalculated(false) }}
                  onKeyDown={handleKeyDown}
                  min="1"
                  max="10"
                  className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Brightness slider */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                輝度 <span className="font-normal text-gray-400">(Ifを最大値としたときの割合)</span>
              </label>
              <span className="text-sm font-semibold text-gray-900">{brightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => { setBrightness(Number(e.target.value)); setCalculated(false) }}
              className="mt-1 w-full accent-blue-600"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
              <span>0% (消灯)</span>
              <span className="font-medium text-gray-600">
                実効 If = {(Number.parseFloat(If) || 0).toFixed(0)}mA × {brightness}% ={" "}
                {((Number.parseFloat(If) || 0) * (brightness / 100)).toFixed(1)} mA
              </span>
              <span>100% (定格)</span>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            計算
          </button>
        </div>

        {/* Results */}
        {calculated && result && (
          <>
            {result.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">{result.error}</p>
              </div>
            ) : (
              <>
                {/* Result summary */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h2 className="mb-3 text-sm font-semibold text-gray-700">📊 結果</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-gray-500">抵抗値</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatResistor(result.resistor)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">E12 近似値</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatResistor(result.nearestE12)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">E24 近似値</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatResistor(result.nearestE24)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">消費電力</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPower(result.power)}
                        </span>
                        <PowerBadge power={result.power} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">総消費電流</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrent(result.totalCurrent)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">回路構成</div>
                      <div className="text-lg font-bold text-gray-900">{modeLabel}</div>
                    </div>
                  </div>
                  {result.colorBands.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 text-xs text-gray-500">カラーコード (4-band)</div>
                      <ColorBandBar bands={result.colorBands} />
                    </div>
                  )}
                </div>

                {/* Visual */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h2 className="mb-3 text-sm font-semibold text-gray-700">🔌 回路図</h2>
                  <LEDCircuitVisual
                    mode={mode}
                    ledColor={result.ledColor}
                    brightness={brightness}
                    resistor={result.resistor}
                    Vcc={config.Vcc}
                    seriesCount={config.seriesCount}
                    parallelCount={config.parallelCount}
                    effectiveCurrent={result.effectiveCurrent}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Show circuit diagram before first calculation */}
        {!calculated && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">🔌 回路図プレビュー</h2>
            <LEDCircuitVisual
              mode={mode}
              ledColor={selectedColor}
              brightness={brightness}
              resistor={0}
              Vcc={config.Vcc}
              seriesCount={config.seriesCount}
              parallelCount={config.parallelCount}
              effectiveCurrent={(Number.parseFloat(If) || 0) * (brightness / 100)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
