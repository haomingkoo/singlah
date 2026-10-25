import { useState, useEffect, useCallback } from 'react'
import { getTrack, LyricsError, type LyricsErrorKind } from '../lib/lrclib'
import { getSong } from '../lib/offlineStore'
import { parseLrc } from '../lib/lrcParser'
import { detectLanguages } from '../lib/languageDetector'
import type { LrcLibTrack, TimedLine } from '../types'

interface UseLyricsResult {
  track: LrcLibTrack | null
  lines: TimedLine[]
  isLoading: boolean
  error: LyricsErrorKind | 'no_synced' | null
  retry: () => void
}

export function useLyrics(songId: number): UseLyricsResult {
  const [track, setTrack] = useState<LrcLibTrack | null>(null)
  const [lines, setLines] = useState<TimedLine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<UseLyricsResult['error']>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      if (!Number.isInteger(songId) || songId <= 0) {
        setError('not_found')
        setIsLoading(false)
        return
      }
      try {
        const data = await getTrack(songId)
        if (cancelled) return

        setTrack(data)

        if (data.syncedLyrics) {
          const parsed = parseLrc(data.syncedLyrics)
          const withLangs = detectLanguages(parsed)
          setLines(withLangs)
        } else {
          setError('no_synced')
        }
      } catch (err) {
        if (cancelled) return
        // Saved songs still play when the lyrics service is down or the device is offline.
        const saved = await getSong(songId).catch(() => undefined)
        if (cancelled) return
        if (saved) {
          setTrack({ id: saved.id, name: saved.trackName, trackName: saved.trackName, artistName: saved.artistName,
            albumName: saved.albumName, duration: saved.duration, instrumental: false, plainLyrics: null, syncedLyrics: null })
          setLines(saved.lines)
        } else {
          setError(err instanceof LyricsError ? err.kind : 'unavailable')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [songId, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { track, lines, isLoading, error, retry }
}
