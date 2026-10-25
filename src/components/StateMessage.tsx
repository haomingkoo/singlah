import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface StateMessageProps {
  title: string
  children?: ReactNode
  onRetry?: () => void
  showSavedLink?: boolean
}

export function StateMessage({ title, children, onRetry, showSavedLink }: StateMessageProps) {
  return (
    <div role="status" className="rounded-[10px] border border-line bg-surface-alt px-5 py-6 text-center">
      <p className="text-[15px] font-semibold text-text">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-[15px] text-text-dim">{children}</p>}
      {(onRetry || showSavedLink) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-[6px] bg-primary px-4 py-2 text-[15px] font-semibold text-surface hover:bg-primary-dim"
            >
              Try again
            </button>
          )}
          {showSavedLink && (
            <Link
              to="/saved"
              className="rounded-[6px] border border-line px-4 py-2 text-[15px] font-medium text-text hover:bg-surface-hover"
            >
              Open saved songs
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
