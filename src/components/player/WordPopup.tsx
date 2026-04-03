import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { RubyToken } from '../../types'

interface WordPopupProps {
  token: RubyToken
  position: { x: number; y: number }
  onClose: () => void
}

export function WordPopup({ token, position, onClose }: WordPopupProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [onClose])

  // Position popup above tap point, centered
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.max(16, Math.min(position.x - 60, window.innerWidth - 136)),
    top: Math.max(16, position.y - 90),
    zIndex: 100,
  }

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="w-[120px] rounded-xl bg-surface-alt border border-surface-hover p-3 text-center shadow-lg"
    >
      <p className="text-3xl font-medium text-text">{token.base}</p>
      {token.annotation && (
        <p className="mt-1 text-sm text-primary">{token.annotation}</p>
      )}
    </div>,
    document.body
  )
}
