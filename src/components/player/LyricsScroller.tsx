import { useRef, useEffect, useCallback, useState } from 'react'
import type { TimedLine, DisplayMode, RubyToken } from '../../types'
import { LyricLine } from './LyricLine'
import { WordPopup } from './WordPopup'

interface LyricsScrollerProps {
  lines: TimedLine[]
  currentLineIndex: number
  displayMode: DisplayMode
  elapsedTime: number
  isPlaying: boolean
}

export function LyricsScroller({
  lines,
  currentLineIndex,
  displayMode,
  elapsedTime,
  isPlaying,
}: LyricsScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const userScrolledRef = useRef(false)
  const userScrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [popup, setPopup] = useState<{
    token: RubyToken
    position: { x: number; y: number }
  } | null>(null)

  const handleUserScroll = useCallback(() => {
    userScrolledRef.current = true
    clearTimeout(userScrollTimerRef.current)
    userScrollTimerRef.current = setTimeout(() => {
      userScrolledRef.current = false
    }, 5000)
  }, [])

  const handleTokenTap = useCallback(
    (token: RubyToken, position: { x: number; y: number }) => {
      setPopup({ token, position })
    },
    []
  )

  // Close popup on line change
  useEffect(() => {
    setPopup(null)
  }, [currentLineIndex])

  useEffect(() => {
    if (currentLineIndex < 0 || userScrolledRef.current) return
    const el = lineRefs.current[currentLineIndex]
    const container = scrollRef.current
    if (!el || !container) return

    const targetScroll = el.offsetTop - container.clientHeight * 0.33

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
        {/* Countdown before first lyric */}
        {isPlaying && lines.length > 0 && currentLineIndex < 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-text-dim">Lyrics start in</p>
            <p className="mt-2 text-5xl font-bold text-primary">
              {Math.ceil(lines[0].time - elapsedTime)}
            </p>
          </div>
        )}
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
              displayMode={displayMode}
              onTokenTap={handleTokenTap}
            />
          </div>
        ))}
      </div>

      {popup && (
        <WordPopup
          token={popup.token}
          position={popup.position}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}
