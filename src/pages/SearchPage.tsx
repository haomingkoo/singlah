import { SearchBar } from '../components/search/SearchBar'
import { SearchResults } from '../components/search/SearchResults'
import { useSearch } from '../hooks/useSearch'

// Each query returns synced lyrics from LRCLib (checked Oct 2026).
const EXAMPLES = [
  { query: '月亮代表我的心', language: 'Mandarin' },
  { query: '夜に駆ける', language: 'Japanese' },
  { query: '봄날', language: 'Korean' },
]

export function SearchPage() {
  const { query, search, retry, results, isLoading, error } = useSearch()
  const hasQuery = query.trim().length > 0

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col px-4 pb-12 pt-10 md:pt-16">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-text [text-wrap:balance] md:text-[40px]">
        Sing it, even if you can't read it.
      </h1>
      <p className="mb-6 mt-2 text-[15px] leading-relaxed text-text-dim md:text-lg">
        Search a song to get synced lyrics with pinyin, romaji or Korean romanisation under every
        line.
      </p>
      <SearchBar value={query} onChange={search} />

      {!hasQuery && (
        <div className="mt-6">
          <p className="text-[13px] font-medium text-text-dim">Try one of these</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map(({ query: q, language }) => (
              <li key={q}>
                <button
                  onClick={() => search(q)}
                  className="rounded-[6px] border border-line bg-surface-alt px-3 py-2 text-left text-[15px] text-text transition-colors hover:bg-surface-hover"
                >
                  {q} <span className="text-text-dim">· {language}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4" aria-live="polite">
        <SearchResults
          query={query.trim()}
          results={results}
          isLoading={isLoading}
          error={error}
          onRetry={retry}
        />
      </div>
    </div>
  )
}
