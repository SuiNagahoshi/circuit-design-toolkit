import { Link } from "react-router-dom"
import type { Tool } from "../data/tools"

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to={tool.path}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="mb-2 text-3xl">{tool.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{tool.description}</p>
    </Link>
  )
}
