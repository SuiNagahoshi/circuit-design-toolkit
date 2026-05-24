import type { SearchResult } from "./combinationUtils"
import { formatValue, formatExpression } from "./combinationUtils"

interface Props {
  results: SearchResult[]
  selectedIndex: number | null
  onSelect: (idx: number) => void
}

export default function ResultsList({ results, selectedIndex, onSelect }: Props) {
  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
        条件に合う組み合わせが見つかりませんでした
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {results.map((res, idx) => {
        const isSelected = selectedIndex === idx
        return (
          <button
            key={`${res.topology}-${res.resistors.join(",")}`}
            onClick={() => onSelect(idx)}
            className={`w-full rounded-lg border p-3 text-left transition ${
              isSelected
                ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                  {idx + 1}
                </span>
                <span className="font-mono text-sm font-medium text-gray-900">
                  {formatExpression(res.topology, res.resistors)}
                </span>
                <span className="text-xs text-gray-400">Ω</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  res.errorPercent < 1
                    ? "bg-green-100 text-green-700"
                    : res.errorPercent < 5
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {res.errorPercent < 0.01 ? "<0.01" : res.errorPercent.toFixed(2)}%
              </span>
            </div>
            <div className="mt-1 text-right text-sm text-gray-500">
              = {formatValue(res.total)}Ω
            </div>
          </button>
        )
      })}
    </div>
  )
}
