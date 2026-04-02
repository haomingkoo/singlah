import { useState, useEffect } from 'react'
import { getTrack } from '../lib/lrclib'
import { parseLrc } from '../lib/lrcParser'
import { detectLanguages } from '../lib/languageDetector'
import type { LrcLibTrack, TimedLine } from '../types'

interface UseLyricsResult {
  track: LrcLibTrack | null
  lines: TimedLine[]
  isLoading: boolean
  error: string | null
}

export function useLyrics(songId: number): UseLyricsResult {
  const [track, setTrack] = useState<LrcLibTrack | null>(null)
  const [lines, setLines] = useState<TimedLine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const data = await getTrack(songId)
        if (cancelled) return

        setTrack(data)

        if (data.syncedLyrics) {
          const parsed = parseLrc(data.syncedLyrics)
          const withLangs = detectLanguages(parsed)
          setLines(withLangs)
        } else {
          setError('No synced lyrics available for this track')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load lyrics')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [songId])

  return { track, lines, isLoading, error }
}
