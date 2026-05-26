import { useMemo } from "react"
import type { CircuitMode } from "./ledUtils"
import { formatResistor, formatCurrent } from "./ledUtils"

interface Props {
  mode: CircuitMode
  ledColor: string
  brightness: number
  resistor: number
  Vcc: number
  seriesCount: number
  parallelCount: number
  effectiveCurrent: number
}

function SMDResistor({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-16} y={-7} width={32} height={14} rx={1.5} fill="#2d2d2d" />
      <rect x={-16} y={-7} width={6} height={14} rx={1} fill="#c0c0c0" />
      <rect x={10} y={-7} width={6} height={14} rx={1} fill="#c0c0c0" />
      <text x={0} y={-12} textAnchor="middle" fontFamily="monospace" fontSize={8} fill="#6b7280">
        {label}
      </text>
    </g>
  )
}

function SMDLed({
  x,
  y,
  color,
  brightness,
  label,
}: {
  x: number
  y: number
  color: string
  brightness: number
  label: string
}) {
  const glowOpacity = 0.15 + (brightness / 100) * 0.6
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-14} y={-8} width={28} height={16} rx={1.5} fill="#333" />
      <rect x={-14} y={-8} width={6} height={16} rx={1} fill="#c0c0c0" />
      <rect x={8} y={-8} width={6} height={16} rx={1} fill="#c0c0c0" />
      <rect x={-8} y={-5} width={16} height={10} rx={1} fill={color} opacity={0.85} />
      <circle cx={0} cy={0} r={10} fill={color} opacity={glowOpacity} className="led-glow" />
      {brightness > 0 && (
        <circle cx={0} cy={0} r={6} fill={color} opacity={glowOpacity * 0.5} className="led-glow-pulse" />
      )}
      <line x1={7} y1={-5} x2={7} y2={5} stroke="#fff" strokeWidth={1} opacity={0.5} />
      <text x={0} y={16} textAnchor="middle" fontFamily="monospace" fontSize={7} fill="#6b7280">
        {label}
      </text>
    </g>
  )
}

function PowerSource({ x, y, voltage }: { x: number; y: number; voltage: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx={0} cy={0} r={10} fill="none" stroke="#4b5563" strokeWidth={1.5} />
      <text x={0} y={-1} textAnchor="middle" fontSize={7} fill="#4b5563" fontWeight="bold">
        V
      </text>
      <line x1={-3} y1={6} x2={3} y2={6} stroke="#4b5563" strokeWidth={1.5} />
      <line x1={0} y1={4} x2={0} y2={8} stroke="#4b5563" strokeWidth={1.5} />
      <text x={0} y={18} textAnchor="middle" fontSize={7} fill="#6b7280">
        {voltage.toFixed(1)}V
      </text>
    </g>
  )
}

function GND({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1={-8} y1={0} x2={8} y2={0} stroke="#4b5563" strokeWidth={1.5} />
      <line x1={-5} y1={3} x2={5} y2={3} stroke="#4b5563" strokeWidth={1} />
      <line x1={-2} y1={6} x2={2} y2={6} stroke="#4b5563" strokeWidth={0.5} />
      <text x={0} y={14} textAnchor="middle" fontSize={7} fill="#6b7280">
        GND
      </text>
    </g>
  )
}

export default function LEDCircuitVisual({
  mode,
  ledColor,
  brightness,
  resistor,
  Vcc,
  seriesCount,
  parallelCount,
  effectiveCurrent,
}: Props) {
  const resLabel = formatResistor(resistor)
  const curLabel = formatCurrent(effectiveCurrent)
  const cx = 160

  const svgContent = useMemo(() => {

    switch (mode) {
      case "single": {
        return (
          <g>
            <line x1={cx} y1={15} x2={cx} y2={35} stroke="#4b5563" strokeWidth={1.5} />
            <SMDResistor x={cx} y={52} label={resLabel} />
            <line x1={cx} y1={59} x2={cx} y2={80} stroke="#4b5563" strokeWidth={1.5} />
            <SMDLed x={cx} y={100} color={ledColor} brightness={brightness} label={curLabel} />
            <line x1={cx} y1={108} x2={cx} y2={130} stroke="#4b5563" strokeWidth={1.5} />
            <PowerSource x={cx} y={15} voltage={Vcc} />
            <GND x={cx} y={130} />
          </g>
        )
      }
      case "series": {
        const ledSpacing = Math.min(45, 160 / (seriesCount + 1))
        const startY = 80
        const leds = Array.from({ length: seriesCount }, (_, i) => ({
          y: startY + i * ledSpacing,
        }))
        const resistorY = startY - 35
        return (
          <g>
            <line x1={cx} y1={15} x2={cx} y2={resistorY - 7} stroke="#4b5563" strokeWidth={1.5} />
            <SMDResistor x={cx} y={resistorY} label={resLabel} />
            <line x1={cx} y1={resistorY + 7} x2={cx} y2={leds[0].y - 8} stroke="#4b5563" strokeWidth={1.5} />
            {leds.map((led, i) => (
              <g key={i}>
                <SMDLed x={cx} y={led.y} color={ledColor} brightness={brightness} label={`${curLabel}`} />
                {i < leds.length - 1 && (
                  <line x1={cx} y1={led.y + 8} x2={cx} y2={leds[i + 1].y - 8} stroke="#4b5563" strokeWidth={1.5} />
                )}
              </g>
            ))}
            <line x1={cx} y1={leds[leds.length - 1].y + 8} x2={cx} y2={150} stroke="#4b5563" strokeWidth={1.5} />
            <PowerSource x={cx} y={15} voltage={Vcc} />
            <GND x={cx} y={150} />
          </g>
        )
      }
      case "parallel": {
        const branches = Math.min(parallelCount, 4)
        const spacing = 240 / (branches + 1)
        const xs = Array.from({ length: branches }, (_, i) => 40 + spacing * (i + 1))
        return (
          <g>
            <line x1={40} y1={35} x2={280} y2={35} stroke="#4b5563" strokeWidth={1.5} />
            <line x1={40} y1={145} x2={280} y2={145} stroke="#4b5563" strokeWidth={1.5} />
            <PowerSource x={cx} y={15} voltage={Vcc} />
            <line x1={cx} y1={25} x2={cx} y2={35} stroke="#4b5563" strokeWidth={1.5} />
            <GND x={cx} y={145} />
            <line x1={cx} y1={145} x2={cx} y2={155} stroke="#4b5563" strokeWidth={1.5} />
            {xs.map((x, i) => (
              <g key={i}>
                <line x1={x} y1={35} x2={x} y2={48} stroke="#4b5563" strokeWidth={1.5} />
                <SMDResistor x={x} y={62} label={resLabel} />
                <line x1={x} y1={69} x2={x} y2={85} stroke="#4b5563" strokeWidth={1.5} />
                <SMDLed x={x} y={100} color={ledColor} brightness={brightness} label={curLabel} />
                <line x1={x} y1={108} x2={x} y2={145} stroke="#4b5563" strokeWidth={1.5} />
              </g>
            ))}
            {parallelCount > 4 && (
              <text x={cx} y={175} textAnchor="middle" fontSize={8} fill="#9ca3af">
                ... あと {parallelCount - 4} 枝
              </text>
            )}
          </g>
        )
      }
      case "series-parallel": {
        const branches = Math.min(parallelCount, 3)
        const spacing = 200 / (branches + 1)
        const xs = Array.from({ length: branches }, (_, i) => 60 + spacing * (i + 1))
        const ledSpacing = Math.min(35, 140 / (seriesCount + 1))
        const startY = 80
        return (
          <g>
            <line x1={40} y1={35} x2={280} y2={35} stroke="#4b5563" strokeWidth={1.5} />
            <line x1={40} y1={155} x2={280} y2={155} stroke="#4b5563" strokeWidth={1.5} />
            <PowerSource x={cx} y={15} voltage={Vcc} />
            <line x1={cx} y1={25} x2={cx} y2={35} stroke="#4b5563" strokeWidth={1.5} />
            <GND x={cx} y={155} />
            <line x1={cx} y1={155} x2={cx} y2={165} stroke="#4b5563" strokeWidth={1.5} />
            {xs.map((x, i) => (
              <g key={i}>
                <line x1={x} y1={35} x2={x} y2={48} stroke="#4b5563" strokeWidth={1.5} />
                <SMDResistor x={x} y={62} label={resLabel} />
                <line x1={x} y1={69} x2={x} y2={startY - 8} stroke="#4b5563" strokeWidth={1.5} />
                {Array.from({ length: seriesCount }, (_, j) => (
                  <g key={j}>
                    <SMDLed
                      x={x}
                      y={startY + j * ledSpacing}
                      color={ledColor}
                      brightness={brightness}
                      label={curLabel}
                    />
                    {j < seriesCount - 1 && (
                      <line
                        x1={x}
                        y1={startY + j * ledSpacing + 8}
                        x2={x}
                        y2={startY + (j + 1) * ledSpacing - 8}
                        stroke="#4b5563"
                        strokeWidth={1.5}
                      />
                    )}
                  </g>
                ))}
                <line
                  x1={x}
                  y1={startY + (seriesCount - 1) * ledSpacing + 8}
                  x2={x}
                  y2={155}
                  stroke="#4b5563"
                  strokeWidth={1.5}
                />
              </g>
            ))}
            {parallelCount > 3 && (
              <text x={cx} y={185} textAnchor="middle" fontSize={8} fill="#9ca3af">
                ... あと {parallelCount - 3} 枝
              </text>
            )}
          </g>
        )
      }
      default:
        return null
    }
  }, [mode, ledColor, brightness, resLabel, curLabel, Vcc, seriesCount, parallelCount])

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 320 200" className="w-full max-w-xs">
        {svgContent}
      </svg>
      <div className="mt-2 flex items-center gap-2">
        <div
          className="h-4 w-4 rounded-full"
          style={{
            backgroundColor: ledColor,
            boxShadow: `0 0 ${6 + (brightness / 100) * 12}px ${ledColor}`,
            opacity: 0.3 + (brightness / 100) * 0.7,
          }}
        />
        <span className="text-xs text-gray-500">
          約 {brightness}% の明るさ{effectiveCurrent > 0 && ` (${curLabel})`}
        </span>
      </div>
      <style>{`
        @keyframes led-pulse {
          0%, 100% { opacity: var(--pulse-opacity, 0.3); }
          50% { opacity: calc(var(--pulse-opacity, 0.3) * 1.4); }
        }
        .led-glow-pulse {
          animation: led-pulse 2s ease-in-out infinite;
          --pulse-opacity: ${0.08 + (brightness / 100) * 0.3};
        }
      `}</style>
    </div>
  )
}
