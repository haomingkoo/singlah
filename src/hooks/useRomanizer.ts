import { useState, useEffect, useRef } from 'react'
import type { TimedLine } from '../types'
import { initJapaneseRomanizer, isJapaneseReady } from '../lib/romanizer/japaneseRomanizer'
import { romanizeAllLines } from '../lib/romanizer'

export function useRomanizer(lines: TimedLine[]) {
  const [romanizedLines, setRomanizedLines] = useState<TimedLine[]>(lines)
  const [isRomanizing, setIsRomanizing] = useState(false)
  const [japaneseLoading, setJapaneseLoading] = useState(false)
  const prevLinesRef = useRef<TimedLine[]>(lines)

  useEffect(() => {
    if (lines.length === 0) {
      setRomanizedLines([])
      return
    }

    // Skip if same reference
    if (lines === prevLinesRef.current && romanizedLines.length > 0) return
    prevLinesRef.current = lines

    let cancelled = false
    const run = async () => {
      setIsRomanizing(true)

      const hasJapanese = lines.some((l) => l.lang === 'ja')
      if (hasJapanese && !isJapaneseReady()) {
        setJapaneseLoading(true)
        await initJapaneseRomanizer()
        if (cancelled) return
        setJapaneseLoading(false)
      }

      const result = await romanizeAllLines(lines)
      if (cancelled) return

      setRomanizedLines(result)
      setIsRomanizing(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [lines])

  return { lines: romanizedLines, isRomanizing, japaneseLoading }
}
