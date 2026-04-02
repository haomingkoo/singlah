import { useNavigate } from 'react-router-dom'
import type { LrcLibTrack } from '../../types'

interface SongCardProps {
  track: LrcLibTrack
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SongCard({ track }: SongCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/play/${track.id}`)}
      className="flex w-full items-center gap-3 rounded-xl bg-surface-alt p-3 text-left transition-colors hover:bg-surface-hover active:bg-surface-hover"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text">{track.trackName}</p>
        <p className="truncate text-sm text-text-dim">{track.artistName}</p>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-xs text-text-dim">{formatDuration(track.duration)}</span>
        {track.syncedLyrics && (
          <p className="mt-0.5 text-[10px] font-medium text-primary">SYNCED</p>
        )}
      </div>
    </button>
  )
}
