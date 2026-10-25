import { Link } from 'react-router-dom'
import type { LrcLibTrack } from '../../types'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SongCard({ track }: { track: LrcLibTrack }) {
  return (
    <Link
      to={`/play?id=${track.id}`}
      className="flex w-full items-center gap-3 rounded-[10px] bg-surface-alt px-4 py-3 text-left transition-colors hover:bg-surface-hover active:bg-surface-hover"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-text">{track.trackName}</p>
        <p className="truncate text-[13px] text-text-dim">{track.artistName}</p>
      </div>
      <span className="tabular shrink-0 text-[13px] text-text-dim">{formatDuration(track.duration)}</span>
    </Link>
  )
}
