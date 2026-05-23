interface Props {
  code: string
}

export default function ChipVisual({ code }: Props) {
  const display = code.padEnd(3, "?").slice(0, 4)

  return (
    <svg viewBox="0 0 200 120" className="mx-auto w-full max-w-xs">
      {/* bottom electrode (full width) */}
      <rect x={25} y={30} width={150} height={60} rx={4} fill="#B0B0B0" />
      {/* ceramic body (black) */}
      <rect x={45} y={30} width={110} height={60} rx={2} fill="#1a1a1a" />
      {/* left terminal */}
      <rect x={25} y={30} width={20} height={60} rx={2} fill="#C0C0C0" />
      <rect x={25} y={30} width={20} height={60} fill="#C0C0C0" />
      {/* right terminal */}
      <rect x={155} y={30} width={20} height={60} rx={2} fill="#C0C0C0" />
      <rect x={155} y={30} width={20} height={60} fill="#C0C0C0" />
      {/* code */}
      <text
        x={100}
        y={68}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={18}
        fontWeight="bold"
        fill="white"
      >
        {display}
      </text>
    </svg>
  )
}
