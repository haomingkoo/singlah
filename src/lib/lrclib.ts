import type { LrcLibTrack } from '../types'

const BASE_URL = 'https://lrclib.net/api'

export async function searchTracks(query: string): Promise<LrcLibTrack[]> {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(`LRCLib search failed: ${res.status}`)
  const data: LrcLibTrack[] = await res.json()
  return data.filter((t) => !t.instrumental && t.syncedLyrics)
}

export async function getTrack(id: number): Promise<LrcLibTrack> {
  const res = await fetch(`${BASE_URL}/get/${id}`)
  if (!res.ok) throw new Error(`LRCLib get failed: ${res.status}`)
  return res.json()
}
