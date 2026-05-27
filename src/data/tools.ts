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
  {
    id: "resistor-combination",
    title: "合成抵抗計算",
    description: "E24/E48系列から目標値に合う抵抗の組み合わせを探索",
    icon: "⚡",
    path: "/tools/resistor-combination",
    category: "受動部品",
  },
  {
    id: "led-resistor",
    title: "LED抵抗計算",
    description: "SMD部品の直並列回路に対応、LED発光色もシミュレート",
    icon: "💡",
    path: "/tools/led-resistor",
    category: "受動部品",
  },
]

export const categories = ["受動部品"]
