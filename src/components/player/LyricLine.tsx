import type { TimedLine, DisplayMode, RubyToken } from '../../types'
import { cn } from '../../utils/cn'

interface LyricLineProps {
  line: TimedLine
  isActive: boolean
  isPast: boolean
  displayMode: DisplayMode
  onTokenTap?: (token: RubyToken, position: { x: number; y: number }) => void
}

export function LyricLine({
  line,
  isActive,
  isPast,
  displayMode,
  onTokenTap,
}: LyricLineProps) {
  const baseClass = cn(
    'px-4 py-3 text-center transition-all duration-300',
    isActive && 'scale-105',
    isPast && 'opacity-40'
  )

  const textColor = cn(
    'text-2xl font-medium leading-snug transition-colors duration-300',
    isActive
      ? 'text-primary drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]'
      : 'text-text'
  )

  const subColor = cn(
    'mt-1 text-base leading-snug transition-colors duration-300',
    isActive ? 'text-primary/70' : 'text-text-dim'
  )

  const handleTokenClick = (
    token: RubyToken,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (!onTokenTap || !token.annotation) return
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    onTokenTap(token, { x: rect.left + rect.width / 2, y: rect.top })
  }

  // Render clickable tokens
  const renderTokens = (tokens: RubyToken[], className: string) => (
    <p className={className}>
      {tokens.map((token, i) => (
        <span
          key={i}
          onClick={(e) => handleTokenClick(token, e)}
          className={token.annotation ? 'cursor-pointer active:opacity-60' : ''}
        >
          {token.base}
        </span>
      ))}
    </p>
  )

  // Ruby mode: <ruby> tags with annotation above
  if (displayMode === 'ruby' && line.rubyTokens) {
    return (
      <div className={baseClass}>
        <p className={textColor}>
          {line.rubyTokens.map((token, i) =>
            token.annotation ? (
              <ruby
                key={i}
                onClick={(e) => handleTokenClick(token, e)}
                className="cursor-pointer active:opacity-60"
              >
                {token.base}
                <rp>(</rp>
                <rt>{token.annotation}</rt>
                <rp>)</rp>
              </ruby>
            ) : (
              <span key={i}>{token.base}</span>
            )
          )}
        </p>
      </div>
    )
  }

  // Original only
  if (displayMode === 'original') {
    return (
      <div className={baseClass}>
        {line.rubyTokens ? (
          renderTokens(line.rubyTokens, textColor)
        ) : (
          <p className={textColor}>{line.text}</p>
        )}
      </div>
    )
  }

  // Romanized only
  if (displayMode === 'romanized') {
    return (
      <div className={baseClass}>
        <p className={textColor}>{line.romanized || line.text}</p>
      </div>
    )
  }

  // Both (default)
  return (
    <div className={baseClass}>
      {line.rubyTokens ? (
        renderTokens(line.rubyTokens, textColor)
      ) : (
        <p className={textColor}>{line.text}</p>
      )}
      {line.romanized && <p className={subColor}>{line.romanized}</p>}
    </div>
  )
}
