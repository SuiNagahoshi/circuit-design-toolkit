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

const RH = 16
const LEDH = 14

function SMDResistor({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-7} y={-RH} width={14} height={RH * 2} rx={1.5} fill="#2d2d2d" />
      <rect x={-7} y={-RH} width={14} height={6} rx={1} fill="#c0c0c0" />
      <rect x={-7} y={RH - 6} width={14} height={6} rx={1} fill="#c0c0c0" />
      <text x={12} y={4} textAnchor="start" fontFamily="monospace" fontSize={8} fill="#6b7280">
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
      <rect x={-8} y={-LEDH} width={16} height={LEDH * 2} rx={1.5} fill="#333" />
      <rect x={-8} y={-LEDH} width={16} height={6} rx={1} fill="#c0c0c0" />
      <rect x={-8} y={LEDH - 6} width={16} height={6} rx={1} fill="#c0c0c0" />
      <rect x={-5} y={-8} width={10} height={16} rx={1} fill={color} opacity={0.85} />
      <circle cx={0} cy={0} r={10} fill={color} opacity={glowOpacity} className="led-glow" />
      {brightness > 0 && (
        <circle cx={0} cy={0} r={6} fill={color} opacity={glowOpacity * 0.5} className="led-glow-pulse" />
      )}
      <line x1={-5} y1={LEDH - 3} x2={5} y2={LEDH - 3} stroke="#fff" strokeWidth={1.5} opacity={0.6} />
      <text x={12} y={4} textAnchor="start" fontFamily="monospace" fontSize={7} fill="#6b7280">
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

    const wireStartY = 35
    const gndY = mode === "single" || mode === "parallel" ? 170 : 190

    switch (mode) {
      case "single": {
        const ry = 60
        const ly = 110
        return (
          <g>
            <line x1={cx} y1={wireStartY} x2={cx} y2={ry - RH} stroke="#4b5563" strokeWidth={1.5} />
            <SMDResistor x={cx} y={ry} label={resLabel} />
            <line x1={cx} y1={ry + RH} x2={cx} y2={ly - LEDH} stroke="#4b5563" strokeWidth={1.5} />
            <SMDLed x={cx} y={ly} color={ledColor} brightness={brightness} label={curLabel} />
            <line x1={cx} y1={ly + LEDH} x2={cx} y2={gndY} stroke="#4b5563" strokeWidth={1.5} />
            <PowerSource x={cx} y={15} voltage={Vcc} />
            <GND x={cx} y={gndY} />
          </g>
        )
      }
      case "series": {
        const gap = 10
        const resH = RH * 2
        const ledH = LEDH * 2
        const totalResH = resH
        const totalLedH = ledH * seriesCount
        const totalGaps = gap * (seriesCount + 1)
        const totalH = totalResH + totalLedH + totalGaps
        const available = gndY - 10 - wireStartY
        let scale = 1
        if (totalH > available) scale = available / totalH

        const scaledGap = gap * scale
        const scaledLedH = ledH * scale
        const scaledRH = RH * scale
        const scaledLEDH = LEDH * scale

        const startY = wireStartY + (available - totalH * scale) / 2
        const ry = startY + scaledGap + scaledRH
        const leds = Array.from({ length: seriesCount }, (_, i) => ({
          y: ry + scaledRH + scaledGap + i * (scaledLedH + scaledGap) + scaledLEDH,
        }))
        return (
          <g>
            <line x1={cx} y1={wireStartY} x2={cx} y2={ry - scaledRH} stroke="#4b5563" strokeWidth={1.5} />
            <g transform={`translate(${cx},${ry}) scale(${scale})`}>
              <rect x={-7} y={-RH} width={14} height={RH * 2} rx={1.5} fill="#2d2d2d" />
              <rect x={-7} y={-RH} width={14} height={6} rx={1} fill="#c0c0c0" />
              <rect x={-7} y={RH - 6} width={14} height={6} rx={1} fill="#c0c0c0" />
            </g>
            <line x1={cx} y1={ry + scaledRH} x2={cx} y2={leds[0].y - scaledLEDH} stroke="#4b5563" strokeWidth={1.5} />
            {leds.map((led, i) => (
              <g key={i}>
                <g transform={`translate(${cx},${led.y}) scale(${scale})`}>
                  <rect x={-8} y={-LEDH} width={16} height={LEDH * 2} rx={1.5} fill="#333" />
                  <rect x={-8} y={-LEDH} width={16} height={6} rx={1} fill="#c0c0c0" />
                  <rect x={-8} y={LEDH - 6} width={16} height={6} rx={1} fill="#c0c0c0" />
                  <rect x={-5} y={-8} width={10} height={16} rx={1} fill={ledColor} opacity={0.85} />
                  <circle cx={0} cy={0} r={10} fill={ledColor} opacity={0.15 + (brightness / 100) * 0.6} className="led-glow" />
                  {brightness > 0 && (
                    <circle cx={0} cy={0} r={6} fill={ledColor} opacity={(0.15 + (brightness / 100) * 0.6) * 0.5} className="led-glow-pulse" />
                  )}
                  <line x1={-5} y1={LEDH - 3} x2={5} y2={LEDH - 3} stroke="#fff" strokeWidth={1.5} opacity={0.6} />
                </g>
                {i < leds.length - 1 && (
                  <line x1={cx} y1={led.y + scaledLEDH} x2={cx} y2={leds[i + 1].y - scaledLEDH} stroke="#4b5563" strokeWidth={1.5} />
                )}
              </g>
            ))}
            <line x1={cx} y1={leds[leds.length - 1].y + scaledLEDH} x2={cx} y2={gndY} stroke="#4b5563" strokeWidth={1.5} />
            <PowerSource x={cx} y={15} voltage={Vcc} />
            <GND x={cx} y={gndY} />
          </g>
        )
      }
      case "parallel": {
        const branches = Math.min(parallelCount, 4)
        const spacing = 240 / (branches + 1)
        const xs = Array.from({ length: branches }, (_, i) => 40 + spacing * (i + 1))
        const topBusY = wireStartY + 5
        const botBusY = gndY - 15
        const ry = topBusY + 18 + RH
        const ly = botBusY - 18 - LEDH
        return (
          <g>
            <line x1={40} y1={topBusY} x2={280} y2={topBusY} stroke="#4b5563" strokeWidth={1.5} />
            <line x1={40} y1={botBusY} x2={280} y2={botBusY} stroke="#4b5563" strokeWidth={1.5} />
            <PowerSource x={cx} y={15} voltage={Vcc} />
            <line x1={cx} y1={25} x2={cx} y2={topBusY} stroke="#4b5563" strokeWidth={1.5} />
            <GND x={cx} y={gndY} />
            <line x1={cx} y1={botBusY} x2={cx} y2={gndY} stroke="#4b5563" strokeWidth={1.5} />
            {xs.map((x, i) => (
              <g key={i}>
                <line x1={x} y1={topBusY} x2={x} y2={ry - RH} stroke="#4b5563" strokeWidth={1.5} />
                <SMDResistor x={x} y={ry} label={resLabel} />
                <line x1={x} y1={ry + RH} x2={x} y2={ly - LEDH} stroke="#4b5563" strokeWidth={1.5} />
                <SMDLed x={x} y={ly} color={ledColor} brightness={brightness} label={curLabel} />
                <line x1={x} y1={ly + LEDH} x2={x} y2={botBusY} stroke="#4b5563" strokeWidth={1.5} />
              </g>
            ))}
            {parallelCount > 4 && (
              <text x={cx} y={gndY + 15} textAnchor="middle" fontSize={8} fill="#9ca3af">
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
        const topBusY = wireStartY + 5
        const botBusY = gndY - 10

        const gap = 8
        const ledH = LEDH * 2
        const resH = RH * 2
        const totalLedH = ledH * seriesCount
        const totalGaps = gap * (seriesCount + 1)
        const totalH = resH + totalLedH + totalGaps
        const available = botBusY - topBusY - 20
        let scale = 1
        if (totalH > available) scale = available / totalH

        const scaledGap = gap * scale
        const scaledLedH = ledH * scale
        const scaledRH = RH * scale
        const scaledLEDH = LEDH * scale

        const startY = topBusY + 10 + (available - totalH * scale) / 2
        const ry = startY + scaledGap + scaledRH
        const ledYs = Array.from({ length: seriesCount }, (_, j) =>
          ry + scaledRH + scaledGap + j * (scaledLedH + scaledGap) + scaledLEDH,
        )
        return (
          <g>
            <line x1={40} y1={topBusY} x2={280} y2={topBusY} stroke="#4b5563" strokeWidth={1.5} />
            <line x1={40} y1={botBusY} x2={280} y2={botBusY} stroke="#4b5563" strokeWidth={1.5} />
            <PowerSource x={cx} y={15} voltage={Vcc} />
            <line x1={cx} y1={25} x2={cx} y2={topBusY} stroke="#4b5563" strokeWidth={1.5} />
            <GND x={cx} y={gndY} />
            <line x1={cx} y1={botBusY} x2={cx} y2={gndY} stroke="#4b5563" strokeWidth={1.5} />
            {xs.map((x, i) => (
              <g key={i}>
                <line x1={x} y1={topBusY} x2={x} y2={ry - scaledRH} stroke="#4b5563" strokeWidth={1.5} />
                <g transform={`translate(${x},${ry}) scale(${scale})`}>
                  <rect x={-7} y={-RH} width={14} height={RH * 2} rx={1.5} fill="#2d2d2d" />
                  <rect x={-7} y={-RH} width={14} height={6} rx={1} fill="#c0c0c0" />
                  <rect x={-7} y={RH - 6} width={14} height={6} rx={1} fill="#c0c0c0" />
                </g>
                <line x1={x} y1={ry + scaledRH} x2={x} y2={ledYs[0] - scaledLEDH} stroke="#4b5563" strokeWidth={1.5} />
                {ledYs.map((ly, j) => (
                  <g key={j}>
                    <g transform={`translate(${x},${ly}) scale(${scale})`}>
                      <rect x={-8} y={-LEDH} width={16} height={LEDH * 2} rx={1.5} fill="#333" />
                      <rect x={-8} y={-LEDH} width={16} height={6} rx={1} fill="#c0c0c0" />
                      <rect x={-8} y={LEDH - 6} width={16} height={6} rx={1} fill="#c0c0c0" />
                      <rect x={-5} y={-8} width={10} height={16} rx={1} fill={ledColor} opacity={0.85} />
                      <circle cx={0} cy={0} r={10} fill={ledColor} opacity={0.15 + (brightness / 100) * 0.6} className="led-glow" />
                      {brightness > 0 && (
                        <circle cx={0} cy={0} r={6} fill={ledColor} opacity={(0.15 + (brightness / 100) * 0.6) * 0.5} className="led-glow-pulse" />
                      )}
                      <line x1={-5} y1={LEDH - 3} x2={5} y2={LEDH - 3} stroke="#fff" strokeWidth={1.5} opacity={0.6} />
                    </g>
                    {j < seriesCount - 1 && (
                      <line x1={x} y1={ly + scaledLEDH} x2={x} y2={ledYs[j + 1] - scaledLEDH} stroke="#4b5563" strokeWidth={1.5} />
                    )}
                  </g>
                ))}
                <line x1={x} y1={ledYs[ledYs.length - 1] + scaledLEDH} x2={x} y2={botBusY} stroke="#4b5563" strokeWidth={1.5} />
              </g>
            ))}
            {parallelCount > 3 && (
              <text x={cx} y={gndY + 15} textAnchor="middle" fontSize={8} fill="#9ca3af">
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
      <svg viewBox="0 0 320 220" className="w-full max-w-xs">
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
