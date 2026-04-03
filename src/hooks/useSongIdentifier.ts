import { useState, useCallback, useRef } from 'react'
import type { IdentifiedSong } from '../lib/songIdentifier'

export type IdentifyState =
  | 'idle'
  | 'listening'
  | 'fingerprinting'
  | 'identifying'
  | 'done'
  | 'error'

export function useSongIdentifier() {
  const [state, setState] = useState<IdentifyState>('idle')
  const [result, setResult] = useState<IdentifiedSong | null>(null)
  const [error, setError] = useState<string | null>(null)
  const cancelledRef = useRef(false)

  const startListening = useCallback(async () => {
    cancelledRef.current = false
    setState('listening')
    setResult(null)
    setError(null)

    try {
      const { recordAudio, identifySong } = await import('../lib/songIdentifier')

      const audioBuffer = await recordAudio(10)
      if (cancelledRef.current) return

      setState('fingerprinting')
      const identified = await identifySong(audioBuffer)
      if (cancelledRef.current) return

      if (identified) {
        setResult(identified)
        setState('done')
      } else {
        setError('Could not identify the song')
        setState('error')
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : 'Identification failed')
        setState('error')
      }
    }
  }, [])

  const cancel = useCallback(() => {
    cancelledRef.current = true
    setState('idle')
  }, [])

  const reset = useCallback(() => {
    cancelledRef.current = true
    setState('idle')
    setResult(null)
    setError(null)
  }, [])

  return { state, result, error, startListening, cancel, reset }
}
