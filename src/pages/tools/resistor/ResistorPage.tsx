import { useState } from "react"
import ThroughHoleTab from "./ThroughHoleTab"
import SMDTab from "./SMDTab"

type Tab = "through" | "smd"

export default function ResistorPage() {
  const [tab, setTab] = useState<Tab>("through")

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">抵抗値計算</h1>
        <p className="mt-1 text-sm text-gray-500">
          スルーホール抵抗のカラーコード、またはチップ抵抗の印字コードから抵抗値を計算します
        </p>
      </div>

      {/* tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setTab("through")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === "through" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          スルーホール (カラーコード)
        </button>
        <button
          onClick={() => setTab("smd")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === "smd" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          チップ抵抗 (SMD)
        </button>
      </div>

      {tab === "through" ? <ThroughHoleTab /> : <SMDTab />}
    </div>
  )
}
