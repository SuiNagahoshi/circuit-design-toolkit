interface Props {
  colors: (string | undefined)[]
  bandCount: number
}

const bandWidth = 10
const gap = 4
const bodyW = bandWidth * 6 + gap * 5

export default function ResistorVisual({ colors, bandCount }: Props) {
  const bands = Array.from({ length: bandCount }, (_, i) => colors[i])

  return (
    <svg
      viewBox={`0 0 ${bodyW + 40} 80`}
      className="mx-auto w-full max-w-xs"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* leads */}
      <rect x={0} y={34} width={bodyW + 40} height={12} fill="#C0C0C0" rx={2} />
      {/* body */}
      <rect x={10} y={16} width={bodyW + 20} height={48} fill="#E8C4A0" rx={6} />
      {/* bands */}
      {bands.map((c, i) => {
        const isCenter = i >= 2 && i < bandCount - 1
        const x = 30 + i * (bandWidth + gap) + (isCenter ? 10 : 0)
        return (
          <rect
            key={i}
            x={x}
            y={16}
            width={bandWidth}
            height={48}
            fill={c ?? "#E8C4A0"}
            rx={1}
          />
        )
      })}
    </svg>
  )
}
