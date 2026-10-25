import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// Go back inside the app; a deep-linked visit has no history, so fall back to search.
export function useBack() {
  const navigate = useNavigate()
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/')
  }, [navigate])
}
