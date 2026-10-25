import type { LrcLibTrack } from '../../types'
import type { LyricsErrorKind } from '../../lib/lrclib'
import { SongCard } from './SongCard'
import { StateMessage } from '../StateMessage'
import { ERROR_COPY } from '../../lib/errorCopy'

interface SearchResultsProps {
  query: string
  results: LrcLibTrack[]
  isLoading: boolean
  error: LyricsErrorKind | null
  onRetry: () => void
}

export function SearchResults({ query, results, isLoading, error, onRetry }: SearchResultsProps) {
  if (!query) return null

  if (error) {
    const copy = ERROR_COPY[error === 'not_found' ? 'unavailable' : error]
    return (
      <StateMessage title={copy.title} onRetry={onRetry} showSavedLink>
        {copy.body}
      </StateMessage>
    )
  }

  if (isLoading) {
    return (
      <div>
        <p className="mb-2 text-[13px] text-text-dim">Searching…</p>
        <div className="flex flex-col gap-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex h-[66px] animate-pulse flex-col justify-center gap-2 rounded-[10px] bg-surface-alt px-4">
              <div className="h-3.5 w-1/2 rounded bg-surface-hover" />
              <div className="h-3 w-1/3 rounded bg-surface-hover" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <StateMessage title={`No synced lyrics for “${query}”`}>
        Try the title in its original script, or add the singer's name.
      </StateMessage>
    )
  }

  return (
    <div>
      <p className="mb-2 text-[13px] text-text-dim">
        {results.length} {results.length === 1 ? 'song' : 'songs'} with synced lyrics
      </p>
      <ul className="flex flex-col gap-2">
        {results.map((track) => (
          <li key={track.id}>
            <SongCard track={track} />
          </li>
        ))}
      </ul>
    </div>
  )
}
