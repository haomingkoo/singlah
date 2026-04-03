import { SearchBar } from '../components/search/SearchBar'
import { SearchResults } from '../components/search/SearchResults'
import { useSearch } from '../hooks/useSearch'

export function SearchPage() {
  const { query, search, results, isLoading, error } = useSearch()

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 pt-10">
      <h1 className="mb-1 text-center text-3xl font-bold text-primary">SingLah</h1>
      <p className="mb-6 text-center text-sm text-text-dim">
        Karaoke lyrics with romanization
      </p>
      <SearchBar value={query} onChange={search} />
      <div className="mt-4">
        <SearchResults
          results={results}
          isLoading={isLoading}
          error={error}
          hasQuery={query.trim().length > 0}
        />
      </div>
    </div>
  )
}
