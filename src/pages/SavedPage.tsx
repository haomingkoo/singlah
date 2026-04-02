import { useNavigate } from 'react-router-dom'
import { useOfflineSongs } from '../hooks/useOfflineSongs'

export function SavedPage() {
  const { savedSongs, remove } = useOfflineSongs()
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-10">
      <h2 className="mb-6 text-center text-xl font-semibold text-text">
        Saved Songs
      </h2>

      {savedSongs.length === 0 ? (
        <p className="py-12 text-center text-text-dim">
          No saved songs yet. Save songs from the player to access them offline.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {savedSongs.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-3 rounded-xl bg-surface-alt p-3"
            >
              <button
                onClick={() => navigate(`/play/${song.id}`)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate font-medium text-text">
                  {song.trackName}
                </p>
                <p className="truncate text-sm text-text-dim">
                  {song.artistName}
                </p>
              </button>
              <button
                onClick={() => remove(song.id)}
                className="shrink-0 rounded-lg p-2 text-text-dim hover:bg-surface-hover hover:text-error"
                aria-label="Remove saved song"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
