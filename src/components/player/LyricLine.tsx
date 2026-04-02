import type { TimedLine } from '../../types'
import { cn } from '../../utils/cn'

interface LyricLineProps {
  line: TimedLine
  isActive: boolean
  isPast: boolean
}

export function LyricLine({ line, isActive, isPast }: LyricLineProps) {
  return (
    <div
      className={cn(
        'px-4 py-3 text-center transition-all duration-300',
        isActive && 'scale-105',
        isPast && 'opacity-40'
      )}
    >
      <p
        className={cn(
          'text-2xl font-medium leading-snug transition-colors duration-300',
          isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-text'
        )}
      >
        {line.text}
      </p>
      {line.romanized && (
        <p
          className={cn(
            'mt-1 text-base leading-snug transition-colors duration-300',
            isActive ? 'text-primary/70' : 'text-text-dim'
          )}
        >
          {line.romanized}
        </p>
      )}
    </div>
  )
}
