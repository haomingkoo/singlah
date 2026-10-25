import type { LrcLibTrack } from '../types'

const BASE_URL = 'https://lrclib.net/api'

export type LyricsErrorKind = 'offline' | 'unavailable' | 'not_found'

export class LyricsError extends Error {
  kind: LyricsErrorKind
  constructor(kind: LyricsErrorKind, detail: string) {
    super(detail)
    this.kind = kind
  }
}

async function request(path: string): Promise<Response> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`)
  } catch (err) {
    const kind = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'unavailable'
    throw new LyricsError(kind, err instanceof Error ? err.message : 'network error')
  }
  if (res.status === 404) throw new LyricsError('not_found', `${path} 404`)
  if (!res.ok) throw new LyricsError('unavailable', `${path} ${res.status}`)
  return res
}

export async function searchTracks(query: string): Promise<LrcLibTrack[]> {
  const res = await request(`/search?q=${encodeURIComponent(query)}`)
  const data: LrcLibTrack[] = await res.json()
  return data.filter((t) => !t.instrumental && t.syncedLyrics)
}

export async function getTrack(id: number): Promise<LrcLibTrack> {
  const res = await request(`/get/${id}`)
  return res.json()
}
