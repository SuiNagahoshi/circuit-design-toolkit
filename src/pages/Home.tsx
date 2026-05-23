import { tools, categories } from "../data/tools"
import ToolCard from "../components/ToolCard"

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ツール一覧</h1>
        <p className="mt-2 text-gray-500">
          回路設計・電子工作に便利なツールをカテゴリ別にまとめました
        </p>
      </div>
      {categories.map((cat) => {
        const catTools = tools.filter((t) => t.category === cat)
        if (catTools.length === 0) return null
        return (
          <section key={cat} className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">{cat}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
