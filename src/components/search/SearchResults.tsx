import type { LrcLibTrack } from '../../types'
import { SongCard } from './SongCard'

interface SearchResultsProps {
  results: LrcLibTrack[]
  isLoading: boolean
  error: string | null
  hasQuery: boolean
}

export function SearchResults({ results, isLoading, error, hasQuery }: SearchResultsProps) {
  if (error) {
    return (
      <div className="rounded-xl bg-error/10 p-4 text-center text-sm text-error">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (hasQuery && results.length === 0) {
    return (
      <p className="py-8 text-center text-text-dim">
        No songs with synced lyrics found
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {results.map((track) => (
        <SongCard key={track.id} track={track} />
      ))}
    </div>
  )
}
