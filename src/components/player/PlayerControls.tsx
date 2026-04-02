import { cn } from '../../utils/cn'

interface PlayerControlsProps {
  isPlaying: boolean
  elapsedTime: number
  duration: number
  playbackRate: number
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onSetPlaybackRate: (rate: number) => void
}

const RATES = [0.5, 0.75, 1.0, 1.25]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PlayerControls({
  isPlaying,
  elapsedTime,
  duration,
  playbackRate,
  onTogglePlay,
  onSeek,
  onSetPlaybackRate,
}: PlayerControlsProps) {
  const nextRate = RATES[(RATES.indexOf(playbackRate) + 1) % RATES.length]

  return (
    <div className="border-t border-surface-alt bg-surface/95 px-4 pb-safe-area pt-3 backdrop-blur-sm">
      {/* Seek slider */}
      <div className="mb-2 flex items-center gap-2">
        <span className="w-10 text-right text-xs text-text-dim">
          {formatTime(elapsedTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={Math.min(elapsedTime, duration)}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-surface-alt accent-primary"
        />
        <span className="w-10 text-xs text-text-dim">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pb-2">
        <button
          onClick={() => onSetPlaybackRate(nextRate)}
          className={cn(
            'rounded-lg px-2 py-1 text-xs font-medium transition-colors',
            playbackRate !== 1.0
              ? 'bg-primary/20 text-primary'
              : 'text-text-dim hover:text-text'
          )}
        >
          {playbackRate}x
        </button>

        <button
          onClick={onTogglePlay}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-surface transition-transform active:scale-95"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={() => onSeek(0)}
          className="rounded-lg px-2 py-1 text-xs text-text-dim hover:text-text"
          aria-label="Restart"
        >
          <RestartIcon />
        </button>
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  )
}

function RestartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M3 12a9 9 0 1 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 21" />
      <path d="M3 14V21h7" />
    </svg>
  )
}
