import { useRef, useEffect, useCallback } from 'react'
import type { PitchData } from '../../hooks/usePitchDetection'

interface PitchVisualizerProps {
  pitchData: PitchData | null
}

const BUFFER_SIZE = 120
const MIN_FREQ = 80
const MAX_FREQ = 800

export function PitchVisualizer({ pitchData }: PitchVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bufferRef = useRef<number[]>(new Array(BUFFER_SIZE).fill(0))
  const rafRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Draw pitch line
    const buf = bufferRef.current
    ctx.beginPath()
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'

    let started = false
    for (let i = 0; i < buf.length; i++) {
      const freq = buf[i]
      if (freq <= 0) {
        started = false
        continue
      }
      const x = (i / (buf.length - 1)) * w
      const normalized = Math.log2(freq / MIN_FREQ) / Math.log2(MAX_FREQ / MIN_FREQ)
      const y = h - Math.max(0, Math.min(1, normalized)) * h

      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw current position dot
    const lastFreq = buf[buf.length - 1]
    if (lastFreq > 0) {
      const normalized =
        Math.log2(lastFreq / MIN_FREQ) / Math.log2(MAX_FREQ / MIN_FREQ)
      const y = h - Math.max(0, Math.min(1, normalized)) * h
      ctx.beginPath()
      ctx.arc(w - 2, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#38bdf8'
      ctx.fill()
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  // Push new pitch data into buffer
  useEffect(() => {
    const buf = bufferRef.current
    buf.shift()
    buf.push(
      pitchData && pitchData.clarity > 0 ? pitchData.frequency : 0
    )
  }, [pitchData])

  // Start/stop draw loop
  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  return (
    <div className="flex items-center gap-2 border-t border-surface-alt bg-surface/80 px-4 py-1">
      <span className="w-8 text-center text-xs font-mono text-primary">
        {pitchData?.clarity && pitchData.clarity > 0
          ? pitchData.note
          : '--'}
      </span>
      <canvas ref={canvasRef} className="h-10 flex-1" />
    </div>
  )
}
