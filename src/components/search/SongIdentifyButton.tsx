import { useSongIdentifier } from '../../hooks/useSongIdentifier'
import { cn } from '../../utils/cn'

interface SongIdentifyButtonProps {
  onIdentified: (query: string) => void
}

export function SongIdentifyButton({ onIdentified }: SongIdentifyButtonProps) {
  const { state, result, error, startListening, cancel, reset } =
    useSongIdentifier()

  if (state === 'done' && result) {
    return (
      <div className="mt-4 rounded-xl bg-surface-alt p-4">
        <p className="text-sm text-text-dim">Identified:</p>
        <p className="mt-1 font-medium text-text">{result.title}</p>
        <p className="text-sm text-text-dim">{result.artist}</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              onIdentified(`${result.artist} ${result.title}`)
              reset()
            }}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-surface"
          >
            Search Lyrics
          </button>
          <button
            onClick={reset}
            className="rounded-lg bg-surface-hover px-3 py-2 text-sm text-text-dim"
          >
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="mt-4 rounded-xl bg-error/10 p-4 text-center">
        <p className="text-sm text-error">{error}</p>
        <button
          onClick={reset}
          className="mt-2 text-sm text-text-dim hover:text-text"
        >
          Try again
        </button>
      </div>
    )
  }

  if (state !== 'idle') {
    const labels = {
      listening: 'Listening...',
      fingerprinting: 'Processing...',
      identifying: 'Identifying...',
    }

    return (
      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
            <MicIcon className="h-6 w-6 text-accent" />
          </div>
        </div>
        <p className="text-sm text-text-dim">
          {labels[state as keyof typeof labels]}
        </p>
        <button
          onClick={cancel}
          className="text-xs text-text-dim hover:text-text"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={startListening}
      className={cn(
        'mt-4 flex w-full items-center justify-center gap-2 rounded-xl',
        'bg-surface-alt p-3 text-sm text-text-dim transition-colors hover:bg-surface-hover'
      )}
    >
      <MicIcon className="h-4 w-4" />
      <span>Identify a song</span>
    </button>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}
