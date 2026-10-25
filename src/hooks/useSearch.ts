import { useState, useCallback, useRef, useEffect } from 'react'
import { searchTracks, LyricsError, type LyricsErrorKind } from '../lib/lrclib'
import type { LrcLibTrack } from '../types'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LrcLibTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<LyricsErrorKind | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const abortRef = useRef<AbortController>(undefined)

  const search = useCallback((q: string) => {
    setQuery(q)

    clearTimeout(timerRef.current)
    abortRef.current?.abort()

    if (!q.trim()) {
      setResults([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const data = await searchTracks(q.trim())
        if (!controller.signal.aborted) {
          setResults(data)
          setError(null)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof LyricsError ? err.kind : 'unavailable')
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 400)
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  const retry = useCallback(() => search(query), [search, query])

  return { query, search, retry, results, isLoading, error }
}
