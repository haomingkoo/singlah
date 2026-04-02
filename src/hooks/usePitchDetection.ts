import { useState, useEffect, useRef, useCallback } from 'react'
import { PitchDetector } from 'pitchy'

export interface PitchData {
  frequency: number
  clarity: number
  note: string
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function frequencyToNote(freq: number): string {
  if (freq <= 0) return '--'
  const midi = 12 * Math.log2(freq / 440) + 69
  const noteIdx = Math.round(midi) % 12
  const octave = Math.floor(Math.round(midi) / 12) - 1
  return `${NOTE_NAMES[(noteIdx + 12) % 12]}${octave}`
}

export function usePitchDetection(enabled: boolean) {
  const [pitchData, setPitchData] = useState<PitchData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null)

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    streamRef.current = null
    analyserRef.current = null
    detectorRef.current = null
    setPitchData(null)
  }, [])

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    let cancelled = false

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream

        const audioCtx = new AudioContext()
        audioCtxRef.current = audioCtx

        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        source.connect(analyser)
        analyserRef.current = analyser

        const detector = PitchDetector.forFloat32Array(analyser.fftSize)
        detectorRef.current = detector

        const buffer = new Float32Array(analyser.fftSize)

        const tick = () => {
          if (cancelled) return
          analyser.getFloatTimeDomainData(buffer)
          const [frequency, clarity] = detector.findPitch(buffer, audioCtx.sampleRate)

          if (clarity > 0.8 && frequency > 50 && frequency < 2000) {
            setPitchData({
              frequency,
              clarity,
              note: frequencyToNote(frequency),
            })
          } else {
            setPitchData((prev) =>
              prev ? { ...prev, clarity: 0 } : null
            )
          }

          rafRef.current = requestAnimationFrame(tick)
        }

        rafRef.current = requestAnimationFrame(tick)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Microphone access denied'
          )
        }
      }
    }

    start()
    return () => {
      cancelled = true
      cleanup()
    }
  }, [enabled, cleanup])

  return { pitchData, error }
}
