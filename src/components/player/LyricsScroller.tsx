import { useRef, useEffect, useCallback } from 'react'
import type { TimedLine } from '../../types'
import { LyricLine } from './LyricLine'

interface LyricsScrollerProps {
  lines: TimedLine[]
  currentLineIndex: number
}

export function LyricsScroller({ lines, currentLineIndex }: LyricsScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const userScrolledRef = useRef(false)
  const userScrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleUserScroll = useCallback(() => {
    userScrolledRef.current = true
    clearTimeout(userScrollTimerRef.current)
    userScrollTimerRef.current = setTimeout(() => {
      userScrolledRef.current = false
    }, 5000)
  }, [])

  useEffect(() => {
    if (currentLineIndex < 0 || userScrolledRef.current) return
    const el = lineRefs.current[currentLineIndex]
    const container = scrollRef.current
    if (!el || !container) return

    const targetScroll = el.offsetTop - container.clientHeight * 0.33

    // Use instant scroll for rapid lines (<500ms gap)
    const prevLine = currentLineIndex > 0 ? lines[currentLineIndex - 1] : null
    const gap = prevLine
      ? lines[currentLineIndex].time - prevLine.time
      : Infinity
    const behavior = gap < 0.5 ? 'instant' : 'smooth'

    container.scrollTo({
      top: targetScroll,
      behavior: behavior as ScrollBehavior,
    })
  }, [currentLineIndex, lines])

  // Reset line refs when lines change
  useEffect(() => {
    lineRefs.current = new Array(lines.length).fill(null)
  }, [lines])

  return (
    <div
      ref={scrollRef}
      onTouchMove={handleUserScroll}
      onWheel={handleUserScroll}
      className="flex-1 overflow-y-auto scroll-smooth"
    >
      <div className="py-[33vh]">
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el
            }}
          >
            <LyricLine
              line={line}
              isActive={i === currentLineIndex}
              isPast={i < currentLineIndex}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
