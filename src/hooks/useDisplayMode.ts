import { useState, useCallback } from 'react'
import type { DisplayMode } from '../types'

const STORAGE_KEY = 'singlah-display-mode'
const MODES: DisplayMode[] = ['both', 'original', 'romanized', 'ruby']

function getInitial(): DisplayMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && MODES.includes(stored as DisplayMode)) {
    return stored as DisplayMode
  }
  return 'both'
}

export function useDisplayMode() {
  const [mode, setMode] = useState<DisplayMode>(getInitial)

  const cycle = useCallback(() => {
    setMode((prev) => {
      const idx = MODES.indexOf(prev)
      const next = MODES[(idx + 1) % MODES.length]
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return { mode, cycle }
}
