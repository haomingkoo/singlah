import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface SongHeaderProps {
  trackName: string
  artistName: string
  isSaved: boolean
  onToggleSave: () => void
}

export function SongHeader({
  trackName,
  artistName,
  isSaved,
  onToggleSave,
}: SongHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 border-b border-surface-alt px-4 py-3">
      <button
        onClick={() => navigate(-1)}
        className="shrink-0 text-text-dim hover:text-text"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-medium text-text">{trackName}</p>
        <p className="truncate text-xs text-text-dim">{artistName}</p>
      </div>
      <button
        onClick={onToggleSave}
        className={cn(
          'shrink-0 transition-colors',
          isSaved ? 'text-accent' : 'text-text-dim hover:text-text'
        )}
        aria-label={isSaved ? 'Remove from saved' : 'Save for offline'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      </button>
    </div>
  )
}
