import { Link } from 'react-router-dom'
import { useOfflineSongs } from '../hooks/useOfflineSongs'
import { StateMessage } from '../components/StateMessage'

export function SavedPage() {
  const { savedSongs, remove } = useOfflineSongs()

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-12 pt-10 md:pt-16">
      <h1 className="text-[28px] font-bold tracking-tight text-text">Saved songs</h1>
      <p className="mb-6 mt-1 text-[15px] text-text-dim">Saved songs play without a connection.</p>

      {savedSongs.length === 0 ? (
        <StateMessage title="Nothing saved yet">
          Open a song and tap the bookmark to keep it on this device.
        </StateMessage>
      ) : (
        <ul className="flex flex-col gap-2">
          {savedSongs.map((song) => (
            <li key={song.id} className="flex items-center gap-2 rounded-[10px] bg-surface-alt pr-2">
              <Link to={`/play?id=${song.id}`} className="min-w-0 flex-1 rounded-[10px] px-4 py-3">
                <p className="truncate text-[15px] font-semibold text-text">{song.trackName}</p>
                <p className="truncate text-[13px] text-text-dim">{song.artistName}</p>
              </Link>
              <button
                onClick={() => remove(song.id)}
                className="shrink-0 rounded-[6px] p-2 text-text-dim hover:bg-surface-hover hover:text-error"
                aria-label={`Remove ${song.trackName} from saved`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
