import { Link } from "react-router-dom"

export default function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-tight">
          電子回路便利ツール
        </Link>
        <span className="text-sm text-gray-400">Circuit Design Toolkit</span>
      </div>
    </header>
  )
}
