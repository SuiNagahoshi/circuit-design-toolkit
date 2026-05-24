import type { SearchResult } from "./combinationUtils"
import { formatValue, calcTotal, TOPOLOGY_LABELS } from "./combinationUtils"

interface Props {
  combination: SearchResult
  target: number
  eSeries: number[]
  onChange: (updated: SearchResult) => void
}

export default function CombinationEditor({ combination, target, eSeries, onChange }: Props) {
  const handleResistorChange = (idx: number, value: number) => {
    const resistors = [...combination.resistors]
    resistors[idx] = value
    const total = calcTotal(combination.topology, resistors)
    const errorPercent = Math.abs((total - target) / target) * 100
    onChange({ ...combination, resistors, total, errorPercent })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">編集</h3>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {TOPOLOGY_LABELS[combination.topology] ?? combination.topology}
        </span>
      </div>

      <div className="space-y-2">
        {combination.resistors.map((r, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-8 text-xs font-medium text-gray-500">
              R{idx + 1}
            </span>
            <select
              value={r}
              onChange={(e) => handleResistorChange(idx, Number(e.target.value))}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
            >
              {eSeries.map((v) => (
                <option key={v} value={v}>
                  {formatValue(v)}Ω
                </option>
              ))}
            </select>

          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-center">
        <div className="text-xs text-gray-500">合成抵抗値</div>
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(combination.total)}
          <span className="ml-1 text-base font-normal text-gray-500">Ω</span>
        </div>
      </div>
    </div>
  )
}
