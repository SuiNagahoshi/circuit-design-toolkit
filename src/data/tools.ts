export interface Tool {
  id: string
  title: string
  description: string
  icon: string
  path: string
  category: string
}

export const tools: Tool[] = [
  {
    id: "resistor",
    title: "抵抗値計算",
    description: "カラーコード・SMD印字から抵抗値を算出",
    icon: "🔌",
    path: "/tools/resistor",
    category: "受動部品",
  },
]

export const categories = ["受動部品"]
