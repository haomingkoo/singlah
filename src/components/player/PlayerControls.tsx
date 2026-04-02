import type { DisplayMode } from '../../types'
import { cn } from '../../utils/cn'

interface PlayerControlsProps {
  isPlaying: boolean
  elapsedTime: number
  duration: number
  playbackRate: number
  displayMode: DisplayMode
  pitchEnabled: boolean
  partyActive: boolean
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onSetPlaybackRate: (rate: number) => void
  onCycleDisplayMode: () => void
  onTogglePitch: () => void
  onOpenParty: () => void
}

const RATES = [0.5, 0.75, 1.0, 1.25]

const DISPLAY_LABELS: Record<DisplayMode, string> = {
  both: 'A+a',
  original: 'A',
  romanized: 'a',
  ruby: 'Aᵃ',
}

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
  displayMode,
  pitchEnabled,
  partyActive,
  onTogglePlay,
  onSeek,
  onSetPlaybackRate,
  onCycleDisplayMode,
  onTogglePitch,
  onOpenParty,
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
      <div className="flex items-center justify-center gap-4 pb-2">
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
          onClick={onCycleDisplayMode}
          className="rounded-lg px-2 py-1 text-xs font-medium text-text-dim hover:text-text"
          title={`Display: ${displayMode}`}
        >
          {DISPLAY_LABELS[displayMode]}
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

        <button
          onClick={onTogglePitch}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            pitchEnabled
              ? 'bg-accent/20 text-accent'
              : 'text-text-dim hover:text-text'
          )}
          aria-label={pitchEnabled ? 'Disable pitch' : 'Enable pitch'}
        >
          <MicIcon />
        </button>

        <button
          onClick={onOpenParty}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            partyActive
              ? 'bg-primary/20 text-primary'
              : 'text-text-dim hover:text-text'
          )}
          aria-label="Party mode"
        >
          <PartyIcon />
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

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

function PartyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
