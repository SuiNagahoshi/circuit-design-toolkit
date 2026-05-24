import { useState, useMemo, useCallback } from "react"
import {
  searchCombinations,
  getESeries,
  type SearchResult,
  type MaxResistors,
} from "./combinationUtils"
import ResultsList from "./ResultsList"
import CombinationEditor from "./CombinationEditor"

export default function ResistorCombinationPage() {
  const [targetInput, setTargetInput] = useState("10")
  const [unit, setUnit] = useState(1000)
  const [maxResistors, setMaxResistors] = useState<MaxResistors>(4)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [editing, setEditing] = useState<SearchResult | null>(null)
  const [searched, setSearched] = useState(false)

  const unitLabels = [
    { value: 1, label: "Ω" },
    { value: 1000, label: "kΩ" },
    { value: 1_000_000, label: "MΩ" },
  ]

  const target = useMemo(() => {
    const n = Number.parseFloat(targetInput)
    return isNaN(n) || n <= 0 ? null : n * unit
  }, [targetInput, unit])

  const handleSearch = useCallback(() => {
    if (target === null) return
    const combo = searchCombinations(target, maxResistors)
    setResults(combo)
    setSelectedIndex(null)
    setEditing(null)
    setSearched(true)
  }, [target, maxResistors])

  const handleSelect = useCallback(
    (idx: number) => {
      setSelectedIndex(idx)
      const res = results[idx]
      setEditing({ ...res })
    },
    [results],
  )

  const handleEditChange = useCallback(
    (updated: SearchResult) => {
      setEditing(updated)
    },
    [],
  )

  const eSeries = useMemo(() => getESeries(), [])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">合成抵抗計算</h1>
        <p className="mt-1 text-sm text-gray-500">
          目標の抵抗値に合う抵抗の組み合わせを E24/E48 系列から探索します
        </p>
      </div>

      {/* Input section */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            目標抵抗値
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="例: 10"
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-lg font-semibold focus:border-blue-400 focus:outline-none"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            >
              {unitLabels.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            最大本数
          </label>
          <div className="flex gap-2">
            {([2, 3, 4] as MaxResistors[]).map((n) => (
              <button
                key={n}
                onClick={() => setMaxResistors(n)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  maxResistors === n
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}本
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={target === null}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
        >
          計算
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            結果 (上位10件)
          </h2>
          <ResultsList
            results={results}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
          />
        </div>
      )}

      {/* Editor */}
      {editing && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">編集</h2>
          <CombinationEditor
            combination={editing}
            target={target!}
            eSeries={eSeries}
            onChange={handleEditChange}
          />
        </div>
      )}
    </div>
  )
}
