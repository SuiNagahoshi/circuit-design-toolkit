import { useState, useMemo, useCallback } from "react"
import { calcSMDNumeric, calcSMD_EIA96, smdDigitLabels } from "./resistorUtils"
import ChipVisual from "./ChipVisual"

const eia96Letters = ["R", "S", "A", "B", "C", "D", "E", "F", "Y", "Z"]

type CodeType = "3digit" | "4digit" | "eia96" | null

function detectCodeType(input: string): CodeType {
  const clean = input.replace(/\s/g, "")
  if (!clean) return null
  // EIA-96: 2 digits + 1 letter
  if (
    clean.length === 3 &&
    /^\d{2}[A-Za-z]$/.test(clean)
  ) {
    return "eia96"
  }
  if (/^\d+$/.test(clean)) {
    if (clean.length <= 3) return "3digit"
    if (clean.length === 4) return "4digit"
  }
  return null
}

export default function SMDTab() {
  const [code, setCode] = useState("")

  const codeType = useMemo(() => detectCodeType(code), [code])

  const addChar = useCallback(
    (ch: string) => {
      if (code.length >= 4) return
      setCode((prev) => prev + ch)
    },
    [code.length],
  )

  const removeChar = useCallback(() => {
    setCode((prev) => prev.slice(0, -1))
  }, [])

  const handleInput = useCallback((val: string) => {
    const upper = val.toUpperCase()
    const cleaned = upper
      .split("")
      .filter((c) => /[\dA-Z]/.test(c))
      .join("")
      .slice(0, 4)
    setCode(cleaned)
  }, [])

  const result = useMemo(() => {
    if (codeType === "eia96") return calcSMD_EIA96(code.toUpperCase())
    if (codeType === "3digit" || codeType === "4digit") return calcSMDNumeric(code)
    return null
  }, [code, codeType])

  const slots = Array.from({ length: 4 }, (_, i) => code[i] ?? null)

  return (
    <div className="space-y-6">
      {/* hint */}
      <p className="text-sm text-gray-500">
        印字コードを入力してください。3桁・4桁・EIA-96を自動判別します
      </p>

      {/* chip visual */}
      <ChipVisual code={code} />

      {/* code display */}
      <div className="flex items-center justify-center gap-2">
        {slots.map((ch, i) => (
          <span
            key={i}
            className={`flex h-12 w-10 items-center justify-center rounded-md border-2 text-lg font-bold transition ${
              ch
                ? "border-amber-500 bg-amber-50 text-gray-900"
                : i === code.length
                  ? "border-blue-400 bg-blue-50 text-gray-300"
                  : "border-gray-200 bg-gray-50 text-gray-200"
            }`}
          >
            {ch ?? "-"}
          </span>
        ))}
      </div>

      {/* keypad: digits */}
      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-5 gap-2">
          {smdDigitLabels.map((d) => (
            <button
              key={d}
              onClick={() => addChar(d)}
              disabled={code.length >= 4 && codeType !== "3digit"}
              className={`h-10 w-10 rounded-md text-sm font-bold transition ${
                code.length >= 4 && codeType !== "3digit"
                  ? "bg-gray-100 text-gray-300"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* keypad: EIA-96 letters (contextual) */}
        {code.length === 2 && codeType !== "4digit" && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400">乗数:</span>
            {eia96Letters.map((ch) => (
              <button
                key={ch}
                onClick={() => addChar(ch)}
                className="h-8 w-8 rounded-md bg-purple-100 text-xs font-bold text-purple-700 hover:bg-purple-200"
              >
                {ch}
              </button>
            ))}
          </div>
        )}

        {/* backspace */}
        <div className="flex gap-2">
          <button
            onClick={removeChar}
            disabled={code.length === 0}
            className="rounded-md bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-200 disabled:opacity-30"
          >
            ← 戻す
          </button>
          <button
            onClick={() => setCode("")}
            disabled={code.length === 0}
            className="rounded-md bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-200 disabled:opacity-30"
          >
            クリア
          </button>
        </div>

        {/* text input fallback */}
        <input
          type="text"
          value={code}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="例: 103 / 1003 / 01C"
          className="mt-2 w-40 rounded-md border border-gray-300 px-3 py-1.5 text-center text-sm focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* result */}
      {result && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {codeType === "eia96" ? "EIA-96" : codeType === "3digit" ? "3桁" : "4桁"}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">抵抗値</div>
          <div className="text-3xl font-bold text-gray-900">
            {result.formatted}
            <span className="ml-1 text-xl font-normal text-gray-500">Ω</span>
          </div>
          {result.tolerance !== undefined && (
            <div className="mt-1 text-sm text-gray-600">許容差: ±{result.tolerance}%</div>
          )}
        </div>
      )}

      {code.length >= 3 && !result && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          無効なコードです。3桁・4桁の数字、またはEIA-96形式（数字2桁＋英字1文字）で入力してください
        </div>
      )}
    </div>
  )
}
