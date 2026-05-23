interface Props {
  code: string
}

export default function ChipVisual({ code }: Props) {
  const display = code.padEnd(3, "?").slice(0, 4)

  return (
    <svg viewBox="0 0 200 80" className="mx-auto w-full max-w-xs">
      {/* bottom electrode */}
      <rect x={15} y={28} width={170} height={24} rx={3} fill="#B0B0B0" />
      {/* ceramic body */}
      <rect x={32} y={28} width={136} height={24} rx={2} fill="#D4A574" />
      {/* left cap */}
      <rect x={15} y={28} width={17} height={24} rx={2} fill="#C0C0C0" />
      <rect x={15} y={28} width={17} height={24} fill="#C0C0C0" />
      {/* right cap */}
      <rect x={168} y={28} width={17} height={24} rx={2} fill="#C0C0C0" />
      <rect x={173} y={28} width={12} height={24} fill="#C0C0C0" />
      {/* marking surface */}
      <rect x={40} y={30} width={120} height={20} rx={1} fill="#B8860B" />
      {/* code */}
      <text
        x={100}
        y={45}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={14}
        fontWeight="bold"
        fill="white"
      >
        {display}
      </text>
    </svg>
  )
}
