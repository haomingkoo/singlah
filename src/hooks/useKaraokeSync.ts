import { useState, useCallback, useRef, useEffect } from 'react'
import type { TimedLine, SyncState } from '../types'

function binarySearchLine(lines: TimedLine[], time: number): number {
  let lo = 0
  let hi = lines.length - 1
  let result = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (lines[mid].time <= time) {
      result = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return result
}

export function useKaraokeSync(lines: TimedLine[], duration: number) {
  const [state, setState] = useState<SyncState>({
    currentLineIndex: -1,
    elapsedTime: 0,
    isPlaying: false,
    playbackRate: 1.0,
  })

  const startTimeRef = useRef(0)
  const offsetRef = useRef(0)
  const rafIdRef = useRef(0)
  const playbackRateRef = useRef(1.0)
  const lastLineRef = useRef(-1)
  const lastUpdateRef = useRef(0)

  const tick = useCallback(() => {
    const now = performance.now()
    const elapsed =
      offsetRef.current +
      ((now - startTimeRef.current) / 1000) * playbackRateRef.current

    // Auto-pause at end of song
    if (elapsed >= duration + 3) {
      offsetRef.current = 0
      startTimeRef.current = performance.now()
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        elapsedTime: 0,
        currentLineIndex: -1,
      }))
      return
    }

    const lineIdx = binarySearchLine(lines, elapsed)

    // Always update currentLineIndex immediately when it changes
    if (lineIdx !== lastLineRef.current) {
      lastLineRef.current = lineIdx
      setState((prev) => ({
        ...prev,
        currentLineIndex: lineIdx,
        elapsedTime: elapsed,
      }))
      lastUpdateRef.current = now
    } else if (now - lastUpdateRef.current > 100) {
      // Throttle elapsed time updates to ~10fps
      setState((prev) => ({ ...prev, elapsedTime: elapsed }))
      lastUpdateRef.current = now
    }

    rafIdRef.current = requestAnimationFrame(tick)
  }, [lines, duration])

  const play = useCallback(() => {
    startTimeRef.current = performance.now()
    setState((prev) => ({ ...prev, isPlaying: true }))
    rafIdRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current)
    const now = performance.now()
    offsetRef.current +=
      ((now - startTimeRef.current) / 1000) * playbackRateRef.current
    setState((prev) => ({ ...prev, isPlaying: false }))
  }, [])

  const seek = useCallback(
    (time: number) => {
      offsetRef.current = time
      startTimeRef.current = performance.now()
      lastLineRef.current = -1

      const lineIdx = binarySearchLine(lines, time)
      setState((prev) => ({
        ...prev,
        elapsedTime: time,
        currentLineIndex: lineIdx,
      }))
    },
    [lines]
  )

  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (state.isPlaying) {
        const now = performance.now()
        offsetRef.current +=
          ((now - startTimeRef.current) / 1000) * playbackRateRef.current
        startTimeRef.current = now
      }
      playbackRateRef.current = rate
      setState((prev) => ({ ...prev, playbackRate: rate }))
    },
    [state.isPlaying]
  )

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [state.isPlaying, play, pause])

  useEffect(() => {
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [])

  // Reset when lines change
  useEffect(() => {
    cancelAnimationFrame(rafIdRef.current)
    offsetRef.current = 0
    startTimeRef.current = performance.now()
    lastLineRef.current = -1
    setState({
      currentLineIndex: -1,
      elapsedTime: 0,
      isPlaying: false,
      playbackRate: playbackRateRef.current,
    })
  }, [lines])

  return { ...state, play, pause, seek, setPlaybackRate, togglePlay }
}
